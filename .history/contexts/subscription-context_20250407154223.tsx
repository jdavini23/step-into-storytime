"use client";

import type React from "react";
import { createContext, useContext, useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import type { AuthState } from "@/contexts/auth-context";

// Define types
export type SubscriptionTier = "free" | "basic" | "premium";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "unpaid";

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

export interface Subscription {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: SubscriptionStatus;
  plan_id: string;
  subscription_start: string | null;
  subscription_end: string | null;
  trial_end: string | null;
  payment_provider: "stripe" | "paypal" | null;
  payment_provider_id: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  interval: string;
  tier: SubscriptionTier;
  features: SubscriptionFeature[];
  is_popular?: boolean;
}

type SubscriptionState = {
  isInitialized: boolean;
  subscription: Subscription | null;
  availablePlans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
};

type SubscriptionAction =
  | {
      type: "INITIALIZE";
      payload: { subscription: Subscription | null; plans: SubscriptionPlan[] };
    }
  | { type: "SET_SUBSCRIPTION"; payload: Subscription | null }
  | { type: "SET_PLANS"; payload: SubscriptionPlan[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_SUBSCRIPTION" }
  | { type: "RESET" };

// Create initial state
const initialState: SubscriptionState = {
  isInitialized: false,
  subscription: null,
  availablePlans: [],
  isLoading: true,
  error: null,
};

// Create reducer
const subscriptionReducer = (
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        subscription: action.payload.subscription,
        availablePlans: action.payload.plans,
        isLoading: false,
        isInitialized: true,
      };
    case "SET_SUBSCRIPTION":
      return {
        ...state,
        subscription: action.payload,
        isLoading: false,
      };
    case "SET_PLANS":
      return {
        ...state,
        availablePlans: action.payload,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "CLEAR_SUBSCRIPTION":
      return {
        ...state,
        subscription: null,
        isLoading: true,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// Create context
interface SubscriptionContextType {
  state: SubscriptionState;
  fetchSubscription: () => Promise<void>;
  createSubscription: (tier: SubscriptionTier) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updateSubscription: (tier: SubscriptionTier) => Promise<void>;
  getSubscriptionTier: () => SubscriptionTier;
  hasFeature: (feature: string) => boolean;
  getRemainingDays: () => number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

// Create provider
export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const auth = useAuth();
  const router = useRouter();

  // Sample subscription plans - in a real app, these would come from your database
  const defaultPlans: SubscriptionPlan[] = [
    {
      id: "1",
      name: "Unlimited stories",
      description: "All themes & settings",
      price: "0",
      interval: "month",
      tier: "premium",
      features: [
        {
          id: "1",
          name: "Advanced character creation",
          description: "",
          quantity: 0,
        },
        { id: "2", name: "Download as PDF", description: "", quantity: 0 },
        { id: "3", name: "New themes monthly", description: "", quantity: 0 },
      ],
      is_popular: true,
    },
    {
      id: "2",
      name: "Everything in Unlimited",
      description: "Up to 5 family profiles",
      price: "0",
      interval: "month",
      tier: "premium",
      features: [
        { id: "4", name: "Audio narration", description: "", quantity: 0 },
        {
          id: "5",
          name: "Print-ready illustrations",
          description: "",
          quantity: 0,
        },
        {
          id: "6",
          name: "Priority new features",
          description: "",
          quantity: 0,
        },
        { id: "7", name: "Exclusive themes", description: "", quantity: 0 },
      ],
    },
  ];

  // Initialize subscription
  useEffect(() => {
    const initializeSubscription = async () => {
      // Track relevant state for subscription management
      const hasUser = !!auth.state.user;
      const userId = auth.state.user?.id;

      // Don't proceed if auth is not initialized
      if (!auth.state.isInitialized) {
        return;
      }

      // If no user, initialize with default plans
      if (!auth.state.user || !auth.state.user.id) {
        dispatch({
          type: "INITIALIZE",
          payload: {
            subscription: null,
            plans: defaultPlans,
          },
        });
        return;
      }

      // Check if we need to re-fetch (either not initialized or user changed)
      const shouldFetch =
        !state.isInitialized ||
        !state.subscription ||
        state.subscription?.user_id !== auth.state.user.id;

      if (!shouldFetch) {
        // Skip fetching if subscription is already initialized for current user
        return;
      }

      // Fetch subscription data
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const { data: subscriptions, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", auth.state.user?.id);

        if (error) {
          // Only log errors in development mode
          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching subscription:", error.message);
          }

          // Initialize with default plans if no subscription found
          dispatch({
            type: "INITIALIZE",
            payload: {
              subscription: null,
              plans: defaultPlans,
            },
          });
          return;
        }

        if (subscriptions && subscriptions.length === 1) {
          // Successfully found a single subscription
          dispatch({
            type: "INITIALIZE",
            payload: {
              subscription: subscriptions[0],
              plans: defaultPlans,
            },
          });
        } else if (subscriptions && subscriptions.length > 1) {
          // Handle edge case of multiple subscriptions
          if (process.env.NODE_ENV === "development") {
            console.error(
              "Multiple subscriptions found for user:",
              auth.state.user.id
            );
          }
          dispatch({
            type: "SET_ERROR",
            payload: "Multiple subscriptions found. Please contact support.",
          });
        } else {
          // No subscription found
          dispatch({
            type: "SET_ERROR",
            payload: "No subscription found. Please subscribe to a plan.",
          });
        }
        return;
      } catch (error) {
        // Only log errors in development mode
        if (process.env.NODE_ENV === "development") {
          console.error(
            "Error fetching subscription:",
            error instanceof Error ? error.message : String(error)
          );
        }

        // Initialize with default plans on error
        dispatch({
          type: "INITIALIZE",
          payload: {
            subscription: null,
            plans: defaultPlans,
          },
        });
      }
    };

    // Run initialization
    initializeSubscription();
  }, [auth.state.isInitialized, auth.state.user?.id]);

  const fetchSubscription = async () => {
    const userId = auth.state.user?.id;

    if (!userId) {
      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: null,
      });
      return;
    }

    try {
      // Start loading state while fetching subscription
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/subscriptions", {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch subscription");
      }

      const data = await response.json();

      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: data,
      });
    } catch (error) {
      // Only log errors in development mode
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching subscription:", error);
      }
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription",
      });
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createSubscription = async (tier: SubscriptionTier) => {
    const userId = auth.state.user?.id;

    if (!userId || !auth.state.isAuthenticated) {
      // User must be authenticated to create a subscription
      toast({
        title: "Error",
        description: "You must be logged in to create a subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      // Start loading state while creating subscription
      dispatch({ type: "SET_LOADING", payload: true });

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session found");
      }

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Only log detailed errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error("Subscription creation failed:", {
            status: response.status,
            statusText: response.statusText,
            error
          });
        }
        throw new Error(error.error || "Failed to create subscription");
      }

      const data = await response.json();
      // Successfully created subscription

      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: data,
      });

      toast({
        title: "Success",
        description: "Subscription created successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("[DEBUG] Error creating subscription:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to create subscription",
      });
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const cancelSubscription = async () => {
    const userId = auth.state.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to cancel your subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[DEBUG] Canceling subscription via API");
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/subscriptions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "canceled" }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[DEBUG] Subscription cancellation failed:", {
          status: response.status,
          statusText: response.statusText,
          error,
          timestamp: new Date().toISOString(),
        });
        throw new Error(error.error || "Failed to cancel subscription");
      }

      const data = await response.json();
      console.log("[DEBUG] Subscription canceled:", {
        data,
        timestamp: new Date().toISOString(),
      });

      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: data,
      });

      toast({
        title: "Success",
        description: "Subscription canceled successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("[DEBUG] Error canceling subscription:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to cancel subscription",
      });
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateSubscription = async (tier: SubscriptionTier) => {
    const userId = auth.state.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update your subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[DEBUG] Updating subscription via API:", {
        tier,
        userId,
        timestamp: new Date().toISOString(),
      });
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/subscriptions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[DEBUG] Subscription update failed:", {
          status: response.status,
          statusText: response.statusText,
          error,
          timestamp: new Date().toISOString(),
        });
        throw new Error(error.error || "Failed to update subscription");
      }

      const data = await response.json();
      console.log("[DEBUG] Subscription updated:", {
        data,
        timestamp: new Date().toISOString(),
      });

      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: data,
      });

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("[DEBUG] Error updating subscription:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Failed to update subscription",
      });
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const getSubscriptionTier = (): SubscriptionTier => {
    if (!state.subscription) {
      return "free";
    }

    return state.subscription.plan_id as SubscriptionTier;
  };

  const hasFeature = (feature: string): boolean => {
    if (!state.subscription) {
      return false;
    }

    const plan = defaultPlans.find(
      (plan) => plan.id === state.subscription?.plan_id
    );
    if (!plan) return false;

    return plan.features.some((f) => f.name === feature);
  };

  const getRemainingDays = (): number | null => {
    if (!state.subscription || !state.subscription.trial_end) {
      return null;
    }

    const trialEnd = new Date(state.subscription.trial_end);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));

    return days;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        state,
        fetchSubscription,
        createSubscription,
        cancelSubscription,
        updateSubscription,
        getSubscriptionTier,
        hasFeature,
        getRemainingDays,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};

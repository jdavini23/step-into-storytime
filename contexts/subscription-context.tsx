"use client"

import type React from "react";

import {  createContext, useContext, useReducer, useEffect, useCallback  } from "react";
import {  useRouter  } from "next/navigation";
import {  toast  } from "@/hooks/use-toast";
import {  supabase  } from "@/lib/supabase";
import {  useAuth  } from "@/contexts/auth-context";

// Define types/
export type SubscriptionTier = {
export type SubscriptionStatus = {
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "unpaid"

export interface SubscriptionFeature {
  id
  name
  description,quantity
};
export interface Subscription {
  id
  user_id
  status,plan_id,subscription_start,subscription_end,trial_end,payment_provider,payment_provider_id,created_at,updated_at;
  features?: SubscriptionFeature[]
};
export interface SubscriptionPlan {
  id
  name
  description,price,interval,tier,features;
  is_popular?: boolean
};
export interface SubscriptionState {
  subscription
  availablePlans
  isLoading,error,isInitialized
};
type SubscriptionAction = {
  | { type: "INITIALIZE"; payload={ subscription: Subscription| null; plans: SubscriptionPlan[] } };
  | { type: "SET_SUBSCRIPTION"; payload: Subscription| null };
  | { type: "SET_PLANS"; payload: SubscriptionPlan[] };
  | { type: "SET_LOADING"; payload: boolean};
  | { type: "SET_ERROR"; payload: string| null };
  | { type: "CLEAR_SUBSCRIPTION" };
// Create initial state/
const initialState: SubscriptionState,subscription,availablePlans,isLoading,error,isInitialized
};
// Create reducer/
const subscriptionReducer;
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        subscription,availablePlans,isLoading,isInitialized
      };
    case "SET_SUBSCRIPTION":
      return {
        ...state,
        subscription,isLoading
      };
    case "SET_PLANS":
      return {
        ...state,
        availablePlans,isLoading
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false};
    case "CLEAR_SUBSCRIPTION":
      return {
        ...state,
        subscription,isLoading
      };
    default
  };
};
// Create context/
interface SubscriptionContextType {
  state
  fetchSubscription
  createSubscription,cancelSubscription,updateSubscription,getSubscriptionTier,hasFeature,getRemainingDays
};
const SubscriptionContext=""// Create provider/
export const SubscriptionProvider;
  const [state, dispatch] = useReducer(subscriptionReducer, initialState)
  const { state;
  const router=""// Sample subscription plans - in a real app, these would come from your database/
  const SUBSCRIPTION_PLANS;
    {
      id,name,description,price,interval,tier,features
    },
    {
      id,name,description,price,interval,tier,features;
        "Unlimited stories",
        "All themes & settings",
        "Advanced character creation",
        "Download as PDF",
        "New themes monthly",
      ],
      is_popular
    },
    {
      id,name,description,price,interval,tier,features;
        "Everything in Unlimited",
        "Up to 5 family profiles",
        "Audio narration",
        "Print-ready illustrations",
        "Priority new features",
        "Exclusive themes",
      ],
    },
  ]

  // Initialize subscription state/
  const initializeSubscription;
    const userId;

    if (!userId) {
      dispatch({
        type,payload,subscription,plans
        },
      })
      return
    };
    try {
      dispatch({ type)

      // Fetch user's subscription/
      const { data;
        .from("subscriptions")
        .select(`
          *,
          subscription_items(*)
        `)
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is fine for new users/
        console.error("Error fetching subscription)
        throw error
      };
      dispatch({
        type,payload,subscription,plans
        },
      })
    } catch (error) {
      console.error("Error initializing subscription)
      dispatch({
        type,payload,subscription,plans
        },
      })
    };
  }, []) // Remove dependencies to break the circular dependency/

  // Initialize subscription when auth state changes/
  useEffect(() => {
    if (authState.isInitialized) {
      initializeSubscription()
    };
  }, [authState.isInitialized, initializeSubscription])

  // Fetch user's subscription/
  const fetchSubscription;
    if (!authState.user) {
      toast({
        title,description,variant
      })
      return
    };
    try {
      dispatch({ type)

      const { data;
        .from("subscriptions")
        .select(`
          *,
          subscription_items(*)
        `)
        .eq("user_id", authState.user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      };
      dispatch({
        type,payload
      })
    } catch (error) {
      const errorMessage;

      dispatch({ type)
      toast({
        title,description,variant
      })
    };
  };
  // Create a new subscription/
  const createSubscription;
    if (!authState.user) {
      toast({
        title,description,variant
      })
      router.push("/sign-in")/
      return
    };
    try {
      dispatch({ type)

      // In a real app, this would create a checkout session with Stripe or another payment provider/
      // For this demo, we'll create a subscription record directly/

      const plan;

      if (!plan) {
        throw new Error("Invalid subscription plan")
      };
      // Create subscription record/
      const { data;
        .from("subscriptions")
        .insert({
          user_id;
          status: plan.price,plan_id,subscription_start;
          subscription_end: plan.price;
          trial_end: plan.price;
          payment_provider: plan.price;
          payment_provider_id: plan.price
        })
        .select()
        .single()

      if (error) throw error

      // Update user profile with subscription tier/
      await supabase.from("profiles").update({ subscription_tier)

      dispatch({
        type,payload
      })

      toast({
        title,description,variant
      })

      router.push("/dashboard")/
    } catch (error) {
      const errorMessage;

      dispatch({ type)
      toast({
        title,description,variant
      })
    } finally {
      dispatch({ type
    };
  };
  // Cancel subscription/
  const cancelSubscription;
    if (!authState.user || !state.subscription) {
      toast({
        title,description,variant
      })
      return
    };
    try {
      dispatch({ type)

      // In a real app, this would cancel the subscription with the payment provider/

      // Update subscription status/
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status,subscription_end
        })
        .eq("id", state.subscription.id)
        .eq("user_id", authState.user.id)

      if (error) throw error

      // Update user profile/
      await supabase.from("profiles").update({ subscription_tier)

      // Refresh subscription data/
      await fetchSubscription()

      toast({
        title,description,variant
      })
    } catch (error) {
      const errorMessage;

      dispatch({ type)
      toast({
        title,description,variant
      })
    } finally {
      dispatch({ type
    };
  };
  // Update subscription/
  const updateSubscription;
    if (!authState.user) {
      toast({
        title,description,variant
      })
      router.push("/sign-in")/
      return
    };
    try {
      dispatch({ type)

      const plan;

      if (!plan) {
        throw new Error("Invalid subscription plan")
      };
      if (!state.subscription) {
        // Create new subscription if none exists/
        return await createSubscription(planId)
      };
      // In a real app, this would update the subscription with the payment provider/

      // Update subscription record/
      const { data;
        .from("subscriptions")
        .update({
          plan_id,status,updated_at
        })
        .eq("id", state.subscription.id)
        .eq("user_id", authState.user.id)
        .select()
        .single()

      if (error) throw error

      // Update user profile/
      await supabase.from("profiles").update({ subscription_tier)

      dispatch({
        type,payload
      })

      toast({
        title,description,variant
      })
    } catch (error) {
      const errorMessage;

      dispatch({ type)
      toast({
        title,description,variant
      })
    } finally {
      dispatch({ type
    };
  };
  // Get current subscription tier/
  const getSubscriptionTier;
    if (!state.subscription || state.subscription.status !== "active") {
      return "free"
    };
    const plan;
    return plan?.tier || "free"
  };
  // Check if subscription has a specific feature/
  const hasFeature;
    if (!state.subscription || state.subscription.status !== "active") {
      // Free tier features/
      const freePlan;
      return freePlan?.features.includes(featureId) || false
    };
    const plan;
    return plan?.features.includes(featureId) || false
  };
  // Get remaining days in subscription or trial/
  const getRemainingDays;
    if (!state.subscription) {
      return null
    };
    const now;
    let endDate: Date| null;

    if (state.subscription.status)
      endDate
    } else if (state.subscription.subscription_end) {
      endDate
    };
    if (!endDate) {
      return null
    };
    const diffTime;
    const diffDays;

    return diffDays > 0 ? diffDays
  };
  return (
    <SubscriptionContext.Provider
      value;
        state,
        fetchSubscription,
        createSubscription,
        cancelSubscription,
        updateSubscription,
        getSubscriptionTier,
        hasFeature,
        getRemainingDays,
      }};
    >
      {children};
    </SubscriptionContext.Provider>/
  )
};
// Create hook for using the context/
export const useSubscription;
  const context;

  if (context)
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  };
  return context
};
'use client';

import type React from 'react';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import type { AuthState } from '@/contexts/auth-context';

// Define types
export type SubscriptionTier = 'free' | 'basic' | 'premium';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid';

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
  payment_provider: 'stripe' | 'paypal' | null;
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
      type: 'INITIALIZE';
      payload: { subscription: Subscription | null; plans: SubscriptionPlan[] };
    }
  | { type: 'SET_SUBSCRIPTION'; payload: Subscription | null }
  | { type: 'SET_PLANS'; payload: SubscriptionPlan[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_SUBSCRIPTION' }
  | { type: 'RESET' };

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
    case 'INITIALIZE':
      return {
        ...state,
        subscription: action.payload.subscription,
        availablePlans: action.payload.plans,
        isLoading: false,
        isInitialized: true,
      };
    case 'SET_SUBSCRIPTION':
      return {
        ...state,
        subscription: action.payload,
        isLoading: false,
      };
    case 'SET_PLANS':
      return {
        ...state,
        availablePlans: action.payload,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_SUBSCRIPTION':
      return {
        ...state,
        subscription: null,
        isLoading: true,
      };
    case 'RESET':
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
      id: '1',
      name: 'Unlimited stories',
      description: 'All themes & settings',
      price: '0',
      interval: 'month',
      tier: 'premium',
      features: [
        {
          id: '1',
          name: 'Advanced character creation',
          description: '',
          quantity: 0,
        },
        { id: '2', name: 'Download as PDF', description: '', quantity: 0 },
        { id: '3', name: 'New themes monthly', description: '', quantity: 0 },
      ],
      is_popular: true,
    },
    {
      id: '2',
      name: 'Everything in Unlimited',
      description: 'Up to 5 family profiles',
      price: '0',
      interval: 'month',
      tier: 'premium',
      features: [
        { id: '4', name: 'Audio narration', description: '', quantity: 0 },
        {
          id: '5',
          name: 'Print-ready illustrations',
          description: '',
          quantity: 0,
        },
        {
          id: '6',
          name: 'Priority new features',
          description: '',
          quantity: 0,
        },
        { id: '7', name: 'Exclusive themes', description: '', quantity: 0 },
      ],
    },
  ];

  // Initialize subscription
  useEffect(() => {
    console.log('[DEBUG] SubscriptionContext useEffect:', {
      authInitialized: auth.state.isInitialized,
      authLoading: auth.state.isLoading,
      userId: auth.state.user?.id,
      subscriptionInitialized: state.isInitialized,
      subscriptionLoading: state.isLoading,
      hasAuthUser: !!auth.state.user,
      isAuthenticated: auth.state.isAuthenticated,
    });

    // Wait for auth to be initialized
    if (!auth.state.isInitialized) {
      console.log('[DEBUG] Auth not initialized yet, waiting...');
      return;
    }

    // If auth is initialized but no user, initialize with default plans
    if (!auth.state.user?.id) {
      console.log(
        '[DEBUG] Auth initialized but no user, setting default state'
      );
      dispatch({
        type: 'INITIALIZE',
        payload: {
          subscription: null,
          plans: defaultPlans,
        },
      });
      return;
    }

    const userId = auth.state.user.id;

    const fetchSubscriptionData = async () => {
      try {
        console.log('[DEBUG] Starting subscription fetch for user:', userId);
        dispatch({ type: 'SET_LOADING', payload: true });

        const response = await fetch('/api/subscriptions', {
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[DEBUG] Subscription fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(errorData.error || 'Failed to fetch subscription');
        }

        const subscription = await response.json();
        console.log(
          '[DEBUG] Subscription data fetched successfully:',
          subscription
        );

        dispatch({
          type: 'INITIALIZE',
          payload: {
            subscription,
            plans: defaultPlans,
          },
        });
      } catch (error) {
        console.error('[DEBUG] Error in subscription fetch:', {
          error,
          userId,
          context: 'fetchSubscriptionData',
        });
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    if (!state.isInitialized || !state.subscription) {
      console.log(
        '[DEBUG] Fetching subscription data - not initialized or no subscription'
      );
      fetchSubscriptionData();
    }
  }, [
    auth.state.isInitialized,
    auth.state.user?.id,
    auth.state.isAuthenticated,
  ]);

  const fetchSubscription = async () => {
    const userId = auth.state.user?.id;

    if (!userId) {
      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: null,
      });
      return;
    }

    try {
      console.log('[DEBUG] Fetching subscription from API');
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/subscriptions', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch subscription');
      }

      const data = await response.json();
      console.log('[DEBUG] Subscription API response:', data);

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: data,
      });
    } catch (error) {
      console.error('[DEBUG] Error fetching subscription:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Failed to fetch subscription',
      });
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to fetch subscription',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createSubscription = async (tier: SubscriptionTier) => {
    const userId = auth.state.user?.id;

    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a subscription',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[DEBUG] Creating subscription via API:', { tier });
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const data = await response.json();
      console.log('[DEBUG] Subscription created:', data);

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: data,
      });

      toast({
        title: 'Success',
        description: 'Subscription created successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('[DEBUG] Error creating subscription:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Failed to create subscription',
      });
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create subscription',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const cancelSubscription = async () => {
    const userId = auth.state.user?.id;

    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to cancel your subscription',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[DEBUG] Canceling subscription via API');
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'canceled' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      const data = await response.json();
      console.log('[DEBUG] Subscription canceled:', data);

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: data,
      });

      toast({
        title: 'Success',
        description: 'Subscription canceled successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('[DEBUG] Error canceling subscription:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Failed to cancel subscription',
      });
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateSubscription = async (tier: SubscriptionTier) => {
    const userId = auth.state.user?.id;

    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your subscription',
        variant: 'destructive',
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = (await supabase
        .from('subscriptions')
        .update({
          tier,
          plan_id: tier === 'premium' ? '1' : '2',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()) as unknown as { data: Subscription | null; error: any };

      if (error) throw error;

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: data,
      });

      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating subscription', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to update subscription',
      });
      toast({
        title: 'Error',
        description:
          (error as Error).message || 'Failed to update subscription',
        variant: 'destructive',
      });
    }
  };

  const getSubscriptionTier = (): SubscriptionTier => {
    if (!state.subscription) return 'free';
    return state.subscription.plan_id === '1' ? 'premium' : 'basic';
  };

  const hasFeature = (feature: string): boolean => {
    const tier = getSubscriptionTier();
    const plan = defaultPlans.find((p) => p.tier === tier);
    if (!plan) return false;
    return plan.features.some((f) => f.name === feature);
  };

  const getRemainingDays = (): number | null => {
    if (!state.subscription?.subscription_end) return null;

    const endDate = new Date(state.subscription.subscription_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
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
  if (context === undefined) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }
  return context;
};

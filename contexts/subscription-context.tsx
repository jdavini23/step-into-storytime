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
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'past_due';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  subscription_start: string;
  subscription_end: string;
  trial_end?: string;
  payment_provider?: string;
  plan_id: string;
  features?: SubscriptionFeature[];
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
  const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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
    if (!auth.state.isInitialized) {
      return;
    }

    if (!auth.state.isInitialized || !auth.state.user) {
      dispatch({ type: 'RESET' });
      return;
    }

    initializeSubscription();
  }, [auth.state.isInitialized, auth.state.user?.id]);

  // Initialize subscription state
  const initializeSubscription = async () => {
    const userId = auth.state.user?.id;

    if (!userId) {
      dispatch({
        type: 'INITIALIZE',
        payload: { subscription: null, plans: SUBSCRIPTION_PLANS },
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Fetch user's subscription
      const { data, error } = (await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()) as unknown as { data: Subscription | null; error: any };

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for new users
        console.error('Error fetching subscription', error);
        throw error;
      }

      dispatch({
        type: 'INITIALIZE',
        payload: { subscription: data, plans: SUBSCRIPTION_PLANS },
      });
    } catch (error) {
      console.error('Error initializing subscription', error);
      dispatch({
        type: 'INITIALIZE',
        payload: { subscription: null, plans: SUBSCRIPTION_PLANS },
      });
    }
  };

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
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = (await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()) as unknown as { data: Subscription | null; error: any };

      if (error) throw error;

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: data,
      });
    } catch (error) {
      console.error('Error fetching subscription', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to fetch subscription',
      });
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to fetch subscription',
        variant: 'destructive',
      });
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
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = (await supabase.from('subscriptions').insert([
        {
          user_id: userId,
          tier,
          status: 'active',
          subscription_start: new Date().toISOString(),
          subscription_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          plan_id: tier === 'premium' ? '1' : '2',
        },
      ])) as unknown as { data: Subscription[] | null; error: any };

      if (error) throw error;

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: data?.[0] ?? null,
      });

      toast({
        title: 'Success',
        description: 'Subscription created successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating subscription', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to create subscription',
      });
      toast({
        title: 'Error',
        description:
          (error as Error).message || 'Failed to create subscription',
        variant: 'destructive',
      });
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
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          subscription_end: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      dispatch({ type: 'CLEAR_SUBSCRIPTION' });

      toast({
        title: 'Success',
        description: 'Subscription canceled successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error canceling subscription', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to cancel subscription',
      });
      toast({
        title: 'Error',
        description:
          (error as Error).message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
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
    if (state.subscription.status !== 'active') return 'free';
    return state.subscription.tier;
  };

  const hasFeature = (feature: string): boolean => {
    const tier = getSubscriptionTier();
    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === tier);
    if (!plan) return false;
    return plan.features.some((f) => f.name === feature);
  };

  const getRemainingDays = (): number | null => {
    if (!state.subscription) return null;
    if (state.subscription.status !== 'active') return null;

    const end = new Date(state.subscription.subscription_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

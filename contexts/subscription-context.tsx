'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  // fetchSubscription as fetchSubscriptionService, // Will import from lib/api
  createSubscription as createSubscriptionService,
  cancelSubscription as cancelSubscriptionService,
  fetchStoryUsage as fetchStoryUsageService,
} from '@/services/subscriptionService';
import { fetchSubscription } from '@/lib/api/subscription'; // Import the correct fetchSubscription
import type {
  SubscriptionState,
  SubscriptionAction,
  DbSubscription,
  StoryUsage,
  SubscriptionTier,
} from '@/types/subscription';
import {
  getSubscriptionTier as getSubscriptionTierUtil,
  canGenerateStory as canGenerateStoryUtil,
  getRemainingStories as getRemainingStoriesUtil,
  hasFeature as hasFeatureUtil,
  getRemainingDays as getRemainingDaysUtil,
} from '@/hooks/use-subscription-utils';

export interface FetchedPlan {
  id: string; // Price ID
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  intervalCount: number;
  features: string[];
  metadata: Record<string, any>;
  active: boolean;
  highlight: boolean;
}

type SubscriptionContextType = {
  state: SubscriptionState;
  availablePlans: FetchedPlan[];
  isLoadingPlans: boolean;
  plansError: string | null;
  createSubscription: (tier: SubscriptionTier, priceId: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  getSubscriptionTier: () => SubscriptionTier;
  canGenerateStory: () => boolean;
  getRemainingStories: () => number;
  hasFeature: (feature: string) => boolean;
  getRemainingDays: () => number | null;
  fetchSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }
  return context;
}

const initialState: SubscriptionState = {
  isInitialized: false,
  subscription: null,
  storyUsage: null,
  isLoading: true,
  error: null,
};

function subscriptionReducer(
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState {
  switch (action.type) {
    case 'SET_SUBSCRIPTION':
      return {
        ...state,
        subscription: action.payload,
        isInitialized: true,
        isLoading: false,
        error: null,
      };
    case 'SET_STORY_USAGE':
      return {
        ...state,
        storyUsage: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const [availablePlans, setAvailablePlans] = useState<FetchedPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const auth = useAuth();
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    if (!auth.state.user) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_SUBSCRIPTION', payload: null });
      dispatch({ type: 'SET_STORY_USAGE', payload: null });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Fetch subscription using the new API function
      const subscriptionData = await fetchSubscription();

      // Fetch usage data (keep using service for now)
      const usageResult = await fetchStoryUsageService(auth.state.user.id);
      const finalUsage = usageResult.error ? null : usageResult.data;

      // Dispatch updates
      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: subscriptionData, // Directly use the fetched data
      });
      dispatch({
        type: 'SET_STORY_USAGE',
        payload: finalUsage, // Use usage data as before
      });
    } catch (error) {
      console.error('Error in subscription initialization:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [auth.state.user]);

  const fetchAvailablePlans = useCallback(async () => {
    setIsLoadingPlans(true);
    setPlansError(null);
    try {
      // Use window.location.origin to get the current origin including protocol, hostname, and port
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/stripe/products`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch plans');
      }
      const data = await response.json();
      setAvailablePlans(data.plans || []);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setPlansError(err instanceof Error ? err.message : 'Unknown error fetching plans');
      setAvailablePlans([]); // Clear plans on error
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    if (!auth.state.isLoading) {
      if (auth.state.isAuthenticated && auth.state.user) {
        fetchUserData();
        fetchAvailablePlans(); // Fetch plans when authenticated
      } else {
        // Reset state if not authenticated
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_SUBSCRIPTION', payload: null });
        dispatch({ type: 'SET_STORY_USAGE', payload: null });
        dispatch({ type: 'SET_ERROR', payload: null });
        setAvailablePlans([]); // Clear plans if not authenticated
        setIsLoadingPlans(false);
      }
    }
  }, [auth.state.isLoading, auth.state.isAuthenticated, auth.state.user, fetchUserData, fetchAvailablePlans]);

  const createSubscription = useCallback(
    async (tier: SubscriptionTier, priceId: string) => {
      if (!auth.state.user) {
        throw new Error('User must be authenticated to create a subscription');
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // Use window.location.origin to get the current origin including protocol, hostname, and port
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/stripe/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            userId: auth.state.user.id,
            email: auth.state.user.email,
            tier,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const { sessionId } = await response.json();

        // Redirect to Stripe checkout
        const stripe = (await import('@stripe/stripe-js')).loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        );
        const stripeInstance = await stripe;
        if (stripeInstance) {
          await stripeInstance.redirectToCheckout({ sessionId });
        } else {
          throw new Error('Stripe.js failed to load.');
        }
      } catch (err) {
        console.error('Error creating subscription:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: `Failed to initiate subscription: ${message}` });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [auth.state.user]
  );

  const cancelSubscription = useCallback(
    async (subscriptionId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const { data, error } = await cancelSubscriptionService(subscriptionId);
        if (error) throw error;
        dispatch({ type: 'SET_SUBSCRIPTION', payload: data });
        router.push('/dashboard');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    [router]
  );

  const value = {
    state,
    availablePlans,
    isLoadingPlans,
    plansError,
    createSubscription,
    cancelSubscription,
    getSubscriptionTier: () => getSubscriptionTierUtil(state.subscription),
    canGenerateStory: () =>
      canGenerateStoryUtil(state.subscription, state.storyUsage),
    getRemainingStories: () =>
      getRemainingStoriesUtil(state.subscription, state.storyUsage),
    hasFeature: (feature: string) =>
      hasFeatureUtil(state.subscription, feature),
    getRemainingDays: () => getRemainingDaysUtil(state.subscription),
    fetchSubscription: fetchUserData,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

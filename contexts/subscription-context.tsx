'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  fetchSubscription as fetchSubscriptionService,
  createSubscription as createSubscriptionService,
  cancelSubscription as cancelSubscriptionService,
  fetchStoryUsage as fetchStoryUsageService,
} from '@/services/subscriptionService';
import type {
  SubscriptionState,
  SubscriptionAction,
  DbSubscription,
  StoryUsage,
  SubscriptionTier,
  Product,
} from '@/types/subscription';
import {
  getSubscriptionTier as getSubscriptionTierUtil,
  canGenerateStory as canGenerateStoryUtil,
  getRemainingStories as getRemainingStoriesUtil,
  hasFeature as hasFeatureUtil,
  getRemainingDays as getRemainingDaysUtil,
} from '@/hooks/use-subscription-utils';
import { PRICING_PLANS } from '@/constants/pricing';

type SubscriptionContextType = {
  state: SubscriptionState;
  createSubscription: (tier: SubscriptionTier) => Promise<void>;
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
  isLoading: false,
  error: null,
  availablePlans: [],
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
    case 'SET_AVAILABLE_PLANS':
      return {
        ...state,
        availablePlans: action.payload,
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
  const auth = useAuth();
  const router = useRouter();

  const fetchSubscription = useCallback(async () => {
    if (!auth.state.user?.id) {
      dispatch({
        type: 'SET_AVAILABLE_PLANS',
        payload: [
          {
            id: 'free',
            name: PRICING_PLANS.free.title,
            tier: 'free',
            features: PRICING_PLANS.free.features,
            prices: [],
          },
          {
            id: 'story_creator',
            name: PRICING_PLANS.unlimited.title,
            tier: 'story_creator',
            features: PRICING_PLANS.unlimited.features,
            prices: [],
          },
          {
            id: 'family',
            name: PRICING_PLANS.family.title,
            tier: 'family',
            features: PRICING_PLANS.family.features,
            prices: [],
          },
        ],
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const [subResult, usageResult] = await Promise.all([
        fetchSubscriptionService(),
        fetchStoryUsageService(auth.state.user.id),
      ]);

      if (subResult.error) {
        console.error('Error fetching subscription:', subResult.error);
        dispatch({ type: 'SET_ERROR', payload: subResult.error.message });
        return;
      }

      const finalUsage = usageResult.error ? null : usageResult.data;

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: subResult.data,
      });
      dispatch({
        type: 'SET_STORY_USAGE',
        payload: finalUsage,
      });
    } catch (error) {
      console.error('Error in subscription initialization:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [auth.state.user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const createSubscription = useCallback(
    async (tier: SubscriptionTier) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const { data, error } = await createSubscriptionService(tier);
        if (error) throw error;
        dispatch({ type: 'SET_SUBSCRIPTION', payload: data });
        router.push('/dashboard');
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [router]
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
    fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

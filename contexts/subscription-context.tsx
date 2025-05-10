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
import { toast } from '@/hooks/use-toast';
import {
  fetchSubscription as fetchSubscriptionService,
  createSubscription as createSubscriptionService,
  cancelSubscription as cancelSubscriptionService,
  updateSubscription as updateSubscriptionService,
  incrementStoryUsage as incrementStoryUsageService,
  fetchStoryUsage as fetchStoryUsageService,
  cancelSubscription,
  createSubscription,
  fetchSubscription,
  updateSubscription,
} from '@/services/subscriptionService';
import {
  SubscriptionState,
  SubscriptionAction,
  Subscription,
  StoryUsage,
  SubscriptionTier,
  Product,
  Price,
  SubscriptionStatus,
  SubscriptionPlan,
} from '@/types/subscription';
import {
  getSubscriptionTier as getSubscriptionTierUtil,
  canGenerateStory as canGenerateStoryUtil,
  getRemainingStories as getRemainingStoriesUtil,
  hasFeature as hasFeatureUtil,
  getRemainingDays as getRemainingDaysUtil,
} from '@/hooks/use-subscription-utils';
import { PRICING_PLANS } from '@/constants/pricing'; // Assuming PRICING_PLANS defines the structure for availablePlans
import { type } from 'os';
import { title } from 'process';
import { string } from 'zod';

// Re-export subscription types
export type {
  SubscriptionState,
  SubscriptionAction,
  Subscription,
  StoryUsage,
  SubscriptionTier,
  Product,
  Price,
  SubscriptionStatus,
  SubscriptionPlan,
};

// Initial state remains, but uses imported types and potentially simplifies availablePlans logic
const initialState: SubscriptionState = {
  isInitialized: false,
  subscription: null,
  storyUsage: null,
  isLoading: false,
  error: null,
  availablePlans: [
    {
      id: 'free',
      name: PRICING_PLANS.free.title,
      tier: 'free',
      features: PRICING_PLANS.free.features,
      prices: [], // Ensure prices array exists
    },
    {
      id: 'story_creator',
      name: PRICING_PLANS.unlimited.title,
      tier: 'story_creator',
      features: PRICING_PLANS.unlimited.features,
      prices: [], // Ensure prices array exists
    },
    {
      id: 'family',
      name: PRICING_PLANS.family.title,
      tier: 'family',
      features: PRICING_PLANS.family.features,
      prices: [], // Ensure prices array exists
    },
  ],
};

// Reducer remains similar, using imported types
const subscriptionReducer = (
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        subscription: action.payload.subscription,
        storyUsage: action.payload.storyUsage,
        isLoading: false,
        isInitialized: action.payload.isInitialized,
        availablePlans: action.payload.availablePlans || state.availablePlans, // Keep existing if none provided
      };
    case 'SET_SUBSCRIPTION':
      return {
        ...state,
        subscription: action.payload,
        isLoading: false,
      };
    case 'SET_STORY_USAGE':
      return {
        ...state,
        storyUsage: action.payload,
        isLoading: false,
      };
    case 'INCREMENT_STORY_COUNT':
      return state.storyUsage
        ? {
            ...state,
            storyUsage: {
              ...state.storyUsage,
              story_count: state.storyUsage.story_count + 1,
              updated_at: new Date().toISOString(),
            },
          }
        : state;
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_SUBSCRIPTION':
      return {
        ...state,
        subscription: null,
        storyUsage: null,
        isLoading: false,
      };
    case 'RESET':
      return initialState;
    default:
      // Add explicit check for exhaustive switch
      const exhaustiveCheck: never = action;
      return state;
  }
};

// Context type definition
interface SubscriptionContextType {
  state: SubscriptionState;
  fetchSubscription: () => Promise<void>;
  createSubscription: (tier: SubscriptionTier) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updateSubscription: (tier: SubscriptionTier) => Promise<void>;
  getSubscriptionTier: () => SubscriptionTier;
  canGenerateStory: () => boolean;
  incrementStoryCount: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  getRemainingStories: () => number;
  getRemainingDays: () => number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

// Provider component
export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const auth = useAuth();
  const router = useRouter();

  // --- Initialization --- //
  const initialize = useCallback(async () => {
    if (!auth.state.user?.id) {
      dispatch({
        type: 'INITIALIZE',
        payload: { ...initialState, isInitialized: true },
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const [subResult, usageResult] = await Promise.all([
        fetchSubscriptionService(),
        fetchStoryUsageService(auth.state.user.id),
      ]);

      if (subResult.error) {
        console.error('Error fetching subscription:', subResult.error);
        // Use default free tier if fetch fails but user exists
      }
      if (usageResult.error && usageResult.error.code !== 'PGRST116') {
        // Log error if it's not 'not found'
        console.error('Error fetching story usage:', usageResult.error);
      }

      // Ensure we have a default free subscription if none is found
      let finalSubscription = subResult.data;
      if (!finalSubscription) {
        // Look for the predefined free plan or use a hardcoded fallback
        const freePlan = state.availablePlans?.find((p) => p.tier === 'free');
        const freePlanStoryLimit = PRICING_PLANS.free.features.includes(
          '5 story generations per month'
        )
          ? 5
          : 1; // Or get from a dedicated field if exists

        finalSubscription = {
          id: '', // Placeholder ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: auth.state.user.id,
          status: 'active',
          plan_id: 'free', // Use string ID for free plan
          subscription_plans: freePlan
            ? {
                id: 1, // Use assumed numeric ID for free plan
                tier: freePlan.tier as SubscriptionTier,
                name: freePlan.name,
                description: PRICING_PLANS.free.description || '', // Add description if available in PRICING_PLANS
                price_monthly: 0,
                story_limit: freePlanStoryLimit, // Use consistent limit
                features: freePlan.features,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : {
                // Fallback plan details (ensure this matches SubscriptionPlan type)
                id: 1, // Use assumed numeric ID for free plan
                tier: 'free',
                name: 'Free Tier',
                description: 'Basic plan',
                price_monthly: 0,
                story_limit: 1, // Fallback story limit
                features: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString(), // Example: 1 year end
          subscription_start: new Date().toISOString(),
          subscription_end: null, // Use null instead of ''
          trial_end: null,
          payment_provider: null,
          payment_provider_id: null,
        };
      }

      // Handle case where usage data doesn't exist (create default)
      let finalUsage = usageResult.data;
      if (!finalUsage && usageResult.error?.code === 'PGRST116') {
        // Create a default usage record if none exists
        finalUsage = {
          id: 0, // Use placeholder numeric ID (assuming number type)
          user_id: auth.state.user.id,
          story_count: 0,
          reset_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        // Optionally: insert this default record into the DB asynchronously
        // Do not await here to avoid blocking initialization
        // createDefaultStoryUsage(auth.state.user.id);
      }

      dispatch({
        type: 'INITIALIZE',
        payload: {
          subscription: finalSubscription,
          storyUsage: finalUsage,
          isInitialized: true,
          availablePlans: state.availablePlans, // Assuming plans are static for now
        },
      });
    } catch (error) {
      console.error('Subscription initialization failed:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to initialize subscription',
      });
      // Initialize with defaults even on error to unblock UI
      dispatch({
        type: 'INITIALIZE',
        payload: { ...initialState, isInitialized: true },
      }); // Remove error field
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [auth.state.user, dispatch, state.availablePlans]);

  useEffect(() => {
    if (auth.state.isInitialized && !state.isInitialized) {
      initialize();
    }
  }, [auth.state.isInitialized, state.isInitialized, initialize]);

  // --- Helper Functions (using utils) --- //
  const getSubscriptionTier = useCallback(() => {
    return getSubscriptionTierUtil(state.subscription);
  }, [state.subscription]);

  const canGenerateStory = useCallback(() => {
    return canGenerateStoryUtil(state.subscription, state.storyUsage);
  }, [state.subscription, state.storyUsage]);

  const getRemainingStories = useCallback(() => {
    return getRemainingStoriesUtil(state.subscription, state.storyUsage);
  }, [state.subscription, state.storyUsage]);

  const hasFeature = useCallback(
    (feature: string) => {
      return hasFeatureUtil(state.subscription, feature);
    },
    [state.subscription]
  );

  const getRemainingDays = useCallback(() => {
    return getRemainingDaysUtil(state.subscription);
  }, [state.subscription]);

  // --- Define the core API call logic --- //
  const apiCallHandler = async <T,>(
    serviceCall: () => Promise<{ data: T | null; error: Error | null }>,
    successMessage: string,
    errorMessageBase: string,
    updateState?: (data: T) => void
  ): Promise<void> => {
    if (!auth.state.user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in.',
        variant: 'destructive',
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { data, error } = await serviceCall();

      if (error) {
        console.error(`${errorMessageBase}:`, error);
        toast({
          title: errorMessageBase,
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
        dispatch({
          type: 'SET_ERROR',
          payload: error.message || 'An unexpected error occurred',
        });
        return;
      }

      if (!data) {
        throw new Error('No data received from server');
      }

      updateState?.(data);
      toast({
        title: successMessage,
        variant: 'default',
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('An unexpected error occurred');
      console.error(`${errorMessageBase}:`, error);
      toast({
        title: errorMessageBase,
        description: error.message,
        variant: 'destructive',
      });
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // --- Memoized Action Handlers (using the handler above) --- //

  // Memoize the handler using useCallback
  const handleApiCall = useCallback(apiCallHandler, [
    auth.state.user, // Need user state for the check inside apiCallHandler
    dispatch, // Need dispatch for state updates
    // router is not directly used in apiCallHandler, but might be if uncommenting redirection
    // Add router here if redirection is used, otherwise it can be omitted
  ]);

  const fetchSubscription = useCallback(async () => {
    // Use the initializer logic for fetching/refreshing
    if (state.isInitialized) {
      // Only fetch if already initialized
      await initialize();
    }
  }, [initialize, state.isInitialized]);

  const createSubscription = useCallback(
    async (tier: SubscriptionTier) => {
      return apiCallHandler(
        () => createSubscriptionService(tier),
        'Subscription created successfully',
        'Failed to create subscription',
        (data) => {
          if (data) {
            dispatch({ type: 'SET_SUBSCRIPTION', payload: data });
            router.push('/dashboard');
          }
        }
      );
    },
    [apiCallHandler, dispatch, router]
  );

  const cancelSubscription = useCallback(() => {
    // Pass router explicitly if needed for redirection after success
    return handleApiCall(
      cancelSubscriptionService,
      'Subscription canceled successfully.',
      'Failed to cancel subscription',
      (data: Subscription | null) => {
        dispatch({ type: 'SET_SUBSCRIPTION', payload: data });
        router.push('/dashboard'); // Redirect after cancel
      }
    );
  }, [handleApiCall, router]); // Keep router dependency here as it's used in the callback

  const updateSubscription = useCallback(
    (tier: SubscriptionTier) => {
      // Pass router explicitly if needed for redirection after success
      return handleApiCall(
        () => updateSubscriptionService(tier),
        'Subscription updated successfully.',
        'Failed to update subscription',
        (data: Subscription | null) => {
          dispatch({ type: 'SET_SUBSCRIPTION', payload: data });
          router.push('/dashboard'); // Redirect after update
        }
      );
    },
    [handleApiCall, router]
  ); // Keep router dependency here as it's used in the callback

  const incrementStoryCount = useCallback(async () => {
    if (!auth.state.user?.id) return;

    const tier = getSubscriptionTier();
    if (tier !== 'free') return; // Only track for free tier

    // Optimistic UI update (optional)
    // dispatch({ type: 'INCREMENT_STORY_COUNT' });

    try {
      const { success, error } = await incrementStoryUsageService(
        auth.state.user.id
      );
      if (error) throw error;

      if (success) {
        // Confirm optimistic update or fetch latest usage
        dispatch({ type: 'INCREMENT_STORY_COUNT' }); // Update state after confirmation
        // OR: await fetchStoryUsage(); // Fetch latest count
      } else {
        // Revert optimistic update if needed
        toast({
          title: 'Story limit reached',
          description: 'Please upgrade.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating story count:', error);
      toast({
        title: 'Error',
        description: 'Failed to update story count',
        variant: 'destructive',
      });
      // Revert optimistic update if implemented
    }
    // Adjusted dependencies: getSubscriptionTier is derived from state, auth.state.user.id is needed
  }, [auth.state.user?.id, dispatch, getSubscriptionTier]);

  // --- Provide Context Value --- //
  const value = {
    state,
    fetchSubscription,
    createSubscription,
    cancelSubscription,
    updateSubscription,
    getSubscriptionTier,
    canGenerateStory,
    incrementStoryCount,
    hasFeature,
    getRemainingStories,
    getRemainingDays,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Custom hook to use the context
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }
  return context;
}

function async<T>(
  serviceCall: () => Promise<{ data: T | null; error: Error | null }>,
  arg1: () => any,
  successMessage: any,
  string: (
    params?: import('zod').RawCreateParams & { coerce?: true }
  ) => import('zod').ZodString,
  errorMessageBase: any,
  string1: (
    params?: import('zod').RawCreateParams & { coerce?: true }
  ) => import('zod').ZodString,
  arg6: any
) {
  throw new Error('Function not implemented.');
}

function updateState(data: any) {
  throw new Error('Function not implemented.');
}

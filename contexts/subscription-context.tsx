'use client';

import type React from 'react';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { PRICING_PLANS } from '@/constants/pricing';

// Define types
export type SubscriptionTier = 'free' | 'story_creator' | 'family';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid';

export interface StoryUsage {
  id: string;
  user_id: string;
  story_count: number;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
  };
}

export interface Product {
  id: string;
  name: string;
  tier: string;
  prices?: Price[];
  features: string[];
}

export interface SubscriptionPlan {
  id: number;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price_monthly: number;
  story_limit: number;
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: number;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  subscription_start: string;
  subscription_end: string;
  trial_end: string | null;
  payment_provider: string | null;
  created_at: string;
  updated_at: string;
  subscription_plans: SubscriptionPlan;
  price?: Price;
  subscription_start?: string;
  trial_end?: string;
  subscription_end?: string;
  payment_provider?: string;
}

type SubscriptionState = {
  isInitialized: boolean;
  subscription: Subscription | null;
  storyUsage: StoryUsage | null;
  isLoading: boolean;
  error: string | null;
  availablePlans?: Product[];
};

type SubscriptionAction =
  | {
      type: 'INITIALIZE';
      payload: {
        subscription: Subscription | null;
        storyUsage: StoryUsage | null;
        isInitialized: boolean;
        availablePlans?: Product[];
      };
    }
  | { type: 'SET_SUBSCRIPTION'; payload: Subscription | null }
  | { type: 'SET_STORY_USAGE'; payload: StoryUsage | null }
  | { type: 'INCREMENT_STORY_COUNT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_SUBSCRIPTION' }
  | { type: 'RESET' };

// Create initial state
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
    },
    {
      id: 'story_creator',
      name: PRICING_PLANS.unlimited.title,
      tier: 'story_creator',
      features: PRICING_PLANS.unlimited.features,
    },
    {
      id: 'family',
      name: PRICING_PLANS.family.title,
      tier: 'family',
      features: PRICING_PLANS.family.features,
    },
  ],
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
        storyUsage: action.payload.storyUsage,
        isLoading: false,
        isInitialized: action.payload.isInitialized,
        availablePlans: action.payload.availablePlans,
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
  canGenerateStory: () => boolean;
  incrementStoryCount: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  getRemainingStories: () => number;
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

  useEffect(() => {
    // Only run initialization if user is authenticated and not already initialized
    if (auth.state.isInitialized && auth.state.user && !state.isInitialized) {
      const initializeSubscription = async () => {
        // Ensure user is not null before proceeding
        if (!auth.state.isInitialized || !auth.state.user) {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              subscription: null,
              storyUsage: null,
              isInitialized: true,
              availablePlans: [],
            },
          });
          return;
        }

        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          let subscriptionData = null;
          // Fetch subscription data
          const { data: subData, error: subError } = await supabase()
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', auth.state.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const initialSubData = {
            subscription_plans: {
              id: 1,
              tier: 'free' as SubscriptionTier,
              name: 'Free Tier',
              description: 'Basic story creation',
              price_monthly: 0,
              story_limit: 1,
              features: ['Basic story generation'],
            },
            user_id: auth.state.user.id,
            status: 'active' as SubscriptionStatus,
          };

          if (subError) {
            if (subError.code === 'PGRST116') {
              // No subscription found, use initial data
              subscriptionData = initialSubData;
            } else {
              throw subError;
            }
          } else {
            subscriptionData = subData || initialSubData;
          }

          // Fetch or create story usage data
          let usageData = null;
          const { data: usage, error: usageError } = await supabase()
            .from('story_usage')
            .select('*')
            .eq('user_id', auth.state.user.id)
            .maybeSingle();

          if (usageError) {
            console.error('Story usage fetch error:', usageError);

            if (usageError.code === 'PGRST116') {
              console.log('No usage record found, creating new one');
              const { data: newUsage, error: createError } = await supabase()
                .from('story_usage')
                .insert({
                  user_id: auth.state.user.id,
                  story_count: 0,
                  reset_date: new Date().toISOString(),
                })
                .select()
                .maybeSingle();

              if (createError) {
                console.error('Error creating usage record:', createError);
                throw createError;
              }

              usageData = newUsage;
            } else {
              throw usageError;
            }
          } else {
            usageData = usage;
          }

          // Fetch available plans
          const { data: availablePlans, error: plansError } = await supabase()
            .from('subscription_plans')
            .select('*');

          console.log(
            '[DEBUG] Fetched subscription plans:',
            JSON.stringify({
              hasPlans: !!availablePlans,
              plansLength: availablePlans?.length,
              plansError: !!plansError,
              errorMessage: plansError?.message,
            })
          );

          // Map the database plans to the Product interface
          const mappedPlans = plansError
            ? []
            : availablePlans.map((plan) => ({
                id: plan.id.toString(),
                name: plan.name,
                tier: plan.tier,
                features: plan.features || [],
                prices: [], // Initialize with empty prices array
              }));

          console.log(
            '[DEBUG] Mapped subscription plans:',
            JSON.stringify({
              hasMappedPlans: !!mappedPlans,
              mappedPlansLength: mappedPlans?.length,
              firstPlan: mappedPlans?.[0],
            })
          );

          dispatch({
            type: 'INITIALIZE',
            payload: {
              subscription: subscriptionData,
              storyUsage: usageData,
              isInitialized: true,
              availablePlans: mappedPlans,
            },
          });
        } catch (error) {
          console.error('Detailed subscription initialization error:', error);

          console.log(
            '[DEBUG] Error in subscription initialization:',
            JSON.stringify({
              errorType: error instanceof Error ? 'Error' : typeof error,
              errorMessage:
                error instanceof Error ? error.message : String(error),
              errorStack:
                error instanceof Error ? error.stack : 'No stack trace',
            })
          );

          dispatch({
            type: 'SET_ERROR',
            payload:
              error instanceof Error
                ? error.message
                : 'Failed to load subscription data',
          });

          // Initialize with null state to prevent loading state
          dispatch({
            type: 'INITIALIZE',
            payload: {
              subscription: null,
              storyUsage: null,
              isInitialized: true,
              availablePlans: [],
            },
          });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };

      initializeSubscription();
    }
  }, [auth.state.isInitialized, auth.state.user, state.isInitialized]);

  const getSubscriptionTier = (): SubscriptionTier => {
    if (!state.subscription || !state.subscription.subscription_plans)
      return 'free';
    return state.subscription.subscription_plans.tier as SubscriptionTier;
  };

  const canGenerateStory = (): boolean => {
    if (!state.subscription) return true; // Allow one free story before setup

    const tier = getSubscriptionTier();
    if (tier !== 'free') return true;

    const { storyUsage } = state;
    if (!storyUsage) return true;

    // Check if reset_date is older than a month
    const resetDate = new Date(storyUsage.reset_date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    if (resetDate < monthAgo) {
      // Need to reset usage count
      return true;
    }

    // Get story limit from subscription plan
    const storyLimit = state.subscription.subscription_plans?.story_limit ?? 1;

    return storyUsage.story_count < storyLimit;
  };

  const getRemainingStories = (): number => {
    const tier = getSubscriptionTier();
    if (tier !== 'free') return Infinity;

    const { storyUsage } = state;
    if (!storyUsage) return 1; // Default to 1 free story

    // Get story limit from subscription plan
    const storyLimit = state.subscription?.subscription_plans?.story_limit ?? 1;

    const resetDate = storyUsage.reset_date
      ? new Date(storyUsage.reset_date)
      : null;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    if (!resetDate || resetDate < monthAgo) {
      return storyLimit;
    }

    return Math.max(0, storyLimit - storyUsage.story_count);
  };

  const incrementStoryCount = async (): Promise<void> => {
    if (!auth.state.user?.id) return;

    const tier = getSubscriptionTier();
    if (tier !== 'free') return; // Only track for free tier

    try {
      const { data: success, error } = await supabase().rpc(
        'increment_story_usage',
        {
          user_id: auth.state.user.id,
        }
      );

      if (error) throw error;

      if (success) {
        dispatch({ type: 'INCREMENT_STORY_COUNT' });
      } else {
        toast({
          title: 'Story limit reached',
          description:
            'You have reached your monthly story limit. Please upgrade to continue.',
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
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!state.subscription || !state.subscription.subscription_plans)
      return false;

    const features = state.subscription.subscription_plans.features;
    return features ? features.includes(feature) : false;
  };

  const fetchSubscription = async () => {
    // Don't fetch if no user ID
    if (!auth.state.user?.id) {
      console.log('[DEBUG] No user ID found, clearing subscription');
      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: null,
      });
      return;
    }

    // If already loading, prevent duplicate requests
    if (state.isLoading) {
      console.log('[DEBUG] Subscription fetch already in progress, skipping');
      return;
    }

    try {
      // Start loading state while fetching subscription
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors

      console.log('[DEBUG] Making request to /api/subscriptions');
      const response = await fetch('/api/subscriptions', {
        credentials: 'include',
        cache: 'no-store', // Prevent caching to ensure fresh data
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      console.log('[DEBUG] Response status:', response.status);
      if (!response.ok) {
        let errorMessage = response.statusText || 'Unknown error';
        let errorData: any = {};

        try {
          errorData = await response.json();
          console.error('Subscription fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          console.error(
            'Response status:',
            response.status,
            response.statusText
          );
        }

        // Use a more descriptive error message
        errorMessage =
          errorData && typeof errorData === 'object' && 'error' in errorData
            ? String(errorData.error) // Explicitly convert to string
            : `HTTP Error ${response.status}: ${
                response.statusText || 'Unknown error'
              }`;

        dispatch({
          type: 'SET_ERROR',
          payload: `Failed to fetch subscription: ${errorMessage}`,
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      let data: any;
      try {
        data = await response.json();
        console.log('[DEBUG] Raw subscription data:', data);
      } catch (parseError) {
        console.error('Error parsing subscription data:', parseError);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to parse subscription data',
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // If no subscription data is returned, use the initial free tier data
      const subscriptionData = data || {
        subscription_plans: {
          id: 1,
          tier: 'free' as SubscriptionTier,
          name: 'Free Tier',
          description: 'Basic story creation',
          price_monthly: 0,
          story_limit: 1,
          features: ['Basic story generation'],
        },
        user_id: auth.state.user?.id || '',
        status: 'active' as SubscriptionStatus,
      };
      console.log('[DEBUG] Processed subscription data:', subscriptionData);

      // Ensure subscription data has a price property if it doesn't already
      if (subscriptionData && !subscriptionData.price) {
        subscriptionData.price = null;
      }

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: subscriptionData,
      });

      // Mark as initialized to prevent repeated fetches
      if (!state.isInitialized) {
        // Ensure availablePlans has the proper structure with prices array
        const updatedAvailablePlans =
          state.availablePlans?.map((plan) => ({
            ...plan,
            prices: Array.isArray(plan.prices) ? plan.prices : [],
          })) || [];

        dispatch({
          type: 'INITIALIZE',
          payload: {
            subscription: subscriptionData,
            storyUsage: state.storyUsage,
            isInitialized: true,
            availablePlans: updatedAvailablePlans,
          },
        });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      // Only log errors in development mode
      console.error(
        'Error fetching subscription:',
        error instanceof Error ? error.message : 'Unknown error'
      );

      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Failed to fetch subscription',
      });

      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createSubscription = async (tier: SubscriptionTier): Promise<void> => {
    if (!auth.state.user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to manage your subscription',
        variant: 'destructive',
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Validate tier
      if (!['free', 'story_creator', 'family'].includes(tier)) {
        throw new Error('Invalid subscription tier');
      }

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      // Refresh subscription data
      await fetchSubscription();

      toast({
        title: 'Subscription updated',
        description: `Your subscription has been updated to ${tier}`,
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
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
        // Only log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Subscription cancellation failed:', {
            status: response.status,
            statusText: response.statusText,
            error,
          });
        }
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      const data = await response.json();
      // Successfully canceled subscription

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
      // Only log errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Error canceling subscription:',
          error instanceof Error ? error.message : String(error)
        );
      }
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
      // Start loading state while updating subscription
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Only log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Subscription update failed:', {
            status: response.status,
            statusText: response.statusText,
            error,
          });
        }
        throw new Error(error.error || 'Failed to update subscription');
      }

      const data = await response.json();
      // Successfully updated subscription

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
      // Only log errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Error updating subscription:',
          error instanceof Error ? error.message : String(error)
        );
      }
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : 'Failed to update subscription',
      });
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update subscription',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getRemainingDays = (): number | null => {
    if (!state.subscription || !state.subscription.current_period_end) {
      return null;
    }

    const currentPeriodEnd = new Date(state.subscription.current_period_end);
    const now = new Date();
    const diff = currentPeriodEnd.getTime() - now.getTime();
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
        canGenerateStory,
        incrementStoryCount,
        hasFeature,
        getRemainingStories,
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

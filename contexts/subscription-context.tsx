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

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | 'trialing';

export interface StoryUsage {
  id: string;
  user_id: string;
  story_count: number;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface SubscriptionPlan {
  id: number;
  tier: SubscriptionTier;
  name: string;
  description: string | null;
  price_monthly: number;
  story_limit: number | null;
  features: Record<string, boolean>;
  created_at: string;
  updated_at: string;
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
}

type SubscriptionState = {
  isInitialized: boolean;
  subscription: Subscription | null;
  storyUsage: StoryUsage | null;
  isLoading: boolean;
  error: string | null;
};

type SubscriptionAction =
  | {
      type: 'INITIALIZE';
      payload: {
        subscription: Subscription | null;
        storyUsage: StoryUsage | null;
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
        storyUsage: action.payload.storyUsage,
        isLoading: false,
        isInitialized: true,
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

  // Initialize subscription and story usage
  useEffect(() => {
    const initializeSubscription = async () => {
      if (!auth.state.isInitialized) {
        return;
      }

      if (!auth.state.user || !auth.state.user.id) {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            subscription: null,
            storyUsage: null,
          },
        });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors

        console.log('Fetching subscription for user:', auth.state.user.id);

        // First check if user has an existing subscription
        let subscriptionData = null;
        const { data: initialSubData, error: subError } = await supabase()
          .from('user_subscriptions')
          .select(
            `
            *,
            subscription_plans (
              tier,
              story_limit,
              features
            )
          `
          )
          .eq('user_id', auth.state.user.id)
          .single();

        if (subError) {
          console.error('Subscription fetch error:', subError);

          // If no subscription found, we'll create a free tier subscription
          if (subError.code === 'PGRST116') {
            console.log(
              'No subscription found, creating free tier subscription'
            );

            // Get the free plan ID
            const { data: freePlan, error: planError } = await supabase()
              .from('subscription_plans')
              .select('id')
              .eq('tier', 'free')
              .single();

            if (planError) {
              console.error('Error fetching free plan:', planError);
              throw planError;
            }

            if (!freePlan) {
              throw new Error('Free plan not found in subscription_plans');
            }

            // Create new subscription for free tier
            const { data: newSubscription, error: createSubError } =
              await supabase()
                .from('user_subscriptions')
                .insert({
                  user_id: auth.state.user.id,
                  plan_id: freePlan.id,
                  status: 'active',
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toISOString(), // 30 days from now
                })
                .select(
                  `
                *,
                subscription_plans (
                  tier,
                  story_limit,
                  features
                )
              `
                )
                .single();

            if (createSubError) {
              console.error('Error creating subscription:', createSubError);
              throw createSubError;
            }

            subscriptionData = newSubscription;
          } else {
            throw subError;
          }
        } else {
          subscriptionData = initialSubData;
        }

        // Fetch or create story usage data
        let usageData = null;
        const { data: usage, error: usageError } = await supabase()
          .from('story_usage')
          .select('*')
          .eq('user_id', auth.state.user.id)
          .single();

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
              .single();

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

        dispatch({
          type: 'INITIALIZE',
          payload: {
            subscription: subscriptionData,
            storyUsage: usageData,
          },
        });
      } catch (error) {
        console.error('Detailed subscription initialization error:', error);
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
          },
        });
      }
    };

    initializeSubscription();
  }, [auth.state.isInitialized, auth.state.user]);

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

    return (
      storyUsage.story_count <
      (state.subscription.subscription_plans?.story_limit ?? 5)
    );
  };

  const getRemainingStories = (): number => {
    const tier = getSubscriptionTier();
    if (tier !== 'free') return Infinity;

    const { storyUsage } = state;
    if (!storyUsage) return 5;

    const resetDate = storyUsage.reset_date
      ? new Date(storyUsage.reset_date)
      : null;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    if (!resetDate || resetDate < monthAgo) {
      return 5;
    }

    return Math.max(0, 5 - storyUsage.story_count);
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
    return features ? features[feature] === true : false;
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
      // Start loading state while fetching subscription
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors

      const response = await fetch('/api/subscriptions', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        // Only log detailed errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Subscription fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            error,
          });
        }
        throw new Error(error.error || 'Failed to fetch subscription');
      }

      const data = await response.json();

      dispatch({
        type: 'SET_SUBSCRIPTION',
        payload: data,
      });
    } catch (error) {
      // Only log errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Error fetching subscription:',
          error instanceof Error ? error.message : String(error)
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch subscription';

      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createSubscription = async (tier: SubscriptionTier) => {
    const userId = auth.state.user?.id;

    if (!userId || !auth.state.isAuthenticated) {
      // User must be authenticated to create a subscription
      toast({
        title: 'Error',
        description: 'You must be logged in to create a subscription',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Start loading state while creating subscription
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors

      // Get the current session
      const {
        data: { session },
        error,
      } = await supabase().auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        throw new Error('Failed to retrieve session');
      }

      if (!session) {
        throw new Error('No active session found');
      }

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Only log detailed errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Subscription creation failed:', {
            status: response.status,
            statusText: response.statusText,
            error,
          });
        }
        throw new Error(error.error || 'Failed to create subscription');
      }

      const data = await response.json();
      // Successfully created subscription

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
      // Only log errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Error creating subscription:',
          error instanceof Error ? error.message : String(error)
        );
      }
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

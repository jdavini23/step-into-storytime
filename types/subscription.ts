import { Database } from './supabase';

// Re-export database types
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'] & {
  subscription_plans?: SubscriptionPlan;
  // Add properties used in context fallback/defaults
  current_period_start?: string | null;
  current_period_end?: string | null;
  subscription_start?: string | null;
  subscription_end?: string | null;
  trial_end?: string | null;
  payment_provider?: string | null;
  payment_provider_id?: string | null;
};
export type StoryUsage = Database['public']['Tables']['story_usage']['Row'];

// Context-specific types
export type SubscriptionTier = 'free' | 'story_creator' | 'family';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid';

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

export type SubscriptionState = {
  isInitialized: boolean;
  subscription: Subscription | null;
  storyUsage: StoryUsage | null;
  isLoading: boolean;
  error: string | null;
  availablePlans?: Product[];
};

export type SubscriptionAction =
  | { type: 'INITIALIZE'; payload: { subscription: Subscription | null; storyUsage: StoryUsage | null; isInitialized: boolean; availablePlans?: Product[] } }
  | { type: 'SET_SUBSCRIPTION'; payload: Subscription | null }
  | { type: 'SET_STORY_USAGE'; payload: StoryUsage | null }
  | { type: 'INCREMENT_STORY_COUNT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_SUBSCRIPTION' }
  | { type: 'RESET' };

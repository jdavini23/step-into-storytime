import type { Database } from "@/types/supabase";

// Re-export database types
export type SubscriptionPlan =
  Database["public"]["Tables"]["subscription_plans"]["Row"];
export type DbSubscription = {
  payment_provider: any;
  subscription_start: string;
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  plan_id: string;
  price_id?: string | null; // Added price_id
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  created_at: string;
  updated_at: string;
  subscription_end?: string | null;
  subscription_plans?: {
    name: string;
    tier: string;
  };
};
export type StoryUsage = Database["public"]["Tables"]["story_usage"]["Row"];

// Context-specific types
export type SubscriptionTier = "free" | "story_creator" | "family";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "trialing"
  | "incomplete"
  | "incomplete_expired";

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

export interface SubscriptionState {
  isInitialized: boolean;
  subscription: DbSubscription | null;
  storyUsage: StoryUsage | null;
  isLoading: boolean;
  error: string | null;
  // Removed availablePlans: Product[]; - Managed by useState in context provider
}

export type SubscriptionAction =
  | { type: "SET_SUBSCRIPTION"; payload: DbSubscription | null }
  | { type: "SET_STORY_USAGE"; payload: StoryUsage | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AVAILABLE_PLANS"; payload: Product[] };

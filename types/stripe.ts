export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export interface StripeSubscriptionData {
  id: string; // Stripe subscription ID
  customer: string; // Stripe customer ID
  status: string;
  plan_id: string; // Stripe price/plan ID
  current_period_start: number; // Unix timestamp
  current_period_end: number; // Unix timestamp
  cancel_at_period_end: boolean;
  canceled_at?: number | null; // Unix timestamp or null
  trial_start?: number | null; // Unix timestamp or null
  trial_end?: number | null; // Unix timestamp or null
  user_id?: string; // Supabase user ID (if available)
}

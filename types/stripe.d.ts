// Types for Stripe webhook events and subscription data

export interface StripeSubscriptionData {
  id: string;
  user: string | null; // Stripe customer id or metadata.user_id
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  price_id: string | null;
  quantity: number | null;
  trial_end: number | null;
  [key: string]: any; // Allow extra fields for flexibility
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

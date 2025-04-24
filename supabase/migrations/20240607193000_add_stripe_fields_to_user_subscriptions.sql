-- Migration: Add Stripe integration fields to user_subscriptions
-- Purpose: Enhance user_subscriptions table for robust Stripe integration
-- Adds: stripe_subscription_id, stripe_customer_id, cancel_at_period_end, canceled_at, current_period_end, trial_start, trial_end, status (if not present)
-- Adds indexes and comments for new fields

alter table public.user_subscriptions
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists cancel_at_period_end boolean default false not null,
  add column if not exists canceled_at timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists trial_start timestamptz,
  add column if not exists trial_end timestamptz;

-- Add index for efficient lookup
create index if not exists user_subscriptions_stripe_subscription_id_idx on public.user_subscriptions(stripe_subscription_id);
create index if not exists user_subscriptions_stripe_customer_id_idx on public.user_subscriptions(stripe_customer_id);

-- Add comments for new columns
comment on column public.user_subscriptions.stripe_subscription_id is 'The Stripe subscription object ID for this user subscription.';
comment on column public.user_subscriptions.stripe_customer_id is 'The Stripe customer object ID for this user.';
comment on column public.user_subscriptions.cancel_at_period_end is 'If true, subscription will cancel at the end of the current period (mirrors Stripe cancel_at_period_end).';
comment on column public.user_subscriptions.canceled_at is 'Timestamp when the subscription was canceled (mirrors Stripe canceled_at).';
comment on column public.user_subscriptions.current_period_end is 'End of the current billing period (mirrors Stripe current_period_end).';
comment on column public.user_subscriptions.trial_start is 'Start of the trial period (mirrors Stripe trial_start).';
comment on column public.user_subscriptions.trial_end is 'End of the trial period (mirrors Stripe trial_end).'; 
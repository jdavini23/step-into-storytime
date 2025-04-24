-- Migration: Add Stripe subscription link to user_subscriptions table
-- Purpose: Track Stripe subscription IDs for each user subscription, enabling webhook sync and management
-- Affected table: public.user_subscriptions
-- Adds: stripe_subscription_id column, index, and comments
-- RLS: Ensures only authenticated users can access their own subscription records

-- Add the stripe_subscription_id column
alter table public.user_subscriptions
  add column stripe_subscription_id text;

-- Add an index for efficient lookup
create index if not exists user_subscriptions_stripe_subscription_id_idx
  on public.user_subscriptions (stripe_subscription_id);

-- Add a comment for the new column
comment on column public.user_subscriptions.stripe_subscription_id is 'The Stripe subscription ID associated with this user subscription.';

-- Enable RLS if not already enabled
alter table public.user_subscriptions enable row level security;

-- RLS Policies
-- Allow authenticated users to select their own subscriptions
create policy "Authenticated users can select their own subscriptions" on public.user_subscriptions
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Allow authenticated users to insert their own subscriptions
create policy "Authenticated users can insert their own subscriptions" on public.user_subscriptions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Allow authenticated users to update their own subscriptions
create policy "Authenticated users can update their own subscriptions" on public.user_subscriptions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Allow authenticated users to delete their own subscriptions
create policy "Authenticated users can delete their own subscriptions" on public.user_subscriptions
  for delete to authenticated
  using (user_id = (select auth.uid())); 
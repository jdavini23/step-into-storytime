-- Migration: Create user_subscriptions table for Stripe integration
-- Purpose: Store and manage user subscription data linked to Stripe, supporting full lifecycle and secure access
-- Affected: Creates public.user_subscriptions, adds indexes, comments, and RLS policies

create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  status text not null, -- e.g., 'active', 'canceled', 'trialing', etc.
  plan_id text not null, -- Stripe price/plan ID
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_subscriptions is 'Links Supabase users to their Stripe subscriptions, supporting full subscription lifecycle and secure access.';
comment on column public.user_subscriptions.id is 'Primary key for the subscription record.';
comment on column public.user_subscriptions.user_id is 'Reference to auth.users.';
comment on column public.user_subscriptions.stripe_subscription_id is 'Stripe subscription ID.';
comment on column public.user_subscriptions.stripe_customer_id is 'Stripe customer ID.';
comment on column public.user_subscriptions.status is 'Subscription status (active, canceled, trialing, etc.).';
comment on column public.user_subscriptions.plan_id is 'Stripe price/plan ID.';
comment on column public.user_subscriptions.current_period_start is 'Start of current billing period.';
comment on column public.user_subscriptions.current_period_end is 'End of current billing period.';
comment on column public.user_subscriptions.cancel_at_period_end is 'If true, subscription will cancel at period end.';
comment on column public.user_subscriptions.canceled_at is 'Timestamp when subscription was canceled.';
comment on column public.user_subscriptions.trial_start is 'Trial start date.';
comment on column public.user_subscriptions.trial_end is 'Trial end date.';
comment on column public.user_subscriptions.created_at is 'Record creation timestamp.';
comment on column public.user_subscriptions.updated_at is 'Record update timestamp.';

create index on public.user_subscriptions(user_id);

-- Enable Row Level Security
alter table public.user_subscriptions enable row level security;

-- RLS Policies: Only allow authenticated users to access their own subscriptions
create policy "Users can view their own subscriptions" on public.user_subscriptions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can create their own subscriptions" on public.user_subscriptions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own subscriptions" on public.user_subscriptions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own subscriptions" on public.user_subscriptions
  for delete to authenticated
  using (user_id = (select auth.uid())); 
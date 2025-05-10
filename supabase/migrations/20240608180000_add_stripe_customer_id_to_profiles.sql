-- Migration: Add Stripe customer ID to profiles and indexes to user_subscriptions
-- Purpose: Complete schema for Stripe integration (Task 2)
-- Date: 2024-06-08
-- Author: AI/Assistant

-- 1. Add stripe_customer_id to profiles
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'stripe_customer_id'
  ) then
    alter table public.profiles add column stripe_customer_id text;
  end if;
end $$;

comment on column public.profiles.stripe_customer_id is 'Stripe customer ID for this user (for quick lookup).';

-- 2. Add indexes for fast lookup (if not already present)
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and tablename = 'user_subscriptions' and indexname = 'user_subscriptions_stripe_customer_id_idx'
  ) then
    create index user_subscriptions_stripe_customer_id_idx on public.user_subscriptions(stripe_customer_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and tablename = 'user_subscriptions' and indexname = 'user_subscriptions_stripe_subscription_id_idx'
  ) then
    create index user_subscriptions_stripe_subscription_id_idx on public.user_subscriptions(stripe_subscription_id);
  end if;
end $$;

-- 3. RLS: Only allow users to update their own stripe_customer_id
-- (Assumes RLS is already enabled on profiles)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update their own stripe_customer_id'
  ) then
    execute $$
      create policy "Users can update their own stripe_customer_id"
      on public.profiles
      for update
      to authenticated
      using (id = auth.uid())
      with check (id = auth.uid());
    $$; 
  end if;
end $$; 
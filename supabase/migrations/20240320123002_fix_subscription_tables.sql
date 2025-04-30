-- Fix subscription_plans table structure
alter table public.subscription_plans
  drop column if exists tier,
  drop column if exists price_monthly,
  drop column if exists story_limit,
  add column if not exists price numeric not null default 0,
  add column if not exists currency text not null default 'USD',
  alter column features set default '[]'::jsonb;

-- Update subscription plans data
update public.subscription_plans
set interval = 'month'
where interval is null;

-- Drop existing constraints if they exist
do $$ 
begin
  if exists (select 1 from pg_constraint where conname = 'subscription_plans_interval_check') then
    alter table public.subscription_plans drop constraint subscription_plans_interval_check;
  end if;
  if exists (select 1 from pg_constraint where conname = 'subscriptions_plan_id_fkey') then
    alter table public.subscriptions drop constraint subscriptions_plan_id_fkey;
  end if;
  if exists (select 1 from pg_constraint where conname = 'subscriptions_status_check') then
    alter table public.subscriptions drop constraint subscriptions_status_check;
  end if;
end $$;

-- Add constraints back
alter table public.subscription_plans
  alter column interval set not null,
  add constraint subscription_plans_interval_check check (interval in ('month', 'year'));

-- Create sequence if it doesn't exist
create sequence if not exists subscriptions_id_seq;

-- Fix subscriptions table structure
alter table public.subscriptions
  drop column if exists subscription_start,
  drop column if exists subscription_end,
  drop column if exists payment_provider,
  drop column if exists payment_provider_id;

-- Convert plan_id to bigint
alter table public.subscriptions
  alter column plan_id type bigint using plan_id::bigint;

-- Add foreign key constraint
alter table public.subscriptions
  add constraint subscriptions_plan_id_fkey foreign key (plan_id) references subscription_plans(id);

-- Add status check constraint
alter table public.subscriptions
  add constraint subscriptions_status_check check (status in ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'));

-- Update subscription plans data
update public.subscription_plans
set price = price_monthly
where price is null and price_monthly is not null;

-- Ensure indexes exist
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_plan_id on public.subscriptions(plan_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscription_plans_is_active on public.subscription_plans(is_active); 
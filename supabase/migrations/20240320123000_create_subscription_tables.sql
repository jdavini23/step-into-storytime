-- Create subscription plans table
create table public.subscription_plans (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric not null,
  currency text not null default 'USD',
  interval text not null check (interval in ('month', 'year')),
  stripe_price_id text unique,
  features jsonb,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscription_plans is 'Stores available subscription plans and their details';

-- Enable RLS
alter table public.subscription_plans enable row level security;

-- RLS Policies for subscription_plans
create policy "Anyone can view active subscription plans"
on public.subscription_plans
for select
to authenticated, anon
using (active = true);

create policy "Only admins can modify subscription plans"
on public.subscription_plans
for all
to authenticated
using ((select auth.jwt() ->> 'app_metadata')::jsonb ? 'is_admin')
with check ((select auth.jwt() ->> 'app_metadata')::jsonb ? 'is_admin');

-- Create subscriptions table
create table public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id bigint not null references public.subscription_plans(id),
  status text not null check (status in ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  stripe_subscription_id text unique,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'Stores user subscription information';

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS Policies for subscriptions
create policy "Users can view their own subscriptions"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own subscriptions"
on public.subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
on public.subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Add updated_at trigger function if not exists
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger handle_updated_at_subscription_plans
before update on public.subscription_plans
for each row
execute function public.handle_updated_at();

create trigger handle_updated_at_subscriptions
before update on public.subscriptions
for each row
execute function public.handle_updated_at();

-- Insert some initial subscription plans
insert into public.subscription_plans (name, description, price, interval, features)
values 
('Free', 'Basic access with limited features', 0, 'month', '{"stories_per_month": 3, "audio_narration": false}'::jsonb),
('Premium Monthly', 'Full access with all features', 9.99, 'month', '{"stories_per_month": -1, "audio_narration": true, "priority_support": true}'::jsonb),
('Premium Yearly', 'Full access with all features (save 16%)', 99.99, 'year', '{"stories_per_month": -1, "audio_narration": true, "priority_support": true}'::jsonb); 
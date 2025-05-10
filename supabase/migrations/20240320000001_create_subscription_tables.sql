-- Create subscription_plans table
create table public.subscription_plans (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price_usd numeric(10,2) not null,
  interval text not null check (interval in ('month', 'year')),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

comment on table public.subscription_plans is 'Stores available subscription plans and their details';

-- Enable RLS on subscription_plans
alter table public.subscription_plans enable row level security;

-- RLS policies for subscription_plans
create policy "Anyone can view active subscription plans" 
on public.subscription_plans
for select
to authenticated, anon
using (is_active = true);

create policy "Only admins can modify subscription plans"
on public.subscription_plans
for all
to authenticated
using (
  (select is_admin from auth.users where id = auth.uid())
)
with check (
  (select is_admin from auth.users where id = auth.uid())
);

-- Create subscriptions table
create table public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id bigint not null references public.subscription_plans(id),
  status text not null check (status in ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamp with time zone,
  ended_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  stripe_subscription_id text unique,
  stripe_customer_id text
);

comment on table public.subscriptions is 'Stores user subscription details and status';

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

-- RLS policies for subscriptions
create policy "Users can view their own subscriptions"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
on public.subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger handle_updated_at
  before update on public.subscription_plans
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();

-- Insert initial subscription plans
insert into public.subscription_plans (name, description, price_usd, interval, features)
values
  ('Free', 'Basic access to Step Into Storytime', 0.00, 'month', '["5 stories per month", "Basic customization"]'::jsonb),
  ('Premium Monthly', 'Full access with monthly billing', 9.99, 'month', '["Unlimited stories", "Advanced customization", "Audio narration", "Priority support"]'::jsonb),
  ('Premium Yearly', 'Full access with yearly billing (save 17%)', 99.99, 'year', '["Unlimited stories", "Advanced customization", "Audio narration", "Priority support", "2 months free"]'::jsonb);

-- Add indexes for better query performance
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_plan_id on public.subscriptions(plan_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_subscription_plans_is_active on public.subscription_plans(is_active); 
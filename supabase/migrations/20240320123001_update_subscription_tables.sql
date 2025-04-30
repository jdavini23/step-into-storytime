-- Update subscription_plans table
alter table public.subscription_plans
  add column if not exists stripe_price_id text unique,
  add column if not exists interval text check (interval in ('month', 'year')),
  add column if not exists is_active boolean not null default true,
  alter column features set default '[]'::jsonb;

-- Update subscriptions table
alter table public.subscriptions
  add column if not exists stripe_subscription_id text unique,
  add column if not exists stripe_customer_id text,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists canceled_at timestamptz,
  add column if not exists ended_at timestamptz,
  alter column status set not null,
  alter column status add check (status in ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'));

-- Add or update RLS policies
drop policy if exists "Anyone can view active subscription plans" on public.subscription_plans;
create policy "Anyone can view active subscription plans"
on public.subscription_plans
for select
to authenticated, anon
using (is_active = true);

drop policy if exists "Only admins can modify subscription plans" on public.subscription_plans;
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

drop policy if exists "Users can view their own subscriptions" on public.subscriptions;
create policy "Users can view their own subscriptions"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can update their own subscriptions" on public.subscriptions;
create policy "Users can update their own subscriptions"
on public.subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Add indexes if they don't exist
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_plan_id on public.subscriptions(plan_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscription_plans_is_active on public.subscription_plans(is_active); 
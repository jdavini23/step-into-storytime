-- Migration: Complete Stripe Integration Schema
-- Purpose: Add missing triggers and indexes for Stripe integration (Task 2)
-- Date: 2025-05-27
-- Author: Cascade AI Assistant

-- 1. Create a function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 2. Add updated_at trigger to user_subscriptions if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'update_user_subscriptions_updated_at'
  ) then
    create trigger update_user_subscriptions_updated_at
    before update on public.user_subscriptions
    for each row
    execute function public.update_updated_at_column();
  end if;
end $$;

-- 3. Add a partial index for active subscriptions
do $$
begin
  if not exists (
    select 1 from pg_indexes 
    where schemaname = 'public' 
    and tablename = 'user_subscriptions' 
    and indexname = 'user_subscriptions_active_status_idx'
  ) then
    create index user_subscriptions_active_status_idx 
    on public.user_subscriptions(status) 
    where status in ('active', 'trialing');
  end if;
end $$;

-- 4. Add a function to validate subscription data
create or replace function public.validate_subscription_dates()
returns trigger as $$
begin
  -- Ensure current_period_end is after current_period_start
  if new.current_period_end <= new.current_period_start then
    raise exception 'current_period_end must be after current_period_start';
  end if;
  
  -- If trial dates are set, they must be valid
  if new.trial_start is not null and new.trial_end is not null then
    if new.trial_end <= new.trial_start then
      raise exception 'trial_end must be after trial_start';
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- 5. Add validation trigger to user_subscriptions
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'validate_subscription_data'
  ) then
    create trigger validate_subscription_data
    before insert or update on public.user_subscriptions
    for each row
    execute function public.validate_subscription_dates();
  end if;
end $$;

-- 6. Add comments for the new functions
comment on function public.update_updated_at_column() is 'Updates the updated_at column with current timestamp on update';
comment on function public.validate_subscription_dates() is 'Validates subscription date fields';

-- 7. Create a view for active subscriptions
create or replace view public.active_subscriptions as
select 
  us.*,
  p.email as user_email
from public.user_subscriptions us
join auth.users u on us.user_id = u.id
join public.profiles p on u.id = p.id
where us.status in ('active', 'trialing');

comment on view public.active_subscriptions is 'View of all active subscriptions with user information';

-- 8. Create a function to get user's subscription status
create or replace function public.get_user_subscription_status(user_id uuid)
returns table (
  has_active_subscription boolean,
  plan_id text,
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean
) as $$
begin
  return query
  select 
    true as has_active_subscription,
    us.plan_id,
    us.status,
    us.current_period_end,
    us.cancel_at_period_end
  from public.user_subscriptions us
  where us.user_id = get_user_subscription_status.user_id
  and us.status in ('active', 'trialing')
  and us.current_period_end > now()
  limit 1;
  
  if not found then
    return query select false, null::text, null::text, null::timestamptz, false;
  end if;
end;
$$ language plpgsql security definer;

comment on function public.get_user_subscription_status(uuid) is 'Gets the subscription status for a user';

-- 9. Grant necessary permissions
grant select on public.active_subscriptions to authenticated;
grant execute on function public.get_user_subscription_status(uuid) to authenticated;

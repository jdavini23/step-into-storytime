-- Insert initial subscription plans
DO $$
BEGIN
  -- Insert initial subscription plans here
END
$$;

-- Add indexes for better query performance
create index idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index idx_user_subscriptions_plan_id on public.user_subscriptions(plan_id);
create index idx_user_subscriptions_status on public.user_subscriptions(status);
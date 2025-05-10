CREATE OR REPLACE FUNCTION public.create_free_subscription_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, status, plan_id, current_period_start, current_period_end)
  VALUES (NEW.id, 'active', 1, NOW(), NOW() + INTERVAL '1 year'); -- Example values, adjust as needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.create_free_subscription_for_new_user();

COMMENT ON FUNCTION public.create_free_subscription_for_new_user() IS 'Creates a free subscription for a new user upon signup.';

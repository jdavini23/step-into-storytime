-- Ensure the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscription_plans table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_plans') THEN
    CREATE TABLE public.subscription_plans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      tier TEXT NOT NULL CHECK (tier IN ('free', 'story_creator', 'family')),
      stripe_product_id TEXT UNIQUE,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      interval TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  ELSE
    -- Check if tier column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans' 
      AND column_name = 'tier'
    ) THEN
      ALTER TABLE public.subscription_plans ADD COLUMN tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'story_creator', 'family'));
    END IF;
    
    -- Check if stripe_product_id column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans' 
      AND column_name = 'stripe_product_id'
    ) THEN
      ALTER TABLE public.subscription_plans ADD COLUMN stripe_product_id TEXT UNIQUE;
    END IF;
    
    -- Check if features column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans' 
      AND column_name = 'features'
    ) THEN
      ALTER TABLE public.subscription_plans ADD COLUMN features JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
    
    -- Check if interval column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans' 
      AND column_name = 'interval'
    ) THEN
      ALTER TABLE public.subscription_plans ADD COLUMN interval TEXT;
    END IF;
    
    -- Check if interval column is NOT NULL, if so make it nullable
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans' 
      AND column_name = 'interval'
      AND is_nullable = 'NO'
    ) THEN
      ALTER TABLE public.subscription_plans ALTER COLUMN interval DROP NOT NULL;
    END IF;
  END IF;
END
$$;

-- Create user_subscriptions table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
    CREATE TABLE public.user_subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan_id UUID REFERENCES public.subscription_plans(id),
      price_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired')),
      current_period_start TIMESTAMPTZ,
      current_period_end TIMESTAMPTZ,
      cancel_at_period_end BOOLEAN DEFAULT false,
      canceled_at TIMESTAMPTZ,
      trial_start TIMESTAMPTZ,
      trial_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id)
    );
  ELSE
    -- Check and add missing columns if needed
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_subscriptions' 
      AND column_name = 'price_id'
    ) THEN
      ALTER TABLE public.user_subscriptions ADD COLUMN price_id TEXT;
    END IF;
    
    -- Add other column checks as needed
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_subscriptions' 
      AND column_name = 'plan_id'
    ) THEN
      ALTER TABLE public.user_subscriptions ADD COLUMN plan_id UUID REFERENCES public.subscription_plans(id);
    END IF;
  END IF;
END
$$;

-- Create story_usage table to track usage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'story_usage') THEN
    CREATE TABLE public.story_usage (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      period_start TIMESTAMPTZ NOT NULL,
      period_end TIMESTAMPTZ NOT NULL,
      stories_generated INTEGER NOT NULL DEFAULT 0,
      stories_limit INTEGER NOT NULL DEFAULT 5,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, period_start, period_end)
    );
  ELSE
    -- Check if stories_generated column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'story_usage' 
      AND column_name = 'stories_generated'
    ) THEN
      ALTER TABLE public.story_usage ADD COLUMN stories_generated INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- Check if stories_limit column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'story_usage' 
      AND column_name = 'stories_limit'
    ) THEN
      ALTER TABLE public.story_usage ADD COLUMN stories_limit INTEGER NOT NULL DEFAULT 5;
    END IF;
  END IF;
END
$$;

-- Update profiles table to include stripe_customer_id if not already present
DO $$
BEGIN
  -- Only proceed if the profiles table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    -- Then check if the stripe_customer_id column already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'stripe_customer_id'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
    END IF;
  ELSE
    RAISE NOTICE 'Table public.profiles does not exist, skipping adding stripe_customer_id column.';
  END IF;
END
$$;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, tier, stripe_product_id, features, interval)
VALUES 
  ('Free', 'free', NULL, '["5 stories per month", "Basic customization", "Text-only stories"]'::jsonb, 'month'),
  ('Story Creator', 'story_creator', 'prod_story_creator', '["30 stories per month", "Advanced customization", "Audio narration", "Save stories"]'::jsonb, 'month'),
  ('Family', 'family', 'prod_family', '["Unlimited stories", "Multiple child profiles", "Premium themes", "Priority support"]'::jsonb, 'month')
ON CONFLICT (stripe_product_id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  features = EXCLUDED.features,
  interval = EXCLUDED.interval;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Enable RLS on tables
  ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.story_usage ENABLE ROW LEVEL SECURITY;

  -- User subscription policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_subscriptions' 
    AND policyname = 'Users can view their own subscriptions'
  ) THEN
    CREATE POLICY "Users can view their own subscriptions" 
      ON public.user_subscriptions FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  -- Subscription plans policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_plans' 
    AND policyname = 'Subscription plans are viewable by all authenticated users'
  ) THEN
    CREATE POLICY "Subscription plans are viewable by all authenticated users" 
      ON public.subscription_plans FOR SELECT 
      USING (auth.role() = 'authenticated');
  END IF;

  -- Story usage policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'story_usage' 
    AND policyname = 'Users can view their own usage'
  ) THEN
    CREATE POLICY "Users can view their own usage" 
      ON public.story_usage FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Function to check if a user has an active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_subscription BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_subscriptions.user_id = $1
    AND status IN ('active', 'trialing')
  ) INTO has_subscription;
  
  RETURN has_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

// Types for subscription handling
interface SubscriptionTier {
  free: 'free';
  story_creator: 'story_creator';
  family: 'family';
}

interface SubscriptionRequest {
  tier: keyof SubscriptionTier;
}

interface SubscriptionResponse {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'cancelled';
  plan_id: string;
  subscription_start: string;
  subscription_end: string;
  trial_end: string | null;
  payment_provider: string | null;
  payment_provider_id: string | null;
}

interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Starting GET /api/subscriptions');
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[DEBUG] Auth error:', authError);
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Unauthorized - Please sign in',
          code: 'AUTH_ERROR',
          details: authError?.message,
        },
        { status: 401 }
      );
    }

    try {
      // Count active subscriptions
      const { count, error: countError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (countError) {
        console.error('[DEBUG] Error counting subscriptions:', countError);
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Failed to check subscriptions',
            code: 'DB_ERROR',
            details: countError.message,
          },
          { status: 500 }
        );
      }

      console.log('[DEBUG] Found active subscriptions:', count);

      // If no active subscriptions, return free tier
      if (count === 0) {
        const freeTierSubscription: SubscriptionResponse = {
          id: 'free',
          user_id: user.id,
          status: 'active',
          plan_id: 'free',
          subscription_start: new Date().toISOString(),
          subscription_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          trial_end: null,
          payment_provider: null,
          payment_provider_id: null,
        };

        return NextResponse.json<SubscriptionResponse>(freeTierSubscription);
      }

      // Get the most recent active subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('subscription_start', { ascending: false })
        .limit(1)
        .single();

      if (subError) {
        console.error('[DEBUG] Error fetching subscription:', subError);
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Failed to fetch subscription details',
            code: 'DB_ERROR',
            details: subError.message,
          },
          { status: 500 }
        );
      }

      // Ensure features is an array
      if (subscription) {
        return NextResponse.json<SubscriptionResponse>(subscription);
      }

      throw new Error('No subscription found after count > 0');
    } catch (dbError) {
      console.error(
        '[DEBUG] Database error in GET /api/subscriptions:',
        dbError
      );
      return NextResponse.json<ErrorResponse>(
        {
          error: dbError instanceof Error ? dbError.message : 'Database error',
          code: 'DB_ERROR',
          details: dbError,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[DEBUG] Unexpected error in GET /api/subscriptions:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] Starting POST /api/subscriptions');
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[DEBUG] Auth error:', authError);
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Unauthorized - Please sign in',
          code: 'AUTH_ERROR',
          details: authError?.message,
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SubscriptionRequest;
    const { tier } = body;

    console.log('[DEBUG] Received subscription request:', {
      tier,
      userId: user.id,
    });

    if (!tier) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Subscription tier is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate tier
    const validTiers: (keyof SubscriptionTier)[] = [
      'free',
      'story_creator',
      'family',
    ];
    if (!validTiers.includes(tier)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid subscription tier',
          code: 'VALIDATION_ERROR',
          details: `Valid tiers are: ${validTiers.join(', ')}`,
        },
        { status: 400 }
      );
    }

    try {
      // First, ensure subscription plan exists
      const { data: existingPlan, error: planCheckError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('tier', tier)
        .single();

      if (planCheckError) {
        console.log('[DEBUG] Plan does not exist, creating default plan');
        // Create the plan if it doesn't exist
        const defaultPlan = {
          tier,
          name:
            tier === 'free'
              ? 'Free Tier'
              : tier === 'story_creator'
              ? 'Story Creator'
              : 'Family Plan',
          description:
            tier === 'free'
              ? 'Basic story creation'
              : tier === 'story_creator'
              ? 'Advanced story creation'
              : 'Family story creation',
          price_monthly:
            tier === 'free' ? 0 : tier === 'story_creator' ? 9.99 : 19.99,
          story_limit: tier === 'free' ? 1 : tier === 'story_creator' ? 10 : 30,
          features:
            tier === 'free'
              ? ['Basic story generation']
              : tier === 'story_creator'
              ? ['Advanced story generation', 'Audio narration']
              : [
                  'Family story generation',
                  'Audio narration',
                  'Multiple profiles',
                ],
        };

        const { data: newPlan, error: createPlanError } = await supabase
          .from('subscription_plans')
          .insert([defaultPlan])
          .select()
          .single();

        if (createPlanError) {
          return NextResponse.json<ErrorResponse>({
            error: `Failed to create subscription plan`,
            code: 'DB_ERROR',
            details: createPlanError.message,
          }, { status: 500 });
        }

        console.log('[DEBUG] Created new plan:', newPlan);
      }

      // Now get the plan (either existing or newly created)
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('tier', tier)
        .single();

      if (planError || !plan) {
        return NextResponse.json<ErrorResponse>({
          error: `Failed to fetch subscription plan`,
          code: 'DB_ERROR',
          details: planError?.message,
        }, { status: 500 });
      }

      // Check for existing active subscription
      const { data: existingSub, error: existingSubError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (existingSubError && existingSubError.code !== 'PGRST116') {
        return NextResponse.json<ErrorResponse>({
          error: `Failed to check existing subscription`,
          code: 'DB_ERROR',
          details: existingSubError.message,
        }, { status: 500 });
      }

      // If an active subscription exists
      if (existingSub) {
        // If the user is on the Free tier, allow upgrade by updating the subscription
        if (existingSub.plan_id && plan.tier === 'free') {
          return NextResponse.json<ErrorResponse>({
            error: 'Already on Free plan',
            code: 'ALREADY_FREE',
          }, { status: 400 });
        }
        // If current plan is free, allow upgrade
        const { data: currentPlan, error: currentPlanError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', existingSub.plan_id)
          .single();
        if (currentPlanError) {
          return NextResponse.json<ErrorResponse>({
            error: `Failed to fetch current subscription plan`,
            code: 'DB_ERROR',
            details: currentPlanError.message,
          }, { status: 500 });
        }
        if (currentPlan.tier === 'free') {
          // Update existing subscription to new plan
          const now = new Date();
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() + 30);
          const { data: updatedSub, error: updateError } = await supabase
            .from('subscriptions')
            .update({
              plan_id: plan.id.toString(),
              updated_at: now.toISOString(),
              start_date: now.toISOString(),
              end_date: endDate.toISOString(),
              status: 'active',
            })
            .eq('id', existingSub.id)
            .select()
            .single();
          if (updateError) {
            return NextResponse.json<ErrorResponse>({
              error: `Failed to upgrade subscription`,
              code: 'DB_ERROR',
              details: updateError.message,
            }, { status: 500 });
          }
          return NextResponse.json({
            message: 'Subscription upgraded successfully',
            subscription: updatedSub,
          });
        } else {
          // Already has an active paid subscription
          return NextResponse.json<ErrorResponse>({
            error: 'User already has an active paid subscription',
            code: 'DUPLICATE_SUBSCRIPTION',
          }, { status: 400 });
        }
      }

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);

      console.log('[DEBUG] Creating subscription with plan:', plan);

      // Create the subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: user.id,
            status: 'active',
            plan_id: plan.id.toString(),
            start_date: now.toISOString(),
            end_date: endDate.toISOString(),
          },
        ])
        .select()
        .single();
      if (subError) {
        return NextResponse.json<ErrorResponse>({
          error: `Failed to create subscription`,
          code: 'DB_ERROR',
          details: subError.message,
        }, { status: 500 });
      }

      // Update the user's profile with the new subscription tier
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier:
            tier === 'story_creator'
              ? 'premium'
              : tier === 'family'
              ? 'premium'
              : 'basic',
          updated_at: now.toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[DEBUG] Profile update failed:', profileError);
        // If profile update fails, delete the subscription to maintain consistency
        const { error: deleteError } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', subscription.id);

        if (deleteError) {
          console.error(
            '[DEBUG] Failed to cleanup subscription after profile update error:',
            deleteError
          );
        }

        return NextResponse.json<ErrorResponse>({
          error: `Failed to update profile`,
          code: 'DB_ERROR',
          details: profileError.message,
        }, { status: 500 });
      }

      console.log(
        '[DEBUG] Successfully created subscription and updated profile'
      );
      return NextResponse.json<SubscriptionResponse>(subscription);
    } catch (error) {
      console.error('[POST /api/subscriptions] Unhandled error:', error);
      return NextResponse.json<ErrorResponse>({
        error: error instanceof Error ? error.message : 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      }, { status: 500 });
    }
  } catch (error) {
    console.error(
      '[DEBUG] Unexpected error in POST /api/subscriptions:',
      error
    );
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'canceled'
          ? { subscription_end: new Date().toISOString() }
          : {}),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (subError) {
      return NextResponse.json(
        { error: subError.message || 'Failed to update subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error in PUT /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

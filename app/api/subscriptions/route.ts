import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] GET /api/subscriptions called');
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('[DEBUG] Auth error in GET /api/subscriptions:', {
        error: authError,
        message: authError.message,
        status: authError.status,
      });
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    if (!user) {
      console.log('[DEBUG] No user found in GET /api/subscriptions');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    console.log('[DEBUG] Fetching subscription for user:', {
      userId: user.id,
      email: user.email,
    });

    try {
      // First check if we have any subscriptions
      const { count, error: countError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (countError) {
        console.error('[DEBUG] Error counting subscriptions:', countError);
        return NextResponse.json(
          { error: countError.message || 'Failed to check subscription count' },
          { status: 500 }
        );
      }

      console.log('[DEBUG] Active subscription count:', count);

      // If no active subscriptions, return the free tier default
      if (count === 0) {
        // Fetch the free tier plan from subscription_plans
        const { data: freePlan, error: freePlanError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('tier', 'free')
          .single();
          
        if (freePlanError) {
          console.error('[DEBUG] Error fetching free plan:', freePlanError);
          // Fallback to hardcoded free tier if we can't fetch from DB
          const freeSubscription = {
            subscription_plans: { 
              id: 1,
              tier: 'free', 
              story_limit: 1, 
              features: ['Basic story generation'],
              name: 'Free Tier',
              description: 'Basic story creation',
              price_monthly: 0
            },
            user_id: user.id,
            status: 'active'
          };
          
          console.log('[DEBUG] No active subscriptions, returning hardcoded free tier default');
          return NextResponse.json(freeSubscription);
        }
        
        // Return the free plan from the database
        const freeSubscription = {
          subscription_plans: freePlan,
          user_id: user.id,
          status: 'active'
        };
        
        console.log('[DEBUG] No active subscriptions, returning free tier from database');
        return NextResponse.json(freeSubscription);
      }

      // Get user's subscription - get the most recent active one
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (
            id,
            tier,
            name,
            description,
            price_monthly,
            story_limit,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });  // Get all active subscriptions, ordered by creation date

      if (subError) {
        console.error('[DEBUG] Subscription fetch error:', {
          error: subError,
          message: subError.message,
          details: subError.details,
          hint: subError.hint,
          code: subError.code,
        });
        return NextResponse.json(
          { error: subError.message || 'Failed to fetch subscription' },
          { status: 500 }
        );
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('[DEBUG] No subscriptions found in the second query');
        // Fallback to free tier if no subscriptions found
        const { data: freePlan, error: freePlanError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('tier', 'free')
          .single();

        if (freePlanError) {
          console.error('[DEBUG] Error fetching free plan:', freePlanError);
          // Return hardcoded free tier
          return NextResponse.json({
            subscription_plans: { 
              id: 1,
              tier: 'free', 
              name: 'Free Tier',
              description: 'Basic story creation',
              price_monthly: 0,
              story_limit: 1, 
              features: ['Basic story generation'] 
            },
            user_id: user.id,
            status: 'active'
          });
        }

        return NextResponse.json({
          subscription_plans: freePlan,
          user_id: user.id,
          status: 'active'
        });
      }

      // Handle case where user has multiple active subscriptions
      // Get the most recent subscription (first in the ordered list)
      const subscription = subscriptions[0];

      // If there are multiple active subscriptions, log this as it might indicate an issue
      if (subscriptions.length > 1) {
        console.warn('[DEBUG] Multiple active subscriptions found for user:', {
          userId: user.id,
          subscriptionCount: subscriptions.length,
          subscriptionIds: subscriptions.map(s => s.id)
        });
      }

      console.log('[DEBUG] Returning subscription:', {
        id: subscription.id,
        tier: subscription.subscription_plans.tier,
        status: subscription.status
      });

      // Ensure features is an array
      if (subscription.subscription_plans && 
          subscription.subscription_plans.features && 
          !Array.isArray(subscription.subscription_plans.features)) {
        // Convert object to array if needed
        if (typeof subscription.subscription_plans.features === 'object') {
          subscription.subscription_plans.features = Object.entries(
            subscription.subscription_plans.features
          ).map(([key, value]) => `${key}: ${value}`);
        } else {
          // Handle string or other types
          subscription.subscription_plans.features = [String(subscription.subscription_plans.features)];
        }
      }

      return NextResponse.json(subscription);
    } catch (dbError) {
      console.error('[DEBUG] Database error in GET /api/subscriptions:', dbError);
      return NextResponse.json(
        { error: dbError instanceof Error ? dbError.message : 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[DEBUG] Unexpected error in GET /api/subscriptions:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { tier } = body;

    if (!tier) {
      return NextResponse.json(
        { error: 'Subscription tier is required' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['free', 'story_creator', 'family'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get the plan ID for the requested tier
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('tier', tier)
      .single();

    if (planError) {
      console.error('[DEBUG] Error fetching plan:', planError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plan' },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          status: 'active',
          subscription_start: now,
          subscription_end: endDate.toISOString(),
          plan_id: plan.id,
          payment_provider: null,
          payment_provider_id: null,
        },
      ])
      .select()
      .single();

    if (subError) {
      return NextResponse.json(
        { error: subError.message || 'Failed to create subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error in POST /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
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

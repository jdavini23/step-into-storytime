// app/api/subscriptions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { DbSubscription, SubscriptionStatus } from '@/types/subscription';

export const runtime = 'edge';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const subscriptionId = params.id;
  console.log(`API Route Log: PUT /api/subscriptions/${subscriptionId} starting...`);

  try {
    const supabase = await createClient();

    // 1. Authenticate user
    console.log('API Route Log: Starting authentication...');
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('API Route Log: Auth header present:', !!authHeader);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('API Route Log: Auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message || 'No error'
    });
    
    if (authError || !user) {
      console.error('API Route Log: User authentication failed.', {
        error: authError,
        authHeader: authHeader ? `${authHeader.substring(0, 20)}...` : 'No auth header',
        headers: Object.fromEntries(request.headers.entries())
      });
      
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Unauthorized', 
          code: 'AUTH_ERROR', 
          details: {
            message: authError?.message || 'User not found',
            hasAuthHeader: !!authHeader
          } 
        },
        { status: 401 },
      );
    }
    console.log(`API Route Log: User ${user.id} authenticated.`);

    const body = await request.json();
    const { newPriceId, newTier } = body;

    if (!newPriceId && !newTier) {
      return NextResponse.json<ErrorResponse>(
        { error: 'New Price ID or Tier is required for update.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    
    let resolvedNewPriceId = newPriceId;
    if (!resolvedNewPriceId && newTier) {
      if (newTier === 'premium') resolvedNewPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
      else {
        return NextResponse.json<ErrorResponse>(
          { error: `Invalid tier provided: ${newTier}`, code: 'VALIDATION_ERROR' },
          { status: 400 },
        );
      }
      if (!resolvedNewPriceId) {
        return NextResponse.json<ErrorResponse>(
          { error: `Stripe Price ID for tier '${newTier}' not configured.`, code: 'CONFIG_ERROR' },
          { status: 500 },
        );
      }
    }

    console.log(`API Route Log: Attempting to update Stripe subscription ${subscriptionId} for user ${user.id} to new price ID ${resolvedNewPriceId}.`);

    // 2. Fetch the current subscription from Stripe
    let currentStripeSubscription: Stripe.Subscription;
    try {
      currentStripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      console.log(`API Route Log: Fetched current Stripe subscription ${subscriptionId}.`);
    } catch (stripeError: any) {
      console.error(`API Route Log: Error fetching Stripe subscription ${subscriptionId}:`, stripeError);
      return NextResponse.json<ErrorResponse>(
        { error: 'Failed to retrieve current subscription from Stripe.', code: 'STRIPE_ERROR', details: stripeError.message },
        { status: stripeError.statusCode || 500 },
      );
    }

    // 3. Verify user owns this subscription
    const { data: userProfile, error: profileError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
        console.error(`API Route Log: Error fetching user profile for user ${user.id}:`, profileError);
        return NextResponse.json<ErrorResponse>(
            { error: 'Failed to verify user profile for subscription ownership.', code: 'DATABASE_ERROR', details: profileError.message }, 
            { status: 500 }
        );
    }

    if (!userProfile?.stripe_customer_id || currentStripeSubscription.customer !== userProfile.stripe_customer_id) {
      console.error(`API Route Log: User ${user.id} does not own Stripe subscription ${subscriptionId}.`);
      return NextResponse.json<ErrorResponse>(
        { error: 'Forbidden. You do not own this subscription.', code: 'AUTH_FORBIDDEN' }, 
        { status: 403 }
      );
    }

    if (!currentStripeSubscription.items.data[0]?.id) {
        console.error(`API Route Log: Stripe subscription ${subscriptionId} has no items or item ID is missing.`);
        return NextResponse.json<ErrorResponse>(
            { error: 'Subscription item not found.', code: 'STRIPE_ERROR' },
            { status: 500 }
        );
    }
    const currentSubscriptionItemId = currentStripeSubscription.items.data[0].id;

    // 4. Update subscription on Stripe
    let updatedStripeSubscription: Stripe.Subscription;
    try {
      updatedStripeSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: currentSubscriptionItemId,
          price: resolvedNewPriceId,
        }],
        proration_behavior: 'create_prorations',
      });
      console.log(`API Route Log: Successfully updated Stripe subscription ${subscriptionId}.`);
    } catch (stripeError: any) {
      console.error(`API Route Log: Error updating Stripe subscription ${subscriptionId}:`, stripeError);
      return NextResponse.json<ErrorResponse>(
        { error: 'Failed to update subscription on Stripe.', code: 'STRIPE_ERROR', details: stripeError.message },
        { status: stripeError.statusCode || 500 },
      );
    }

    // 5. Update local database
    const dbUpdateData: Partial<DbSubscription> = {
      stripe_subscription_id: updatedStripeSubscription.id,
      status: updatedStripeSubscription.status as SubscriptionStatus,
      plan_id: typeof updatedStripeSubscription.items.data[0]?.price?.product === 'string' 
                ? updatedStripeSubscription.items.data[0].price.product as string
                : undefined,
      price_id: updatedStripeSubscription.items.data[0]?.price?.id,
      updated_at: new Date().toISOString(),
      cancel_at_period_end: updatedStripeSubscription.cancel_at_period_end,
    };
    
    if (typeof updatedStripeSubscription.current_period_start === 'number') {
        dbUpdateData.current_period_start = new Date(updatedStripeSubscription.current_period_start * 1000).toISOString();
    }
    if (typeof updatedStripeSubscription.current_period_end === 'number') {
        dbUpdateData.current_period_end = new Date(updatedStripeSubscription.current_period_end * 1000).toISOString();
    }
    if (typeof updatedStripeSubscription.trial_start === 'number') {
        dbUpdateData.trial_start = new Date(updatedStripeSubscription.trial_start * 1000).toISOString();
    }
    if (typeof updatedStripeSubscription.trial_end === 'number') {
        dbUpdateData.trial_end = new Date(updatedStripeSubscription.trial_end * 1000).toISOString();
    }

    const { data: updatedDbSub, error: dbError } = await supabase
      .from('user_subscriptions')
      .update(dbUpdateData)
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError) {
      console.error(`API Route Log: Error updating local subscription for Stripe ID ${subscriptionId}:`, dbError);
      return NextResponse.json<ErrorResponse>(
        { error: 'Failed to update local subscription record. Stripe was updated.', code: 'DATABASE_ERROR', details: dbError.message },
        { status: 500 },
      );
    }

    console.log(`API Route Log: Successfully updated local subscription for Stripe ID ${subscriptionId}.`);
    return NextResponse.json({ message: 'Subscription updated successfully', subscription: updatedDbSub });

  } catch (error: any) {
    console.error(`API Route Log: Unexpected error in PUT /api/subscriptions/${params.id}:`, error);
    return NextResponse.json<ErrorResponse>(
      { error: 'Internal server error', code: 'UNKNOWN_ERROR', details: error.message },
      { status: 500 },
    );
  }
}

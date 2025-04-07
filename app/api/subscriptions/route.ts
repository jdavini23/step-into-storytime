import { NextRequest, NextResponse } from 'next/server';
import createClient from '@/utils/supabase/server';

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

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

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

    console.log('[DEBUG] Subscription fetched successfully:', {
      userId: user.id,
      hasSubscription: !!subscription,
      subscriptionId: subscription?.id,
      status: subscription?.status,
    });

    return NextResponse.json(subscription);
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
          plan_id: tier === 'premium' ? '1' : '2',
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

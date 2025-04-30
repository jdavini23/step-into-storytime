import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  DbSubscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionTier,
} from "@/types/subscription";

export const runtime = "edge";

interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export async function GET(request: NextRequest) {
  try {
    console.log("[DEBUG] Starting GET /api/subscriptions");
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[DEBUG] Auth error:", authError);
      return NextResponse.json<ErrorResponse>(
        {
          error: "Unauthorized - Please sign in",
          code: "AUTH_ERROR",
          details: authError?.message,
        },
        { status: 401 },
      );
    }

    try {
      // Get the most recent active subscription from user_subscriptions
      const { data: subscription, error: subError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_plans (
            name,
            tier
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (subError) {
        if (subError.code === "PGRST116") {
          // No subscription found, return free tier
          const now = new Date().toISOString();
          const freeTierSubscription = {
            id: "free",
            user_id: user.id,
            stripe_subscription_id: null,
            stripe_customer_id: null,
            status: "active",
            plan_id: "free",
            current_period_start: now,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString(),
            cancel_at_period_end: false,
            trial_end: null,
            created_at: now,
            updated_at: now,
            subscription_plans: {
              name: "Free Plan",
              tier: "free",
            },
          };
          return NextResponse.json(freeTierSubscription);
        }

        console.error("[DEBUG] Error fetching subscription:", subError);
        return NextResponse.json<ErrorResponse>(
          {
            error: "Failed to fetch subscription details",
            code: "DB_ERROR",
            details: subError.message,
          },
          { status: 500 },
        );
      }

      return NextResponse.json(subscription);
    } catch (error) {
      console.error("[DEBUG] Unexpected error:", error);
      return NextResponse.json<ErrorResponse>(
        {
          error: "An unexpected error occurred",
          code: "UNKNOWN_ERROR",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[DEBUG] Top-level error:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
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
      return NextResponse.json<ErrorResponse>(
        {
          error: "Unauthorized - Please sign in",
          code: "AUTH_ERROR",
          details: authError?.message,
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { tier } = body;

    if (!tier) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Subscription tier is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }

    // Create Stripe checkout session
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier,
          userId: user.id,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create checkout session");
    }

    const { url: checkoutUrl } = await response.json();

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("[DEBUG] Error in POST /api/subscriptions:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "Failed to create subscription",
        code: "STRIPE_ERROR",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
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
        { error: "Unauthorized - Please sign in" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === "canceled"
          ? { subscription_end: new Date().toISOString() }
          : {}),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (subError) {
      return NextResponse.json(
        { error: subError.message || "Failed to update subscription" },
        { status: 500 },
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error in PUT /api/subscriptions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

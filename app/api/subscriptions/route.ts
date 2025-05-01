import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";
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

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: "2024-06-20", // Let the library use its default or manage via Stripe dashboard
  typescript: true,
});

export async function GET(request: NextRequest) {
  console.log("API Route Log: GET /api/subscriptions starting...");
  try {
    console.log("API Route Log: Attempting to create Supabase client...");
    const supabase = await createClient();
    console.log("API Route Log: Supabase client created successfully.");

    // First get the session
    console.log("API Route Log: Attempting to get session...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("[DEBUG] Session error:", sessionError);
      return NextResponse.json<ErrorResponse>(
        {
          error: "Unauthorized - No valid session",
          code: "AUTH_ERROR",
          details: sessionError.message,
        },
        { status: 401 },
      );
    }

    if (!session) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Unauthorized - No session found",
          code: "AUTH_ERROR",
          details: "No active session",
        },
        { status: 401 },
      );
    }

    // Then verify the user
    console.log("API Route Log: Attempting to get user...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[DEBUG] User verification error:", userError);
      return NextResponse.json<ErrorResponse>(
        {
          error: "Unauthorized - User verification failed",
          code: "AUTH_ERROR",
          details: userError?.message || "User not found",
        },
        { status: 401 },
      );
    }

    console.log(`API Route Log: User authenticated: ${user.id}`);

    // Fetch subscription data
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError) {
      console.error("[DEBUG] Subscription fetch error:", subscriptionError);
      if (subscriptionError.code === "PGRST116") {
        // No subscription found
        return NextResponse.json({ subscription: null });
      }

      return NextResponse.json<ErrorResponse>(
        {
          error: "Failed to fetch subscription",
          code: "DATABASE_ERROR",
          details: subscriptionError.message,
        },
        { status: 500 },
      );
    } // <-- Added missing closing brace here

    let liveSubscriptionData: Partial<DbSubscription> = {};

    // If subscription exists in DB and has a Stripe ID, fetch live data from Stripe
    if (subscription && subscription.stripe_subscription_id) {
      console.log(
        `API Route Log: Fetching live data for Stripe subscription ID: ${subscription.stripe_subscription_id}`,
      );
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id,
          { expand: ["plan.product", "customer"] }, // Expand plan and product for details
        );

        console.log("API Route Log: Successfully fetched data from Stripe.");

        // Map Stripe data to our DbSubscription structure
        // Ensure stripeSubscription is treated as Stripe.Subscription, not Stripe.Response<...>
        const sub = stripeSubscription as Stripe.Subscription; // Type assertion for clarity

        liveSubscriptionData = {
          status: sub.status as SubscriptionStatus,
          // Use items array to reliably get product and price IDs
          plan_id: typeof sub.items.data[0]?.price?.product === "string"
            ? sub.items.data[0].price.product
            : undefined, // Ensure undefined if null/not string
          price_id: sub.items.data[0]?.price?.id,
          subscription_start: new Date(
            sub.created * 1000,
          ).toISOString(),
          // Cast to 'any' to bypass strict type checking for these specific properties
          subscription_end: (sub as any)["current_period_end"]
            ? new Date((sub as any)["current_period_end"] * 1000).toISOString()
            : null,
          trial_start: (sub as any)["trial_start"]
            ? new Date((sub as any)["trial_start"] * 1000).toISOString()
            : null,
          trial_end: (sub as any)["trial_end"]
            ? new Date((sub as any)["trial_end"] * 1000).toISOString()
            : null,
          // Add any other relevant fields you want to sync
        };

        // Optionally: Update the DB record asynchronously (fire and forget or use a queue)
        // supabase.from('subscriptions').update(liveSubscriptionData).eq('id', subscription.id);
      } catch (stripeError) {
        console.error(
          "[DEBUG] Error fetching subscription from Stripe:",
          stripeError,
        );
        // Decide how to handle Stripe errors: return DB data, return error, etc.
        // For now, we'll log the error and return the potentially stale DB data.
      }
    } else {
      console.log(
        "API Route Log: No subscription found in DB or no Stripe ID.",
      );
    }

    // Merge DB data with live Stripe data (Stripe data takes precedence)
    const finalSubscriptionData = subscription
      ? { ...subscription, ...liveSubscriptionData }
      : null;

    return NextResponse.json({ subscription: finalSubscriptionData });
  } catch (error) {
    console.error("[DEBUG] Unexpected error in GET /api/subscriptions:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal server error",
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

    // First get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Unauthorized - No valid session",
          code: "AUTH_ERROR",
          details: sessionError.message,
        },
        { status: 401 },
      );
    }

    if (!session) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Unauthorized - No session found",
          code: "AUTH_ERROR",
          details: "No active session",
        },
        { status: 401 },
      );
    }

    // Then verify the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Unauthorized - User verification failed",
          code: "AUTH_ERROR",
          details: userError?.message || "User not found",
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

    const origin = request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL;

    // Create Stripe checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: tier === "premium"
              ? process.env.STRIPE_PREMIUM_PRICE_ID
              : process.env.STRIPE_BASIC_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url:
          `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscription/cancel`,
        customer_email: user.email || undefined,
        metadata: {
          userId: user.id,
        },
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session URL");
      }

      return NextResponse.redirect(session.url, { status: 303 });
    } catch (error) {
      console.error("Stripe checkout session creation error:", error);
      return NextResponse.json<ErrorResponse>(
        {
          error: "Failed to create checkout session",
          code: "STRIPE_ERROR",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
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

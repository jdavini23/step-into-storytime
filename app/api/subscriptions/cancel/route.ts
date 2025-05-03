import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

export const runtime = "edge";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Unauthorized", details: sessionError?.message || "No active session" },
        { status: 401 }
      );
    }
    
    // Get user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    
    if (subscriptionError) {
      return NextResponse.json(
        { error: "Failed to fetch subscription", details: subscriptionError.message },
        { status: 500 }
      );
    }
    
    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }
    
    // Cancel the subscription at period end
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    );
    
    // Extract the current_period_end safely
    // The Stripe SDK types might not match the actual response structure
    const currentPeriodEnd = typeof updatedSubscription === 'object' && 
                            updatedSubscription !== null && 
                            'current_period_end' in updatedSubscription ? 
                            updatedSubscription.current_period_end : 
                            null;
    
    // Update the subscription in the database
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", session.user.id);
    
    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update subscription", details: updateError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "Subscription canceled successfully",
      cancelAtPeriodEnd: true,
      currentPeriodEnd: currentPeriodEnd ? new Date(Number(currentPeriodEnd) * 1000).toISOString() : null
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { 
        error: "Failed to cancel subscription", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

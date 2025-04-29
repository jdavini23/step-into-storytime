import { headers } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore - Stripe types are not up to date
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.metadata?.userId;

        if (!userId) {
          throw new Error("No user ID in session metadata");
        }

        // Fetch subscription details
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId,
        );
        const priceId = subscription.items.data[0].price.id;

        // Update user's subscription status in database
        const { error: updateError } = await supabase
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            status: subscription.status,
            // @ts-ignore - Stripe types are not up to date
            current_period_end: new Date(subscription.current_period_end * 1000)
              .toISOString(),
          });

        if (updateError) {
          throw updateError;
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user with this customer ID
        const { data: userData, error: userError } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userError || !userData) {
          throw new Error("No user found with this customer ID");
        }

        // Update subscription details
        const { error: updateError } = await supabase
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            // @ts-ignore - Stripe types are not up to date
            current_period_end: new Date(subscription.current_period_end * 1000)
              .toISOString(),
          })
          .eq("user_id", userData.user_id);

        if (updateError) {
          throw updateError;
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find and update user subscription
        const { data: userData, error: userError } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userError || !userData) {
          throw new Error("No user found with this customer ID");
        }

        // Mark subscription as cancelled
        const { error: updateError } = await supabase
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            // @ts-ignore - Stripe types are not up to date
            current_period_end: new Date(subscription.current_period_end * 1000)
              .toISOString(),
          })
          .eq("user_id", userData.user_id);

        if (updateError) {
          throw updateError;
        }

        break;
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Webhook processing failed", { status: 400 });
  }
}

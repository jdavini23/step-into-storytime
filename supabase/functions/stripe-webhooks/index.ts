import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.24.0?target=deno&deno-std=0.168.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7?dts"; // Import Supabase client

// --- Environment Variable Check ---
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
// Read Supabase URL. Assumes NEXT_PUBLIC_SUPABASE_URL is in .env.local for local dev.
const supabaseUrl = Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
// Read Service Role Key. Use LOCAL_SUPABASE_SERVICE_ROLE_KEY for local 'serve' due to CLI limitations.
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || // This will be set in deployed env
  Deno.env.get("LOCAL_SUPABASE_SERVICE_ROLE_KEY"); // Fallback for local 'serve'

if (!stripeSecretKey) {
  console.error("FATAL: Missing STRIPE_SECRET_KEY environment variable.");
  // Optional: throw an error to prevent the server from starting if misconfigured
  throw new Error("Missing STRIPE_SECRET_KEY");
}
if (!webhookSecret) {
  // Log this, but the check inside the handler is the critical one for request processing
  console.warn(
    "Warning: STRIPE_WEBHOOK_SECRET environment variable not set. Webhook verification will fail.",
  );
  // Consider throwing here too if webhook signing is mandatory for all function starts
  // throw new Error('Missing STRIPE_WEBHOOK_SECRET');
}
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.",
  );
  throw new Error("Missing Supabase configuration.");
}

console.log("Attempting to initialize Stripe...");

// Initialize Stripe - Now guaranteed stripeSecretKey is a string
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

console.log("Stripe client initialized.");

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
console.log("Supabase admin client initialized.");

console.log("Stripe Webhook Handler Initialized and Ready");

serve(async (req: Request) => { // Add type Request to req and make async again
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  console.log("Received webhook request");

  // Critical check inside the handler, as it might be set but empty etc.
  if (!webhookSecret) {
    console.error(
      "Error: Stripe webhook secret (STRIPE_WEBHOOK_SECRET) is not set correctly for verification.",
    );
    return new Response("Webhook secret not configured.", { status: 500 });
  }

  if (!signature) {
    console.error("Error: Request is missing Stripe-Signature header.");
    return new Response("Missing Stripe signature.", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
    console.log(
      `Webhook signature verified successfully for event ID: ${event.id}`,
    );

    // Log the event type
    console.log(`Received event: ${event.id}, type: ${event.type}`);

    // --- Handle the event ---
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // --- Check if the session has required data ---
        // We need customer, subscription, and client_reference_id (which holds our user_id)
        if (
          !session.customer || !session.subscription ||
          !session.client_reference_id
        ) {
          console.error(
            `Error: Checkout session ${session.id} is missing essential data (customer, subscription, or client_reference_id).`,
          );
          // Acknowledge receipt to Stripe but log internal error.
          return new Response(
            JSON.stringify({
              received: true,
              error: "Missing essential session data.",
            }),
            { status: 200 },
          );
        }

        const userId = session.client_reference_id; // Passed from frontend during checkout creation
        const stripeSubscriptionId = session.subscription as string; // Ensure it's a string
        const stripeCustomerId = session.customer as string; // Ensure it's a string

        console.log(
          `Checkout session ${session.id} completed for user ${userId}. Attempting to upsert subscription ${stripeSubscriptionId}...`,
        );

        try {
          // --- Retrieve the full subscription details from Stripe ---
          // This gives us the status, plan, period dates etc., which aren't all in the session event.
          const subscription = await stripe.subscriptions.retrieve(
            stripeSubscriptionId,
          );

          // --- Prepare data for Supabase upsert ---
          // Map Stripe subscription fields to our user_subscriptions table columns
          const subscriptionData = {
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: stripeCustomerId, // Use customer ID from session event
            status: subscription.status,
            plan_id: subscription.items.data[0]?.price?.id ?? null, // Safely access price ID
            current_period_start: new Date(
              subscription.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000)
              .toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            trial_start: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            // created_at and updated_at have default values in the DB schema
          };

          if (!subscriptionData.plan_id) {
            console.warn(
              `Warning: Could not determine plan_id for subscription ${subscription.id}. Price data might be missing.`,
            );
          }

          // --- Upsert the subscription data into Supabase ---
          // Use the stripe_subscription_id as the conflict target to ensure uniqueness
          const { error: upsertError } = await supabaseAdmin
            .from("user_subscriptions")
            .upsert(subscriptionData, { onConflict: "stripe_subscription_id" });

          if (upsertError) {
            console.error(
              `Error upserting subscription ${subscription.id} for user ${userId} in Supabase:`,
              upsertError,
            );
            // Log the error, but still return 200 to Stripe unless it's a critical failure scenario
          } else {
            console.log(
              `Successfully upserted subscription ${subscription.id} for user ${userId} in Supabase.`,
            );
          }
        } catch (error: unknown) {
          // Catch errors from Stripe API call or DB upsert
          console.error(
            `Error processing checkout session ${session.id} (Stripe API or DB operation):`,
            error,
          );
          // Return 200 to Stripe to prevent retries for potentially non-recoverable errors here.
          // Consider more specific error handling if needed.
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `Subscription ${event.type} for customer: ${subscription.customer}, status: ${subscription.status}`,
        );
        // TODO: Update user subscription status in your database based on subscription.status
        // Example: await updateUserSubscriptionStatus(subscription.customer, subscription.status);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice paid for customer: ${invoice.customer}`);
        // TODO: Update billing records, potentially grant access if payment confirms subscription
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed for customer: ${invoice.customer}`);
        // TODO: Notify user, potentially restrict access if subscription payment fails
        break;
      }
      // ... handle other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: unknown) { // Handle unknown error type
    let errorMessage = "Webhook signature verification failed.";
    if (err instanceof Error) {
      errorMessage = `Webhook Error: ${err.message}`;
      console.error(`Webhook signature verification failed: ${err.message}`);
    } else {
      console.error(
        "Webhook signature verification failed with unknown error:",
        err,
      );
    }
    return new Response(errorMessage, { status: 400 });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.24.0?target=deno&deno-std=0.168.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7?dts"; // Import Supabase client
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
console.log("SUPABASE_URL:", Deno.env.get("SUPABASE_URL"));
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);
console.log("STRIPE_SECRET_KEY:", Deno.env.get("STRIPE_SECRET_KEY"));
console.log("STRIPE_WEBHOOK_SECRET:", Deno.env.get("STRIPE_WEBHOOK_SECRET"));
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

serve(async (req: Request) => {
  try {
    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      return new Response("Missing Stripe signature", { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        Stripe.createSubtleCryptoProvider(),
      );
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400 },
      );
    }

    console.log(`Processing Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.client_reference_id) {
          throw new Error("Missing client_reference_id in session");
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          {
            expand: ["items.data.price"], // Expand price details
          },
        );

        const subscriptionData = {
          user_id: session.client_reference_id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          plan_id: subscription.items.data[0]?.price?.id,
          status: subscription.status,
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
        };

        // First, try to find an existing subscription for this user
        const { data: existingSubscription } = await supabaseAdmin
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", session.client_reference_id)
          .single();

        if (existingSubscription) {
          // Update existing subscription
          const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update(subscriptionData)
            .eq("id", existingSubscription.id);

          if (updateError) throw updateError;
        } else {
          // Create new subscription
          const { error: insertError } = await supabaseAdmin
            .from("user_subscriptions")
            .insert([subscriptionData]);

          if (insertError) throw insertError;
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Find the user with this subscription
        const { data: subscriptionData, error: fetchError } =
          await supabaseAdmin
            .from("user_subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscription.id)
            .single();

        if (fetchError || !subscriptionData) {
          throw new Error(`No subscription found with ID ${subscription.id}`);
        }

        const updateData = {
          status: subscription.status,
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
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabaseAdmin
          .from("user_subscriptions")
          .update(updateData)
          .eq("user_id", subscriptionData.user_id);

        if (updateError) throw updateError;

        // If subscription is deleted or canceled, update the status
        if (
          event.type === "customer.subscription.deleted" ||
          subscription.status === "canceled"
        ) {
          const { error: statusError } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
              status: "canceled",
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);

          if (statusError) throw statusError;
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        // Update user's subscription status if needed
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
            {
              expand: ["items.data.price"], // Expand price details
            },
          );

          const updateData: {
            status: string;
            current_period_end: string;
            updated_at: string;
            plan_id?: string;
          } = {
            status: subscription.status,
            current_period_end: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          };

          // If there's a price change, update the plan_id
          if (subscription.items.data[0]?.price?.id) {
            updateData.plan_id = subscription.items.data[0].price.id;
          }

          const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update(updateData)
            .eq("stripe_subscription_id", subscription.id);

          if (updateError) throw updateError;
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );

          const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
              status: subscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);

          if (updateError) throw updateError;
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error: updateError } = await supabaseAdmin
          .from("user_subscriptions")
          .update({
            status: "trialing",
            trial_end: new Date(subscription.trial_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) throw updateError;
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Error processing webhook:", err);
    const errorMessage = err instanceof Error
      ? err.message
      : "Unknown error occurred";

    // Log detailed error information
    if (err instanceof Error) {
      console.error("Error stack:", err.stack);
      if ("code" in err) {
        console.error("Error code:", (err as Stripe.errors.StripeError).code);
      }
    }

    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

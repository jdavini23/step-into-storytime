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

        if (!session.client_reference_id && !session.metadata?.supabase_uid) {
          console.error("Missing user ID in session");
          throw new Error("Missing user ID in session");
        }

        // Get user ID from either client_reference_id or metadata
        const userId = session.client_reference_id || session.metadata?.supabase_uid;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          {
            expand: ["items.data.price.product"], // Expand price and product details
          },
        );

        // Get product details from the first subscription item
        const productId = typeof subscription.items.data[0]?.price?.product === "string"
          ? subscription.items.data[0]?.price?.product
          : (subscription.items.data[0]?.price?.product as Stripe.Product)?.id;

        const priceId = subscription.items.data[0]?.price?.id;

        const subscriptionData = {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          plan_id: productId,
          price_id: priceId,
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

        console.log("Processing subscription data:", JSON.stringify(subscriptionData, null, 2));

        // First, try to find an existing subscription for this user
        const { data: existingSubscription, error: fetchError } = await supabaseAdmin
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching subscription:", fetchError);
          throw fetchError;
        }

        if (existingSubscription) {
          // Update existing subscription
          const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update(subscriptionData)
            .eq("id", existingSubscription.id);

          if (updateError) {
            console.error("Error updating subscription:", updateError);
            throw updateError;
          }
          
          console.log(`Updated subscription for user ${userId}`);
        } else {
          // Create new subscription
          const { error: insertError } = await supabaseAdmin
            .from("user_subscriptions")
            .insert([subscriptionData]);

          if (insertError) {
            console.error("Error inserting subscription:", insertError);
            throw insertError;
          }
          
          console.log(`Created new subscription for user ${userId}`);
        }

        // Initialize or update story usage for the user
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        
        // Determine story limit based on plan
        let storyLimit = 5; // Default free tier
        if (productId) {
          // Get plan details from product metadata or use defaults based on product ID
          if (productId.includes("story_creator")) {
            storyLimit = 30;
          } else if (productId.includes("family")) {
            storyLimit = 999; // Effectively unlimited
          }
        }

        // Check for existing usage record
        const { data: existingUsage, error: usageError } = await supabaseAdmin
          .from("story_usage")
          .select("*")
          .eq("user_id", userId)
          .gte("period_start", firstDayOfMonth.toISOString())
          .lte("period_end", lastDayOfMonth.toISOString())
          .maybeSingle();

        if (usageError && usageError.code !== "PGRST116") {
          console.error("Error fetching usage:", usageError);
          throw usageError;
        }

        if (existingUsage) {
          // Update existing usage with new limit
          const { error: updateUsageError } = await supabaseAdmin
            .from("story_usage")
            .update({ stories_limit: storyLimit })
            .eq("id", existingUsage.id);

          if (updateUsageError) {
            console.error("Error updating usage:", updateUsageError);
            throw updateUsageError;
          }
          
          console.log(`Updated usage limit to ${storyLimit} for user ${userId}`);
        } else {
          // Create new usage record
          const { error: insertUsageError } = await supabaseAdmin
            .from("story_usage")
            .insert([{
              user_id: userId,
              period_start: firstDayOfMonth.toISOString(),
              period_end: lastDayOfMonth.toISOString(),
              stories_generated: 0,
              stories_limit: storyLimit
            }]);

          if (insertUsageError) {
            console.error("Error inserting usage:", insertUsageError);
            throw insertUsageError;
          }
          
          console.log(`Created new usage record with limit ${storyLimit} for user ${userId}`);
        }
        
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Processing ${event.type} for subscription ${subscription.id}`);

        // Find the user with this subscription
        const { data: subscriptionData, error: fetchError } =
          await supabaseAdmin
            .from("user_subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscription.id)
            .maybeSingle();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error(`Error finding subscription ${subscription.id}:`, fetchError);
          throw new Error(`No subscription found with ID ${subscription.id}`);
        }

        if (!subscriptionData) {
          console.warn(`No subscription found in database with ID ${subscription.id}`);
          // If we can't find the subscription, try to get user ID from metadata
          if (!subscription.metadata?.supabase_uid) {
            console.error("No user ID found in subscription metadata");
            throw new Error("Could not determine user ID for subscription update");
          }
        }

        const userId = subscriptionData?.user_id || subscription.metadata?.supabase_uid;
        
        if (!userId) {
          console.error("Could not determine user ID for subscription update");
          throw new Error("Could not determine user ID for subscription update");
        }

        // Get product details from the first subscription item
        const productId = typeof subscription.items.data[0]?.price?.product === "string"
          ? subscription.items.data[0]?.price?.product
          : (subscription.items.data[0]?.price?.product as Stripe.Product)?.id;

        const priceId = subscription.items.data[0]?.price?.id;

        const updateData = {
          status: subscription.status,
          plan_id: productId,
          price_id: priceId,
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

        console.log(`Updating subscription for user ${userId}:`, JSON.stringify(updateData, null, 2));

        // Check if subscription exists in database
        const { data: existingSubscription, error: checkError } = await supabaseAdmin
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking for existing subscription:", checkError);
          throw checkError;
        }

        if (existingSubscription) {
          // Update existing subscription
          const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update(updateData)
            .eq("id", existingSubscription.id);

          if (updateError) {
            console.error("Error updating subscription:", updateError);
            throw updateError;
          }
          
          console.log(`Updated subscription for user ${userId}`);
        } else {
          // Create new subscription record if it doesn't exist
          const { error: insertError } = await supabaseAdmin
            .from("user_subscriptions")
            .insert([{
              user_id: userId,
              stripe_subscription_id: subscription.id,
              ...updateData
            }]);

          if (insertError) {
            console.error("Error inserting subscription:", insertError);
            throw insertError;
          }
          
          console.log(`Created new subscription for user ${userId}`);
        }

        // If subscription status changed, update story usage limits
        if (event.type === "customer.subscription.updated") {
          // Determine story limit based on plan
          let storyLimit = 5; // Default free tier
          
          // Only update limits for active subscriptions
          if (subscription.status === "active" || subscription.status === "trialing") {
            if (productId) {
              if (productId.includes("story_creator")) {
                storyLimit = 30;
              } else if (productId.includes("family")) {
                storyLimit = 999; // Effectively unlimited
              }
            }

            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            // Update usage limits
            const { data: existingUsage, error: usageError } = await supabaseAdmin
              .from("story_usage")
              .select("*")
              .eq("user_id", userId)
              .gte("period_start", firstDayOfMonth.toISOString())
              .lte("period_end", lastDayOfMonth.toISOString())
              .maybeSingle();

            if (usageError && usageError.code !== "PGRST116") {
              console.error("Error fetching usage:", usageError);
              throw usageError;
            }

            if (existingUsage) {
              // Update existing usage with new limit
              const { error: updateUsageError } = await supabaseAdmin
                .from("story_usage")
                .update({ stories_limit: storyLimit })
                .eq("id", existingUsage.id);

              if (updateUsageError) {
                console.error("Error updating usage:", updateUsageError);
                throw updateUsageError;
              }
              
              console.log(`Updated usage limit to ${storyLimit} for user ${userId}`);
            } else {
              // Create new usage record
              const { error: insertUsageError } = await supabaseAdmin
                .from("story_usage")
                .insert([{
                  user_id: userId,
                  period_start: firstDayOfMonth.toISOString(),
                  period_end: lastDayOfMonth.toISOString(),
                  stories_generated: 0,
                  stories_limit: storyLimit
                }]);

              if (insertUsageError) {
                console.error("Error inserting usage:", insertUsageError);
                throw insertUsageError;
              }
              
              console.log(`Created new usage record with limit ${storyLimit} for user ${userId}`);
            }
          }
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

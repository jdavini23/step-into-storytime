import { StripeSubscriptionData } from "@/types/stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL and Service Role Key must be defined in environment variables",
  );
}
const TABLE = "user_subscriptions";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upsert a user subscription record based on Stripe webhook event data.
 */
export async function upsertUserSubscription(
  data: StripeSubscriptionData,
): Promise<void> {
  if (!data.id) throw new Error("Missing Stripe subscription id");
  // Extract user_id from metadata or customer field
  const user_id = data.metadata?.user_id || data.user || null;
  if (!user_id) throw new Error("Missing user_id in Stripe subscription");
  const record = {
    stripe_subscription_id: data.id,
    user_id,
    status: data.status,
    current_period_end: new Date(data.current_period_end * 1000).toISOString(),
    cancel_at_period_end: data.cancel_at_period_end,
    price_id: data.items?.data?.[0]?.price?.id || null,
    quantity: data.items?.data?.[0]?.quantity || null,
    trial_end: data.trial_end
      ? new Date(data.trial_end * 1000).toISOString()
      : null,
  };
  const { error } = await supabase
    .from(TABLE)
    .upsert([record], { onConflict: "stripe_subscription_id" });
  if (error) throw error;
}

/**
 * Update a user subscription record based on Stripe webhook event data.
 */
export async function updateUserSubscription(
  data: StripeSubscriptionData,
): Promise<void> {
  if (!data.id) throw new Error("Missing Stripe subscription id");
  const updates = {
    status: data.status,
    current_period_end: new Date(data.current_period_end * 1000).toISOString(),
    cancel_at_period_end: data.cancel_at_period_end,
    price_id: data.items?.data?.[0]?.price?.id || null,
    quantity: data.items?.data?.[0]?.quantity || null,
    trial_end: data.trial_end
      ? new Date(data.trial_end * 1000).toISOString()
      : null,
  };
  const { error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("stripe_subscription_id", data.id);
  if (error) throw error;
}

/**
 * Delete a user subscription record based on Stripe webhook event data.
 */
export async function deleteUserSubscription(
  stripeSubscriptionId: string,
): Promise<void> {
  if (!stripeSubscriptionId) throw new Error("Missing Stripe subscription id");
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("stripe_subscription_id", stripeSubscriptionId);
  if (error) throw error;
}

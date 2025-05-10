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

interface SubscriptionRecord {
  stripe_subscription_id: string;
  user_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  price_id: string | null;
  quantity: number | null;
  trial_end: string | null;
  updated_at: string;
}

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

  const record: SubscriptionRecord = {
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
    updated_at: new Date().toISOString(),
  };

  // First try to find an existing subscription for this user
  const { data: existingSubscription } = await supabase
    .from(TABLE)
    .select("id")
    .eq("user_id", user_id)
    .single();

  if (existingSubscription) {
    // Update existing subscription
    const { error: updateError } = await supabase
      .from(TABLE)
      .update(record)
      .eq("id", existingSubscription.id);
    if (updateError) throw updateError;
  } else {
    // Create new subscription
    const { error: insertError } = await supabase
      .from(TABLE)
      .insert([record]);
    if (insertError) throw insertError;
  }
}

/**
 * Update a user subscription record based on Stripe webhook event data.
 */
export async function updateUserSubscription(
  data: StripeSubscriptionData,
): Promise<void> {
  if (!data.id) throw new Error("Missing Stripe subscription id");

  const updates: Partial<SubscriptionRecord> = {
    status: data.status,
    current_period_end: new Date(data.current_period_end * 1000).toISOString(),
    cancel_at_period_end: data.cancel_at_period_end,
    price_id: data.items?.data?.[0]?.price?.id || null,
    quantity: data.items?.data?.[0]?.quantity || null,
    trial_end: data.trial_end
      ? new Date(data.trial_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("stripe_subscription_id", data.id);

  if (error) throw error;

  // If subscription is canceled, update the status
  if (data.status === "canceled") {
    const { error: statusError } = await supabase
      .from(TABLE)
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", data.id);

    if (statusError) throw statusError;
  }
}

/**
 * Delete a user subscription record based on Stripe webhook event data.
 */
export async function deleteUserSubscription(
  stripeSubscriptionId: string,
): Promise<void> {
  if (!stripeSubscriptionId) throw new Error("Missing Stripe subscription id");

  // First update the status to canceled
  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (updateError) throw updateError;

  // Then delete the record
  const { error: deleteError } = await supabase
    .from(TABLE)
    .delete()
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (deleteError) throw deleteError;
}

/**
 * Get a user's active subscription
 */
export async function getUserActiveSubscription(
  userId: string,
): Promise<SubscriptionRecord | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows found
    throw error;
  }

  return data;
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId);
  return subscription !== null;
}

// Error handling: always return { data, error } or similar. All logs are environment-guarded.

"use client";

import { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { PostgrestError } from "@supabase/supabase-js";
import {
  DbSubscription,
  StoryUsage,
  SubscriptionTier,
} from "@/types/subscription";

// Helper to get client
function getBrowserClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * Fetches the user's subscription data.
 * 
 * @returns { data: DbSubscription | null, error: Error | null }
 */
export async function fetchSubscription(): Promise<{
  data: DbSubscription | null;
  error: Error | null;
}> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Starting subscription fetch...");
    }

    // Get the Supabase client first
    const supabase = getBrowserClient();

    // Check session first
    const { data: sessionData, error: sessionError } = await supabase.auth
      .getSession();

    if (sessionError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("[Debug] Session check failed:", sessionError);
      }
      return {
        data: null,
        error: new Error("Authentication required - Session error"),
      };
    }

    if (!sessionData.session) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("[Debug] No active session found");
      }
      return {
        data: null,
        error: new Error("Authentication required - No active session"),
      };
    }

    // Verify user after session check
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("[Debug] User verification failed:", userError);
      }
      return {
        data: null,
        error: new Error("Authentication required - User verification failed"),
      };
    }

    // Both session and user are verified, proceed with subscription fetch
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await fetch(`${baseUrl}/api/subscriptions`, {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Accept": "application/json",
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Subscription API response status:", response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Debug] Subscription API error response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
        });
      }

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Subscription data received:", data);
    }
    return { data, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Debug] Subscription fetch error:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Creates a new subscription for the user.
 * 
 * @param {SubscriptionTier} tier The subscription tier to create.
 * @returns { data: DbSubscription | null, error: Error | null }
 */
export async function createSubscription(
  tier: SubscriptionTier,
): Promise<{ data: DbSubscription | null; error: Error | null }> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Creating subscription for tier:", tier);
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await fetch(`${baseUrl}/api/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tier }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Debug] Subscription creation error:", errorData);
      }
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Subscription created:", data);
    }
    return { data, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Debug] Subscription creation exception:", error);
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Updates the user's subscription data.
 * 
 * @param {string} subscriptionId The ID of the subscription to update.
 * @param {Partial<DbSubscription>} updates The updates to apply to the subscription.
 * @returns { data: DbSubscription | null, error: Error | null }
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<DbSubscription>,
): Promise<{ data: DbSubscription | null; error: Error | null }> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Updating subscription:", subscriptionId, updates);
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await fetch(`${baseUrl}/api/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Debug] Subscription update error:", errorData);
      }
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Subscription updated:", data);
    }
    return { data, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Debug] Subscription update exception:", error);
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Cancels the user's subscription.
 * 
 * @param {string} subscriptionId The ID of the subscription to cancel.
 * @returns { data: DbSubscription | null, error: Error | null }
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<{ data: DbSubscription | null; error: Error | null }> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Cancelling subscription:", subscriptionId);
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await fetch(`${baseUrl}/api/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Debug] Subscription cancel error:", errorData);
      }
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    // After successful cancellation, fetch the updated subscription
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Subscription cancelled. Fetching updated subscription...");
    }
    return await fetchSubscription();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Debug] Subscription cancel exception:", error);
    }
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Fetches the user's story usage data.
 * 
 * @returns { used: number, limit: number | null, error: Error | null }
 */
export async function getStoryUsage(): Promise<{
  used: number;
  limit: number | null;
  error: Error | null;
}> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Fetching story usage...");
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await fetch(`${baseUrl}/api/subscriptions/usage`, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Debug] Story usage fetch error:", errorData);
      }
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Story usage data:", data);
    }
    return {
      used: data.used,
      limit: data.limit,
      error: null,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Debug] Story usage fetch exception:", error);
    }
    return {
      used: 0,
      limit: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Increments the user's story usage.
 * 
 * @param {string} userId The ID of the user to increment story usage for.
 * @returns { success: boolean, error: Error | null }
 */
export async function incrementStoryUsage(
  userId: string,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Incrementing story usage for user:", userId);
    }
    const supabase = getBrowserClient();
    const { data: success, error } = await supabase.rpc(
      "increment_story_usage",
      { user_id: userId },
    );

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Debug] Increment story usage error:", error);
      }
      throw error;
    }
    return { success: !!success, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Debug] Increment story usage exception:", error);
    }
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

/**
 * Fetches the user's story usage data.
 * 
 * @param {string} userId The ID of the user to fetch story usage for.
 * @returns { data: StoryUsage | null, error: PostgrestError | null }
 */
export async function fetchStoryUsage(
  userId: string,
): Promise<{ data: StoryUsage | null; error: PostgrestError | null }> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Debug] Fetching story usage for user:", userId);
    }
    
    // Validate userId before making the request
    if (!userId) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Debug] Error fetching story usage: Missing user ID");
      }
      return { 
        data: null, 
        error: {
          message: "Missing user ID",
          details: "User ID is required to fetch story usage",
          hint: "Ensure user is authenticated before fetching usage",
          code: "auth/missing-user-id",
        } as PostgrestError
      };
    }
    
    const supabase = getBrowserClient();
    
    // First try to get the most recent usage record
    const { data, error } = await supabase
      .from("story_usage")
      .select("*")
      .eq("user_id", userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("[Debug] Error fetching story usage:", error);
      }
      
      // Check if the error is "no rows returned" - this is expected for new users
      if (error.code === 'PGRST116' && error.details?.includes('no rows')) {
        // Create default usage object for new users
        const now = new Date();
        const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        return { 
          data: {
            id: 0,
            user_id: userId,
            story_count: 0,
            reset_date: resetDate.toISOString(),
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          } as StoryUsage, 
          error: null 
        };
      }
      
      // For other errors, return null data and the error
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Debug] Exception fetching story usage:", error);
    }
    
    // Get the current date and calculate reset date (first day of next month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return {
      data: {
        id: 0, // Use 0 as a placeholder ID
        user_id: userId,
        story_count: 0,
        reset_date: resetDate.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      } as StoryUsage,
      error: error instanceof PostgrestError ? error : {
        message: error instanceof Error ? error.message : "Unknown error",
        details: "",
        hint: "This may be a temporary issue. Please try again later.",
        code: "",
      } as PostgrestError,
    };
  }
}

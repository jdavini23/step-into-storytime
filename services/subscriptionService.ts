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

export async function fetchSubscription(): Promise<{
  data: DbSubscription | null;
  error: Error | null;
}> {
  try {
    console.log("[Debug] Starting subscription fetch...");

    // Get the Supabase client first
    const supabase = getBrowserClient();

    // Check session first
    const { data: sessionData, error: sessionError } = await supabase.auth
      .getSession();

    if (sessionError) {
      console.warn("[Debug] Session check failed:", sessionError);
      return {
        data: null,
        error: new Error("Authentication required - Session error"),
      };
    }

    if (!sessionData.session) {
      console.warn("[Debug] No active session found");
      return {
        data: null,
        error: new Error("Authentication required - No active session"),
      };
    }

    // Verify user after session check
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.warn("[Debug] User verification failed:", userError);
      return {
        data: null,
        error: new Error("Authentication required - User verification failed"),
      };
    }

    // Both session and user are verified, proceed with subscription fetch
    const response = await fetch("/api/subscriptions", {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Accept": "application/json",
      },
    });

    console.log("[Debug] Subscription API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Debug] Subscription API error response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }

      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    console.log("[Debug] Subscription data received:", data);
    return { data, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[Debug] Subscription fetch error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function createSubscription(
  tier: SubscriptionTier,
): Promise<{ data: DbSubscription | null; error: Error | null }> {
  try {
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tier }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<DbSubscription>,
): Promise<{ data: DbSubscription | null; error: Error | null }> {
  try {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function cancelSubscription(
  subscriptionId: string,
): Promise<{ data: DbSubscription | null; error: Error | null }> {
  try {
    const response = await fetch(
      `/api/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    // After successful cancellation, fetch the updated subscription
    return await fetchSubscription();
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function getStoryUsage(): Promise<{
  used: number;
  limit: number | null;
  error: Error | null;
}> {
  try {
    const response = await fetch("/api/subscriptions/usage", {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return {
      used: data.used,
      limit: data.limit,
      error: null,
    };
  } catch (error) {
    return {
      used: 0,
      limit: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function incrementStoryUsage(
  userId: string,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = getBrowserClient();
    const { data: success, error } = await supabase.rpc(
      "increment_story_usage",
      { user_id: userId },
    );

    if (error) throw error;
    return { success: !!success, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export async function fetchStoryUsage(
  userId: string,
): Promise<{ data: StoryUsage | null; error: PostgrestError | null }> {
  try {
    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from("story_usage")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    console.error("Error fetching story usage:", error);
    return {
      data: null,
      error: error instanceof PostgrestError ? error : {
        message: "Unknown error",
        details: "",
        hint: "",
        code: "",
      } as PostgrestError,
    };
  }
}

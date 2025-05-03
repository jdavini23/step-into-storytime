import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const runtime = "edge";

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
    
    // Get the current month's usage record
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Check for existing usage record
    const { data: existingUsage, error: usageError } = await supabase
      .from("story_usage")
      .select("*")
      .eq("user_id", session.user.id)
      .gte("reset_date", firstDayOfMonth.toISOString())
      .lte("created_at", lastDayOfMonth.toISOString())
      .maybeSingle();
    
    if (usageError && usageError.code !== "PGRST116") {
      console.error("Error fetching usage:", usageError);
      return NextResponse.json(
        { error: "Failed to fetch usage data", details: usageError.message },
        { status: 500 }
      );
    }
    
    // If no usage record exists, create one with default values
    if (!existingUsage) {
      // Get subscription to determine story limit
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(tier)")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      // Set story limit based on subscription tier
      let storyLimit = 5; // Default free tier
      if (subscription && subscription.status === "active") {
        const tier = subscription.subscription_plans?.tier || "free";
        if (tier === "story_creator") {
          storyLimit = 30;
        } else if (tier === "family") {
          storyLimit = 999; // Effectively unlimited
        }
      }
      
      // Create new usage record
      const { data: newUsage, error: createError } = await supabase
        .from("story_usage")
        .insert({
          user_id: session.user.id,
          reset_date: firstDayOfMonth.toISOString(),
          story_count: 1 // Start with 1 for this request
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating usage record:", createError);
        return NextResponse.json(
          { error: "Failed to create usage record", details: createError.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: "Story usage recorded",
        usage: newUsage,
        remaining: storyLimit - 1
      });
    }
    
    // Increment the story_count
    const newCount = (existingUsage.story_count || 0) + 1;
    const { error: updateError } = await supabase
      .from("story_usage")
      .update({ story_count: newCount })
      .eq("id", existingUsage.id);
    
    if (updateError) {
      console.error("Error updating usage count:", updateError);
      return NextResponse.json(
        { error: "Failed to update usage count", details: updateError.message },
        { status: 500 }
      );
    }
    
    // Calculate story limit based on subscription tier
    let storyLimit = 5; // Default free tier
    
    // Get subscription to determine story limit
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*, subscription_plans(tier)")
      .eq("user_id", session.user.id)
      .maybeSingle();
    
    if (subscription && subscription.status === "active") {
      const tier = subscription.subscription_plans?.tier || "free";
      if (tier === "story_creator") {
        storyLimit = 30;
      } else if (tier === "family") {
        storyLimit = 999; // Effectively unlimited
      }
    }
    
    // Calculate remaining stories
    const remaining = Math.max(0, storyLimit - newCount);
    
    return NextResponse.json({
      message: "Story usage recorded",
      usage: {
        ...existingUsage,
        story_count: newCount,
        stories_limit: storyLimit // Add this for the frontend
      },
      remaining
    });
  } catch (error) {
    console.error("Error recording story usage:", error);
    return NextResponse.json(
      { 
        error: "Failed to record story usage", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // --- AUTHENTICATION HANDLING ---
    // Check for Bearer token in Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    console.log('[Usage API] Received Authorization header:', authHeader ? `${authHeader.slice(0, 12)}...${authHeader.slice(-4)}` : 'none');
    
    let supabase, session, user;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '').trim();
      console.log('[Usage API] Using access token:', accessToken.slice(0, 5) + '...');
      
      // Validate the token by calling Supabase REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });
      
      if (!userRes.ok) {
        console.error('[Usage API] Supabase REST API user validation failed:', userRes.status);
        return NextResponse.json(
          {
            error: "Unauthorized",
            details: "Invalid or expired token. Please sign in again.",
          },
          { status: 401 }
        );
      }
      
      const userData = await userRes.json();
      user = userData;
      session = { user };
      
      // Create supabase client for DB operations WITH the token explicitly set
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );
      console.log('[Usage API] Authenticated via Bearer token:', { userId: user.id });
    } else {
      // Fallback to cookie-based authentication
      supabase = await createClient();
      const { data: { session: cookieSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !cookieSession) {
        return NextResponse.json(
          { error: "Unauthorized", details: sessionError?.message || "No active session" },
          { status: 401 }
        );
      }
      
      session = cookieSession;
      user = session.user;
      console.log('[Usage API] Authenticated via cookies:', { userId: user.id });
    }
    
    // Get the current month's usage record
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Helper function to determine story limit based on subscription tier
    const getStoryLimit = async (userId: string) => {
      // Get subscription to determine story limit
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(tier)")
        .eq("user_id", userId)
        .maybeSingle();
      
      // Set story limit based on subscription tier
      let limit = 5; // Default free tier
      if (subscription && subscription.status === "active") {
        const tier = subscription.subscription_plans?.tier || "free";
        if (tier === "story_creator") {
          limit = 30;
        } else if (tier === "family") {
          limit = 999; // Effectively unlimited
        }
      }
      return limit;
    };
    
    // Check for existing usage record
    const { data: existingUsage, error: usageError } = await supabase
      .from("story_usage")
      .select("*")
      .eq("user_id", user.id)
      .gte("reset_date", firstDayOfMonth.toISOString())
      .lte("created_at", lastDayOfMonth.toISOString())
      .maybeSingle();
    
    if (usageError && usageError.code !== "PGRST116") {
      console.error("Error fetching usage:", usageError);
      return NextResponse.json(
        { error: "Failed to fetch usage data", details: usageError.message },
        { status: 500 }
      );
    }
    
    // Get the story limit based on subscription
    const storyLimit = await getStoryLimit(user.id);
    
    // If no usage record exists, create one with default values
    if (!existingUsage) {
      // Create new usage record
      const { data: newUsage, error: createError } = await supabase
        .from("story_usage")
        .insert({
          user_id: user.id,
          reset_date: firstDayOfMonth.toISOString(),
          story_count: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating usage record:", createError);
        return NextResponse.json(
          { error: "Failed to create usage record", details: createError.message },
          { status: 500 }
        );
      }
      
      // Calculate remaining stories based on the story limit and current usage
      const remaining = Math.max(0, storyLimit - 0);
      
      return NextResponse.json({
        usage: {
          ...newUsage,
          stories_limit: storyLimit // Add this for the frontend
        },
        remaining
      });
    }
    
    // Calculate remaining stories based on the story limit and current usage
    const remaining = Math.max(0, storyLimit - (existingUsage.story_count || 0));
    
    return NextResponse.json({
      usage: {
        ...existingUsage,
        stories_limit: storyLimit // Add this for the frontend
      },
      remaining
    });
  } catch (error) {
    console.error("Error fetching story usage:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch story usage", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

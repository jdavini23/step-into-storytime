import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    // If there's no code, redirect to sign-in
    if (!code) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Create a Supabase client for this request
    const supabase = createServerSupabaseClient();

    // Exchange the code for a session
    const supabaseClient = await supabase;
    const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }

    // Get the return URL from the cookie or default to dashboard
    const returnTo = requestUrl.searchParams.get("returnTo") || "/dashboard";

    // Redirect to the return URL
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

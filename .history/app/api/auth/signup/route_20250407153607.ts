import { type NextRequest, NextResponse } from "next/server";
import createServerSupabaseClient from "@/utils/supabase/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user profile
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: authData.user.id,
        email: email,
        name: name,
        subscription_tier: "free",
      },
    ]);

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Don't fail the signup if profile creation fails
      // We can handle this case separately
    }

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

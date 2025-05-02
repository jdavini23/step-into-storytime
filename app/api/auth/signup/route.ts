import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Enhanced input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    const sanitizedName = typeof name === 'string' ? name.replace(/[<>]/g, '').trim() : '';
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters, include uppercase, lowercase, number, and special character." },
        { status: 400 }
      );
    }
    if (sanitizedName.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters and not contain < or >." },
        { status: 400 }
      );
    }
    if (/script/i.test(name)) {
      return NextResponse.json(
        { error: "Name cannot contain the word 'script'." },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // Sign up the user
    const supabaseClient = await supabase;
    const { data: authData, error: signUpError } =
      await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: sanitizedName,
          },
        },
      });

    if (signUpError) {
      // Log raw error server-side, return user-friendly message
      console.error("Supabase signUp error:", signUpError);
      let userMessage = "An error occurred during registration. Please try again.";
      if (signUpError.message && signUpError.message.toLowerCase().includes("already registered")) {
        userMessage = "This email is already registered. Please sign in or use a different email.";
      }
      return NextResponse.json({ error: userMessage }, { status: 400 });
    }

    if (!authData.user) {
      // Log raw error server-side, return user-friendly message
      console.error("Supabase returned no user object after signUp:", authData);
      return NextResponse.json(
        { error: "Failed to create user. Please try again later." },
        { status: 500 }
      );
    }

    // Create user profile
    const { error: profileError } = await (await supabase)
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          email: email,
          name: sanitizedName,
          subscription_tier: "free",
        },
      ]);

    if (profileError) {
      // Log raw error server-side, return user-friendly message
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
    // Log raw error server-side, return user-friendly message
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again later." }, { status: 500 });
  }
}

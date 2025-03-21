import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // Attempt to sign in with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      // Handle specific auth errors
      if (authError.status === 400) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      throw authError;
    }

    if (!authData.session || !authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed - no session created' },
        { status: 401 }
      );
    }

    // Get user profile after successful authentication
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Don't fail the login if profile fetch fails
    }

    // Create the response with user data
    const response = NextResponse.json({
      user: {
        ...authData.user,
        profile: profile || null,
      },
      session: authData.session,
    });

    // Get the project ref from the Supabase URL
    const projectRef =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1];

    if (projectRef && authData.session) {
      // Set access token cookie
      response.cookies.set({
        name: `sb-${projectRef}-auth-token`,
        value: authData.session.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      // Set refresh token cookie if present
      if (authData.session.refresh_token) {
        response.cookies.set({
          name: `sb-${projectRef}-refresh-token`,
          value: authData.session.refresh_token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });
      }
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

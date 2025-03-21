import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.'
  );
}

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
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Attempt to sign in with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      // Handle specific auth errors
      if (authError.status === 400) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      throw authError;
    }

    if (!authData.session || !authData.user) {
      return Response.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Get user profile after successful authentication
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Don't fail the login if profile fetch fails
    }

    // Create the response with user data
    const response = Response.json({
      user: authData.user,
      profile: profileData,
      session: authData.session,
    });

    // Get the project ref from the Supabase URL
    const matches = supabaseUrl.match(/(?:db|api)\.(.*?)(?:\.supabase|$)/i);
    const projectRef = matches ? matches[1] : null;

    if (projectRef && authData.session) {
      // Set access token cookie
      const cookieStore = cookies();
      cookieStore.set(
        `sb-${projectRef}-auth-token`,
        authData.session.access_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        }
      );

      // Set refresh token cookie if present
      if (authData.session.refresh_token) {
        cookieStore.set(
          `sb-${projectRef}-auth-refresh-token`,
          authData.session.refresh_token,
          {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
          }
        );
      }
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

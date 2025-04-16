import { createServerClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { type NextRequest, type NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables.');
}

let serverClient: SupabaseClient<Database> | null = null;

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => {
        cookieStore.set({ name, value, ...options });
      },
      remove: (name: string, options: any) => {
        cookieStore.delete({ name, ...options });
      },
    },
  });
};

// Export a function to get the session on the server side
export async function getServerSession() {
  console.log('[Server] Starting getServerSession...');
  const supabase = await createServerSupabaseClient();
  try {
    console.log('[Server] Getting session from Supabase...');
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[Server] Session error:', sessionError);
      return null;
    }

    if (!session) {
      console.log('[Server] No session found');
      return null;
    }

    console.log('[Server] Session found, verifying user...', {
      userId: session.user.id,
    });

    // Verify the user's authentication status
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('[Server] User verification error:', userError);
      return null;
    }

    if (!user) {
      console.log('[Server] No user found during verification');
      return null;
    }

    // Only return session if both checks pass
    if (session && user && session.user.id === user.id) {
      console.log('[Server] Session verified successfully', {
        userId: user.id,
        sessionId: session.user.id,
        email: user.email,
      });
      return session;
    }

    console.log('[Server] Session/User mismatch', {
      sessionUserId: session?.user?.id,
      userId: user?.id,
    });
    return null;
  } catch (error) {
    console.error('[Server] Server session error:', error);
    return null;
  }
}

// Export a function to get the authenticated user on the server side
export async function getServerUser() {
  const supabase = await createServerSupabaseClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Server user error:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Server user error:', error);
    return null;
  }
}

// Export a function to check if a user is authenticated on the server side
export async function isAuthenticated() {
  const user = await getServerUser();
  return !!user;
}

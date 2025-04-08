import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { type NextRequest, type NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing required Supabase environment variables.');
}

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

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
  const supabase = await createServerSupabaseClient();
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      // Silent error in production
      return null;
    }

    return session;
  } catch (error) {
    // Silent error in production
    return null;
  }
}

// Export a function to get the authenticated user on the server side
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}

// Export a function to check if a user is authenticated on the server side
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session?.user;
}

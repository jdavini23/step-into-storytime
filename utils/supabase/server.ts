import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import type { CookieOptions } from '@supabase/ssr';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error(
    'Invalid Supabase URL format. Please check your NEXT_PUBLIC_SUPABASE_URL.'
  );
}

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          });
        } catch (error) {
          // Silent error in production
          if (process.env.NODE_ENV === 'development') {
            console.error('Error setting cookie:', error);
          }
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value: '',
            ...options,
            expires: new Date(0),
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          });
        } catch (error) {
          // Silent error in production
          if (process.env.NODE_ENV === 'development') {
            console.error('Error removing cookie:', error);
          }
        }
      },
    },
  });
};

// Export a function to get the session on the server side
export async function getServerSession() {
  const supabase = await createClient();
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

// Export the client creation function as default as well
export default createClient;

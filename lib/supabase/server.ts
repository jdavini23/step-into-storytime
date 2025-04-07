import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. Please check your .env.local file.'
  );
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

// Helper function to create a Supabase client for server components
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.error('[DEBUG] Error setting cookie:', { name, error });
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          console.error('[DEBUG] Error removing cookie:', { name, error });
        }
      },
    },
    auth: {
      flowType: 'pkce',
      debug: true,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'sb-auth-token',
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web/2.38.4',
        'Cache-Control': 'no-store',
        apikey: supabaseAnonKey,
      },
      fetch: async (url, options = {}) => {
        const fetchWithRetry = async (retries = 3) => {
          try {
            const response = await fetch(url, {
              ...options,
              credentials: 'include',
              headers: {
                ...options.headers,
                'Cache-Control': 'no-store',
                'Content-Type': 'application/json',
                apikey: supabaseAnonKey,
                Origin:
                  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              },
              mode: 'cors',
            });

            if (!response.ok) {
              console.error('[DEBUG] Server fetch error:', {
                status: response.status,
                statusText: response.statusText,
                url: url.toString(),
                retries,
              });

              if (retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return fetchWithRetry(retries - 1);
              }

              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
          } catch (error) {
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return fetchWithRetry(retries - 1);
            }
            console.error('[DEBUG] Server request error:', {
              url: url.toString(),
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
          }
        };
        return fetchWithRetry();
      },
    },
  });
};

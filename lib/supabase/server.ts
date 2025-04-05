import { createServerClient } from '@supabase/ssr';
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
      set(
        name: string,
        value: string,
        options: Omit<ResponseCookie, 'name' | 'value'>
      ) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      },
      remove(name: string, options: Omit<ResponseCookie, 'name' | 'value'>) {
        try {
          cookieStore.delete({ name, ...options });
        } catch (error) {
          console.error('Error removing cookie:', error);
        }
      },
    },
    auth: {
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'sb-auth-token',
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web/2.38.4',
        apikey: supabaseAnonKey,
      },
      fetch: async (url, options = {}) => {
        const fetchWithRetry = async (retries = 3) => {
          try {
            const response = await fetch(url, {
              ...options,
              credentials: 'omit',
              headers: {
                ...options.headers,
                apikey: supabaseAnonKey,
                Origin:
                  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              },
            });
            if (!response.ok && retries > 0) {
              console.error('[DEBUG] Server fetch error:', {
                status: response.status,
                url: url.toString(),
                retries,
              });
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
          } catch (error) {
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return fetchWithRetry(retries - 1);
            }
            throw error;
          }
        };
        return fetchWithRetry();
      },
    },
  });
};

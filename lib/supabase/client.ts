import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { Session } from '@supabase/supabase-js';

// Type for Supabase instance with all tables
export type TypedSupabaseClient = ReturnType<
  typeof createBrowserClient<Database>
>;

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

export const createBrowserSupabaseClient = (): TypedSupabaseClient => {
  const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'sb-auth-token',
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web/2.38.4',
        apikey: supabaseAnonKey,
      },
      fetch: (
        url: RequestInfo | URL,
        options: RequestInit = {}
      ): Promise<Response> => {
        const fetchWithRetry = async (retries = 3): Promise<Response> => {
          try {
            // Get the current session
            const {
              data: { session },
            } = await client.auth.getSession();
            const response: Response = await fetch(url, {
              ...options,
              credentials: 'omit',
              headers: {
                ...options.headers,
                apikey: supabaseAnonKey,
                Authorization: session
                  ? `Bearer ${session.access_token}`
                  : `Bearer ${supabaseAnonKey}`,
                Origin: window.location.origin,
                'Content-Type': 'application/json',
              },
            });
            if (!response.ok && retries > 0) {
              console.error('[DEBUG] Fetch error:', {
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

  return client;
};

// Export a singleton instance for use in client components
export const supabase: TypedSupabaseClient = createBrowserSupabaseClient();

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

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
  const client: SupabaseClient<Database> = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storage:
          typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-auth-token',
        debug: process.env.NODE_ENV === 'development',
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web/2.38.4',
        },
        fetch: async (
          url: RequestInfo | URL,
          options: RequestInit = {}
        ): Promise<Response> => {
          try {
            // Get the current session
            const {
              data: { session },
            }: { data: { session: Session | null } } =
              await client.auth.getSession();

            const response: Response = await fetch(url, {
              ...options,
              credentials: 'include',
              headers: {
                ...options.headers,
                Authorization: session
                  ? `Bearer ${session.access_token}`
                  : `Bearer ${supabaseAnonKey}`,
                apikey: supabaseAnonKey,
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
          } catch (error) {
            console.error('[DEBUG] Fetch error:', error);
            throw error;
          }
        },
      },
    }
  );

  return client;
};

// Export a singleton instance for use in client components
export const supabase: TypedSupabaseClient = createBrowserSupabaseClient();

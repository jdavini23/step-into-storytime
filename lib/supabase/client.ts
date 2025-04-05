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
  const instance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'sb-auth-token',
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
      storage: {
        getItem: (key: string): string | null => {
          try {
            return localStorage.getItem(key);
          } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
          }
        },
        setItem: (key: string, value: string): void => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('Error writing to localStorage:', error);
          }
        },
        removeItem: (key: string): void => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        },
      },
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
            data: { session: currentSession },
            error: sessionError,
          } = await instance.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          // Check if session needs refresh
          let session = currentSession;
          if (session?.expires_at) {
            const expiresAt = session.expires_at * 1000;
            const isExpired = expiresAt < Date.now();
            const isCloseToExpiring = expiresAt - Date.now() < 5 * 60 * 1000; // 5 minutes

            if (isExpired || isCloseToExpiring) {
              console.log('Session needs refresh, attempting to refresh...');
              const { data: refreshData, error: refreshError } =
                await instance.auth.refreshSession();

              if (refreshError) {
                console.error('Session refresh error:', refreshError);
                throw refreshError;
              }

              if (!refreshData.session) {
                throw new Error('Session refresh failed - no session returned');
              }

              session = refreshData.session;
            }
          }

          // Add authorization header if we have a session
          if (session?.access_token) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${session.access_token}`,
            };
          }

          // Make the actual request
          const response = await fetch(url, {
            ...options,
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return response;
        } catch (error) {
          console.error('Fetch error:', error);
          throw error;
        }
      },
    },
  });

  return instance;
};

// Export a singleton instance for use in client components
export const supabase: TypedSupabaseClient = createBrowserSupabaseClient();

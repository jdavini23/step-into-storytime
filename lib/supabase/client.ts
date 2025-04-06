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

// Singleton instance
let supabaseInstance: TypedSupabaseClient | null = null;

export const createBrowserSupabaseClient = (): TypedSupabaseClient => {
  if (supabaseInstance) {
    console.log('[DEBUG] Returning existing Supabase client instance');
    return supabaseInstance;
  }

  console.log('[DEBUG] Creating new Supabase client...', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isClient: typeof window !== 'undefined',
  });

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
            console.log('[DEBUG] Reading from localStorage:', { key });
            const value = localStorage.getItem(key);
            console.log('[DEBUG] localStorage value:', {
              key,
              hasValue: !!value,
            });
            return value;
          } catch (error) {
            console.error('[DEBUG] Error reading from localStorage:', {
              key,
              error,
            });
            return null;
          }
        },
        setItem: (key: string, value: string): void => {
          try {
            console.log('[DEBUG] Writing to localStorage:', {
              key,
              hasValue: !!value,
            });
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('[DEBUG] Error writing to localStorage:', {
              key,
              error,
            });
          }
        },
        removeItem: (key: string): void => {
          try {
            console.log('[DEBUG] Removing from localStorage:', { key });
            localStorage.removeItem(key);
          } catch (error) {
            console.error('[DEBUG] Error removing from localStorage:', {
              key,
              error,
            });
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
        const MAX_RETRIES = 2;
        const TIMEOUT = 15000; // 15 seconds per attempt

        const fetchWithRetry = async (retryCount = 0): Promise<Response> => {
          try {
            console.log('[DEBUG] Supabase fetch request:', {
              url: url.toString(),
              method: options.method,
              hasHeaders: !!options.headers,
              retryCount,
              timestamp: new Date().toISOString(),
            });

            // Add timeout to fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
              console.log('[DEBUG] Aborting fetch request due to timeout', {
                retryCount,
                timeout: TIMEOUT,
              });
            }, TIMEOUT);

            try {
              // Get the current session
              const {
                data: { session: currentSession },
                error: sessionError,
              } = await instance.auth.getSession();

              if (sessionError) {
                console.error('[DEBUG] Session error:', sessionError);
                throw sessionError;
              }

              // Check if session needs refresh
              let session = currentSession;
              if (session?.expires_at) {
                const expiresAt = session.expires_at * 1000;
                const isExpired = expiresAt < Date.now();
                const isCloseToExpiring =
                  expiresAt - Date.now() < 5 * 60 * 1000; // 5 minutes

                if (isExpired || isCloseToExpiring) {
                  console.log(
                    '[DEBUG] Session needs refresh, attempting to refresh...'
                  );
                  const { data: refreshData, error: refreshError } =
                    await instance.auth.refreshSession();

                  if (refreshError) {
                    console.error(
                      '[DEBUG] Session refresh error:',
                      refreshError
                    );
                    console.log('[DEBUG] Continuing with current session');
                  } else if (refreshData.session) {
                    session = refreshData.session;
                  }
                }
              }

              // Add authorization header if we have a session
              if (session?.access_token) {
                options.headers = {
                  ...options.headers,
                  Authorization: `Bearer ${session.access_token}`,
                };
              }

              // Make the actual request with timeout
              console.log('[DEBUG] Making fetch request:', {
                url: url.toString(),
                method: options.method,
                hasAuth: !!(options.headers as any)?.Authorization,
                retryCount,
                timestamp: new Date().toISOString(),
              });

              const response = await fetch(url, {
                ...options,
                credentials: 'include',
                signal: controller.signal,
                keepalive: true,
              });

              clearTimeout(timeoutId);

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              return response;
            } finally {
              clearTimeout(timeoutId);
            }
          } catch (error) {
            if (
              retryCount < MAX_RETRIES &&
              error instanceof Error &&
              error.name === 'AbortError'
            ) {
              console.log('[DEBUG] Retrying failed request:', {
                error: error.message,
                retryCount,
                nextRetryIn: (retryCount + 1) * 1000,
              });

              // Exponential backoff
              await new Promise((resolve) =>
                setTimeout(resolve, (retryCount + 1) * 1000)
              );
              return fetchWithRetry(retryCount + 1);
            }

            console.error('[DEBUG] Fetch error:', {
              error,
              url: url.toString(),
              method: options.method,
              retryCount,
              timestamp: new Date().toISOString(),
              isAbortError:
                error instanceof Error && error.name === 'AbortError',
              stack: error instanceof Error ? error.stack : undefined,
            });

            throw error;
          }
        };

        return fetchWithRetry();
      },
    },
  });

  supabaseInstance = instance;
  console.log('[DEBUG] Supabase client created successfully');
  return instance;
};

// Export a singleton instance
export const supabase = createBrowserSupabaseClient();

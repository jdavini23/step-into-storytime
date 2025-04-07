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

// Debug logging for environment variables
console.log('[DEBUG] Supabase Environment Variables:', {
  hasUrl: !!supabaseUrl,
  urlLength: supabaseUrl?.length,
  urlFirstChars: supabaseUrl?.substring(0, 10),
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length,
  anonKeyFirstChars: supabaseAnonKey?.substring(0, 10),
  environment: process.env.NODE_ENV,
  isClient: typeof window !== 'undefined',
  windowLocation:
    typeof window !== 'undefined' ? window.location.href : 'server',
});

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[DEBUG] Missing Supabase environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
  });
  throw new Error(
    'Missing required Supabase environment variables. Please check your .env.local file.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('[DEBUG] Invalid Supabase URL format:', {
    url: supabaseUrl,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
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
              value: value ? `${value.substring(0, 10)}...` : null,
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
              value: value ? `${value.substring(0, 10)}...` : null,
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
        'Cache-Control': 'no-store',
      },
      fetch: async (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.error('[DEBUG] Request timeout:', {
            url,
            timeout: 30000,
          });
        }, 30000);

        try {
          console.log('[DEBUG] Making request:', {
            url,
            method: options.method || 'GET',
            hasBody: !!options.body,
          });

          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          const response = await fetch(url, {
            ...options,
            credentials: 'include',
            signal: controller.signal,
            headers: {
              ...options.headers,
              'Cache-Control': 'no-store',
              Origin: siteUrl,
            },
          });

          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
    },
  });

  supabaseInstance = instance;
  console.log('[DEBUG] Supabase client created successfully');
  return instance;
};

// Export a singleton instance
export const supabase = createBrowserSupabaseClient();

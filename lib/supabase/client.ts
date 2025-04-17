'use client';

import { createBrowserClient, CookieOptions } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use a WeakMap to store the instance (better for garbage collection)
const instanceMap = new WeakMap<typeof globalThis, SupabaseClient<Database>>();

// Function to initialize and/or get the client instance
function getSupabaseClientInstance(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client should only be used in the browser');
  }

  // Check if instance exists in WeakMap
  if (instanceMap.has(globalThis)) {
    return instanceMap.get(globalThis)!;
  }
  // Create the client with a single instance
  const instance = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    cookies: {
      get: (name: string) => {
        const cookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${name}=`));
        return cookie ? cookie.split('=')[1] : undefined;
      },
      set: (name: string, value: string, options: CookieOptions) => {
        document.cookie = `${name}=${value}; path=${
          options.path || '/'
        }; max-age=${options.maxAge || 60 * 60 * 24 * 365}; domain=${
          options.domain || window.location.hostname
        }; ${options.sameSite ? `samesite=${options.sameSite}; ` : ''}${
          options.secure ? 'secure; ' : ''
        }`;
      },
      remove: (name: string, options: CookieOptions) => {
        document.cookie = `${name}=; path=${
          options.path || '/'
        }; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${
          options.domain || window.location.hostname
        }; ${options.sameSite ? `samesite=${options.sameSite}; ` : ''}${
          options.secure ? 'secure; ' : ''
        }`;
      },
    },
  });

  // Store instance in WeakMap
  instanceMap.set(globalThis, instance as any);

  if (process.env.NODE_ENV === 'development') {
    // Add auth state listener only in development
    instance.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase Client] Auth state changed:', {
        event,
        hasSession: !!session,
        timestamp: new Date().toISOString(),
        host: window.location.hostname,
      });
    });
  }

  return instance as SupabaseClient<Database, 'public', any>;
}

// Export a function to get the client
export const getClient = (): SupabaseClient<Database, 'public', any> => {
  return getSupabaseClientInstance();
};

// Export only the getter function
export default getClient;

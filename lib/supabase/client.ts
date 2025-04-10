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
    cookieOptions: {
      name: 'sb-auth-token',
      domain: process.env.NEXT_PUBLIC_DOMAIN,
      path: '/',
      sameSite: 'lax',
      secure: true,
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

'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { createCustomCookieHandler } from './cookie-handler';

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

  try {
    // Create the client with a single instance and custom cookie handler
    const instance = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      cookies: createCustomCookieHandler(),
    });

    // Store instance in WeakMap
    instanceMap.set(globalThis, instance);

    if (process.env.NODE_ENV === 'development') {
      // Add auth state listener only in development
      instance.auth.onAuthStateChange((event: any, session: any) => {
        console.log('[Supabase Client] Auth state changed:', {
          event,
          hasSession: !!session,
          timestamp: new Date().toISOString(),
          host: window.location.hostname,
        });
      });
    }

    return instance;
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
    throw new Error('Failed to initialize Supabase client. Please try again later.');
  }
}

// Export the getter function
export default getSupabaseClientInstance;

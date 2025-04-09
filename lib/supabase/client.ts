'use client';

// Use Auth Helpers browser client for cookie-based sessions
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type {
  SupabaseClient,
  AuthChangeEvent,
  Session,
} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Declare supabase variable, initialize only once
let supabase: SupabaseClient<Database> | null = null;

// Function to initialize and/or get the client instance
function getSupabaseClientInstance(): SupabaseClient<Database> {
  if (supabase) {
    return supabase;
  }

  // Create the client only if it doesn't exist (singleton pattern)
  supabase = createPagesBrowserClient<Database>();

  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    console.log('[Supabase Client] Initialized Pages Browser Client');

    // Optional: Debug listener for auth state changes in development
    supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('[Supabase Client] Auth state changed:', {
          event,
          hasSession: !!session,
          timestamp: new Date().toISOString(),
          host:
            typeof window !== 'undefined' ? window.location.hostname : 'server',
        });
      }
    );
  }

  return supabase;
}

// Export a function to get the client, ensuring initialization
export const getClient = (): SupabaseClient<Database> => {
  return getSupabaseClientInstance();
};

// You might still want a direct export for convenience in some cases,
// but ensure it gets initialized correctly.
// const browserClient = getSupabaseClientInstance();
// export default browserClient;

// Consider exporting only the getter function for safety:
export default getClient;

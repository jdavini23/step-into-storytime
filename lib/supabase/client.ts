'use client';

// Simplified browser-specific Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

let supabase: any;

if (typeof window !== 'undefined' && !supabase) {
  supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sb-auth-token',
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
    },
  });

  // Debug listener for auth state changes in development
  if (process.env.NODE_ENV === 'development') {
    supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('[Supabase Client] Auth state changed:', {
          event,
          hasSession: !!session,
          timestamp: new Date().toISOString(),
        });
      }
    );
  }
}

export { supabase };

// Export a function to get the client
export const getClient = () => supabase;

export default supabase;

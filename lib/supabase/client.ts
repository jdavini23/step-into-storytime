import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Type for Supabase instance with all tables
export type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug logging for environment variables
console.log('[DEBUG] Supabase Environment Variables:', {
  url: supabaseUrl ? 'Set (length: ' + supabaseUrl.length + ')' : 'Missing',
  anonKey: supabaseAnonKey
    ? 'Set (length: ' + supabaseAnonKey.length + ')'
    : 'Missing',
  isDevelopment: process.env.NODE_ENV === 'development',
  isClient: typeof window !== 'undefined',
});

// Create a singleton instance of the Supabase client
let supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  }
);

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[ERROR] Missing Supabase environment variables.',
    'Required variables:',
    {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Set ✓' : 'Missing ✗',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set ✓' : 'Missing ✗',
    }
  );

  if (process.env.NODE_ENV === 'development') {
    throw new Error('Missing required Supabase environment variables');
  }

  // In production, create a dummy client that will fail gracefully
  const dummyClient = {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: { session: null },
          error: new Error('No Supabase credentials'),
        }),
      getUser: () =>
        Promise.resolve({
          data: { user: null },
          error: new Error('No Supabase credentials'),
        }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: () =>
        Promise.resolve({
          data: null,
          error: new Error('No Supabase credentials'),
        }),
      signInWithOAuth: () =>
        Promise.resolve({
          data: null,
          error: new Error('No Supabase credentials'),
        }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: null,
              error: new Error('No Supabase credentials'),
            }),
        }),
      }),
      insert: () =>
        Promise.resolve({
          data: null,
          error: new Error('No Supabase credentials'),
        }),
      update: () =>
        Promise.resolve({
          data: null,
          error: new Error('No Supabase credentials'),
        }),
    }),
  } as unknown as ReturnType<typeof createBrowserClient<Database>>;

  console.warn(
    '[WARN] Using fallback Supabase client that will fail gracefully'
  );
  supabase = dummyClient;
} else {
  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (error) {
    console.error('[ERROR] Invalid Supabase URL format:', supabaseUrl);

    if (process.env.NODE_ENV === 'development') {
      throw new Error('Invalid Supabase URL format');
    }
  }
}

export { supabase };

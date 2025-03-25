import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Type for Supabase instance with all tables
export type TypedSupabaseClient = SupabaseClient<Database>;

// Environment variables for Supabase connection
const supabaseUrl =
  process.env.STEP_NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  process.env.STEP_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

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
let supabase: SupabaseClient<Database>;

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[ERROR] Missing Supabase environment variables. Authentication and database features will not work.',
    'Required variables:',
    {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Set ✓' : 'Missing ✗',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set ✓' : 'Missing ✗',
    }
  );

  // In development, throw an error to make it obvious
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Missing required Supabase environment variables');
  }

  // In production, create a dummy client that will fail gracefully
  // This prevents the app from crashing completely
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
  } as unknown as SupabaseClient<Database>;

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

  // Initialize Supabase client with additional options
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: isBrowser, // Only persist session in browser environments
        autoRefreshToken: isBrowser, // Only auto-refresh token in browser environments
        detectSessionInUrl: isBrowser, // Only detect session in URL in browser environments
        storageKey: 'sb-auth-token',
      },
    });

    // Test the connection in development and only in browser
    if (process.env.NODE_ENV === 'development' && isBrowser) {
      supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (error) {
            console.warn(
              '[WARN] Initial Supabase session check failed:',
              error.message
            );
          } else {
            console.log('[DEBUG] Supabase client initialized successfully', {
              hasSession: !!data.session,
            });
          }
        })
        .catch((err) => {
          console.error('[ERROR] Failed to initialize Supabase client:', err);
        });
    }
  } catch (error) {
    console.error('[ERROR] Failed to create Supabase client:', error);

    // Create a fallback client that fails gracefully
    const fallbackClient = {
      auth: {
        getSession: () =>
          Promise.resolve({
            data: { session: null },
            error: new Error('Supabase client creation failed'),
          }),
        getUser: () =>
          Promise.resolve({
            data: { user: null },
            error: new Error('Supabase client creation failed'),
          }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signInWithPassword: () =>
          Promise.resolve({
            data: null,
            error: new Error('Supabase client creation failed'),
          }),
        signInWithOAuth: () =>
          Promise.resolve({
            data: null,
            error: new Error('Supabase client creation failed'),
          }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: null,
                error: new Error('Supabase client creation failed'),
              }),
          }),
        }),
        insert: () =>
          Promise.resolve({
            data: null,
            error: new Error('Supabase client creation failed'),
          }),
        update: () =>
          Promise.resolve({
            data: null,
            error: new Error('Supabase client creation failed'),
          }),
      }),
    } as unknown as SupabaseClient<Database>;

    console.warn(
      '[WARN] Using fallback Supabase client due to initialization error'
    );
    supabase = fallbackClient;
  }
}

export { supabase };

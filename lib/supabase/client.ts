import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Type for Supabase instance with all tables
export type TypedSupabaseClient = SupabaseClient<Database>;

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging for environment variables
console.log('[DEBUG] Supabase Environment Variables:', {
  url: supabaseUrl ? 'Set (length: ' + supabaseUrl.length + ')' : 'Missing',
  anonKey: supabaseAnonKey
    ? 'Set (length: ' + supabaseAnonKey.length + ')'
    : 'Missing',
  isDevelopment: process.env.NODE_ENV === 'development',
  isClient: typeof window !== 'undefined',
});

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Authentication and database features will not work.',
    'Required variables:',
    {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Set ✓' : 'Missing ✗',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set ✓' : 'Missing ✗',
    }
  );
  throw new Error('Missing required Supabase environment variables');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format');
}

// Initialize Supabase client with additional options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
  },
});

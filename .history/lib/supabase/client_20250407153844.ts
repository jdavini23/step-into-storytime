import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

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
    "Missing required Supabase environment variables. Please check your .env.local file."
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    "Invalid Supabase URL format. Please check your NEXT_PUBLIC_SUPABASE_URL."
  );
}

// Singleton instance
let supabaseInstance: TypedSupabaseClient | null = null;

const createBrowserSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const instance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      flowType: "pkce",
      debug: false,
      storageKey: "sb-auth-token",
    },
    global: {
      headers: {
        "X-Client-Info": "@supabase/ssr",
      },
    },
  });

  // Add auth state change listener (no logging in production)
  instance.auth.onAuthStateChange(() => {
    // Auth state changes are now handled silently
    // No console logging to keep the console clean
  });

  supabaseInstance = instance;
  return instance;
};

// Export a singleton instance
export const supabase = createBrowserSupabaseClient();

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// Type for Supabase instance with all tables
export type TypedSupabaseClient = ReturnType<
  typeof createBrowserClient<Database>
>;

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only log in development environment
if (process.env.NODE_ENV === "development") {
  console.log("Supabase Environment Variables:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    environment: process.env.NODE_ENV,
    isClient: typeof window !== "undefined",
  });
}

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[DEBUG] Missing Supabase environment variables:", {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
  });
  throw new Error(
    "Missing required Supabase environment variables. Please check your .env.local file."
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error("[DEBUG] Invalid Supabase URL format:", {
    url: supabaseUrl,
    error: error instanceof Error ? error.message : "Unknown error",
  });
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

  // Only log in development environment
  if (process.env.NODE_ENV === "development") {
    console.log("Creating new Supabase client...");
  }

  const instance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      flowType: "pkce",
      debug: process.env.NODE_ENV === "development",
      storageKey: "sb-auth-token",
      // storage: {
      //   getItem: (key) => {
      //     try {
      //       const item = localStorage.getItem(key);
      //       console.log('[DEBUG] Storage getItem:', { key, hasValue: !!item });
      //       return item;
      //     } catch (error) {
      //       console.error('[DEBUG] Storage getItem error:', { key, error });
      //       return null;
      //     }
      //   },
      //   setItem: (key, value) => {
      //     try {
      //       localStorage.setItem(key, value);
      //       console.log('[DEBUG] Storage setItem:', { key, hasValue: !!value });
      //     } catch (error) {
      //       console.error('[DEBUG] Storage setItem error:', { key, error });
      //     }
      //   },
      //   removeItem: (key) => {
      //     try {
      //       localStorage.removeItem(key);
      //       console.log('[DEBUG] Storage removeItem:', { key });
      //     } catch (error) {
      //       console.error('[DEBUG] Storage removeItem error:', { key, error });
      //     }
      //   },
      // },
    },
    global: {
      headers: {
        "X-Client-Info": "@supabase/ssr",
      },
    },
  });

  // Add auth state change listener (only log in development)
  instance.auth.onAuthStateChange((event, session) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth state change:', {
        event,
        hasSession: !!session,
      });
    }
  });

  supabaseInstance = instance;
  return instance;
};

// Export a singleton instance
export const supabase = createBrowserSupabaseClient();

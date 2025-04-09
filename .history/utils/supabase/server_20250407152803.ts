import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import type { CookieOptions } from "@supabase/ssr";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error("Invalid Supabase URL format:", supabaseUrl);
  throw new Error(
    "Invalid Supabase URL format. Please check your NEXT_PUBLIC_SUPABASE_URL."
  );
}

export const createServerSupabaseClient = async () => {
  const cookieStore = await Promise.resolve(cookies());

  // Only log in development environment
  if (process.env.NODE_ENV === "development") {
    const allCookies = await Promise.resolve(cookieStore.getAll());
    const authToken = await Promise.resolve(cookieStore.get("sb-auth-token"));

    console.log("Server auth status:", {
      hasAuthToken: !!authToken,
    });
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            path: '/',
          });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error setting cookie:', {
              name,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value: '',
            ...options,
            expires: new Date(0),
            path: '/',
          });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error removing cookie:', {
              name,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      },
    },
  });

  return supabase;
};

// Export a function to get the session on the server side
export async function getServerSession() {
  const supabase = await createServerSupabaseClient();
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log("[DEBUG] Server session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      error: error?.message,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("[DEBUG] Server session error:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      return null;
    }

    return session;
  } catch (error) {
    console.error("[DEBUG] Unexpected server session error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

// Export a function to get the authenticated user on the server side
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}

// Export a function to check if a user is authenticated on the server side
export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session?.user;
}

// Export the server client creation function
export default createServerSupabaseClient;

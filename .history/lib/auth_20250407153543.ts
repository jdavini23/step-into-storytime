import { cookies } from "next/headers";
import createServerSupabaseClient from "@/utils/supabase/server";

export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error in getServerSession:", error);
    return null;
  }
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<boolean> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // For demo purposes, accept any username with password "password123"
  // In a real app, this would validate against your authentication backend
  if (password === "password123") {
    // Store auth token in localStorage or cookies
    localStorage.setItem("auth-token", "demo-token-12345");
    return true;
  }

  return false;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  // Check if auth token exists
  return !!localStorage.getItem("auth-token");
}

/**
 * Sign out user
 */
export function signOut(): void {
  localStorage.removeItem("auth-token");
  // In a real app, you might also want to invalidate the token on the server
}

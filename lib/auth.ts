import { cookies } from "next/headers";
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getServerSession() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting session:", error.message);
      }
      return null;
    }

    return session;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Error in getServerSession:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
    return null;
  }
}


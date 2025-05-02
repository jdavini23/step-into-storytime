import { getUserProfile, createUserProfile } from "../services/authService";
import { User, UserProfile } from "@/types/auth";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Fetches the user profile for the given user. If not found, attempts to create it.
 * Ensures downstream logic always receives a profile row if possible.
 * Usage: Use everywhere a profile is required for business logic.
 *
 * @param user - The full User object (must include id/email/metadata)
 * @returns { profile: UserProfile | null, error: PostgrestError | null }
 */
export async function getOrCreateUserProfile(
  user: User
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> {
  // Try to fetch the profile first
  const { profile, error } = await getUserProfile(user.id);
  if (profile) {
    return { profile, error: null };
  }
  // If error is not-null and not just missing profile, return error
  if (
    error &&
    error.code !== "PGRST116" &&
    error.code !== "400" &&
    error.code !== "406"
  ) {
    return { profile: null, error };
  }
  // Attempt to create the profile
  const { profile: createdProfile, error: createError } = await createUserProfile(user);
  if (createdProfile) {
    return { profile: createdProfile, error: null };
  }
  // If creation fails, return the error
  return { profile: null, error: createError };
}

import { getUserProfile, createUserProfile, updateUserProfileData } from '@/services/authService';
import { UserProfile } from '@/types/auth';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Fetches existing user profile or creates a new one if none exists.
 * @param userId - Supabase auth user ID
 * @param data - Optional data to update the user profile
 */
export async function fetchOrCreateUserProfile(
  userId: string,
  data: Partial<UserProfile> = {}
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> {
  const { profile, error } = await getUserProfile(userId);
  if (error) {
    return { profile: null, error };
  }
  if (profile) {
    if (data && Object.keys(data).length > 0) {
      return await updateUserProfileData(userId, data);
    }
    return { profile, error: null };
  }
  // Create new profile if not found
  const { profile: newProfile, error: createError } = await createUserProfile(
    userId,
    data
  );
  return { profile: newProfile, error: createError };
}

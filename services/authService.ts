'use client';

// Remove the old client import
// import getClient from '@/lib/supabase/client';
import { createBrowserClient } from '@supabase/ssr';
import {
  AuthError,
  Provider,
  PostgrestError,
  SupabaseClient, // Import SupabaseClient type
} from '@supabase/supabase-js';
import { User, UserProfile } from '@/types/auth';

// Helper function to get the browser client
// We create it directly in the AuthProvider now, so this might not be strictly needed
// But can be useful if authService functions are called from other client components
function getBrowserClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// --- Authentication Methods (Simplified) ---
// Note: These functions now often assume they are called from a context
// where a Supabase client is readily available (like AuthProvider)
// or they create a temporary client.

interface SignInOptions {
  expiresIn?: number;
}

export const signInWithPassword = async (
  email: string,
  password: string,
  options?: SignInOptions
): Promise<{ user: User | null; error: AuthError | null }> => {
  const supabase = getBrowserClient();
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '[Auth] Attempting login with email:',
        email.split('@')[0] + '***'
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
      ...(options?.expiresIn ? {} : {}),
    });

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Auth] Login error:', error.message);
      }
      // Re-throw specific user-friendly errors or a generic one
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password.');
      } else if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please verify your email address.');
      } else if (error.message?.includes('rate limit')) {
        throw new Error('Too many attempts. Please try again later.');
      }
      // Throw original error for other cases or logging
      throw error;
    }

    // Session is now managed by @supabase/ssr via cookies and middleware.
    // No need for manual session checks here.
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Auth] Login successful for user:', data.user?.id);
    }
    return { user: data.user as User | null, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] Unexpected login error:', error);
    }
    // Ensure the caught error is returned in the expected structure
    return {
      user: null,
      error:
        error instanceof AuthError
          ? error
          : new AuthError(
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred during login.'
            ),
    };
  }
};

export const signInWithOAuth = async (
  provider: Provider
): Promise<{ error: AuthError | null }> => {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      // Ensure the redirect URL is absolute for OAuth flows
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] OAuth Sign In error:', error.message);
    }
  }
  return { error };
};

export const signInWithOtp = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] OTP Sign In error:', error.message);
    }
  }
  return { error };
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const supabase = getBrowserClient();
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Auth] Signing out...');
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Auth] Sign out error:', error.message);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Auth] Sign out successful.');
      }
    }
    // Clear any local state if necessary (handled in AuthContext)
    return { error };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] Unexpected Sign out error:', error);
    }
    return {
      error: new AuthError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during sign out.'
      ),
    };
  }
};

export const resetPasswordForEmail = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: `${window.location.origin}/update-password`, // Ensure this route exists
    }
  );
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] Reset Password error:', error.message);
    }
  }
  return { error };
};

export const updateUserPassword = async (
  newPassword: string
): Promise<{ error: AuthError | null }> => {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] Update Password error:', error.message);
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '[Auth] Password updated successfully for user:',
        data.user?.id
      );
    }
  }
  return { error };
};

export const signUp = async (
  name: string,
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  const supabase = getBrowserClient();
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '[Auth] Attempting sign up for email:',
        email.split('@')[0] + '***'
      );
    }
    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      }
    );

    if (signUpError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Auth] Sign up error:', signUpError.message);
      }
      // Map common errors
      if (signUpError.message?.includes('User already registered')) {
        throw new Error('This email is already registered. Try logging in.');
      } else if (
        signUpError.message?.includes(
          'Password should be at least 6 characters'
        )
      ) {
        throw new Error('Password must be at least 6 characters long.');
      }
      throw signUpError; // Re-throw original error for other cases
    }

    if (!signUpData.user) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Auth] Sign up succeeded but no user data returned.');
      }
      throw new Error('Sign up process failed to return user information.');
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '[Auth] Sign up successful, user created with ID:',
        signUpData.user.id
      );
    }
    // Profile creation is now typically handled by onAuthStateChange listener
    // in the AuthContext after successful sign-up and sign-in (or by a trigger in Supabase).
    // We return the user object here for immediate feedback if needed.
    return { user: signUpData.user as User | null, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] Unexpected sign up error:', error);
    }
    return {
      user: null,
      error:
        error instanceof AuthError
          ? error
          : new AuthError(
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred during sign up.'
            ),
    };
  }
};

// --- Profile Management ---
// These functions might be called client-side (using getBrowserClient)
// or server-side (using createServerClient from @supabase/ssr).
// For simplicity here, we assume client-side usage for now.
// Error handling: always return { profile, error }. All logs are environment-guarded.
export const getUserProfile = async (
  userId: string
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  if (!userId) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Profile] getUserProfile called with invalid userId.');
    }
    return {
      profile: null,
      error: {
        message: 'Invalid user ID',
        details: '',
        hint: '',
        code: '400',
      } as PostgrestError,
    };
  }

  const supabase = getBrowserClient(); // Use browser client
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Profile] Fetching profile for userId:', userId);
  }

  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(); // Use single() to expect one row or throw error (PGRST116) if zero/multiple

    if (error) {
      // Handle case where profile doesn't exist (e.g., PGRST116: 'JSON object requested, multiple (or no) rows returned')
      if (status === 406 || error.code === 'PGRST116') {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[Profile] Profile not found for userId: ${userId}. It might need to be created.`
          );
        }
        // Decide if creation should happen here or be triggered elsewhere (e.g., on sign-up listener)
        // For now, just return null profile and no error
        return { profile: null, error: null };
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[Profile] Error fetching profile:', error);
        }
        return { profile: null, error };
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Profile] Profile fetched successfully for userId:', userId);
    }
    return { profile: data as UserProfile, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Profile] Unexpected error fetching profile:', error);
    }
    return {
      profile: null,
      error: {
        message: error instanceof Error ? error.message : 'Unexpected error',
        details: '',
        hint: '',
        code: '500',
      } as PostgrestError,
    };
  }
};

/**
 * Creates a new user profile record.
 */
export const createUserProfile = async (
  userId: string,
  data: Partial<UserProfile> = {}
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  const supabase = getBrowserClient();
  const profileData = { id: userId, ...data };
  const { data: inserted, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .single();
  if (error) {
    return { profile: null, error };
  }
  return { profile: inserted as UserProfile, error: null };
};

// Note: duplicate user-based overload removed. Use createUserProfile(userId) only.

// Error handling: always return { profile, error }. All logs are environment-guarded.
export const updateUserProfileData = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  if (!userId) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[Profile] updateUserProfileData called with invalid userId.'
      );
    }
    return {
      profile: null,
      error: {
        message: 'Invalid user ID',
        details: '',
        hint: '',
        code: '400',
      } as PostgrestError,
    };
  }
  if (!data || Object.keys(data).length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Profile] updateUserProfileData called with no data to update for userId:',
        userId
      );
    }
    // Optionally fetch and return the current profile or return null
    return { profile: null, error: null };
  }

  const supabase = getBrowserClient(); // Use browser client
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[Profile] Updating profile for userId: ${userId} with data:`,
      data
    );
  }

  try {
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select() // Select the updated profile data
      .single(); // Expect a single row back

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Profile] Error updating profile:', error);
      }
      return { profile: null, error };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Profile] Profile updated successfully for userId: ${userId}`);
    }
    return { profile: updatedProfile as UserProfile, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Profile] Unexpected error updating profile:', error);
    }
    return {
      profile: null,
      error: {
        message: error instanceof Error ? error.message : 'Unexpected error',
        details: '',
        hint: '',
        code: '500',
      } as PostgrestError,
    };
  }
};

// --- Removed Obsolete Functions ---
// getSupabaseSession, refreshSupabaseSession, getSupabaseUser,
// initializeSession, verifySessionAfterLogin, fetchWithAuth, getUserData example
// are no longer needed as @supabase/ssr handles session management via cookies
// and middleware. Authentication state and user data are now typically accessed
// via the AuthContext or directly using the appropriate Supabase client.
// getSupabaseClient is also removed as clients are created contextually.
// createUserProfileWrapper removed as direct call to createUserProfile is clearer.
// verifyUserIdInDatabase removed as it was primarily for debugging the previous complex flow.

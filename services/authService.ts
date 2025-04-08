'use client';

import getClient from '@/lib/supabase/client';
import {
  AuthError,
  Session,
  Provider,
  PostgrestError,
} from '@supabase/supabase-js';

// Import shared types
import { User, UserProfile } from '@/types/auth';

// --- Session & User ---

export const getSupabaseSession = async (): Promise<{
  session: Session | null;
  error: AuthError | null;
}> => {
  const { data, error } = await getClient().auth.getSession();
  return { session: data?.session || null, error };
};

export const refreshSupabaseSession = async (): Promise<{
  session: Session | null;
  error: AuthError | null;
}> => {
  const { data, error } = await getClient().auth.refreshSession();
  return { session: data?.session || null, error };
};

export const getSupabaseUser = async (): Promise<{
  user: User | null;
  error: AuthError | null;
}> => {
  const { data, error } = await getClient().auth.getUser();
  return { user: data.user as User | null, error };
};

// --- Authentication Methods ---

export const signInWithPassword = async (
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
  try {
    console.log('[Auth] Attempting login with:', {
      email: email.slice(0, 3) + '***@' + email.split('@')[1],
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      host: typeof window !== 'undefined' ? window.location.hostname : 'server',
    });

    const supabase = getClient();

    // Pre-login state check
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('[Auth] Pre-login session state:', {
      hasSession: !!sessionData?.session,
      timestamp: new Date().toISOString(),
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    // Detailed response logging
    console.log('[Auth] Login response:', {
      success: !error,
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      errorType: error?.name,
      errorMessage: error?.message,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('[Auth] Login error details:', {
        name: error.name,
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      });

      // Map Supabase errors to user-friendly messages
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please verify your email address before logging in.');
      } else if (error.message?.includes('rate limit')) {
        throw new Error('Too many login attempts. Please try again later.');
      } else {
        throw error;
      }
    }

    // Check if session exists before attempting to fetch profile
    if (!data?.session) {
      console.error('No session after authentication');
      throw new Error('Authentication succeeded but no session was created');
    }

    // Post-login session verification
    if (data?.session) {
      const { data: verifySession } = await supabase.auth.getSession();
      console.log('[Auth] Post-login session verification:', {
        hasSession: !!verifySession?.session,
        sessionMatch:
          verifySession?.session?.access_token === data.session.access_token,
        timestamp: new Date().toISOString(),
      });
    }

    return { user: data?.user || null, session: data?.session || null, error: null };
  } catch (error) {
    console.error('[Auth] Unexpected login error:', error);
    return {
      user: null,
      session: null,
      error:
        error instanceof Error
          ? new AuthError(error.message)
          : new AuthError('An unexpected error occurred'),
    };
  }
};

export const signInWithOAuth = async (
  provider: Provider
): Promise<{ error: AuthError | null }> => {
  const { error } = await getClient().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
};

export const signInWithOtp = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  const { error } = await getClient().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await getClient().auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error in signOut:', error);
    return { error: error as AuthError };
  }
};

export const resetPasswordForEmail = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await getClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  } catch (error) {
    console.error('Error in resetPasswordForEmail:', error);
    return { error: error as AuthError };
  }
};

export const updateUserPassword = async (
  newPassword: string
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await getClient().auth.updateUser({
      password: newPassword,
    });
    return { error };
  } catch (error) {
    console.error('Error in updateUserPassword:', error);
    return { error: error as AuthError };
  }
};

export const signUp = async (
  name: string,
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const { data, error } = await getClient().auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    const user = data?.user || null;
    if (user) {
      await createUserProfile(user);
    }
    return { user, error };
  } catch (error) {
    console.error('Error in signUp:', error);
    return { user: null, error: error as AuthError };
  }
};

// --- Profile Management ---
async function createUserProfileWrapper(userId: string, user?: User) {
  try {
    const { profile, error: createError } = await createUserProfile(
      (user || {
        id: userId,
        email: '',
        user_metadata: {
          name: 'New User',
        },
      }) as User
    );

    if (createError) {
      console.error('Error creating new profile for userId:', userId, createError);
      throw new Error(`Failed to create a new profile for userId: ${userId}`);
    }

    return { profile, error: null };
  } catch (error) {
    console.error('Error in createUserProfileWrapper:', error);
    throw new Error(`Failed to create a new profile in wrapper: ${error}`); // More specific error
  }
}

export const getUserProfile = async (
  userId: string
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  if (!userId) {
    console.error('getUserProfile called with invalid userId:', userId);
    throw new Error('Invalid user ID provided');
  }

  console.log('Fetching profile for userId:', userId);

  try {
    // Log authentication state before query
    const { data: sessionData } = await getClient().auth.getSession();
    console.log('Auth state before fetching profile:', {
      hasSession: !!sessionData?.session,
      sessionData,
    });

    const { data, error } = await getClient()
      .from('profiles')
      .select('*', { head: false }) // Ensure correct headers are set
      .eq('id', userId)
      .single();

    console.log('Profile query result:', { data, error });

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('No profile found for userId:', userId, '- Creating a new profile.');

        try {
          const currentUser = await getClient().auth.getUser();
          const currentUserId = currentUser.data?.user?.id; // Get the user ID from auth.getUser()

          if (!currentUserId) {
            console.error('No user ID found after authentication.');
            throw new Error('No user ID found after authentication.');
          }

          const { profile, error } = await (currentUser.data?.user
            ? createUserProfileWrapper(currentUserId, currentUser.data.user) // Use the correct user ID
            : createUserProfileWrapper(currentUserId)); // Use the correct user ID

          if (error) {
            console.error('Error creating new profile:', error);
            throw new Error('Failed to create a new profile');
          }

          return { profile, error: null };
        } catch (err) {
          console.error('Error creating new profile:', err);
          throw new Error('Failed to create a new profile');
        }
      }
    }

    return {
      profile: data as UserProfile | null,
      error: null,
    };
  } catch (error) {
    console.error('Error details in getUserProfile:', error);
    throw error;
  }
};

// Debugging utility to verify userId in the database
export const verifyUserIdInDatabase = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await getClient()
      .from('profiles')
      .select('id')
      .eq('id', userId);

    if (error) {
      console.error('Error verifying userId in database:', error);
      return false;
    }

    if (!data || data.length === 0) {
      console.warn('No matching userId found in database:', userId);
      return false;
    }

    if (data.length > 1) {
      console.error('Multiple entries found for userId in database:', userId);
      return false;
    }

    console.log('userId verified in database:', userId);
    return true;
  } catch (error) {
    console.error('Unexpected error while verifying userId in database:', error);
    return false;
  }
};

export const createUserProfile = async (
  user: User
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  const { data, error } = await getClient()
    .from('profiles')
    .insert({
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      avatar_url: user.user_metadata?.avatar_url || null,
      subscription_tier: 'free',
    })
    .select()
    .single();
  return {
    profile: data as UserProfile | null,
    error: error as PostgrestError | null,
  };
};

export const updateUserProfileData = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  const { data: updatedProfile, error } = await getClient()
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  return {
    profile: updatedProfile as UserProfile | null,
    error: error as PostgrestError | null,
  };
};

// --- Auth State Listener ---
// Note: The actual listener setup (onAuthStateChange) will be handled
// by the useAuthListener hook in the next step. This service provides
// the core Supabase client instance if needed by the hook.
export const getSupabaseClient = () => getClient();

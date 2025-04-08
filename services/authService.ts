'use client';

import { supabase } from '@/lib/supabase/client';
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
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

export const refreshSupabaseSession = async (): Promise<{
  session: Session | null;
  error: AuthError | null;
}> => {
  const { data, error } = await supabase.auth.refreshSession();
  return { session: data.session, error };
};

export const getSupabaseUser = async (): Promise<{
  user: User | null;
  error: AuthError | null;
}> => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user as User | null, error };
};

// --- Authentication Methods ---

export const signInWithPassword = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    // Input validation logging
    if (!email || !password) {
      console.error('[Auth] Missing credentials:', {
        hasEmail: !!email,
        hasPassword: !!password,
      });
      throw new Error('Email and password are required');
    }

    // Pre-login state check
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('[Auth] Pre-login session state:', {
      hasSession: !!sessionData?.session,
      timestamp: new Date().toISOString(),
    });

    // Attempt login
    console.log('[Auth] Attempting login with:', {
      email: email.slice(0, 3) + '***@' + email.split('@')[1],
      passwordLength: password?.length,
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
    }

    // Post-login session check if successful
    if (data?.user) {
      const { data: newSession } = await supabase.auth.getSession();
      console.log('[Auth] Post-login session state:', {
        hasSession: !!newSession?.session,
        timestamp: new Date().toISOString(),
      });
    }

    return { user: data?.user || null, error };
  } catch (error) {
    console.error('[Auth] Unexpected login error:', error);
    return { user: null, error: error as AuthError };
  }
};

export const signInWithOAuth = async (
  provider: Provider
): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithOAuth({
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
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
    const { error } = await supabase.auth.updateUser({
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { user: data?.user || null, error };
  } catch (error) {
    console.error('Error in signUp:', error);
    return { user: null, error: error as AuthError };
  }
};

// --- Profile Management ---

export const getUserProfile = async (
  userId: string
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  try {
    console.log(`[DEBUG] Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`[DEBUG] Error fetching profile:`, error);
      // Check for 406 Not Acceptable error
      if (error.code === '406') {
        console.error(
          `[DEBUG] 406 Not Acceptable error encountered. This may be a content negotiation issue.`
        );
      }
    } else {
      console.log(`[DEBUG] Successfully fetched profile for user: ${userId}`);
    }

    return {
      profile: data as UserProfile | null,
      error: error as PostgrestError | null,
    };
  } catch (err) {
    console.error(`[DEBUG] Unexpected error in getUserProfile:`, err);
    return {
      profile: null,
      error: err as PostgrestError,
    };
  }
};

export const createUserProfile = async (
  user: User
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase
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
  const { data: updatedProfile, error } = await supabase
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
export const getSupabaseClient = () => supabase;

import { supabase } from '@/lib/supabase/client';
import {
  AuthError,
  Session,
  // User as SupabaseUser, // User type is now imported from types/auth
  Provider,
  PostgrestError, // Import PostgrestError for database operations
} from '@supabase/supabase-js';

// Import shared types
import { User, UserProfile } from '@/types/auth';

// Re-define types here for now, or import from a shared location later
// export interface UserProfile { ... }
// export interface User extends SupabaseUser {}

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
  console.log('[DEBUG] Calling Supabase signInWithPassword...');

  try {
    // Check network connectivity first
    if (!navigator.onLine) {
      throw new Error(
        'No internet connection. Please check your network and try again.'
      );
    }

    // Log the request attempt
    console.log('[DEBUG] Auth request details:', {
      timestamp: new Date().toISOString(),
      email: email.length > 0 ? '✓' : '✗',
      networkStatus: navigator.onLine ? 'online' : 'offline',
    });

    // Create a single promise that will either resolve with the auth result or reject with a timeout
    const authPromiseWithTimeout = new Promise<{
      data: { user: User | null; session: Session | null };
      error: AuthError | null;
    }>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Authentication request timed out after 30 seconds'));
      }, 30000);

      supabase.auth
        .signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });

    try {
      const result = await authPromiseWithTimeout;

      console.log('[DEBUG] Raw Supabase response:', {
        status: 'success',
        hasData: !!result.data,
        hasError: !!result.error,
        timestamp: new Date().toISOString(),
      });

      if (result.error) {
        console.error('[DEBUG] Auth error details:', {
          name: result.error.name,
          message: result.error.message,
          status: result.error.status,
          timestamp: new Date().toISOString(),
        });
        return { user: null, error: result.error };
      }

      console.log('[DEBUG] Auth success:', {
        hasUser: !!result.data.user,
        hasSession: !!result.data.session,
        timestamp: new Date().toISOString(),
      });

      return {
        user: result.data.user,
        error: null,
      };
    } catch (error) {
      if (error instanceof Error) {
        const authError = error as AuthError;
        console.error('[DEBUG] Auth promise error:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
        return { user: null, error: authError };
      }
      return {
        user: null,
        error: new Error(
          'An unexpected error occurred during authentication'
        ) as AuthError,
      };
    }
  } catch (error) {
    // Enhanced error logging
    console.error('[DEBUG] Unexpected error in signInWithPassword:', {
      error,
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString(),
    });

    // Create a proper error response
    let authError: AuthError;
    if (error instanceof Error) {
      authError = error as AuthError;
      authError.status = authError.status || 500;
      // Add more context to timeout errors
      if (
        authError.name === 'AbortError' ||
        authError.name === 'TimeoutError'
      ) {
        authError.message =
          'The authentication service is not responding. Please check your internet connection and try again.';
      }
    } else {
      authError = new Error(
        'An unexpected error occurred during authentication'
      ) as AuthError;
      authError.name = 'AuthError';
      authError.status = 500;
    }

    return { user: null, error: authError };
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
  return supabase.auth.signOut();
};

export const signUp = async (
  name: string,
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }, // Include name in user_metadata during signup
    },
  });
  return { user: data?.user as User | null, error };
};

// --- Profile Management ---

export const getUserProfile = async (
  userId: string
): Promise<{ profile: UserProfile | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return {
    profile: data as UserProfile | null,
    error: error as PostgrestError | null,
  };
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
    .update({ ...data, updated_at: new Date().toISOString() })
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

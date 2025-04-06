'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  Dispatch,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { AuthError, PostgrestError, Provider } from '@supabase/supabase-js';

// Use types from central file
import {
  User,
  UserProfile,
  AuthAction,
  AuthState,
  UserRole,
} from '@/types/auth';

// Import functions from authService
import {
  signInWithPassword,
  signInWithOAuth,
  signInWithOtp,
  signOut,
  signUp,
  getSupabaseSession,
  refreshSupabaseSession,
  getSupabaseUser,
  getUserProfile,
  createUserProfile,
  updateUserProfileData,
} from '@/services/authService';

// Import the custom hook
import { useAuthListener } from '@/hooks/useAuthListener';

// Remove local type definitions
// export type UserRole = 'user' | 'admin';
// export interface AuthState { ... }
// export type AuthAction = ...

// --- Initial State (Define type explicitly) ---
const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
  isInitializing: true,
};

// --- Reducer (Define types explicitly) ---
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        isInitialized: true,
        isInitializing: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitializing: false,
        isInitialized: true,
      };
    case 'PROFILE_LOADED':
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        isInitialized: true,
        isInitializing: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isInitializing: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload.user };
    case 'SET_INITIALIZING':
      return { ...state, isInitializing: action.payload };
    default:
      return state;
  }
};

// --- Context Definition (Define type explicitly) ---
interface AuthContextType {
  state: AuthState;
  login: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// --- Error Mapping Utility (Refine error type) ---
function mapSupabaseErrorToMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const err = error as { message: string; status?: number; code?: string };
    const message =
      typeof err.message === 'string' ? err.message.toLowerCase() : '';

    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please verify your email before logging in.';
    }
    if (
      message.includes('user already registered') ||
      message.includes('unique constraint') ||
      err.code === '23505'
    ) {
      return 'This email is already registered. Please log in.';
    }
    if (message.includes('password should be at least 6 characters')) {
      return 'Password should be at least 6 characters.';
    }
    if (message.includes('too many requests') || err.status === 429) {
      return 'Too many attempts. Please try again later.';
    }
    if (
      message.includes('network error') ||
      message.includes('failed to fetch')
    ) {
      return 'Network error. Please check your connection and try again.';
    }
    return err.message || 'An unexpected error occurred.';
  } else if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
}

type AuthResult<T> = {
  data?: T | null;
  error: AuthError | null;
};

interface HandleAuthCallOptions {
  successMessage?: string;
  errorMessage?: string;
}

// --- Provider Component ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  useAuthListener(dispatch, state.isInitialized);

  const handleAuthCall = useCallback(
    async <T,>(
      serviceCall: () => Promise<AuthResult<T>>,
      options: HandleAuthCallOptions = {}
    ): Promise<AuthResult<T>> => {
      const startTime = Date.now();
      console.log('[DEBUG] handleAuthCall - Starting service call...', {
        timestamp: new Date().toISOString(),
        options,
      });

      try {
        // Add connection status check
        if (!navigator.onLine) {
          throw new Error('No internet connection available');
        }

        console.log('[DEBUG] handleAuthCall - Network status:', {
          online: navigator.onLine,
          type: (navigator as any).connection?.type,
          effectiveType: (navigator as any).connection?.effectiveType,
          timestamp: new Date().toISOString(),
        });

        console.log('[DEBUG] handleAuthCall - Executing service call...');
        const result = await serviceCall();

        const endTime = Date.now();
        console.log('[DEBUG] handleAuthCall - Service call completed', {
          duration: endTime - startTime,
          timestamp: new Date().toISOString(),
        });

        return result;
      } catch (error) {
        const endTime = Date.now();
        console.error('[DEBUG] handleAuthCall - Error in service call', {
          error,
          duration: endTime - startTime,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    []
  );

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ user: User | null; error: AuthError | null }> => {
      console.log('[DEBUG] Starting login process in auth context...');

      try {
        // Check Supabase client initialization
        if (!supabase.auth) {
          console.error('[DEBUG] Supabase client not properly initialized');
          throw new Error('Authentication service not available');
        }

        const result = await handleAuthCall<User>(
          () => signInWithPassword(email, password),
          {
            successMessage: 'Successfully logged in',
            errorMessage: 'Failed to log in',
          }
        );

        if (result.error) {
          console.error('[DEBUG] Login error:', {
            error: result.error,
            timestamp: new Date().toISOString(),
          });
          throw result.error;
        }

        if (!result.data) {
          console.error('[DEBUG] No user returned from login');
          throw new Error('No user returned from authentication service');
        }

        return { user: result.data, error: null };
      } catch (error) {
        console.error('[DEBUG] Login process failed:', {
          error,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        if (error instanceof AuthError) {
          return { user: null, error };
        }
        return {
          user: null,
          error: new Error('An unexpected error occurred') as AuthError,
        };
      }
    },
    [handleAuthCall]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      const result = await handleAuthCall<{ user: User | null }>(
        () => signUp(name, email.trim().toLowerCase(), password),
        { errorMessage: 'Failed to sign up' }
      );
      if (result.error) throw result.error;
    },
    [handleAuthCall]
  );

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!state.user?.id) return;
      const result = await handleAuthCall<UserProfile>(
        async () => {
          const { profile, error } = await updateUserProfileData(
            state.user!.id,
            data
          );
          if (error) throw error;
          return { data: profile, error: null };
        },
        { errorMessage: 'Failed to update profile' }
      );
      if (result.data) {
        dispatch({ type: 'PROFILE_LOADED', payload: result.data });
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          variant: 'default',
        });
      }
    },
    [state.user?.id, handleAuthCall]
  );

  const loginWithGoogle = useCallback(async () => {
    await handleAuthCall<void>(() => signInWithOAuth('google'), {
      errorMessage: 'Failed to login with Google',
    });
  }, [handleAuthCall]);

  const loginWithGithub = useCallback(async () => {
    await handleAuthCall<void>(() => signInWithOAuth('github'), {
      errorMessage: 'Failed to login with GitHub',
    });
  }, [handleAuthCall]);

  const loginWithOtp = useCallback(
    async (email: string) => {
      await handleAuthCall<void>(
        () => signInWithOtp(email.trim().toLowerCase()),
        { errorMessage: 'Failed to login with OTP' }
      );
    },
    [handleAuthCall]
  );

  const loginWithFacebook = useCallback(async () => {
    await handleAuthCall<void>(() => signInWithOAuth('facebook'), {
      errorMessage: 'Failed to login with Facebook',
    });
  }, [handleAuthCall]);

  const loginWithMagicLink = useCallback(
    async (email: string) => {
      await handleAuthCall<void>(
        () => signInWithOtp(email.trim().toLowerCase()),
        { errorMessage: 'Failed to send magic link' }
      );
    },
    [handleAuthCall]
  );

  const sendMagicLink = useCallback(
    async (email: string) => {
      await handleAuthCall<void>(
        () => signInWithOtp(email.trim().toLowerCase()),
        { errorMessage: 'Failed to send magic link' }
      );
    },
    [handleAuthCall]
  );

  const logout = useCallback(async () => {
    await handleAuthCall<void>(() => signOut(), {
      errorMessage: 'Failed to logout',
    });
  }, [handleAuthCall]);

  const refreshSession = useCallback(async () => {
    console.warn('Attempting to refresh session manually...');
    await handleAuthCall<void>(
      async () => {
        const { error } = await supabase.auth.refreshSession();
        return { error, data: undefined };
      },
      { errorMessage: 'Failed to refresh session' }
    );
  }, [handleAuthCall]);

  const value = useMemo(
    () => ({
      state,
      login,
      loginWithGoogle,
      loginWithFacebook,
      sendMagicLink,
      logout,
      signup,
      updateProfile,
      refreshSession,
    }),
    [
      state,
      login,
      loginWithGoogle,
      loginWithFacebook,
      sendMagicLink,
      logout,
      signup,
      updateProfile,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create hook for using the context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

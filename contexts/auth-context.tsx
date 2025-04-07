'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { AuthError, User } from '@supabase/supabase-js';

// Types
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer
type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_STATE' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_STATE':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Handle auth state changes
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SET_USER', payload: session?.user || null });
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'SET_USER', payload: session?.user || null });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Error handler
  const handleError = useCallback((error: AuthError | null) => {
    if (error) {
      const message = error.message || 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return true;
    }
    return false;
  }, []);

  // Auth methods
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        console.log('[DEBUG] Login attempt:', {
          emailLength: email?.length,
          hasPassword: !!password,
          timestamp: new Date().toISOString(),
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

        if (error) {
          console.error('[DEBUG] Login error details:', {
            errorMessage: error.message,
            errorStatus: error.status,
            errorName: error.name,
            timestamp: new Date().toISOString(),
          });
          handleError(error);
          return;
        }

        if (!data.session) {
          console.error('[DEBUG] No session after login:', {
            hasData: !!data,
            hasUser: !!data?.user,
            timestamp: new Date().toISOString(),
          });
          dispatch({
            type: 'SET_ERROR',
            payload: 'No session after login. Please try again.',
          });
          return;
        }

        console.log('[DEBUG] Login successful:', {
          hasSession: !!data.session,
          hasUser: !!data.session?.user,
          timestamp: new Date().toISOString(),
        });

        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        dispatch({ type: 'SET_USER', payload: data.session.user });
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push('/dashboard');
      } catch (error) {
        console.error('[DEBUG] Unexpected login error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        handleError(error as AuthError);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [handleError, router]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const { error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: { name },
          },
        });

        if (handleError(error)) return;

        toast({
          title: 'Success',
          description: 'Please check your email to confirm your account',
        });
        router.push('/auth/verify');
      } catch (error) {
        handleError(error as AuthError);
      }
    },
    [handleError, router]
  );

  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('[DEBUG] Starting logout process');

      // Clear local state first to ensure UI updates immediately
      dispatch({ type: 'CLEAR_STATE' });

      // Clear any stored auth data
      try {
        localStorage.removeItem('sb-auth-token');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('stories');
      } catch (storageError) {
        console.error('[DEBUG] Error clearing local storage:', storageError);
      }

      // Attempt to sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('[DEBUG] Supabase signOut error:', {
            error,
            message: error.message,
            status: error.status,
          });
          // Don't throw the error, just log it
        }
      } catch (signOutError) {
        console.error('[DEBUG] Network error during signOut:', {
          error:
            signOutError instanceof Error
              ? signOutError.message
              : 'Unknown error',
          type:
            signOutError instanceof Error ? signOutError.name : 'Unknown type',
        });
        // Don't throw the error, continue with cleanup
      }

      // Always redirect to home page
      console.log('[DEBUG] Redirecting to home page');
      router.push('/');
    } catch (error) {
      console.error('[DEBUG] Unexpected error during logout:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown type',
      });
      // Don't throw the error, ensure we complete the logout process
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [router]);

  const loginWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (handleError(error)) return;
    } catch (error) {
      handleError(error as AuthError);
    }
  }, [handleError]);

  const loginWithGithub = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (handleError(error)) return;
    } catch (error) {
      handleError(error as AuthError);
    }
  }, [handleError]);

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (handleError(error)) return;

        toast({
          title: 'Success',
          description: 'Password reset instructions sent to your email',
        });
      } catch (error) {
        handleError(error as AuthError);
      }
    },
    [handleError]
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (handleError(error)) return;

        toast({
          title: 'Success',
          description: 'Password updated successfully',
        });
        router.push('/dashboard');
      } catch (error) {
        handleError(error as AuthError);
      }
    },
    [handleError, router]
  );

  const value = useMemo(
    () => ({
      state,
      login,
      signup,
      logout,
      loginWithGoogle,
      loginWithGithub,
      resetPassword,
      updatePassword,
    }),
    [
      state,
      login,
      signup,
      logout,
      loginWithGoogle,
      loginWithGithub,
      resetPassword,
      updatePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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

        console.log('[DEBUG] Attempting login with email:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

        if (error) {
          console.error('[DEBUG] Login error:', error);
          handleError(error);
          return;
        }

        if (!data.session) {
          console.error('[DEBUG] No session after login');
          dispatch({
            type: 'SET_ERROR',
            payload: 'No session after login. Please try again.',
          });
          return;
        }

        console.log('[DEBUG] Login successful, redirecting to dashboard');
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        // Ensure we have the user before redirecting
        dispatch({ type: 'SET_USER', payload: data.session.user });

        // Small delay to ensure state updates are processed
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push('/dashboard');
      } catch (error) {
        console.error('[DEBUG] Unexpected login error:', error);
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

      const { error } = await supabase.auth.signOut();

      if (handleError(error)) return;

      dispatch({ type: 'CLEAR_STATE' });
      router.push('/');
    } catch (error) {
      handleError(error as AuthError);
    }
  }, [handleError, router]);

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

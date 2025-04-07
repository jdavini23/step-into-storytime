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
import { error } from 'console';

// Types
export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
};

export type AuthContextType = {
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
  isInitialized: false,
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
        isInitialized: true,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_STATE':
      return { ...initialState, isLoading: false, isInitialized: true };
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
    let isSubscribed = true;
    dispatch({ type: 'SET_LOADING', payload: true });

    // Function to update auth state
    const updateAuthState = async (user: User | null) => {
      if (!isSubscribed) return;
      
      if (!user) {
        dispatch({ type: 'SET_USER', payload: null });
        return;
      }

      try {
        // Verify the session is still valid
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          console.error('[DEBUG] Session verification failed:', {
            error: error?.message,
            hasSession: !!session,
            timestamp: new Date().toISOString(),
          });
          dispatch({ type: 'SET_USER', payload: null });
          return;
        }

        console.log('[DEBUG] User email confirmed at:', user?.email_confirmed_at);

        // Fetch subscription data
        console.log('[DEBUG] Fetching subscription data for user:', user.id);
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id);
        console.log('[DEBUG] Subscription data result:', { subscriptions, subError });

        if (subError) {
          console.error('[DEBUG] Error fetching subscription:', {
            error: subError?.message,
            userId: user.id,
            timestamp: new Date().toISOString(),
          });
          dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch subscription data.' });
        } else {
          if (subscriptions && subscriptions.length === 1) {
            const subscription = subscriptions[0];
            console.log('[DEBUG] Subscription fetched successfully:', {
              userId: user.id,
              hasSubscription: !!subscription,
              subscriptionId: subscription?.id,
              status: subscription?.status,
            });
          } else if (subscriptions && subscriptions.length > 1) {
            console.error('[DEBUG] Multiple subscriptions found for user:', user.id);
            dispatch({ type: 'SET_ERROR', payload: 'Multiple subscriptions found. Please contact support.' });
          } else {
            console.log('[DEBUG] No subscription found for user:', user.id);
            dispatch({ type: 'SET_ERROR', payload: 'No subscription found. Please subscribe to a plan.' });
          }
        }

        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        console.error('[DEBUG] Error updating auth state:', {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('[DEBUG] Initializing auth - getting session...');
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log('[DEBUG] getSession result:', { session, sessionError });

        if (!isSubscribed) return;

        if (sessionError) {
          console.error('[DEBUG] Error getting session:', {
            error: sessionError.message,
            timestamp: new Date().toISOString(),
          });
          dispatch({
            type: 'SET_ERROR',
            payload: sessionError?.message || 'An error occurred',
          });
          return;
        }

        console.log('[DEBUG] Session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          isInitialized: true,
          timestamp: new Date().toISOString(),
        });

        if (session?.user) {
          await updateAuthState(session.user);
        }
      } catch (error) {
        console.error('[DEBUG] Error during auth initialization:', {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
        dispatch({ type: 'SET_USER', payload: null });
      } finally {
        if (isSubscribed) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    // Initialize auth
    console.log('[DEBUG] Calling initializeAuth()');
    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isSubscribed) return;

      console.log('[DEBUG] Auth state change:', {
        event: _event,
        hasSession: !!session,
        hasUser: !!session?.user,
        timestamp: new Date().toISOString(),
      });

      await updateAuthState(session?.user || null);
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  // Error handler
  const handleError = useCallback(
    (error: AuthError | null, clearState = false) => {
      if (error) {
        console.error('[DEBUG] Auth error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          timestamp: new Date().toISOString(),
        });

        let userMessage = 'An error occurred during authentication';

        // Handle specific error cases
        switch (error.status) {
          case 400:
            userMessage = 'Invalid email or password. Please double-check your credentials.';
          case 401:
            userMessage = 'Your session has expired. Please sign in again. If the problem persists, clear your browser cookies and try again.';
            if (clearState) {
              dispatch({ type: 'CLEAR_STATE' });
              router.push('/sign-in');
            }
            break;
          case 422:
            userMessage =
              'Invalid input provided. Please check your information. Ensure all fields are filled correctly and meet the required criteria.';
          case 429:
            userMessage = 'Too many attempts. Please try again later. This is a security measure to prevent abuse. Please wait a few minutes before trying again.';
          default:
            if (error.message?.includes('Failed to fetch')) {
              userMessage =
                'Network error. Please check your internet connection. If the problem persists, try again later.';
            } else {
              userMessage = `An unexpected error occurred: ${error.message}. Please try again later. If the problem persists, contact support.`;
            }
        }

        dispatch({ type: 'SET_ERROR', payload: userMessage });
        toast({
          title: 'Error',
          description: userMessage,
          variant: 'destructive',
        });
        return true;
      }
      return false;
    },
    [router]
  );

  // Auth methods
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        console.log('[DEBUG] Login attempt:', {
          emailProvided: !!email,
          emailLength: email?.length,
          passwordProvided: !!password,
          passwordLength: password?.length,
          timestamp: new Date().toISOString(),
        });

        if (!email || !password) {
          throw new Error('Email and password are required');
        }

        console.log('[DEBUG] Calling supabase.auth.signInWithPassword with email:', email.toLowerCase().trim());
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });
        console.log('[DEBUG] supabase.auth.signInWithPassword returned', { data, error });

        console.log('[DEBUG] Supabase response:', {
          hasData: !!data,
          hasError: !!error,
          errorMessage: error?.message,
          errorStatus: error?.status,
          timestamp: new Date().toISOString(),
        });

        if (error) {
          console.error('[DEBUG] Login error:', {
            message: error.message,
            status: error.status,
            name: error.name,
            details: error,
            timestamp: new Date().toISOString(),
          });
          throw error;
        }

        if (!data?.session) {
          const noSessionError = new Error(
            'No session data received from authentication service'
          );
          console.error('[DEBUG] No session after login:', {
            error: noSessionError.message,
            data,
            timestamp: new Date().toISOString(),
          });
          throw noSessionError;
        }

        console.log('[DEBUG] Login successful:', {
          hasSession: !!data.session,
          hasUser: !!data.session?.user,
          userId: data.session?.user?.id,
          timestamp: new Date().toISOString(),
        });

        // Set session data in localStorage and cookie
        // const storageKey = 'sb-auth-token';
        // const maxAge = 60 * 60 * 24 * 7;
        // try {
        //   localStorage.setItem(storageKey, data.session.access_token);
        //   document.cookie = `${storageKey}=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        // } catch (storageError: unknown) {
        //   console.error('[DEBUG] Error storing session:', {
        //     error:
        //       storageError instanceof Error
        //         ? storageError.message
        //         : 'Unknown error',
        //     timestamp: new Date().toISOString(),
        //   });
        // }

        dispatch({ type: 'SET_USER', payload: data.session.user });
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        // Small delay to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log('[DEBUG] Redirecting to dashboard');
        window.location.href = '/dashboard';
      } catch (error: unknown) {
        console.error('[DEBUG] Login error:', {
          error: error instanceof Error ? error.message : JSON.stringify(error),
          type: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });

        // Let the form handle the error display
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [router]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error('[DEBUG] Invalid email format provided:', { email });
        handleError({
          name: 'Validation Error',
          message: 'Invalid email format. Please enter a valid email address.',
        } as AuthError); // Cast to AuthError for consistency, though it's a client-side error
        dispatch({ type: 'SET_LOADING', payload: false }); // Ensure loading stops
        return; // Prevent Supabase call
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        console.log('[DEBUG] Calling supabase.auth.signUp with email:', email.toLowerCase().trim());
        const { error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: { name },
          },
        });
        console.log('[DEBUG] supabase.auth.signUp returned', { error });

        if (handleError(error)) return;

        toast({
          title: 'Success',
          description: 'Please check your email to confirm your account',
        });
        router.push('/verify');
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
            redirectTo: `${window.location.origin}/callback`,
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
            redirectTo: `${window.location.origin}/callback`,
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
            redirectTo: `${window.location.origin}/update-password`,
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

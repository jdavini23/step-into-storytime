'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { AuthError } from '@supabase/supabase-js';
import getClient from '@/lib/supabase/client';
import {
  signInWithPassword,
  signInWithOAuth,
  signOut,
  signUp as supabaseSignUp,
  resetPasswordForEmail,
  updateUserPassword,
  getUserProfile,
  createUserProfile,
} from '@/services/authService';
import { User, UserProfile } from '@/types/auth';

// Define auth state type
type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
};

// Define auth context type
type Provider = 'google' | 'github' | 'apple';

type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: Provider) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
};

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define action types
type AuthAction =
  | {
      type: 'SET_USER';
      payload: { user: User | null; profile: UserProfile | null };
    }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_INITIALIZED'; payload: boolean };

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const supabase = getClient();

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] State change:', event, !!session, {
        timestamp: new Date().toISOString(),
        userId: session?.user?.id,
      });

      if (!mounted) {
        console.log('[Auth] Component unmounted, skipping state update');
        return;
      }

      if (!session) {
        console.log('[Auth] No session, logging out');
        dispatch({ type: 'LOGOUT' });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const user = session.user as User;
        console.log('[Auth] Fetching profile for user:', user.id);
        const { profile } = await getUserProfile(user.id);

        if (!mounted) {
          console.log(
            '[Auth] Component unmounted during profile fetch, skipping state update'
          );
          return;
        }

        if (!profile) {
          console.log(
            '[Auth] No profile found, creating new profile for user:',
            user.id
          );
          const { profile: newProfile } = await createUserProfile(user);
          dispatch({
            type: 'SET_USER',
            payload: { user, profile: newProfile },
          });
        } else {
          console.log(
            '[Auth] Profile found, updating state with user:',
            user.id
          );
          dispatch({
            type: 'SET_USER',
            payload: { user, profile },
          });
        }
      } catch (error) {
        console.error('[Auth] Profile error:', error);
        if (mounted) {
          dispatch({
            type: 'SET_ERROR',
            payload: 'Failed to load user profile',
          });
        }
      }
    });

    // Check initial session
    const initializeAuth = async () => {
      console.log('[Auth] Starting auth initialization');
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('[Auth] Initial session check:', {
          hasSession: !!session,
          userId: session?.user?.id,
          timestamp: new Date().toISOString(),
        });

        if (!mounted) {
          console.log('[Auth] Component unmounted during initialization');
          return;
        }

        if (session) {
          const user = session.user as User;
          console.log(
            '[Auth] Fetching profile for initial session user:',
            user.id
          );
          const { profile } = await getUserProfile(user.id);

          if (!mounted) {
            console.log('[Auth] Component unmounted during profile fetch');
            return;
          }

          if (!profile) {
            console.log(
              '[Auth] Creating profile for initial session user:',
              user.id
            );
            const { profile: newProfile } = await createUserProfile(user);
            dispatch({
              type: 'SET_USER',
              payload: { user, profile: newProfile },
            });
          } else {
            console.log('[Auth] Setting user and profile for initial session');
            dispatch({
              type: 'SET_USER',
              payload: { user, profile },
            });
          }
        } else {
          console.log(
            '[Auth] No initial session found, setting logged out state'
          );
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('[Auth] Initial session error:', error);
        if (mounted) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize auth' });
        }
      } finally {
        if (mounted) {
          console.log('[Auth] Completing initialization');
          dispatch({ type: 'SET_INITIALIZED', payload: true });
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('[Auth] Cleaning up auth listener');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Auth methods
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await signInWithPassword(email, password);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Login error:', authError);
      dispatch({ type: 'SET_ERROR', payload: authError.message });
      toast({
        title: 'Error',
        description: authError.message,
        variant: 'destructive',
      });
    }
  };

  const loginWithProvider = async (provider: Provider) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await signInWithOAuth(
        provider as 'google' | 'github' | 'apple'
      );

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] OAuth error:', authError);
      dispatch({ type: 'SET_ERROR', payload: authError.message });
      toast({
        title: 'Error',
        description: authError.message,
        variant: 'destructive',
      });
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await signOut();

      if (error) throw error;

      dispatch({ type: 'LOGOUT' });
      router.push('/sign-in');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Logout error:', authError);
      dispatch({ type: 'SET_ERROR', payload: authError.message });
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await supabaseSignUp(name, email, password);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Please check your email to confirm your account',
      });

      router.push('/sign-in');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Signup error:', authError);
      dispatch({ type: 'SET_ERROR', payload: authError.message });
      toast({
        title: 'Error',
        description: authError.message,
        variant: 'destructive',
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await resetPasswordForEmail(email);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password reset instructions sent to your email',
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Reset password error:', authError);
      dispatch({ type: 'SET_ERROR', payload: authError.message });
      toast({
        title: 'Error',
        description: authError.message,
        variant: 'destructive',
      });
    }
  };

  const updatePassword = async (password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { error } = await updateUserPassword(password);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Update password error:', authError);
      dispatch({ type: 'SET_ERROR', payload: authError.message });
      toast({
        title: 'Error',
        description: authError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        loginWithProvider,
        logout,
        signUp,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import type React from 'react';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Define types
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  subscription_tier: 'free' | 'basic' | 'premium' | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

type AuthAction =
  | {
      type: 'INITIALIZE';
      payload: { user: User | null; profile: UserProfile | null };
    }
  | {
      type: 'LOGIN_SUCCESS';
      payload: { user: User; profile: UserProfile | null };
    }
  | { type: 'PROFILE_LOADED'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> };

// Create initial state
const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
};

// Create reducer
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
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'PROFILE_LOADED':
      return {
        ...state,
        profile: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
      };
    default:
      return state;
  }
};

// Create context
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [authChangeUnsubscribe, setAuthChangeUnsubscribe] = useState<
    (() => void) | null
  >(null);
  const router = useRouter();

  // Debug logging for auth context
  useEffect(() => {
    console.log('[DEBUG] AuthContext mounted:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isClient: typeof window !== 'undefined',
      state: {
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        isInitialized: state.isInitialized,
        hasUser: !!state.user,
        hasProfile: !!state.profile,
      },
    });
  }, [state]);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Get current session and user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) throw new Error('No user ID found');

      // If user exists, fetch their profile with retries
      let profile = null;
      if (user) {
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            console.log(
              '[DEBUG] Attempting to fetch profile, attempt:',
              retryCount + 1
            );
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (error) throw error;
            profile = data;
            break;
          } catch (error) {
            console.error('[DEBUG] Error fetching profile:', {
              attempt: retryCount + 1,
              error,
            });

            retryCount++;
            if (retryCount === maxRetries) {
              console.error(
                '[DEBUG] Failed to fetch profile after max retries'
              );
              // Don't throw, just continue with null profile
              break;
            }

            // Wait before retrying with exponential backoff
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                Math.min(1000 * Math.pow(2, retryCount), 5000)
              )
            );
          }
        }
      }

      dispatch({
        type: 'INITIALIZE',
        payload: {
          user: user as User | null,
          profile: profile as UserProfile | null,
        },
      });
    } catch (error) {
      console.error('[DEBUG] Error initializing auth:', error);
      dispatch({ type: 'INITIALIZE', payload: { user: null, profile: null } });
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user?.id) throw new Error('No user ID found');

            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: user as User,
                profile: profile as UserProfile | null,
              },
            });
          } catch (error) {
            console.error('[DEBUG] Error handling auth state change:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    setAuthChangeUnsubscribe(() => subscription.unsubscribe);

    return () => {
      if (authChangeUnsubscribe) {
        authChangeUnsubscribe();
      }
    };
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.user as User,
          profile: profile as UserProfile | null,
        },
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('[DEBUG] Login error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to login',
      });
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to login',
        variant: 'destructive',
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('[DEBUG] Google login error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to login with Google',
      });
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to login with Google',
        variant: 'destructive',
      });
    }
  };

  const loginWithFacebook = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('[DEBUG] Facebook login error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to login with Facebook',
      });
      toast({
        title: 'Error',
        description:
          (error as Error).message || 'Failed to login with Facebook',
        variant: 'destructive',
      });
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Magic link sent to your email',
      });
    } catch (error) {
      console.error('[DEBUG] Magic link error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to send magic link',
      });
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to send magic link',
        variant: 'destructive',
      });
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      dispatch({ type: 'LOGOUT' });
      router.push('/');
    } catch (error) {
      console.error('[DEBUG] Logout error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to logout',
      });
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            name,
            email: email.trim().toLowerCase(),
          },
        ]);

        if (profileError) throw profileError;
      }

      toast({
        title: 'Success',
        description: 'Please check your email to verify your account',
      });

      router.push('/auth/verify');
    } catch (error) {
      console.error('[DEBUG] Signup error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to sign up',
      });
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to sign up',
        variant: 'destructive',
      });
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!state.user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_PROFILE', payload: data });

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('[DEBUG] Profile update error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to update profile',
      });
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const refreshSession = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: user as User,
          profile: profile as UserProfile | null,
        },
      });
    } catch (error) {
      console.error('[DEBUG] Session refresh error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as Error).message || 'Failed to refresh session',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        loginWithGoogle,
        loginWithFacebook,
        sendMagicLink,
        logout,
        signup,
        updateProfile,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create hook for using the context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

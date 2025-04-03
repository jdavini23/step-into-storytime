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
  email?: string;
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
  isInitializing: boolean;
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
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_USER'; payload: { user: User } }
  | { type: 'SET_INITIALIZING'; payload: boolean };

// Create initial state
const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
  isInitializing: true,
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
      };
    case 'PROFILE_LOADED':
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        error: null,
        isInitializing: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: false,
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
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload.user };
    case 'SET_INITIALIZING':
      return { ...state, isInitializing: action.payload };
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
  const router = useRouter();

  // Debug logging for auth context
  useEffect(() => {
    console.log('AuthContext state update:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isClient: typeof window !== 'undefined',
      state: {
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        isInitialized: state.isInitialized,
        isInitializing: state.isInitializing,
        hasUser: !!state.user,
        hasProfile: !!state.profile,
      },
    });
  }, [state]);

  // Helper function to fetch or create user profile
  const fetchOrCreateUserProfile = async (
    user: User
  ): Promise<UserProfile | null> => {
    try {
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile not found, create it
          console.log(`Profile not found for ${user.id}. Creating...`);
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name:
                user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              avatar_url: user.user_metadata?.avatar_url || null,
              subscription_tier: 'free',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            throw createError; // Re-throw to be caught by initializeAuth
          }
          console.log(`Profile created for ${user.id}`);
          return newProfile as UserProfile;
        } else {
          console.error('Profile fetch error:', profileError);
          throw profileError; // Re-throw other profile errors
        }
      } else {
        console.log(`Profile fetched for ${user.id}`);
        return profile as UserProfile;
      }
    } catch (error) {
      console.error('Profile operation error in helper:', error);
      // Return null if profile cannot be fetched or created, let initializeAuth handle state
      return null;
    }
  };

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    // No SET_LOADING/SET_INITIALIZING here, handled by listener/direct calls
    try {
      console.log('Starting auth initialization');
      // dispatch({ type: 'SET_LOADING', payload: true });        // Removed
      // dispatch({ type: 'SET_INITIALIZING', payload: true }); // Removed

      // Remove delay: await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error during init:', sessionError);
        throw sessionError;
      }

      const session = sessionData?.session;

      if (!session) {
        console.log('No active session found during init.');
        dispatch({
          type: 'INITIALIZE',
          payload: { user: null, profile: null },
        });
        return; // Exit early if no session
      }

      // Remove delay: await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error('User error during init:', userError);
        // If user fetch fails despite session, treat as logged out
        throw userError;
      }

      if (!userData?.user) {
        console.error('No user data found despite active session.');
        // This case might indicate an inconsistent state, treat as logged out
        throw new Error('No user data available despite session');
      }

      const user = userData.user as User; // Cast User type

      // Remove delay: await new Promise((resolve) => setTimeout(resolve, 100));

      // Use the helper function to get/create profile
      const profile = await fetchOrCreateUserProfile(user);

      // Remove delays and previous profile logic block

      // Dispatch success with user and profile (profile might be null if helper failed)
      console.log('Initialization complete. Dispatching INITIALIZE.');
      dispatch({
        type: 'INITIALIZE',
        payload: { user, profile },
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Ensure state is reset on any initialization error
      dispatch({
        type: 'INITIALIZE',
        payload: { user: null, profile: null },
      });
      // Optionally dispatch SET_ERROR if specific error feedback is needed
      // dispatch({ type: 'SET_ERROR', payload: 'Initialization failed' });
    }
    // No finally block needed as INITIALIZE sets loading/initializing states
    // Remove delays: await new Promise((resolve) => setTimeout(resolve, 100));
    // dispatch({ type: 'SET_LOADING', payload: false }); // Removed
  }, [dispatch]); // Added dispatch to dependency array

  // Set up auth listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('Setting up auth listener');

    let authListener: (() => void) | null = null;

    const setupAuthListener = async () => {
      try {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', {
            event,
            hasSession: !!session,
          });

          // Reset loading/initializing state before handling change
          dispatch({ type: 'SET_LOADING', payload: true });
          dispatch({ type: 'SET_INITIALIZING', payload: true });

          if (!session) {
            dispatch({ type: 'LOGOUT' }); // LOGOUT now also sets loading/initializing to false
            return;
          }

          // Call initializeAuth on SIGNED_IN, USER_UPDATED, or TOKEN_REFRESHED
          // INITIALIZE action within initializeAuth will set loading/initializing to false
          if (
            event === 'SIGNED_IN' ||
            event === 'USER_UPDATED' ||
            event === 'TOKEN_REFRESHED'
          ) {
            await initializeAuth();
          } else {
            // For other events or if initializeAuth isn't called, ensure loading states are reset
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'SET_INITIALIZING', payload: false });
          }
        });

        authListener = subscription.unsubscribe;
      } catch (error) {
        console.error('Auth listener setup error:', error);
        // Ensure loading state is reset if listener setup fails
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INITIALIZING', payload: false });
      }
    };

    // Initial setup call
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_INITIALIZING', payload: true });
    setupAuthListener().then(() => {
      initializeAuth(); // Initial check on mount
    });

    return () => {
      if (authListener) {
        console.log('Cleaning up auth listener');
        authListener();
      }
    };
  }, [initializeAuth, dispatch]); // Added dispatch

  const login = async (email: string, password: string) => {
    // Set loading state at the beginning
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_INITIALIZING', payload: true }); // Consider if needed, listener handles post-login init
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('Starting login process');

      // Removed delay: await new Promise((resolve) => setTimeout(resolve, 100));

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error from Supabase:', error);
        throw error;
      }

      if (!data.user) {
        console.error('No user data returned from signInWithPassword');
        throw new Error('Login successful but no user data received');
      }

      // Login successful
      console.log('signInWithPassword successful. User:', data.user.id);

      // Removed profile fetch logic - handled by initializeAuth via listener

      // Removed wait loop: while (!state.isInitialized && attempts < maxAttempts)
      // Rely on the onAuthStateChange listener to trigger initializeAuth and update state.
      // The UI should show a loading state until the context updates.

      console.log(
        'Login successful, navigating to dashboard. Listener will handle state update.'
      );
      router.push('/dashboard');

      // Note: State update (user, profile, isAuthenticated) happens asynchronously via the listener.
      // SET_LOADING/SET_INITIALIZING will be set to false by the INITIALIZE action in initializeAuth.
    } catch (error) {
      console.error('Login error caught:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to login',
      });

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
        variant: 'destructive',
      });

      // Re-throw the error if needed by the caller
      // throw error;
    } finally {
      // Ensure loading/initializing flags are reset if login fails before listener runs
      // If login succeeded, the listener -> initializeAuth -> INITIALIZE will handle resetting these.
      // However, setting them here covers immediate signInWithPassword errors.
      // Consider if this introduces race conditions with the listener.
      // A safer approach might be to only dispatch SET_LOADING/INITIALIZING false within the catch block.
      // For now, keeping it in finally for broad coverage.
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZING', payload: false });
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
      console.error('Google login error:', error);
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
      console.error('Facebook login error:', error);
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
      console.error('Magic link error:', error);
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
      console.error('Logout error:', error);
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
      console.error('Signup error:', error);
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
      console.error('Profile update error:', error);
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
      console.error('Session refresh error:', error);
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

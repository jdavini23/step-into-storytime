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
  email: string | undefined;
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
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_USER'; payload: { user: User } };

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
    case 'UPDATE_USER':
      return { ...state, user: action.payload.user };
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

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[AUTH] Session error:', sessionError);
        dispatch({ type: 'SET_ERROR', payload: sessionError.message });
        return;
      }

      if (!session) {
        dispatch({
          type: 'INITIALIZE',
          payload: { user: null, profile: null },
        });
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user || !user.email) {
        console.error('[AUTH] User error:', userError);
        dispatch({
          type: 'SET_ERROR',
          payload: userError?.message || 'Failed to get user',
        });
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[AUTH] Profile error:', profileError);
        dispatch({ type: 'SET_ERROR', payload: profileError.message });
        return;
      }

      dispatch({
        type: 'INITIALIZE',
        payload: {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
          },
          profile: profile || null,
        },
      });
    } catch (error) {
      console.error('[AUTH] Initialization error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to initialize auth',
      });
    }
  }, [dispatch]);

  // Listen for auth state changes
  useEffect(() => {
    console.log('[AUTH] Setting up auth listener');

    // Initialize auth first - only on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
    } else {
      console.log('[AUTH] Skipping auth initialization on server');
      dispatch({
        type: 'INITIALIZE',
        payload: { user: null, profile: null },
      });
    }

    // Skip setting up listener on server
    if (typeof window === 'undefined') {
      console.log('[AUTH] Skipping auth listener on server');
      return () => {};
    }

    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('[AUTH] Auth state changed:', {
            event,
            hasSession: !!session,
          });

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('[AUTH] User signed in or token refreshed');

            if (session?.user?.id) {
              console.log('[AUTH] Fetching user profile after sign in');

              // Fetch user profile
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error(
                  '[AUTH] Error fetching profile after sign in:',
                  error
                );

                // Check if error is because profile doesn't exist
                if (error.code === 'PGRST116') {
                  console.log('[AUTH] Profile not found, creating new profile');

                  // Create a new profile
                  const { data: newProfile, error: createError } =
                    await supabase
                      .from('profiles')
                      .insert({
                        id: session.user.id,
                        name:
                          session.user.user_metadata.name ||
                          session.user.email?.split('@')[0] ||
                          'User',
                        email: session.user.email || '',
                        avatar_url:
                          session.user.user_metadata.avatar_url || null,
                        created_at: new Date().toISOString(),
                      })
                      .select()
                      .single();

                  if (createError) {
                    console.error(
                      '[AUTH] Error creating profile:',
                      createError
                    );
                  } else {
                    console.log('[AUTH] New profile created successfully');

                    dispatch({
                      type: 'LOGIN_SUCCESS',
                      payload: {
                        user: session.user as User,
                        profile: newProfile as unknown as UserProfile | null,
                      },
                    });
                  }
                }
              } else {
                console.log('[AUTH] Profile fetched successfully');

                dispatch({
                  type: 'LOGIN_SUCCESS',
                  payload: {
                    user: session.user as User,
                    profile: profile as unknown as UserProfile | null,
                  },
                });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[AUTH] User signed out');
            dispatch({ type: 'LOGOUT' });
          } else if (event === 'USER_UPDATED') {
            console.log('[AUTH] User updated');
            // Update the user in the state
            if (session?.user) {
              dispatch({
                type: 'UPDATE_USER',
                payload: { user: session.user as User },
              });
            }
          }
        }
      );

      setAuthChangeUnsubscribe(() => data.subscription.unsubscribe);

      return () => {
        console.log('[AUTH] Cleaning up auth listener');
        if (authChangeUnsubscribe) {
          authChangeUnsubscribe();
        }
      };
    } catch (error) {
      console.error('[AUTH] Error setting up auth listener:', error);
      if (error instanceof Error) {
        console.error('[AUTH] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      return () => {};
    }
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('[DEBUG] Attempting login with email:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] Login error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return;
      }

      if (!data.user || !data.user.email) {
        dispatch({ type: 'SET_ERROR', payload: 'No user returned from login' });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          },
          profile: profile || null,
        },
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to login',
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

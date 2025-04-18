'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { createBrowserClient, CookieOptions } from '@supabase/ssr';
import {
  AuthError,
  Provider as SupabaseProvider, // Renamed to avoid conflict with React Provider
  SupabaseClient,
  User as SupabaseUser,
  Session,
} from '@supabase/supabase-js';
import {
  signInWithPassword as apiSignInWithPassword,
  signInWithOAuth as apiSignInWithOAuth,
  signOut as apiSignOut,
  signUp as apiSignUp,
  resetPasswordForEmail as apiResetPasswordForEmail,
  updateUserPassword as apiUpdateUserPassword,
  getUserProfile,
  createUserProfile,
  updateUserProfileData, // Assuming you might need this
} from '@/services/authService';
import { User, UserProfile } from '@/types/auth';
import { cookieManager } from '@/lib/cookies';
import { handleAuthError } from '@/lib/error-handler';

// Define auth state type
interface AuthState {
  isInitialized: boolean; // Changed from unknown
  user: User | null;
  profile: UserProfile | null;
  session: Session | null; // Added session state
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define auth context type
interface AuthContextType {
  state: AuthState;
  supabase: SupabaseClient; // Expose the client
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  loginWithProvider: (provider: SupabaseProvider) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  // Optional: Add profile update function if needed
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const initialState: AuthState = {
  isInitialized: false, // Start as false
  user: null,
  profile: null,
  session: null, // Initialize session as null
  isAuthenticated: false,
  isLoading: true, // Start loading until initial check is done
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define action types
interface InitializeAction {
  type: 'INITIALIZE';
  payload: {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
  };
}
interface SetUserAndProfile {
  type: 'SET_USER_AND_PROFILE';
  payload: {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
  };
}
interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}
interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string | null;
}
interface LogoutAction {
  type: 'LOGOUT';
}

type AuthAction =
  | InitializeAction
  | SetUserAndProfile
  | SetLoadingAction
  | SetErrorAction
  | LogoutAction;

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INITIALIZE': // Handle initialization separately
    case 'SET_USER_AND_PROFILE': // Use a combined action
      return {
        ...state,
        isInitialized: true, // Mark as initialized
        user: action.payload.user,
        profile: action.payload.profile,
        session: action.payload.session,
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
        isInitialized: true, // Still initialized, just logged out
        isLoading: false, // Stop loading on logout
      };
    default:
      console.warn('[Auth] Unhandled action type:', action);
      return state;
  }
}

// Create Supabase client with cookie handling
const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  const [supabase] = useState(() => createClient());

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!isInitializing) return;

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const { profile, error: profileError } = await getUserProfile(
            session.user.id
          );
          if (profileError) throw profileError;

          if (mounted) {
            dispatch({
              type: 'INITIALIZE',
              payload: {
                user: session.user as User,
                profile: profile || null,
                session,
              },
            });
          }
        } else {
          if (mounted) {
            dispatch({
              type: 'INITIALIZE',
              payload: { user: null, profile: null, session: null },
            });
          }
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        if (mounted) {
          dispatch({
            type: 'INITIALIZE',
            payload: { user: null, profile: null, session: null },
          });
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || isInitializing) return;

      // Skip if we're already in the correct state
      if (
        (event === 'SIGNED_IN' &&
          state.isAuthenticated &&
          state.session?.user?.id === session?.user?.id) ||
        (event === 'SIGNED_OUT' && !state.isAuthenticated)
      ) {
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { profile, error: profileError } = await getUserProfile(
            session.user.id
          );
          if (profileError) throw profileError;

          if (mounted) {
            dispatch({
              type: 'SET_USER_AND_PROFILE',
              payload: {
                user: session.user as User,
                profile: profile || null,
                session,
              },
            });
          }
        } catch (error) {
          console.error('[Auth] Error fetching profile:', error);
          if (mounted) {
            dispatch({
              type: 'SET_USER_AND_PROFILE',
              payload: {
                user: session.user as User,
                profile: null,
                session,
              },
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          dispatch({ type: 'LOGOUT' });
        }
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [
    supabase,
    isInitializing,
    state.isAuthenticated,
    state.session?.user?.id,
  ]);

  // --- Action Functions ---

  const handleError = useCallback(
    (error: unknown, defaultMessage: string) => {
      console.error(`[Auth] Error - ${defaultMessage}:`, error);
      const message =
        error instanceof AuthError
          ? error.message
          : error instanceof Error
          ? error.message
          : defaultMessage;
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error('Error', { description: message });
      dispatch({ type: 'SET_LOADING', payload: false }); // Ensure loading stops on error
    },
    [dispatch]
  );

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { user, error } = await apiSignInWithPassword(email, password, {
          // Set session expiry based on remember me option
          expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
        });

        if (error || !user) {
          throw error || new Error('Login failed: No user returned.');
        }

        // Explicitly redirect to dashboard after successful login
        router.push('/dashboard');
        router.refresh();
      } catch (error) {
        handleError(error, 'Login failed');
        throw error; // Re-throw to be caught by the form
      }
    },
    [handleError, router]
  );

  const loginWithProvider = useCallback(
    async (provider: SupabaseProvider) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { error } = await apiSignInWithOAuth(provider);
        if (error) throw error;
        // Redirect is handled by Supabase OAuth flow
        // Loading will stop when the auth state changes
      } catch (error) {
        handleError(error, 'OAuth login failed');
      }
    },
    [handleError]
  );

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await apiSignOut();
      if (error) throw error;
      // State update and navigation handled by onAuthStateChange listener
    } catch (error) {
      handleError(error, 'Logout failed');
    }
  }, [handleError]);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { user, error } = await apiSignUp(name, email, password);
        if (error || !user) {
          throw error || new Error('Sign up failed: No user returned.');
        }

        // After successful signup, attempt immediate login
        const { user: loggedInUser, error: loginError } =
          await apiSignInWithPassword(email, password);

        if (loginError || !loggedInUser) {
          throw loginError || new Error('Auto-login after signup failed');
        }

        // Show success toast
        toast.success('Welcome to Step Into Storytime!', {
          description: 'Your account has been created successfully.',
        });

        // Redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      } catch (error) {
        handleError(error, 'Signup failed');
        throw error;
      }
    },
    [handleError, router]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { error } = await apiResetPasswordForEmail(email);
        if (error) throw error;
        toast.success('Success', {
          description: 'Password reset instructions sent (if account exists).',
        });
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        handleError(error, 'Password reset failed');
      }
    },
    [handleError]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { error } = await apiUpdateUserPassword(password);
        if (error) throw error;
        toast.success('Success', {
          description: 'Password updated successfully',
        });
        // Optionally navigate
        // router.push('/dashboard');
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        handleError(error, 'Password update failed');
      }
    },
    [handleError]
  );

  // Optional: Update profile function
  const updateProfile = useCallback(
    async (profileData: Partial<UserProfile>) => {
      if (!state.user?.id) {
        handleError(
          new Error('User not authenticated'),
          'Profile update failed'
        );
        return;
      }
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { profile, error } = await updateUserProfileData(
          state.user.id,
          profileData
        );
        if (error) throw error;
        // Update local state immediately
        dispatch({
          type: 'SET_USER_AND_PROFILE',
          payload: { user: state.user, profile, session: state.session },
        });
        toast.success('Success', {
          description: 'Profile updated successfully',
        });
      } catch (error) {
        handleError(error, 'Profile update failed');
      }
    },
    [state.user, state.session, dispatch, handleError]
  );

  // Context-aware fetchWithAuth
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = state.session?.access_token;
    if (!token) throw new Error('Not authenticated');
    // Log the token (redacted)
    console.log(
      '[AuthContext fetchWithAuth] Using access token:',
      token ? `${token.slice(0, 4)}...${token.slice(-4)}` : 'none'
    );
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      state,
      supabase,
      login,
      loginWithProvider,
      logout,
      signUp,
      resetPassword,
      updatePassword,
      updateProfile,
      fetchWithAuth,
    }),
    [
      state,
      supabase,
      login,
      loginWithProvider,
      logout,
      signUp,
      resetPassword,
      updatePassword,
      updateProfile,
      fetchWithAuth,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

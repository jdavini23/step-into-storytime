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
import { toast } from '@/components/ui/use-toast';
import { createBrowserClient } from '@supabase/ssr';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Create the Supabase client instance using @supabase/ssr for browser
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // --- Profile Fetching Logic ---
  const fetchAndSetProfile = useCallback(
    async (user: SupabaseUser | null, session: Session | null) => {
      if (!user) {
        console.log('[Auth] No user, skipping profile fetch.');
        dispatch({
          type: 'SET_USER_AND_PROFILE',
          payload: { user: null, profile: null, session: null },
        });
        return;
      }

      console.log(`[Auth] User found (ID: ${user.id}). Fetching profile...`);
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { profile, error: profileError } = await getUserProfile(user.id);

        if (profileError) {
          console.error('[Auth] Error fetching profile:', profileError.message);
          // Don't set an error state here, maybe the profile just doesn't exist yet
          dispatch({
            type: 'SET_USER_AND_PROFILE',
            payload: { user: user as User, profile: null, session },
          });
          // Optionally: Attempt profile creation if it doesn't exist (e.g., after sign-up)
          // Consider if this logic belongs here or should be triggered elsewhere
          // if (!profile && session) { // Only create if profile is null and session exists
          //     console.log('[Auth] Profile not found, attempting creation...');
          //     await createUserProfile(user as User);
          //     // Re-fetch profile after creation attempt - recursive call risk, handle carefully
          // }
          return;
        }

        if (!profile) {
          console.warn(
            `[Auth] Profile not found for user ${user.id}, but no error was returned. Attempting to create.`
          );
          const { profile: newProfile, error: createError } =
            await createUserProfile(user as User);
          if (createError) {
            console.error(
              '[Auth] Failed to create missing profile:',
              createError.message
            );
            dispatch({
              type: 'SET_USER_AND_PROFILE',
              payload: { user: user as User, profile: null, session },
            });
          } else {
            console.log('[Auth] Successfully created missing profile.');
            dispatch({
              type: 'SET_USER_AND_PROFILE',
              payload: { user: user as User, profile: newProfile, session },
            });
          }
        } else {
          console.log('[Auth] Profile fetched successfully:', profile);
          dispatch({
            type: 'SET_USER_AND_PROFILE',
            payload: { user: user as User, profile, session },
          });
        }
      } catch (error) {
        console.error(
          '[Auth] Unexpected error during profile fetch/creation:',
          error
        );
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load user profile.',
        });
        // Keep user but clear profile on unexpected error
        dispatch({
          type: 'SET_USER_AND_PROFILE',
          payload: { user: user as User, profile: null, session },
        });
      }
    },
    [dispatch]
  ); // Add dependencies

  // --- Auth State Change Listener ---
  useEffect(() => {
    console.log('[Auth] Setting up onAuthStateChange listener...');

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[Auth] onAuthStateChange event: ${event}`, session);

        const currentUser = session?.user ?? null;

        if (event === 'INITIAL_SESSION') {
          console.log('[Auth] Initial session event.');
          // Check if user exists from potential server-side render
          // If not, fetch profile based on session
          if (!state.user && currentUser) {
            await fetchAndSetProfile(currentUser, session);
          } else {
            // If user exists in state or no session, finalize initialization
            dispatch({
              type: 'INITIALIZE',
              payload: {
                user: state.user,
                profile: state.profile,
                session: state.session,
              },
            });
          }
        } else if (event === 'SIGNED_IN') {
          console.log('[Auth] User signed in.');
          if (currentUser) {
            await fetchAndSetProfile(currentUser, session);
          } else {
            console.error('[Auth] SIGNED_IN event but no session/user found!');
            dispatch({ type: 'LOGOUT' }); // Treat as logout if no user
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out.');
          dispatch({ type: 'LOGOUT' });
          // Redirect to sign-in page after logout
          router.push('/sign-in');
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log('[Auth] Password recovery event.');
          // Handle password recovery event if needed (e.g., redirect to update password page)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] Token refreshed.');
          // Update session state if necessary, though @supabase/ssr handles cookie refresh
          if (session) {
            dispatch({
              type: 'SET_USER_AND_PROFILE',
              payload: { user: state.user, profile: state.profile, session },
            });
          }
        } else if (event === 'USER_UPDATED') {
          console.log('[Auth] User updated.');
          // User metadata might have changed, re-fetch profile
          if (currentUser) {
            await fetchAndSetProfile(currentUser, session);
          } else {
            dispatch({ type: 'LOGOUT' }); // If user becomes null after update?
          }
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      console.log('[Auth] Cleaning up auth listener.');
      authListener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, fetchAndSetProfile, router]); // Add router to dependencies

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
      toast({ title: 'Error', description: message, variant: 'destructive' });
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
        toast({
          title: 'Welcome to Step Into Storytime!',
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
        toast({
          title: 'Success',
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
        toast({
          title: 'Success',
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
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      } catch (error) {
        handleError(error, 'Profile update failed');
      }
    },
    [state.user, state.session, dispatch, handleError]
  );

  // Memoize the context value
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

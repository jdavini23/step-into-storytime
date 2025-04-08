'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
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
interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define auth context type
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'github' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define action types
interface SetUserAction {
  type: 'SET_USER';
  payload: { user: User | null; profile: UserProfile | null };
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

type AuthAction = SetUserAction | SetLoadingAction | SetErrorAction | LogoutAction;

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
      return { ...initialState };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { user, profile } = await fetchInitialAuthState();
        if (user) {
          dispatch({ type: 'SET_USER', payload: { user, profile } });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { user } = await signInWithPassword(email, password);
      if (!user || !user.id) {
        console.error('[Auth] Login failed: User ID is not available');
        throw new Error('User ID is not available');
      }

      const { profile } = await getUserProfile(user.id);
      dispatch({ type: 'SET_USER', payload: { user, profile } });
      router.push('/dashboard');
    } catch (error) {
      handleError(error, 'Login failed');
    }
  };

  const loginWithProvider = async (provider: 'google' | 'github' | 'apple') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      handleError(error, 'OAuth login failed');
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await signOut();
      dispatch({ type: 'LOGOUT' });
      router.push('/sign-in');
    } catch (error) {
      handleError(error, 'Logout failed');
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await supabaseSignUp(name, email, password);
      toast({ title: 'Success', description: 'Check your email to confirm your account' });
      router.push('/sign-in');
    } catch (error) {
      handleError(error, 'Signup failed');
    }
  };

  const resetPassword = async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await resetPasswordForEmail(email);
      toast({ title: 'Success', description: 'Password reset instructions sent to your email' });
    } catch (error) {
      handleError(error, 'Password reset failed');
    }
  };

  const updatePassword = async (password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await updateUserPassword(password);
      toast({ title: 'Success', description: 'Password updated successfully' });
      router.push('/dashboard');
    } catch (error) {
      handleError(error, 'Password update failed');
    }
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    console.error('[Auth] Error:', error);
    const message = error instanceof Error ? error.message : defaultMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast({ title: 'Error', description: message, variant: 'destructive' });
  };

  const fetchInitialAuthState = async (): Promise<{ user: User | null; profile: UserProfile | null }> => {
    if (!state.user) {
      console.warn('[Auth] No user found during initialization');
      return { user: null, profile: null };
    }

    const userId = state.user.id;
    if (!userId) {
      console.error('[Auth] User ID is not available');
      return { user: state.user, profile: null };
    }

    const { profile } = await getUserProfile(userId);
    return { user: state.user, profile };
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

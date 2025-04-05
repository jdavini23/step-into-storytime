import { createContext, useContext, useReducer } from 'react';
import type { AuthState, AuthContextType } from './types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: undefined,
  loading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Implement your sign in logic here
      dispatch({ type: 'SIGN_IN_SUCCESS', payload: { id: '1', email } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign in' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Implement your sign out logic here
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign out' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Implement your sign up logic here
      dispatch({ type: 'SIGN_UP_SUCCESS', payload: { id: '1', email, name } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign up' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SIGN_IN_SUCCESS'; payload: { id: string; email: string } }
  | {
      type: 'SIGN_UP_SUCCESS';
      payload: { id: string; email: string; name: string };
    }
  | { type: 'SIGN_OUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SIGN_IN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'SIGN_UP_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isAuthenticated: false,
        user: undefined,
        error: null,
      };
    default:
      return state;
  }
}

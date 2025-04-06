import { User as SupabaseUser } from '@supabase/supabase-js';

// Core User and Profile Information

// Re-export SupabaseUser as our base User type
export type User = SupabaseUser;

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  subscription_tier: 'free' | 'basic' | 'premium' | null;
  created_at: string;
  updated_at: string;
}

// --- Auth Context State and Actions ---

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isInitializing: boolean;
}

export type AuthAction =
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
  | { type: 'UPDATE_USER'; payload: { user: User } }
  | { type: 'SET_INITIALIZING'; payload: boolean };

// --- Other related types (Add more as needed) ---

export type UserRole = 'user' | 'admin';

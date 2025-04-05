export interface User {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | undefined;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

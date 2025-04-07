"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { AuthError } from "@supabase/supabase-js";

// Import auth service functions
import {
  signInWithPassword,
  signInWithOAuth,
  signOut,
  signUp as supabaseSignUp,
  resetPasswordForEmail,
  updateUserPassword,
  getSupabaseClient,
} from "@/services/authService";

// Import auth listener hook
import { useAuthListener } from "@/hooks/useAuthListener";

// Import types
import { User, UserProfile, AuthAction } from "@/types/auth";

// Types
export type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isInitializing: boolean;
};

export type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
  isInitializing: false,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        isInitialized: true,
        isInitializing: false,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "PROFILE_LOADED":
      return {
        ...state,
        profile: action.payload,
      };
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
        isInitialized: true,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "UPDATE_USER":
      return { ...state, user: action.payload.user };
    case "SET_INITIALIZING":
      return { ...state, isInitializing: action.payload };
    default:
      return state;
  }
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Use the auth listener hook to handle auth state changes
  useAuthListener(dispatch, state.isInitialized);

  // Error handler
  const handleError = useCallback(
    (error: AuthError | null, clearState = false) => {
      if (error) {
        // Only log errors in development mode
        if (process.env.NODE_ENV === "development") {
          console.error("Auth error:", {
            message: error.message,
            status: error.status,
            name: error.name,
          });
        }

        let userMessage = "An error occurred during authentication";

        // Handle specific error cases
        switch (error.status) {
          case 400:
            userMessage =
              "Invalid email or password. Please double-check your credentials.";
            break;
          case 401:
            userMessage =
              "Your session has expired. Please sign in again. If the problem persists, clear your browser cookies and try again.";
            if (clearState) {
              dispatch({ type: "LOGOUT" });
              router.push("/sign-in");
            }
            break;
          case 422:
            userMessage =
              "Invalid input provided. Please check your information. Ensure all fields are filled correctly and meet the required criteria.";
            break;
          case 429:
            userMessage =
              "Too many attempts. Please try again later. This is a security measure to prevent abuse. Please wait a few minutes before trying again.";
            break;
          default:
            if (error.message?.includes("Failed to fetch")) {
              userMessage =
                "Network error. Please check your internet connection. If the problem persists, try again later.";
            } else {
              userMessage = `An unexpected error occurred: ${error.message}. Please try again later. If the problem persists, contact support.`;
            }
        }

        dispatch({ type: "SET_ERROR", payload: userMessage });
        toast({
          title: "Error",
          description: userMessage,
          variant: "destructive",
        });
        return true;
      }
      return false;
    },
    [router]
  );

  // Login function using the auth service
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const { user, error } = await signInWithPassword(email, password);

        console.log("[DEBUG] Auth service signInWithPassword response:", {
          user,
          error,
        });

        if (error) {
          handleError(error);
          throw new Error(error.message || "Login failed. Please try again.");
        }

        if (!user) {
          console.error("[DEBUG] No user data received");
          throw new Error("No user data received from authentication service");
        }

        // The auth listener will handle updating the state
        console.log("[DEBUG] User authenticated:", user);

        toast({
          title: "Success",
          description: "Logged in successfully",
        });

        router.replace("/dashboard");
        // Add debug log to confirm redirection
        console.log("[DEBUG] Redirecting to /dashboard with replace");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        throw error; // Ensure the error is propagated to the form
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [router, handleError]
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error("[DEBUG] Invalid email format provided:", { email });
        handleError({
          name: "Validation Error",
          message: "Invalid email format. Please enter a valid email address.",
        } as AuthError); // Cast to AuthError for consistency, though it's a client-side error
        dispatch({ type: "SET_LOADING", payload: false }); // Ensure loading stops
        return; // Prevent service call
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });

        console.log(
          "[DEBUG] Calling authService.signUp with email:",
          email.toLowerCase().trim()
        );
        const { user, error } = await supabaseSignUp(
          name,
          email.toLowerCase().trim(),
          password
        );
        console.log("[DEBUG] authService.signUp returned", { user, error });

        if (handleError(error)) return;

        toast({
          title: "Success",
          description: "Please check your email to confirm your account",
        });
        router.push("/verify");
      } catch (error) {
        handleError(error as AuthError);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [handleError, router]
  );

  const logout = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      console.log("[DEBUG] Starting logout process");

      // Clear local state first to ensure UI updates immediately
      dispatch({ type: "LOGOUT" });

      // Clear any stored auth data
      try {
        localStorage.removeItem("stories");
      } catch (storageError) {
        console.error("[DEBUG] Error clearing local storage:", storageError);
      }

      // Attempt to sign out from Supabase
      try {
        const { error } = await signOut();
        if (error) {
          console.error("[DEBUG] Auth service signOut error:", {
            error,
            message: error.message,
            status: error.status,
          });
          // Don't throw the error, just log it
        }
      } catch (signOutError) {
        console.error("[DEBUG] Network error during signOut:", {
          error:
            signOutError instanceof Error
              ? signOutError.message
              : "Unknown error",
          type:
            signOutError instanceof Error ? signOutError.name : "Unknown type",
        });
        // Don't throw the error, continue with cleanup
      }

      // Always redirect to home page
      console.log("[DEBUG] Redirecting to home page");
      router.push("/");
    } catch (error) {
      console.error("[DEBUG] Unexpected error during logout:", {
        error: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.name : "Unknown type",
      });
      // Don't throw the error, ensure we complete the logout process
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [router]);

  const loginWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const { error } = await signInWithOAuth("google");

      if (handleError(error)) return;
    } catch (error) {
      handleError(error as AuthError);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [handleError]);

  const loginWithGithub = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const { error } = await signInWithOAuth("github");

      if (handleError(error)) return;
    } catch (error) {
      handleError(error as AuthError);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [handleError]);

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const { error } = await resetPasswordForEmail(email);

        if (handleError(error)) return;

        toast({
          title: "Success",
          description: "Password reset instructions sent to your email",
        });
      } catch (error) {
        handleError(error as AuthError);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [handleError]
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const { error } = await updateUserPassword(newPassword);

        if (handleError(error)) return;

        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        router.push("/dashboard");
      } catch (error) {
        handleError(error as AuthError);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [handleError, router]
  );

  const value = useMemo(
    () => ({
      state,
      login,
      signup,
      logout,
      loginWithGoogle,
      loginWithGithub,
      resetPassword,
      updatePassword,
    }),
    [
      state,
      login,
      signup,
      logout,
      loginWithGoogle,
      loginWithGithub,
      resetPassword,
      updatePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

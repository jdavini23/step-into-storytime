"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  getCurrentUser,
  getSession,
  fetchUserProfile,
} from "@/lib/supabase"

// Define types
export type UserRole = "user" | "admin"

export interface UserProfile {
  id: string
  name: string | null
  email: string
  avatar_url: string | null
  subscription_tier: "free" | "basic" | "premium" | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  user_metadata: {
    name?: string
    avatar_url?: string
  }
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

type AuthAction =
  | { type: "INITIALIZE"; payload: { user: User | null; profile: UserProfile | null } }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; profile: UserProfile | null } }
  | { type: "PROFILE_LOADED"; payload: UserProfile }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> }

// Create initial state
const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
}

// Create reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        isInitialized: true,
      }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case "PROFILE_LOADED":
      return {
        ...state,
        profile: action.payload,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "UPDATE_PROFILE":
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
      }
    default:
      return state
  }
}

// Create context
interface AuthContextType {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  logout: () => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [authChangeUnsubscribe, setAuthChangeUnsubscribe] = useState<(() => void) | null>(null)
  const router = useRouter()

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      // Get current session and user
      const session = await getSession()
      const user = session ? await getCurrentUser() : null

      // If user exists, fetch their profile
      let profile = null
      if (user) {
        try {
          profile = await fetchUserProfile(user.id)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }

      dispatch({
        type: "INITIALIZE",
        payload: {
          user: user as User | null,
          profile: profile as UserProfile | null,
        },
      })
    } catch (error) {
      console.error("Error initializing auth:", error)
      dispatch({ type: "INITIALIZE", payload: { user: null, profile: null } })
    }
  }, [])

  // Set up auth state listener
  useEffect(() => {
    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        try {
          const user = session.user as User
          let profile = null

          try {
            profile = await fetchUserProfile(user.id)
          } catch (profileError) {
            console.error("Error fetching profile on auth change:", profileError)
          }

          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user,
              profile: profile as UserProfile | null,
            },
          })
        } catch (error) {
          console.error("Error handling sign in:", error)
        }
      } else if (event === "SIGNED_OUT") {
        dispatch({ type: "LOGOUT" })
      }
    })

    // Store unsubscribe function
    setAuthChangeUnsubscribe(() => subscription.unsubscribe)

    // Cleanup function
    return () => {
      if (authChangeUnsubscribe) {
        authChangeUnsubscribe()
      }
    }
  }, [initializeAuth])

  // Auth functions
  const login = async (email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const { user } = await signInWithEmail(email, password)

      if (!user) {
        throw new Error("Login failed. Please check your credentials and try again.")
      }

      // Profile will be loaded by the auth state change listener
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "success",
      })

      return
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Redirect happens automatically
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Google login failed. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    }
  }

  const loginWithFacebook = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Redirect happens automatically
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Facebook login failed. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    }
  }

  const sendMagicLink = async (email: string) => {
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast({
        title: "Magic link sent",
        description: "Check your email for the login link",
      })

      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send magic link. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    }
  }

  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      await supabaseSignOut()

      // Auth state listener will handle the state update
      router.push("/")

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      console.error("Error during logout:", error)

      // Force logout on client side even if API call fails
      dispatch({ type: "LOGOUT" })
      router.push("/")
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const { user } = await signUpWithEmail(email, password, { name })

      if (!user) {
        throw new Error("Signup failed. Please try again.")
      }

      toast({
        title: "Account created",
        description: "Your account has been successfully created",
        variant: "success",
      })

      // Auth state listener will handle the state update
      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!state.user) {
      throw new Error("You must be logged in to update your profile")
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", state.user.id)
        .select()
        .single()

      if (error) throw error

      dispatch({
        type: "UPDATE_PROFILE",
        payload: updatedProfile as Partial<UserProfile>,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
        variant: "success",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again."

      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const refreshSession = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      await initializeAuth()
    } catch (error) {
      console.error("Error refreshing session:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

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
  )
}

// Create hook for using the context
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}


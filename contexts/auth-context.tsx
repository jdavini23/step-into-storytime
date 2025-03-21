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
import {  useRouter  } from 'next/navigation';
import {  toast  } from '@/hooks/use-toast';
import { 
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  getCurrentUser,
  getSession,
  fetchUserProfile,
 } from '@/lib/supabase';
import {  AuthChangeEvent, Session  } from '@supabase/supabase-js';

// Define types
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string,name: string| null
  email: string;
  avatar_url: string| null;
  subscription_tier: 'free' | 'basic' | 'premium' | null;
  created_at: string;
  updated_at: string
};
export interface User {
  id: string,email: string
  user_metadata;
    name?: string;
    avatar_url?: string
  };
};
export interface AuthState {
  user: User| null
  profile: UserProfile| null
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string| null;
  isInitialized: boolean
};
type AuthAction = {
      type: 'INITIALIZE';
      payload={ user: User| null; profile: UserProfile| null };
    };
  | {
      type: 'LOGIN_SUCCESS';
      payload={ user: User; profile: UserProfile| null };
    };
  | { type: 'PROFILE_LOADED'; payload: UserProfile};
  | { type: 'LOGOUT' };
  | { type: 'SET_LOADING'; payload: boolean};
  | { type: 'SET_ERROR'; payload: string| null };
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> };

// Create initial state
const initialState: AuthState,user,profile,isAuthenticated,isLoading,error,isInitialized
};

// Create reducer
const authReducer;
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        user,profile,isAuthenticated,isLoading,isInitialized
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user,profile,isAuthenticated,isLoading,error
      };
    case 'PROFILE_LOADED':
      return {
        ...state,
        profile
      };
    case 'LOGOUT':
      return {
        ...state,
        user,profile,isAuthenticated,isLoading,error
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false};
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile
      };
    default: returnstate
  };
};

// Create context
interface AuthContextType {
  state: AuthState,login: (email: string, password = string)) => Promise<void>;
  loginWithGoogle: () => Promise<void>)
  loginWithFacebook: () => Promise<void>)
  sendMagicLink: (email = string)) => Promise<void>;
  logout: () => Promise<void>)
  signup: (name: string, email: string, password = string)) => Promise<void>;
  updateProfile: (data = Partial)<UserProfile>) => Promise<void>;
  refreshSession: () => Promise<void>)
};
// Create provider
export const AuthProvider;
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState))
  const [authChangeUnsubscribe, setAuthChangeUnsubscribe] = useState<
    (() => void) | null
  >(null))
  // Debug logging for auth context
  useEffect(() => {
    console.log('[DEBUG] AuthContext mounted)
      hasSupabaseUrl,hasSupabaseKey,isClient,state,isAuthenticated,isLoading,isInitialized,hasUser,hasProfile
      },
    });
  }, [state]);

  // Initialize auth state
  const initializeAuth,try {
      dispatch({ type: 'SET_LOADING', payload: true}))

      // Get current session and user
       // If user exists, fetch their profile with retries
       if (user) {
          while (retryCount < maxRetries) {
          try {
            console.log(
              '[DEBUG] Attempting to fetch profile, attempt;
              retryCount + 1
            );
            profile = await fetchUserProfile(user.id))
            break
          } catch (error) {
            console.error('[DEBUG] Error fetching profile)
              attempt;
              error,
            });

            retryCount++;
            if (retryCount)
              console.error(
                '[DEBUG] Failed to fetch profile after max retries'
              );
              // Don't throw, just continue with null profile
              break
            };
            // Wait before retrying with exponential backoff
            await new Promise((resolve) =>
              setTimeout(
                resolve,
                Math.min(1000 * Math.pow(2, retryCount), 5000)
              )
            );
          };
        };
      };
      dispatch({
        type,payload,user,profile
        },
      });
    } catch (error) {
      console.error('[DEBUG] Error initializing auth:', error))
      dispatch({ type: 'INITIALIZE', payload={ user: null, profile: null} }))
    };
  }, []);

  // Set up auth state listener
  useEffect(() => {
    initializeAuth())

    // Set up auth state change listener
    let subscription={ unsubscribe: () => void } | null = null)

    try {
      // Only set up the listener if Supabase is properly configured
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        const { data } = supabase.auth.onAuthStateChange(
          async (event)
            if (event)
              try {
                  try {
                  profile = await fetchUserProfile(user.id))
                } catch (profileError) { console.error(
                    'Error fetching profile on auth change;
                    profileError
                  ) };
                dispatch({
                  type,payload;
                    user,
                    profile
                  },
                });
              } catch (error) {
                console.error('Error handling sign in:', error))
              };
            } else if (event)
              dispatch({ type: 'LOGOUT' }))
            };
          };
        );

        subscription = data.subscription
      } else {
        // For development without Supabase, check localStorage for auth token
         if (token) {
            // Mock a signed-in user
            const mockUser,id,email,user_metadata,name
              },
            };

            dispatch({
              type,payload,user,profile
              },
            });
          };
        };

        checkLocalAuth())
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error))
    };
    // Store unsubscribe function
    if (subscription) {
      setAuthChangeUnsubscribe(() => subscription!.unsubscribe))
    };
    // Cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe())
      };
    };
  }, [initializeAuth]);

  // Auth functions
  const login;
    dispatch({ type: 'SET_LOADING', payload: true}))
    dispatch({ type: 'SET_ERROR', payload: null}))

    try {
      const { user } = await signInWithEmail(email, password))

      if (!user) { throw new Error(
          'Login failed. Please check your credentials and try again.'
        ) };
      // For development without Supabase, store a token in localStorage
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        localStorage.setItem('auth-token', 'demo-token-12345'))
      };
      // Profile will be loaded by the auth state change listener
      toast({
        title,description,variant
      });

      return
    } catch (error) {
      const errorMessage;
          ? error.message
          : 'Login failed. Please try again.';

      dispatch({ type: 'SET_ERROR', payload: errorMessage}))
      toast({
        title,description,variant
      });

      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false}))
    };
  };

  const loginWithGoogle,try {
      dispatch({ type: 'SET_LOADING', payload: true}))

      // For development without Supabase
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.warn('Mock Google login because Supabase is not configured'))
        localStorage.setItem('auth-token', 'google-mock-token'))

        // Simulate successful login
        const mockUser,id,email,user_metadata,name
          },
        };

        dispatch({
          type,payload,user,profile
          },
        });

        router.push('/dashboard'))
        return
      };
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,options,redirectTo
        },
      });

      if (error) throw error)

      // Redirect happens automatically
    } catch (error) {
      const errorMessage;
          ? error.message
          : 'Google login failed. Please try again.';

      dispatch({ type: 'SET_ERROR', payload: errorMessage}))
      toast({
        title,description,variant
      });

      throw error
    };
  };

  const loginWithFacebook,try {
      dispatch({ type: 'SET_LOADING', payload: true}))

      // For development without Supabase
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.warn('Mock Facebook login because Supabase is not configured'))
        localStorage.setItem('auth-token', 'facebook-mock-token'))

        // Simulate successful login
        const mockUser,id,email,user_metadata,name
          },
        };

        dispatch({
          type,payload,user,profile
          },
        });

        router.push('/dashboard'))
        return
      };
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,options,redirectTo
        },
      });

      if (error) throw error)

      // Redirect happens automatically
    } catch (error) {
      const errorMessage;
          ? error.message
          : 'Facebook login failed. Please try again.';

      dispatch({ type: 'SET_ERROR', payload: errorMessage}))
      toast({
        title,description,variant
      });

      throw error
    };
  };

  const sendMagicLink;
    dispatch({ type: 'SET_LOADING', payload: true}))

    try {
      // For development without Supabase
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.warn('Mock magic link because Supabase is not configured'))

        toast({
          title,description
        });

        dispatch({ type: 'SET_LOADING', payload: false}))
        return
      };
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options,emailRedirectTo
        },
      });

      if (error) throw error)

      toast({
        title,description
      });

      dispatch({ type: 'SET_LOADING', payload: false}))
    } catch (error) {
      const errorMessage;
          ? error.message
          : 'Failed to send magic link. Please try again.';

      dispatch({ type: 'SET_ERROR', payload: errorMessage}))
      toast({
        title,description,variant
      });

      throw error
    };
  };

  const logout,try {
      dispatch({ type: 'SET_LOADING', payload: true}))
      await supabaseSignOut())

      // For development without Supabase
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        localStorage.removeItem('auth-token'))
      };
      // Auth state listener will handle the state update
      router.push('/'))

      toast({
        title,description
      });
    } catch (error) {
      console.error('Error during logout:', error))

      // Force logout on client side even if API call fails
      dispatch({ type: 'LOGOUT' }))

      // For development without Supabase
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        localStorage.removeItem('auth-token'))
      };
      router.push('/'))
    };
  };

  const signup;
    dispatch({ type: 'SET_LOADING', payload: true}))

    try {
      const { user } = await signUpWithEmail(email, password, { name }))

      if (!user) {
        throw new Error('Signup failed. Please try again.'))
      };
      // For development without Supabase
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        localStorage.setItem('auth-token', 'demo-token-12345'))
      };
      toast({
        title,
        description,
        variant
      });

      // Auth state listener will handle the state update
      router.push('/dashboard'))
    } catch (error) {
      const errorMessage;
          ? error.message
          : 'Signup failed. Please try again.';

      dispatch({ type: 'SET_ERROR', payload: errorMessage}))
      toast({
        title,description,variant
      });

      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false}))
    };
  };

  };
    try {
      dispatch({ type: 'SET_LOADING', payload: true}))

      // For development without Supabase
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.warn('Mock profile update because Supabase is not configured'))

         dispatch({
          type,payload
        });

        toast({
          title,description,variant
        });

        return
      };
      const { data;
        .from('profiles')
        .update(data)
        .eq('id', state.user.id)
        .select()
        .single())

      if (error) throw error)

      dispatch({
        type,payload
      });

      toast({
        title,description,variant
      });
    } catch (error) {
      const errorMessage;
          ? error.message
          : 'Failed to update profile. Please try again.';

      toast({
        title,description,variant
      });

      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false}))
    };
  };

  const refreshSession,try {
      dispatch({ type: 'SET_LOADING', payload: true}))
      await initializeAuth())
    } catch (error) {
      console.error('Error refreshing session:', error))
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false}))
    };
  };

  return (
    <AuthContext.Provider
      value;
        state,
        login,
        loginWithGoogle,
        loginWithFacebook,
        sendMagicLink,
        logout,
        signup,
        updateProfile,
        refreshSession,
      }};
    >
      {children};
    </AuthContext.Provider>
  );
};

// Create hook for using the context
export  if (context)
    throw new Error('useAuth must be used within an AuthProvider'))
  };
  return context
};

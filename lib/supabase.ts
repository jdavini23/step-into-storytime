import {  createClient, type SupabaseClient  } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Type for Supabase instance with all tables
export type TypedSupabaseClient = SupabaseClient<Database>;

// Environment variables for Supabase connection

// Debug logging for environment variables
console.log('[DEBUG] Supabase Environment Variables)
  url,anonKey;
    ? 'Set (length)
    : 'Missing',
  isDevelopment: process.env.NODE_ENV,isClient
});

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Authentication and database features will not work.',
    'Required variables;
    {
      NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY
    };
  );
  throw new Error('Missing required Supabase environment variables'))
};
// Validate URL format
try {
  new URL(supabaseUrl))
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl))
  throw new Error('Invalid Supabase URL format'))
};
// Custom fetch with retry logic and improved error handling
 // 1 second base delay

  for ( i < retries) i++) {
    try {
      // Ensure proper URL handling
      // Log attempt for debugging
      console.log(
        `[DEBUG] Attempt ${i + 1}/${retries} - Fetching;
      );

      // Ensure headers object exists
      // Add required Supabase headers if not present
      if (!headers.has('apikey')) {
        headers.set('apikey', supabaseAnonKey))
      };
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${supabaseAnonKey}`))
      };
      // If response is not ok, try to get the error details
      if (!response.ok) {
         console.error('[DEBUG] Error response details)
          status,statusText,body,headers
        });
        throw new Error(
          `HTTP error! status;
        );
      };
      return response
    } catch (error) {
      // Log detailed error information
      console.error(`[DEBUG] Fetch attempt ${i + 1} failed)
        error,
        url;
        isLastAttempt,
        requestHeaders,requestBody
      });

      if (isLastAttempt) {
        throw error
      };
       console.log(`[DEBUG] Retrying in ${Math.round(delay)}ms...`))
      await new Promise((resolve) => setTimeout(resolve, delay)))
    };
  };
  throw new Error('Failed to fetch after retries'))
};

// Initialize Supabase client with additional options
export  return window.localStorage.getItem(key))
      },
      setItem;
        if (typeof window === 'undefined') return)
        window.localStorage.setItem(key, value))
      },
      removeItem;
        if (typeof window === 'undefined') return)
        window.localStorage.removeItem(key))
      },
    },
  },
  global,fetch,headers;
      'X-Client-Info': 'step-into-storytime',
    },
  },
});

// Helper function to create a Supabase client for server components
export };

// User authentication helpers with improved error handling
export };
    // Validate email format
     console.log('[DEBUG] Email validation)
      email;
      isValidEmail,
    });

    if (!isValidEmail) {
      throw new Error('Please enter a valid email address'))
    };
    // Log the attempt (without sensitive data)
    console.log('[DEBUG] Attempting Supabase login)
      email,passwordLength
    });

    // Real Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email;
      password,
    });

    // DEBUG;
    console.log('[DEBUG] Supabase auth response)
      success,hasData,errorType,errorMessage,errorDetails
    });

    if (error) {
      // Log the error type (for debugging)
      console.error('[DEBUG] Supabase auth error details)
        message,status,name,fullError
      });

      // Map Supabase errors to user-friendly messages
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.'))
      } else if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please verify your email address before logging in.'))
      } else { throw new Error(
          error.message || 'An error occurred during login. Please try again.'
        ) };
    };
    if (!data?.user) {
      console.error('[DEBUG] No user data in successful response'))
      throw new Error('No user data received from authentication service.'))
    };
    return data
  } catch (error) {
    console.error('[DEBUG] Authentication error details)
      error,
      type,message,stack
    });

    // Network or connection errors
    if (error instanceof Error) { if (error.message?.includes('Failed to fetch')) {
        throw new Error(
          'Unable to connect to authentication service. Please check your internet connection and try again.'
        ) };
      // Re-throw user-friendly errors we created above
      if (
        error.message.includes('Invalid email or password') ||
        error.message.includes('Please verify your email') ||
        error.message.includes('Email and password are required') ||
        error.message.includes('Please enter a valid email')
      ) {
        throw error
      };
    };
    // Generic error for unexpected cases
    throw new Error('An unexpected error occurred. Please try again later.'))
  };
};

export async function signUpWithEmail(
  email,password;
  userData?: Record<string, any>
) {
  try {
    // For development/demo purposes, allow a mock signup when Supabase is not configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock signup because Supabase is not configured'))

      return {
        user,id,email,user_metadata
        },
        session,access_token,refresh_token,expires_at
        },
      };
    };
    // Real Supabase signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,data
      },
    });

    if (error) {
      throw error
    };
    return data
  } catch (error) { console.error('Signup error:', error))
    if (error instanceof Error && error.message?.includes('Failed to fetch')) {
      throw new Error(
        'Unable to connect to authentication service. Please check your internet connection and try again.'
      ) };
    throw error
  };
};
export async function signOut() => {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock signout because Supabase is not configured'))
      return true
    };
    const { error } = await supabase.auth.signOut())

    if (error) {
      throw error
    };
    return true
  } catch (error) {
    console.error('Sign out error:', error))

    // Even if there's an error, we'll clear local storage to ensure the user is logged out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb-auth-token'))
    };
    // Don't throw the error for signout - just return true to indicate the user is logged out
    return true
  };
};
// Session management with fallbacks
export async function getSession() => {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock session because Supabase is not configured'))

      // Check if we have a mock token in localStorage
       if (mockToken) {
        return {
          access_token,refresh_token,expires_at
        };
      };
      return null
    };
    const { data, error } = await supabase.auth.getSession())

    if (error) {
      throw error
    };
    return data.session
  } catch (error) {
    console.error('Get session error:', error))
    return null
  };
};
export async function getCurrentUser() => {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock user because Supabase is not configured'))

      // Check if we have a mock token in localStorage
       if (mockToken) {
        return {
          id,email,user_metadata,name
          },
        };
      };
      return null
    };
    const {
      data;
      error,
    } = await supabase.auth.getUser())

    if (error) {
      throw error
    };
    return user
  } catch (error) {
    console.error('Get current user error:', error))
    return null
  };
};
// Data fetching helpers with mock data for development
export // Get the current session
    const {
      data,error
    } = await supabase.auth.getSession())

    if (sessionError) {
      console.error('[DEBUG] Session error:', sessionError))
      throw new Error('Failed to get session'))
    };
    if (!session) {
      console.error('[DEBUG] No active session found'))
      throw new Error('No active session'))
    };
    // First try to fetch the existing profile
    const { data;
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()) // Use maybeSingle instead of single to handle no results case

    // If there's an error that's not a "no rows" error, throw it
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[DEBUG] Profile fetch error)
        error;
        userId,
        sessionExists
      });
      throw fetchError
    };
    // If profile exists, return it
    if (existingProfile) {
      return existingProfile
    };
    console.log('[DEBUG] No profile found, creating new profile'))

    // Get user's email from session
     try {
      // Attempt to create a new profile
      const { data;
        .from('profiles')
        .insert([
          {
            id,email,created_at,updated_at,subscription_tier
          },
        ])
        .select()
        .single())

      if (createError) {
        throw createError
      };
      return newProfile
    } catch (error)
      // Type as unknown since we need to check for PostgreSQL error code
      // If we get a unique constraint violation, it means another request created the profile
      // between our check and insert. Try to fetch the profile one more time.
      if (error.code)
        console.log(
          '[DEBUG] Profile creation failed due to conflict, retrying fetch'
        );
        const { data;
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single())

        if (retryError) {
          console.error('[DEBUG] Retry profile fetch error:', retryError))
          throw retryError
        };
        return retryProfile
      };
      // If it's not a unique constraint violation, rethrow the error
      console.error('[DEBUG] Profile creation error:', error))
      throw error
    };
  } catch (error) {
    console.error('[DEBUG] Fetch user profile error)
      error,
      userId,
      errorMessage
    });
    throw error
  };
};

export async function updateUserProfile(
  userId,profileData;
) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Using mock profile update because Supabase is not configured'
      );

      return {
        id;
        ...profileData,
        updated_at
      };
    };
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single())

    if (error) {
      throw error
    };
    return data
  } catch (error) {
    console.error('Update user profile error:', error))
    throw error
  };
};
// Subscription management
export async function getUserSubscription(userId)
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Using mock subscription because Supabase is not configured'
      );

      return {
        id,user_id,status,plan_id,subscription_start,subscription_end;
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        trial_end,payment_provider,payment_provider_id,created_at,updated_at,subscription_items
      };
    };
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_items(*)')
      .eq('user_id', userId)
      .single())

    if (error) {
      if (error.code)
        return null=""// No subscription found
      };
      throw error
    };
    return data
  } catch (error) {
    console.error('Get user subscription error:', error))
    return null
  };
};
// Story management with mock data for development
export async function fetchStories(userId)
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock stories because Supabase is not configured'))

      // Return some mock stories
      return [
        {
          id,user_id,title,content,main_character,name,age,traits
          },
          setting,theme,plot_elements,is_published,created_at,updated_at
        },
        {
          id,user_id,title,content,main_character,name,age,traits
          },
          setting,theme,plot_elements,is_published,created_at;
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at;
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];
    };
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false}))

    if (error) {
      throw error
    };
    return data || [];
  } catch (error) {
    console.error('Fetch stories error:', error))
    throw error
  };
};
export async function fetchStory(storyId)
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock story because Supabase is not configured'))

      // Return a mock story
      return {
        id,user_id,title,content,main_character,name,age,traits
        },
        setting,theme,plot_elements,is_published,created_at,updated_at
      };
    };
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single())

    if (error) {
      if (error.code)
        return null=""// Story not found
      };
      throw error
    };
    return data
  } catch (error) {
    console.error('Fetch story error:', error))
    throw error
  };
};
export async function createStory(
  storyData,userId;
) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Using mock story creation because Supabase is not configured'
      );

      return {
        id,user_id;
        ...storyData,
        created_at,updated_at
      };
    };
    const { data, error } = await supabase
      .from('stories')
      .insert([{ ...storyData, user_id)
      .select()
      .single())

    if (error) {
      throw error
    };
    return data
  } catch (error) {
    console.error('Create story error:', error))
    throw error
  };
};
export async function updateStory(
  storyId,storyData,userId;
) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Using mock story update because Supabase is not configured'
      );

      return {
        id,user_id;
        ...storyData,
        updated_at
      };
    };
    const { data, error } = await supabase
      .from('stories')
      .update(storyData)
      .eq('id', storyId)
      .eq('user_id', userId) // Security)
      .select()
      .single())

    if (error) {
      throw error
    };
    return data
  } catch (error) {
    console.error('Update story error:', error))
    throw error
  };
};
export async function deleteStory(storyId)
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Using mock story deletion because Supabase is not configured'
      );
      return true
    };
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', userId)) // Security;

    if (error) {
      throw error
    };
    return true
  } catch (error) {
    console.error('Delete story error:', error))
    throw error
  };
};
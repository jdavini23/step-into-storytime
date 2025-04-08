// Refactored Supabase client initialization
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing required Supabase environment variables. Please check your .env file and Vercel environment variables.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
  },
});

// For client-side only operations
export const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('Browser client must be used in browser context only');
  }
  return supabase;
};

// For server-side operations
export const createServerClient = () => {
  return supabase;
};

// Type for Supabase instance with all tables
export type TypedSupabaseClient = typeof supabase;

// Singleton instance for browser and server
let supabaseInstance: TypedSupabaseClient | null = null;

export const createSupabaseClient = (): TypedSupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  if (typeof window === 'undefined') {
    throw new Error(
      'Supabase client cannot be initialized server-side. Please use in browser context only.'
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Supabase] Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    });
    throw new Error(
      'Missing required Supabase environment variables. Please check your .env file and Vercel environment variables.'
    );
  }

  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token',
      },
    });

    // Test the client
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase] Auth state changed:', event, !!session);
    });

    return supabaseInstance;
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
    throw new Error(
      'Failed to initialize Supabase client. Please try again later.'
    );
  }
};

// Export a function to check if the client is initialized
export const isSupabaseInitialized = () => !!supabaseInstance;

// Custom fetch with retry logic and improved error handling
const customFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const retries = 3;
  const baseDelay = 1000; // 1 second base delay

  for (let i = 0; i < retries; i++) {
    try {
      // Ensure proper URL handling
      const url = input instanceof URL ? input : new URL(input.toString());

      // Log attempt for debugging
      console.log(
        `[DEBUG] Attempt ${i + 1}/${retries} - Fetching: ${url.toString()}`
      );

      // Ensure headers object exists
      const headers = new Headers(init?.headers || {});

      // Add required Supabase headers if not present
      if (!headers.has('apikey')) {
        headers.set('apikey', supabaseKey);
      }
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${supabaseKey}`);
      }

      const response = await fetch(url.toString(), {
        ...init,
        headers: {
          ...Object.fromEntries(headers.entries()),
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      // If response is not ok, try to get the error details
      if (!response.ok) {
        const errorBody = await response
          .text()
          .catch(() => 'Failed to read error response');
        console.error('[DEBUG] Error response details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          headers: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }

      return response;
    } catch (error) {
      const isLastAttempt = i === retries - 1;

      // Log detailed error information
      console.error(`[DEBUG] Fetch attempt ${i + 1} failed:`, {
        error,
        url: input.toString(),
        isLastAttempt,
        requestHeaders: init?.headers,
        requestBody: init?.body,
      });

      if (isLastAttempt) {
        throw error;
      }

      const delay = Math.min(
        1000 * Math.pow(2, i) + Math.random() * 1000,
        10000
      );
      console.log(`[DEBUG] Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Failed to fetch after retries');
};

// User authentication helpers with improved error handling
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<any> => {
  try {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Validate email format
    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    console.log('[DEBUG] Email validation:', {
      email: email.slice(0, 3) + '***@' + email.split('@')[1],
      isValidEmail,
    });

    if (!isValidEmail) {
      throw new Error('Please enter a valid email address');
    }

    // Log the attempt (without sensitive data)
    console.log('[DEBUG] Attempting Supabase login:', {
      email: email.slice(0, 3) + '***@' + email.split('@')[1],
      passwordLength: password?.length,
    });

    // Real Supabase authentication
    const { data, error } =
      await createSupabaseClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    // DEBUG: Log authentication response
    console.log('[DEBUG] Supabase auth response:', {
      success: !error,
      hasData: !!data,
      errorType: error?.name,
      errorMessage: error?.message,
      errorDetails: error,
    });

    if (error) {
      // Log the error type (for debugging)
      console.error('[DEBUG] Supabase auth error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        fullError: error,
      });

      // Map Supabase errors to user-friendly messages
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please verify your email address before logging in.');
      } else {
        throw new Error(
          error.message || 'An error occurred during login. Please try again.'
        );
      }
    }

    if (!data?.user) {
      console.error('[DEBUG] No user data in successful response');
      throw new Error('No user data received from authentication service.');
    }

    return data;
  } catch (error) {
    console.error('[DEBUG] Authentication error details:', {
      error,
      type: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Network or connection errors
    if (error instanceof Error) {
      if (error.message?.includes('Failed to fetch')) {
        throw new Error(
          'Unable to connect to authentication service. Please check your internet connection and try again.'
        );
      }
      // Re-throw user-friendly errors we created above
      if (
        error.message.includes('Invalid email or password') ||
        error.message.includes('Please verify your email') ||
        error.message.includes('Email and password are required') ||
        error.message.includes('Please enter a valid email')
      ) {
        throw error;
      }
    }

    // Generic error for unexpected cases
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};

export async function signUpWithEmail(
  email: string,
  password: string,
  userData?: Record<string, any>
) {
  try {
    // For development/demo purposes, allow a mock signup when Supabase is not configured
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Using mock signup because Supabase is not configured');

      return {
        user: {
          id: 'mock-user-id',
          email: email,
          user_metadata: userData || {},
        },
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000,
        },
      };
    }

    // Real Supabase signup
    const { data, error } = await createSupabaseClient().auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error && error.message?.includes('Failed to fetch')) {
      throw new Error(
        'Unable to connect to authentication service. Please check your internet connection and try again.'
      );
    }

    throw error;
  }
}

export async function signOut() {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Using mock signout because Supabase is not configured');
      return true;
    }

    const { error } = await createSupabaseClient().auth.signOut();

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Sign out error:', error);

    // Even if there's an error, we'll clear local storage to ensure the user is logged out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb-auth-token');
    }

    // Don't throw the error for signout - just return true to indicate the user is logged out
    return true;
  }
}

// Session management with fallbacks
export async function getSession() {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Using mock session because Supabase is not configured');

      // Check if we have a mock token in localStorage
      const mockToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth-token')
          : null;

      if (mockToken) {
        return {
          access_token: mockToken,
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000,
        };
      }

      return null;
    }

    const { data, error } = await createSupabaseClient().auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Using mock user because Supabase is not configured');

      // Check if we have a mock token in localStorage
      const mockToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth-token')
          : null;

      if (mockToken) {
        return {
          id: 'mock-user-id',
          email: 'user@example.com',
          user_metadata: {
            name: 'Demo User',
          },
        };
      }

      return null;
    }

    const {
      data: { user },
      error,
    } = await createSupabaseClient().auth.getUser();

    if (error) {
      throw error;
    }

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Data fetching helpers with mock data for development
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log('[DEBUG] Fetching user profile:', { userId });

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await createSupabaseClient().auth.getSession();

    if (sessionError) {
      console.error('[DEBUG] Session error:', sessionError);
      throw new Error('Failed to get session');
    }

    if (!session) {
      console.error('[DEBUG] No active session found');
      throw new Error('No active session');
    }

    // First try to fetch the existing profile
    const { data: existingProfile, error: fetchError } =
      await createSupabaseClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results case

    // If there's an error that's not a "no rows" error, throw it
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[DEBUG] Profile fetch error:', {
        error: fetchError,
        userId,
        sessionExists: !!session,
      });
      throw fetchError;
    }

    // If profile exists, return it
    if (existingProfile) {
      return existingProfile;
    }

    console.log('[DEBUG] No profile found, creating new profile');

    // Get user's email from session
    const userEmail = session.user.email;

    try {
      // Attempt to create a new profile
      const { data: newProfile, error: createError } =
        await createSupabaseClient()
          .from('profiles')
          .insert([
            {
              id: userId,
              email: userEmail || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_tier: 'free' as const,
            },
          ])
          .select()
          .single();

      if (createError) {
        throw createError;
      }

      return newProfile;
    } catch (error: any) {
      // Type as any since we need to check for PostgreSQL error code
      // If we get a unique constraint violation, it means another request created the profile
      // between our check and insert. Try to fetch the profile one more time.
      if (error.code === '23505') {
        console.log(
          '[DEBUG] Profile creation failed due to conflict, retrying fetch'
        );
        const { data: retryProfile, error: retryError } =
          await createSupabaseClient()
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (retryError) {
          console.error('[DEBUG] Retry profile fetch error:', retryError);
          throw retryError;
        }

        return retryProfile;
      }

      // If it's not a unique constraint violation, rethrow the error
      console.error('[DEBUG] Profile creation error:', error);
      throw error;
    }
  } catch (error) {
    console.error('[DEBUG] Fetch user profile error:', {
      error,
      userId,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

export async function updateUserProfile(
  userId: string,
  profileData: Record<string, any>
) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        'Using mock profile update because Supabase is not configured'
      );

      return {
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await createSupabaseClient()
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
}

// Subscription management
export async function getUserSubscription(userId: string) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        'Using mock subscription because Supabase is not configured'
      );

      return {
        id: 'mock-subscription-id',
        user_id: userId,
        status: 'active',
        plan_id: 'basic',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        trial_end: null,
        payment_provider: 'stripe',
        payment_provider_id: 'mock-payment-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subscription_items: [],
      };
    }

    const { data, error } = await createSupabaseClient()
      .from('subscriptions')
      .select('*, subscription_items(*)')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No subscription found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Get user subscription error:', error);
    return null;
  }
}

// Story management with mock data for development
export async function fetchStories(userId: string) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Using mock stories because Supabase is not configured');

      // Return some mock stories
      return [
        {
          id: 'mock-story-1',
          user_id: userId,
          title: 'The Enchanted Forest',
          content: 'Once upon a time in an enchanted forest...',
          main_character: {
            name: 'Emma',
            age: '8',
            traits: ['brave', 'curious'],
          },
          setting: 'an enchanted forest',
          theme: 'adventure',
          plot_elements: ['magic spell', 'talking animals'],
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'mock-story-2',
          user_id: userId,
          title: 'Space Adventure',
          content: 'Captain Max set off on a journey through the stars...',
          main_character: {
            name: 'Max',
            age: '7',
            traits: ['adventurous', 'clever'],
          },
          setting: 'outer space',
          theme: 'discovery',
          plot_elements: ['hidden treasure', 'new friend'],
          is_published: true,
          created_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];
    }

    const { data, error } = await createSupabaseClient()
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Fetch stories error:', error);
    throw error;
  }
}

export async function fetchStory(storyId: string, userId: string) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Using mock story because Supabase is not configured');

      // Return a mock story
      return {
        id: storyId,
        user_id: userId,
        title: 'The Enchanted Forest',
        content: 'Once upon a time in an enchanted forest...',
        character: {
          name: 'Emma',
          age: '8',
          traits: ['brave', 'curious'],
        },
        setting: 'an enchanted forest',
        theme: 'adventure',
        plot_elements: ['magic spell', 'talking animals'],
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await createSupabaseClient()
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Story not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Fetch story error:', error);
    throw error;
  }
}

export async function createStory(
  storyData: Record<string, any>,
  userId: string
) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        'Using mock story creation because Supabase is not configured'
      );

      return {
        id: `mock-story-${Date.now()}`,
        user_id: userId,
        ...storyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await createSupabaseClient()
      .from('stories')
      .insert({
        user_id: userId,
        title: storyData.title || 'Untitled Story',
        ...storyData,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Create story error:', error);
    throw error;
  }
}

export async function updateStory(
  storyId: string,
  storyData: Record<string, any>,
  userId: string
) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        'Using mock story update because Supabase is not configured'
      );

      return {
        id: storyId,
        user_id: userId,
        ...storyData,
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await createSupabaseClient()
      .from('stories')
      .update(storyData)
      .eq('id', storyId)
      .eq('user_id', userId) // Security: ensure user owns the story
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Update story error:', error);
    throw error;
  }
}

export async function deleteStory(storyId: string, userId: string) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        'Using mock story deletion because Supabase is not configured'
      );
      return true;
    }

    const { error } = await createSupabaseClient()
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', userId); // Security: ensure user owns the story

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Delete story error:', error);
    throw error;
  }
}

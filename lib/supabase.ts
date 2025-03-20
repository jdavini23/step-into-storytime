import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Type for Supabase instance with all tables
export type TypedSupabaseClient = SupabaseClient<Database>;

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Authentication and database features may not work correctly.',
    'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

// Initialize Supabase client with additional options
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: (...args) => {
        return fetch(...args);
      },
    },
  }
);

// Helper function to create a Supabase client for server components
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
      persistSession: false,
    },
  });
};

// User authentication helpers with improved error handling
export async function signInWithEmail(email: string, password: string) {
  try {
    // For development/demo purposes, allow a mock login when Supabase is not configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Using mock authentication because Supabase is not configured'
      );

      // Mock successful login for demo purposes
      if (password === 'password123') {
        return {
          user: {
            id: 'mock-user-id',
            email: email,
            user_metadata: {
              name: email.split('@')[0],
            },
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000,
          },
        };
      } else {
        throw new Error('Invalid login credentials');
      }
    }

    // Real Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof Error && error.message?.includes('Failed to fetch')) {
      throw new Error(
        'Unable to connect to authentication service. Please check your internet connection and try again.'
      );
    }

    throw error;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  userData?: Record<string, any>
) {
  try {
    // For development/demo purposes, allow a mock signup when Supabase is not configured
    if (!supabaseUrl || !supabaseAnonKey) {
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
    const { data, error } = await supabase.auth.signUp({
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
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock signout because Supabase is not configured');
      return true;
    }

    const { error } = await supabase.auth.signOut();

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
    if (!supabaseUrl || !supabaseAnonKey) {
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

    const { data, error } = await supabase.auth.getSession();

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
    if (!supabaseUrl || !supabaseAnonKey) {
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
    } = await supabase.auth.getUser();

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
export async function fetchUserProfile(userId: string) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock profile because Supabase is not configured');

      return {
        id: userId,
        name: 'Demo User',
        email: 'user@example.com',
        avatar_url: null,
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No profile found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Fetch user profile error:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: Record<string, any>
) {
  try {
    // For development/demo purposes
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Using mock profile update because Supabase is not configured'
      );

      return {
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
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
    if (!supabaseUrl || !supabaseAnonKey) {
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

    const { data, error } = await supabase
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
    if (!supabaseUrl || !supabaseAnonKey) {
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

    const { data, error } = await supabase
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
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Using mock story because Supabase is not configured');

      // Return a mock story
      return {
        id: storyId,
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
      };
    }

    const { data, error } = await supabase
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
    if (!supabaseUrl || !supabaseAnonKey) {
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

    const { data, error } = await supabase
      .from('stories')
      .insert([{ ...storyData, user_id: userId }])
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
    if (!supabaseUrl || !supabaseAnonKey) {
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

    const { data, error } = await supabase
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
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Using mock story deletion because Supabase is not configured'
      );
      return true;
    }

    const { error } = await supabase
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

'use client';

// Simplified browser-specific Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

let supabase: any;

if (typeof window !== 'undefined' && !supabase) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  // Get the domain for cookie storage
  const getCookieDomain = () => {
    if (isDevelopment) return host;
    // For Vercel deployment, use the main domain
    const parts = host.split('.');
    if (parts.length > 2) {
      // Return the top-level domain and extension (e.g., example.com from sub.example.com)
      return parts.slice(-2).join('.');
    }
    return host;
  };

  const storageKey = 'sb-' + supabaseUrl.split('//')[1].split('.')[0];

  supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: isDevelopment,
      storageKey,
      storage: {
        getItem: (key) => {
          try {
            return Promise.resolve(localStorage.getItem(key));
          } catch (error) {
            console.error('Error accessing localStorage:', error);
            return Promise.resolve(null);
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
            return Promise.resolve();
          } catch (error) {
            console.error('Error setting localStorage:', error);
            return Promise.resolve();
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
            return Promise.resolve();
          } catch (error) {
            console.error('Error removing from localStorage:', error);
            return Promise.resolve();
          }
        },
      },
    },
  });

  // Debug listener for auth state changes in development
  if (isDevelopment) {
    supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('[Supabase Client] Auth state changed:', {
          event,
          hasSession: !!session,
          timestamp: new Date().toISOString(),
          domain: getCookieDomain(),
          host: window.location.hostname,
        });
      }
    );
  }
}

export { supabase };

// Export a function to get the client
export const getClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
};

export default supabase;

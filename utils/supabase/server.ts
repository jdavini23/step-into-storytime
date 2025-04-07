import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. Please check your .env.local file.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error(
    'Invalid Supabase URL format. Please check your NEXT_PUBLIC_SUPABASE_URL.'
  );
}

export async function createClient() {
  console.log('[DEBUG] Creating server Supabase client...', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });

  const cookieStore = cookies();
  const cookiesList = (await cookieStore).getAll();
  console.log('[DEBUG] Available cookies:', {
    count: cookiesList.length,
    names: cookiesList.map((c) => c.name),
  });

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        try {
          console.log('[DEBUG] Reading cookie:', { name });
          const cookie = (await cookieStore).get(name);
          console.log('[DEBUG] Cookie value:', {
            name,
            hasValue: !!cookie?.value,
            value: cookie?.value ? `${cookie.value.substring(0, 10)}...` : null,
          });
          return cookie?.value ?? '';
        } catch (error) {
          console.error('[DEBUG] Error reading cookie:', { name, error });
          return '';
        }
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          console.log('[DEBUG] Setting cookie:', {
            name,
            hasValue: !!value,
            options,
          });
          const cookieOptions = {
            ...options,
            sameSite: 'lax' as const,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            httpOnly: true,
            priority: 'high' as const,
          };
          (await cookieStore).set({
            name,
            value,
            ...cookieOptions,
          });
        } catch (error) {
          console.error('[DEBUG] Error setting cookie:', { name, error });
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          console.log('[DEBUG] Removing cookie:', { name, options });
          (await cookieStore).delete({
            name,
            ...options,
            path: '/',
          });
        } catch (error) {
          console.error('[DEBUG] Error removing cookie:', { name, error });
        }
      },
    },
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web/2.38.4',
        'Cache-Control': 'no-store',
      },
    },
  });
}

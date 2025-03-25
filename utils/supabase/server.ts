import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          } catch (error) {
            // Handle error if needed
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({
              name,
              ...options,
            });
          } catch (error) {
            // Handle error if needed
          }
        },
      },
      auth: {
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    }
  );

  return client;
}

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export async function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookies().get(name);
          return cookie?.value ?? '';
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies().set(name, value);
        },
        remove(name: string, options: CookieOptions) {
          cookies().delete(name);
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
}

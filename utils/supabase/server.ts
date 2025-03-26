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
        async get(name: string) {
          const cookie = (await cookies()).get(name);
          return cookie?.value ?? '';
        },
        async set(name: string, value: string, options: CookieOptions) {
          (await cookies()).set(name, value);
        },
        async remove(name: string, options: CookieOptions) {
          (await cookies()).delete(name);
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

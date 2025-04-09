'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { CookieOptions } from '@supabase/ssr';

export async function getServerClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          (await cookies()).set(name, value, options);
        },
        async remove(name: string, options: CookieOptions) {
          (await cookies()).delete({ name, ...options });
        },
      },
    }
  );
}

export async function getServerSession() {
  const supabase = await getServerClient();
  return await supabase.auth.getSession();
}

export async function getServerUser() {
  const {
    data: { session },
  } = await getServerSession();
  return session?.user ?? null;
}

export async function isAuthenticated() {
  const user = await getServerUser();
  return !!user;
}

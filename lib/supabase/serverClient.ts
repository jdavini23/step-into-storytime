import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase';

export const createClient = (request: NextRequest, response: NextResponse) => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookieValue = request.cookies.get(name)?.value;
          
          // If it's a Supabase cookie (starts with 'sb-') or base64-encoded,
          // return it as is without trying to parse it as JSON
          if (cookieValue && (name.startsWith('sb-') || cookieValue.startsWith('base64-'))) {
            return cookieValue;
          }
          
          return cookieValue;
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })

          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })

          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      cookieOptions: {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  )
}
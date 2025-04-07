import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  console.log('[DEBUG] Middleware executing for path:', req.nextUrl.pathname);

  try {
    // Refresh session if needed
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log('[DEBUG] Session check in middleware:', {
      hasSession: !!session,
      path: req.nextUrl.pathname,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('[DEBUG] Session error in middleware:', {
        error: error.message,
        status: error.status,
        path: req.nextUrl.pathname,
      });
    }

    // Protected API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      if (!session) {
        console.log('[DEBUG] Unauthorized API access attempt:', {
          path: req.nextUrl.pathname,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Protected pages
    if (
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/profile')
    ) {
      if (!session) {
        console.log(
          '[DEBUG] Redirecting unauthenticated user from protected page:',
          {
            path: req.nextUrl.pathname,
            timestamp: new Date().toISOString(),
          }
        );
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }
    }

    // Auth pages (when already authenticated)
    if (
      session &&
      (req.nextUrl.pathname === '/sign-in' ||
        req.nextUrl.pathname === '/sign-up')
    ) {
      console.log('[DEBUG] Redirecting authenticated user from auth page:', {
        path: req.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
  } catch (error) {
    console.error('[DEBUG] Unexpected error in middleware:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.nextUrl.pathname,
    });
    return res;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/:path*',
    '/sign-in',
    '/sign-up',
  ],
};

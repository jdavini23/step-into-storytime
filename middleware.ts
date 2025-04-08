import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  // Temporarily disabled for testing
  return NextResponse.next();

  /* Original middleware code commented out for testing
  const res = NextResponse.next();

  // Create a Supabase client for the middleware
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[Middleware][${requestId}] Processing request:`, {
      pathname: req.nextUrl.pathname,
      search: req.nextUrl.search,
      timestamp: new Date().toISOString(),
    });

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(`[Middleware][${requestId}] Session status:`, {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    // Handle protected routes
    const isAuthRoute = req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up';
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/profile');
    const isProtectedApiRoute = req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/auth');

    // Check if we're already being redirected to prevent loops
    const isBeingRedirected = req.headers.get('x-auth-redirect') === 'true';
    if (isBeingRedirected) {
      console.log(`[Middleware][${requestId}] Detected redirect loop, allowing request to proceed`);
      return res;
    }

    // If user is authenticated and trying to access auth pages
    if (session && isAuthRoute) {
      const redirectTo = req.nextUrl.searchParams.get('redirect') || '/dashboard';
      const safePath = redirectTo.startsWith('/') ? redirectTo : '/dashboard';

      console.log(`[Middleware][${requestId}] Redirecting authenticated user from auth page to:`, safePath);
      const response = NextResponse.redirect(new URL(safePath, req.url));
      response.headers.set('x-auth-redirect', 'true');
      return response;
    }

    // Redirect unauthenticated users away from protected pages
    if (!session && isProtectedRoute) {
      console.log(`[Middleware][${requestId}] Unauthenticated access to protected route:`, req.nextUrl.pathname);
      const redirectUrl = new URL('/sign-in', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      const response = NextResponse.redirect(redirectUrl);
      response.headers.set('x-auth-redirect', 'true');
      return response;
    }

    // Handle protected API routes
    if (!session && isProtectedApiRoute) {
      console.log(`[Middleware][${requestId}] Unauthorized API access attempt`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[Middleware][${requestId}] Allowing request to proceed`);
    return res;
  } catch (error) {
    console.error('[Middleware] Error:', error);
    return res;
  }
  */
}

export const config = {
  matcher: [
    // Temporarily disabled for testing
    /*
    '/dashboard',
    '/dashboard/:path*',
    '/profile',
    '/profile/:path*',
    '/api/:path*',
    '/sign-in',
    '/sign-up',
    */
  ],
};

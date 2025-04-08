import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { publicRoutes, defaultRedirectPath } from './config/authRoutes';

// import type { Database } from '@/lib/database.types' // Assuming you have types generated

export async function middleware(req: NextRequest) {
  console.log('--- Middleware START ---');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Middleware Request Cookies:', req.cookies.getAll());

  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  );
  // If using database types:
  // const supabase = createMiddlewareClient<Database>({ req, res }, {
  //   supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  //   supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // });

  try {
    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('Middleware Session:', session ? 'Found' : 'Not Found');
    console.log('Middleware Pathname:', pathname);

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(
      (route) =>
        pathname === route ||
        (route.endsWith('/*') && pathname.startsWith(route.slice(0, -2)))
    );
    console.log('Middleware isPublicRoute:', isPublicRoute);

    // If it's not a public route and there's no session, redirect to login
    if (!isPublicRoute && !session) {
      console.log('>>> REDIRECTING: No session or non-public route', {
        pathname,
        isPublicRoute,
        hasSession: !!session,
      });

      // Store the original URL to redirect back after login
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = defaultRedirectPath;
      redirectUrl.searchParams.set('redirect', pathname);

      const response = NextResponse.redirect(redirectUrl);

      // Copy over the Supabase auth cookies to maintain session state
      const supabaseCookies = req.cookies
        .getAll()
        .filter(
          (cookie) =>
            cookie.name.includes('sb-') ||
            cookie.name.includes('supabase-auth-token')
        );

      supabaseCookies.forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, {
          path: '/',
          ...cookie,
        });
      });

      return response;
    }

    // If the user is logged in and tries to access a public-only route like signin/signup, redirect them
    if (session && (pathname === '/sign-in' || pathname === '/signup')) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to continue to avoid blocking the user
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

import { createClient as createMiddlewareClient} from '@/lib/supabase/serverClient';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { publicRoutes, defaultRedirectPath } from './config/authRoutes';
import { getServerSession } from '@/lib/supabase/server';
import { Session } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  console.log('--- Middleware START ---');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Middleware Request Cookies:', req.cookies.getAll());

  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in middleware!');
    return NextResponse.next();
  }

  const supabase = createMiddlewareClient(req, res);

  try {
    const session: Session | null = await getServerSession();

    console.log('Middleware Session:', session ? 'Found' : 'Not Found');

    if (session) {
      console.log('Middleware Session Details:', {
        userId: session.user?.id,
        accessToken: session.access_token?.slice(0, 10) + '...',
        expiresAt: session.expires_at,
      });
    } else {
      console.log('Middleware Session Data: null');
    }

    console.log('Middleware Pathname:', pathname);
    console.log('Middleware publicRoutes:', publicRoutes);

    const isPublicRoute = publicRoutes.some(
      (route) =>
        pathname === route ||
        (route.endsWith('/*') && pathname.startsWith(route.slice(0, -2)))
    );

    console.log('Middleware isPublicRoute:', isPublicRoute);
    console.log('Middleware pathname:', pathname);

    if (!isPublicRoute && !session) {
      console.log('>>> REDIRECTING: No session or non-public route', {
        pathname,
        isPublicRoute,
        hasSession: !!session,
      });

      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = defaultRedirectPath;
      redirectUrl.searchParams.set('redirect', pathname);

      return NextResponse.redirect(redirectUrl);
    }

    if (session && (pathname === '/sign-in' || pathname === '/signup')) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }

    console.log('Response cookies:', res.cookies.getAll().map(c => ({
      name: c.name,
      value: c.value.substring(0, 10) + '...',
      domain: c.domain,
      path: c.path,
      sameSite: c.sameSite,
      secure: c.secure,
      maxAge: c.maxAge
    })));

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
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

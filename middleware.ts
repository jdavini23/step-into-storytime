import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the original pathname
  const pathname = request.nextUrl.pathname;

  // Create a new response
  const response = NextResponse.next();

  // Set template variables in response headers
  response.headers.set('x-var-original-pathname', pathname);

  // Create a new URL for rewriting if needed
  const url = request.nextUrl.clone();
  url.searchParams.set('VAR_ORIGINAL_PATHNAME', pathname);

  // Return the response with rewritten URL and headers
  return NextResponse.rewrite(url, {
    headers: response.headers,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

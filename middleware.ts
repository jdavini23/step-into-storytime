import { createClient as createMiddlewareClient } from "@/lib/supabase/serverClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultRedirectPath, publicRoutes } from "./config/authRoutes";
import { Session } from "@supabase/supabase-js";

// Simple in-memory rate limiting store
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Max requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRateLimit = rateLimit.get(ip);

  if (!userRateLimit) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - userRateLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (userRateLimit.count >= MAX_REQUESTS) {
    return false;
  }

  userRateLimit.count++;
  return true;
}

export async function middleware(req: NextRequest) {
  console.log("--- Middleware START ---");
  console.log("Request URL:", req.url);
  console.log("Request Method:", req.method);

  // Rate limiting check
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    console.warn("Rate limit exceeded for IP:", ip);
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Create Supabase client
  const supabase = createMiddlewareClient(req, res);

  try {
    // First get the session to ensure it exists
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return res;
    }

    // Then verify the user with getUser if we have a session
    let verifiedUser = null;
    if (session) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User verification error:", userError);
      } else {
        verifiedUser = user;
      }
    }

    console.log("Middleware Auth Status:", {
      hasSession: !!session,
      isVerified: !!verifiedUser,
      userId: verifiedUser?.id || session?.user?.id,
    });

    const isPublicRoute = publicRoutes.some(
      (route) =>
        pathname === route ||
        (route.endsWith("/*") && pathname.startsWith(route.slice(0, -2))),
    );

    console.log("Route Status:", {
      pathname,
      isPublicRoute,
      isAuthenticated: !!session && !!verifiedUser,
    });

    // Handle authentication redirects
    if (!isPublicRoute && (!session || !verifiedUser)) {
      console.log(">>> REDIRECTING: Authentication required");
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = defaultRedirectPath;
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    if (
      session && verifiedUser &&
      (pathname === "/sign-in" || pathname === "/signup")
    ) {
      console.log(">>> REDIRECTING: Authenticated user to dashboard");
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return res;
  }
}

// Clean up rate limit data periodically
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimit.entries()).forEach(([ip, data]) => {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimit.delete(ip);
    }
  });
}, RATE_LIMIT_WINDOW);

export const config = {
  matcher: [
    /*
     * Match specific routes that need authentication
     * while excluding Next.js static files
     */
    "/",
    "/dashboard/:path*",
    "/sign-in",
    "/signup",
    "/_sites/:path*",
    "/subscription/:path*",
  ],
};

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function middleware(req: NextRequest) {
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
            value: "",
            ...options,
          });
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  try {
    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Handle protected routes
    const isAuthRoute =
      req.nextUrl.pathname === "/sign-in" ||
      req.nextUrl.pathname === "/sign-up";
    const isProtectedRoute =
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/profile");
    const isProtectedApiRoute =
      req.nextUrl.pathname.startsWith("/api/") &&
      !req.nextUrl.pathname.startsWith("/api/auth");

    // Redirect authenticated users away from auth pages
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect unauthenticated users away from protected pages
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL("/sign-in", req.url);
      // Add the original URL as a parameter to redirect back after login
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Handle protected API routes
    if (!session && isProtectedApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return res;
  } catch (error) {
    // In case of any error, allow the request to continue
    // but don't expose sensitive information in production
    if (process.env.NODE_ENV === "development") {
      console.error("Middleware error:", error);
    }
    return res;
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/api/:path*",
    "/sign-in",
    "/sign-up",
  ],
};

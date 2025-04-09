import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  console.log("[DEBUG] Middleware executing for path:", req.nextUrl.pathname);

  try {
    // Refresh session if needed
    console.log("[DEBUG] Middleware - Parsed Cookies:", req.cookies);

    const authCookie = req.cookies.get("sb-auth-token")?.value;
    console.log("[DEBUG] Middleware - authCookie:", authCookie);

    if (authCookie) {
      try {
        // Decode base64 token before setting session
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: authCookie,
            refresh_token: "",
          });

          if (error) {
            console.error("[DEBUG] Failed to set session:", error);
            // Clear invalid session
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error("[DEBUG] Error setting session:", error);
          // Clear invalid session
          await supabase.auth.signOut();
        }
        console.log("[DEBUG] Middleware - setSession data:", data);
        console.log("[DEBUG] Middleware - setSession error:", error);
      } catch (error) {
        console.error("[DEBUG] Middleware - setSession error:", error);
      }
    }

    // Protected API routes
    if (req.nextUrl.pathname.startsWith("/api/")) {
    }

    // Protected pages
    if (
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/profile")
    ) {
      const redirectUrl = new URL("/sign-in", req.url);
      console.log("[DEBUG] Redirecting to:", redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Auth pages (when already authenticated)
    if (
      session &&
      (req.nextUrl.pathname === "/sign-in" ||
        req.nextUrl.pathname === "/sign-up")
    ) {
      console.log("[DEBUG] Redirecting authenticated user from auth page:", {
        path: req.nextUrl.pathname,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return res;
  } catch (error) {
    console.error("[DEBUG] Unexpected error in middleware:", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: req.nextUrl.pathname,
    });
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

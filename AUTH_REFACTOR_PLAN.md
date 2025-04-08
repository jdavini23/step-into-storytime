# Authentication Refactor Plan

**Project:** Step-into-Storytime

**Goal:** Refactor the authentication flow to address existing issues and improve security, scalability, and maintainability, with a focus on cookie management.

**New Architecture:**

*   Use `@supabase/ssr` for server-side authentication.
*   Use `supabase.auth.getSession()` in middleware to get the session.
*   Handle profile management with Supabase Functions (optional).
*   Implement secure cookie management.

**Step-by-Step Plan:**

1.  **Install `@supabase/ssr`:**
    ```bash
    npm install @supabase/ssr
    ```
2.  **Update `utils/supabase/server.ts`:**
    *   Remove `createServerSupabaseClient` and use `createServerClient` from `@supabase/ssr`.
    *   Update `getServerSession` to use the new client.
3.  **Update `middleware.ts`:**
    *   Remove manual session construction.
    *   Use `supabase.auth.getSession()` to get the session.
    *   Use `NextResponse.redirect` with the correct `redirect` URL.
4.  **Remove Client-Side Authentication Logic:**
    *   Remove the commented-out code in `lib/auth.ts`.
5.  **Review Profile Management:**
    *   Ensure that the `profiles` table is properly configured.
    *   Consider using Supabase Functions to handle profile creation and updates.
6.  **Implement Secure Cookie Management:**
    *   **Ensure proper cookie settings:**
        *   Set `secure: true` for cookies in production to ensure they are only sent over HTTPS.
        *   Set `httpOnly: true` to prevent client-side JavaScript from accessing the cookies.
        *   Set `sameSite: 'strict'` or `'lax'` to prevent CSRF attacks.
        *   Set an appropriate `domain` attribute to limit the cookie's scope to the application's domain.
        *   Set an `expires` or `maxAge` attribute to control the cookie's lifetime.
    *   **Use the `cookies` API from `next/headers` and `next/server` to manage cookies:**
        *   This API provides a secure and convenient way to set and get cookies in Next.js.
    *   **Verify cookie attributes:**
        *   Double-check that all cookies related to authentication have the correct attributes set.
7.  **Remove or Reduce Logging:**
    *   Remove or reduce the number of logging statements in production to improve performance and reduce noise.
8.  **Test Thoroughly:**
    *   Test all authentication flows (sign-up, sign-in, sign-out, password reset, etc.).
    *   Test route protection with middleware.
    *   Test profile management.
    *   **Verify cookie settings in the browser's developer tools.**
    *   **Test cookie behavior in different browsers and environments.**

**Mermaid Diagram (Optional):**

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Middleware
    participant Supabase

    User->Browser: Request Protected Route
    Browser->Middleware: Request
    Middleware->Supabase: Get Session (supabase.auth.getSession())
    alt Session Exists
        Supabase->Middleware: Session Data
        Middleware->Browser: Allow Request
        Browser->User: Render Page
    else Session Does Not Exist
        Supabase->Middleware: No Session
        Middleware->Browser: Redirect to Login
        Browser->User: Redirect to Login Page
    end
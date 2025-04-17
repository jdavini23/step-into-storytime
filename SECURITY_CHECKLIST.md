# Security Implementation Checklist

This document lists prioritized security recommendations for the Step-Into-Storytime app (Next.js, Supabase, AI integration). Follow this checklist to ensure best practices for frontend, backend, and infrastructure security.

---

## 🚨 Critical (Immediate Action)

1. **Enforce HTTPS Everywhere**  
   ✅ Completed
   - Ensure all deployments (Vercel/Netlify) use HTTPS; add HTTP→HTTPS redirects if needed.
2. **Never Expose API Keys in Frontend**  
   ✅ Completed
   - Confirm OpenAI/Supabase service keys are only in Edge Functions/server code. Never bundle in client.
3. **Input Validation and Sanitization**  
   ✅ Completed
   - Use Zod/Yup for all user input (forms, API payloads) on both client and server.
4. **Authentication and Authorization**  
   ✅ Completed
   - Double-check Supabase RLS policies and all API/Edge endpoints for auth checks. Enforce role-based access for all protected routes.
5. **No Sensitive Data in Browser**  
   ✅ Completed
   - Production code never stores tokens/PII in browser storage. Dev fallback uses localStorage only if Supabase is not configured.
6. **Proper Error Handling**
   - Never leak stack traces or sensitive info to users. Log errors server-side only.

---

## 🔶 High Priority (Should Be Done Soon)

7. **Rate Limiting**
   - Add rate limiting middleware to all API endpoints (especially story generation/narration).
8. **Basic Security Headers**
   - Add/verify X-Frame-Options, X-Content-Type-Options, and HSTS in Next.js config or middleware.
9. **Secure Cookies**
   - Set HttpOnly, Secure, SameSite=Strict attributes for all session/auth cookies.
10. **SQL Injection Prevention**
    - Ensure all DB access uses Supabase client/ORM; never raw SQL with user input.
11. **Keep Dependencies Updated**
    - Run `npm audit`, update patch/minor versions, document and schedule major upgrade needs.

---

## 🟠 Medium Priority (Plan for This Sprint)

12. **CSRF Protection**
    - For state-changing POSTs in API routes, use Next.js CSRF protection or validate origin/session.
13. **File Upload Security** (if/when file uploads are implemented)
    - Validate file types/sizes, scan for malware (use `file-type`, antivirus npm packages).
14. **Content Security Policy (CSP)**
    - Add CSP headers to restrict script/style/image sources.
15. **Session Expiration**
    - Set reasonable session timeouts in Supabase Auth.

---

## 🟢 Ongoing/Best Practices

16. **Logging & Monitoring**
    - Integrate Sentry, LogRocket, or Supabase logs for errors and suspicious activity.
17. **Accessibility & Security**
    - Continue large touch targets, keyboard navigation, ARIA, and regular aXe/lighthouse testing.
18. **Audit 3rd-Party Packages**
    - Regularly review and audit all npm dependencies for vulnerabilities.

---

## 📁 File & Route Mapping

Below is a mapping of each security checklist item to relevant files, directories, or route patterns in your codebase. Use this as a reference when implementing or auditing each security measure.

### 🚨 Critical (Immediate Action)

1. **Enforce HTTPS Everywhere**
   - Deployment config: `next.config.js`, Vercel/Netlify dashboard
   - Redirects: `public/_redirects` (Netlify), `next.config.js` (rewrites/redirects)
2. **Never Expose API Keys in Frontend**
   - Edge/server code: `/pages/api/`, `/app/api/`, `/supabase/functions/`, `.env` (never `.env.local` for secrets)
   - Check: No OpenAI/Supabase service keys in `/components/`, `/app/`, `/pages/`
3. **Input Validation and Sanitization**
   - Forms/components: `/components/`, `/app/story/create/`, `/app/profile/`, `/app/subscription/`
   - API validation: `/pages/api/`, `/app/api/`, `/supabase/functions/`
   - Validation schemas: `/lib/validation/`, `/utils/validation/` (if present)
4. **Authentication and Authorization**
   - Middleware: `/middleware.ts`, `/app/middleware.ts`
   - API/Edge: `/pages/api/`, `/app/api/`, `/supabase/functions/`
   - Supabase RLS: Supabase dashboard, `/database/` (if SQL scripts present)
   - Protected routes: `/app/dashboard/`, `/app/profile/`, `/app/story/[id]/`
5. **No Sensitive Data in Browser**
   - Session management: `/lib/auth/`, `/utils/auth/`, `/pages/_app.tsx`, `/app/layout.tsx`
   - Check usage: No sensitive data in `/components/`, `/app/`
6. **Proper Error Handling**
   - API/Edge: `/pages/api/`, `/app/api/`, `/supabase/functions/`
   - UI: `/components/`, `/app/` (error boundaries, user messages)
   - Logging: `/lib/logger/`, `/utils/logger/` (if present)

### 🔶 High Priority (Should Be Done Soon)

7. **Rate Limiting**
   - API/Edge: `/pages/api/`, `/app/api/`, `/supabase/functions/`
   - Middleware: `/middleware.ts` (global rate limiting)
8. **Basic Security Headers**
   - Config: `/next.config.js`, `/middleware.ts`
   - Custom headers: `/pages/_middleware.ts`, `/app/middleware.ts`
9. **Secure Cookies**
   - Session/auth: `/lib/auth/`, `/utils/auth/`, `/pages/api/auth/`, `/app/api/auth/`
10. **SQL Injection Prevention**
    - DB access: `/supabase/functions/`, `/lib/db/`, `/utils/db/`
    - Review all DB queries in Edge/API code
11. **Keep Dependencies Updated**
    - Dependencies: `package.json`, `package-lock.json`, `yarn.lock`

### 🟠 Medium Priority (Plan for This Sprint)

12. **CSRF Protection**
    - API routes: `/pages/api/`, `/app/api/`
    - Edge Functions: `/supabase/functions/`
    - Forms: `/components/`, `/app/` (if using traditional forms)
13. **File Upload Security** (if/when file uploads are implemented)
    - Upload endpoints: `/pages/api/upload`, `/app/api/upload`, `/supabase/functions/upload`
    - File handling: `/components/FileUpload.tsx`, `/lib/file/`, `/utils/file/`
14. **Content Security Policy (CSP)**
    - Headers: `/next.config.js`, `/middleware.ts`
15. **Session Expiration**
    - Auth config: `/lib/auth/`, `/utils/auth/`, `/pages/api/auth/`, `/app/api/auth/`
    - Supabase dashboard settings

### 🟢 Ongoing/Best Practices

16. **Logging & Monitoring**
    - Error logging: `/lib/logger/`, `/utils/logger/`, `/pages/api/`, `/app/api/`, `/supabase/functions/`
    - Monitoring config: Sentry/LogRocket integration files
17. **Accessibility & Security**
    - UI: `/components/`, `/app/` (ARIA, keyboard navigation, touch targets)
    - Testing: `/__tests__/`, `/e2e/`, accessibility test scripts
18. **Audit 3rd-Party Packages**
    - Dependencies: `package.json`, `package-lock.json`, `yarn.lock`

---

**Review and update this checklist regularly as new features and dependencies are added.**

**Use this mapping as a guide for secure implementation and regular security audits.**

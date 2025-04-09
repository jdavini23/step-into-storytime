// config/authRoutes.ts

/**
 * An array of routes that are accessible to the public.
 * These routes do not require authentication.
 * @type {string[]}
 */
export const publicRoutes: string[] = [
  '/', // Landing page
  '/sign-in', // Login page
  '/signup', // Sign up page (adjust if you don't have one)
  '/pricing', // Pricing page
  // Add any other public API routes or pages here, e.g.:
  // '/api/public-data',
];

/**
 * The default redirect path for users who are not logged in
 * and try to access a protected route.
 * @type {string}
 */
export const defaultRedirectPath: string = '/sign-in';

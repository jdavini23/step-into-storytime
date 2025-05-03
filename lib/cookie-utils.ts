'use client';

/**
 * Cookie utility functions for handling cookies safely in both client and server environments
 * with special handling for Supabase's base64-encoded cookies
 */

/**
 * Get a cookie value by name
 * @param name The name of the cookie to get
 * @returns The cookie value or undefined if not found
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  
  if (!cookie) return undefined;
  
  return cookie.split('=')[1];
}

/**
 * Set a cookie with the specified name, value, and options
 * @param name The name of the cookie
 * @param value The value of the cookie
 * @param options Cookie options (path, maxAge, domain, secure, sameSite)
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  if (typeof document === 'undefined') return;
  
  const {
    path = '/',
    maxAge = 60 * 60 * 24 * 365, // 1 year default
    domain = window.location.hostname,
    secure = window.location.protocol === 'https:',
    sameSite = 'lax',
  } = options;
  
  document.cookie = `${name}=${value}; path=${path}; max-age=${maxAge}; domain=${domain}; ${
    sameSite ? `samesite=${sameSite}; ` : ''
  }${secure ? 'secure; ' : ''}`;
}

/**
 * Remove a cookie by setting its expiration to the past
 * @param name The name of the cookie to remove
 * @param options Cookie options (path, domain, secure, sameSite)
 */
export function removeCookie(
  name: string,
  options: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  if (typeof document === 'undefined') return;
  
  const {
    path = '/',
    domain = window.location.hostname,
    secure = window.location.protocol === 'https:',
    sameSite = 'lax',
  } = options;
  
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}; ${
    sameSite ? `samesite=${sameSite}; ` : ''
  }${secure ? 'secure; ' : ''}`;
}

/**
 * Get all cookies as an object
 * @returns An object with all cookies
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  
  return document.cookie.split('; ').reduce((acc, curr) => {
    if (!curr) return acc;
    
    const [key, value] = curr.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Check if a cookie exists
 * @param name The name of the cookie to check
 * @returns True if the cookie exists, false otherwise
 */
export function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  
  return document.cookie.split('; ').some(c => c.startsWith(`${name}=`));
}

/**
 * Parse a cookie string safely, handling base64-encoded cookies
 * @param cookieString The cookie string to parse
 * @returns The parsed cookie value or the original string if parsing fails
 */
export function parseCookieValue(cookieString: string): any {
  if (!cookieString) return null;
  
  // If it's a base64-encoded cookie (like Supabase uses), don't try to parse it as JSON
  if (cookieString.startsWith('base64-')) {
    return cookieString;
  }
  
  try {
    return JSON.parse(cookieString);
  } catch (e) {
    // If parsing fails, return the original string
    return cookieString;
  }
}

/**
 * Get the current origin (protocol + hostname + port)
 * Safe to use in both client and server environments
 * @returns The current origin or an empty string if not in a browser
 */
export function getCurrentOrigin(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

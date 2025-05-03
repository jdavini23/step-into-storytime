'use client';

import { CookieOptions } from '@supabase/ssr';

/**
 * Safely parse a cookie value, handling base64-encoded cookies
 * @param cookieValue The cookie value to parse
 * @returns The parsed value or the original value if parsing fails
 */
export function safelyParseCookie(cookieValue: string | undefined): any {
  if (!cookieValue) return null;
  
  // If it's a base64-encoded cookie (like Supabase uses), don't try to parse it as JSON
  if (cookieValue.startsWith('base64-')) {
    return cookieValue;
  }
  
  try {
    return JSON.parse(cookieValue);
  } catch (e) {
    // If parsing fails, return the original string
    return cookieValue;
  }
}

/**
 * Create a custom cookie handler for Supabase that properly handles base64-encoded cookies
 * This prevents the "Failed to parse cookie string" errors
 */
export function createCustomCookieHandler() {
  return {
    get: (name: string): string | undefined => {
      if (typeof document === 'undefined') return undefined;
      
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`));
      
      if (!cookie) return undefined;
      
      const value = cookie.split('=')[1];
      
      // If it's a Supabase cookie (starts with 'sb-') or base64-encoded,
      // return it as is without trying to parse it as JSON
      if (name.startsWith('sb-') || value.startsWith('base64-')) {
        return value;
      }
      
      return value;
    },
    set: (name: string, value: string, options: CookieOptions): void => {
      if (typeof document === 'undefined') return;
      
      document.cookie = `${name}=${value}; path=${
        options.path || '/'
      }; max-age=${options.maxAge || 60 * 60 * 24 * 365}; domain=${
        options.domain || window.location.hostname
      }; ${options.sameSite ? `samesite=${options.sameSite}; ` : ''}${
        options.secure ? 'secure; ' : ''
      }`;
    },
    remove: (name: string, options: CookieOptions): void => {
      if (typeof document === 'undefined') return;
      
      document.cookie = `${name}=; path=${
        options.path || '/'
      }; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${
        options.domain || window.location.hostname
      }; ${options.sameSite ? `samesite=${options.sameSite}; ` : ''}${
        options.secure ? 'secure; ' : ''
      }`;
    },
  };
}

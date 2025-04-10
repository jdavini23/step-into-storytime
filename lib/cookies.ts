import { CookieOptions } from '@supabase/ssr';

export const cookieManager = {
  get(name: string): string | undefined {
    try {
      if (typeof window === 'undefined') return undefined;

      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`));

      if (!cookie) return undefined;

      const value = cookie.split('=')[1];
      return name.startsWith('sb-') ? value : decodeURIComponent(value);
    } catch (error) {
      console.error('[Cookies] Get error:', error);
      return undefined;
    }
  },

  getAll(): Record<string, string> {
    try {
      if (typeof window === 'undefined') return {};

      return document.cookie.split('; ').reduce((acc, curr) => {
        const [key, value] = curr.split('=');
        acc[key] = key.startsWith('sb-') ? value : decodeURIComponent(value);
        return acc;
      }, {} as Record<string, string>);
    } catch (error) {
      console.error('[Cookies] GetAll error:', error);
      return {};
    }
  },

  set(name: string, value: string, options: CookieOptions): void {
    try {
      if (typeof window === 'undefined') return;

      let cookieValue = name.startsWith('sb-')
        ? value
        : encodeURIComponent(value);
      let cookieString = `${name}=${cookieValue}; path=${options.path || '/'}`;

      if (options.domain) cookieString += `; domain=${options.domain}`;
      if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;
      if (options.secure) cookieString += '; secure';
      if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;

      document.cookie = cookieString;
    } catch (error) {
      console.error('[Cookies] Set error:', error);
    }
  },

  setAll(cookies: Record<string, string>, options?: CookieOptions): void {
    Object.entries(cookies).forEach(([name, value]) => {
      this.set(name, value, options || {});
    });
  },

  remove(name: string, options: CookieOptions): void {
    try {
      if (typeof window === 'undefined') return;

      document.cookie = `${name}=; path=${
        options.path || '/'
      }; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch (error) {
      console.error('[Cookies] Remove error:', error);
    }
  },
};

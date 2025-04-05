import { headers } from 'next/headers';

export async function getTemplateVariables() {
  try {
    // Try to get headers from server context
    const headersList = await headers();
    const pathname = headersList.get('x-var-original-pathname');

    // If we have the pathname in headers, use it
    if (pathname) {
      return {
        VAR_ORIGINAL_PATHNAME: pathname,
      };
    }

    // If we're on the client side or headers not available, use search params
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const pathFromParams = searchParams.get('VAR_ORIGINAL_PATHNAME');
      if (pathFromParams) {
        return {
          VAR_ORIGINAL_PATHNAME: pathFromParams,
        };
      }
    }

    // Fallback to environment variable
    return {
      VAR_ORIGINAL_PATHNAME: process.env.VAR_ORIGINAL_PATHNAME || '/',
    };
  } catch {
    // Final fallback
    return {
      VAR_ORIGINAL_PATHNAME: '/',
    };
  }
}

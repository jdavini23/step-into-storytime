import { headers } from 'next/headers';

export async function getTemplateVariables() {
  try {
    // Try to get headers from server context
    const headersList = await headers();
    return {
      VAR_ORIGINAL_PATHNAME: headersList.get('x-var-original-pathname') || '/',
    };
  } catch {
    // Fallback to environment variables
    return {
      VAR_ORIGINAL_PATHNAME: process.env.VAR_ORIGINAL_PATHNAME || '/',
    };
  }
}

import { headers } from 'next/headers';

export async function getTemplateVariables() {
  const headersList = await headers();

  return {
    VAR_ORIGINAL_PATHNAME: headersList.get('x-var-original-pathname') || '/',
  };
}

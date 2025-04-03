import { headers } from 'next/headers';
import getConfig from 'next/config';

export async function getTemplateVariables() {
  const headersList = await headers();
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

  return {
    VAR_ORIGINAL_PATHNAME:
      headersList.get('x-var-original-pathname') ||
      serverRuntimeConfig?.VAR_ORIGINAL_PATHNAME ||
      publicRuntimeConfig?.VAR_ORIGINAL_PATHNAME ||
      '/',
  };
}

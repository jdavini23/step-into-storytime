import { headers } from 'next/headers';
import getConfig from 'next/config';

export function getTemplateVariables() {
  return {
    VAR_ORIGINAL_PATHNAME: process.env.VAR_ORIGINAL_PATHNAME || '/',
  };
}

import { supabase } from './supabase';

/**
 * Fetch with Supabase Auth token attached as Bearer token.
 * Throws if user is not authenticated.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token)
    throw new Error('Not authenticated');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${data.session.access_token}`,
    },
  });
}

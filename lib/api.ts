import { supabase } from './supabase';

/**
 * DEPRECATED: Use fetchWithAuth from AuthProvider context instead.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  throw new Error(
    'DEPRECATED: Use fetchWithAuth from AuthProvider context via useAuth().'
  );
}

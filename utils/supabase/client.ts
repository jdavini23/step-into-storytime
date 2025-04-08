import supabase from '@/lib/supabase/client';

// Re-export the singleton instance
export function createClient() {
  return supabase;
}

export default supabase;

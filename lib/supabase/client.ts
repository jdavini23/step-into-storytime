// Simplified browser-specific Supabase client
import { createSupabaseClient } from '@/lib/supabase';

// Export the singleton instance
export const supabase = createSupabaseClient();

'use client';

// Simplified browser-specific Supabase client
import { createSupabaseClient } from '@/lib/supabase';

// Export the singleton instance
export const supabase = createSupabaseClient();

// Export a function to get the client
export const getClient = () => supabase;

export default supabase;

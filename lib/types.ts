import type { Database } from '@/types/supabase';

// Base story type from the database
export type Story = Database['public']['Tables']['stories']['Row'];

// Extended story data type for the UI
export interface StoryData {
  name: string;
  traits: string[];
  setting: string;
  theme: string;
  length: 'short' | 'medium' | 'long';
  generatedStory?: string;
  narrationUrl?: string;
}

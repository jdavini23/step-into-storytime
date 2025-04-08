import type { Database } from '@/types/supabase';

// Base story type from the database
export type Story = Database['public']['Tables']['stories']['Row'];

// Extended story data type for the UI
export interface StoryData {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  title: string;
  character: {
    name: string;
    description?: string;
  };
  setting: string;
  theme: string;
  plot_elements: string[];
  is_published: boolean;
  thumbnail_url: string | null;
  content: {
    en: string[];
    es: string[];
  };
  illustrations?: Array<{
    url: string;
    prompt: string;
    scene: string;
  }>;
}

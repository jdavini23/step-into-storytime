import { z } from 'zod';
import type { Database } from '@/types/supabase';
import type { Json } from '@/types/supabase';
import type { EducationalElement, StorySettings } from '@/lib/constants';

// Base story type from the database
export type Story = Omit<
  Database['public']['Tables']['stories']['Row'],
  'character'
> & {
  character?: Character;
  length?: StoryLength;
};

// UI story type with additional fields
export interface UIStory {
  id: string;
  title: string;
  content: string | { en: string[]; es: string[] };
  character: Story['character'];
  setting: string | null;
  theme: string | null;
  plot_elements: string[] | null;
  is_published: boolean;
  user_id: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  length?: StoryLength;
  illustrations?: { url: string; scene: string }[];
  branches?: Record<string, StoryBranch>;
  currentBranchId?: string;
}

// Character types
export const characterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z
    .string()
    .regex(/^\d+$/, 'Age must be a number')
    .transform(Number)
    .optional(),
  traits: z.array(z.string()).min(1, 'At least one trait is required'),
  appearance: z.string().optional(),
});

export type Character = z.infer<typeof characterSchema>;

// Story length types
export const lengthSchema = z.enum(['short', 'medium', 'long']);
export type StoryLength = z.infer<typeof lengthSchema>;

export const LENGTH_OPTIONS = {
  short: '5 minutes',
  medium: '10 minutes',
  long: '15 minutes',
} as const;

// Setting and theme validation
export const settingSchema = z.string().min(1, 'Setting is required');
export const themeSchema = z.string().min(1, 'Theme is required');

// Story metadata
export interface StoryMetadata {
  targetAge: number;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
  setting: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readingTime: number;
}

// Extended story interface for UI
export interface StoryData {
  id?: string;
  title?: string;
  content?: string;
  character?: Character;
  setting?: StorySettings;
  settingDescription?: string;
  theme?: string;
  length?: StoryLength;
  readingLevel?: 'beginner' | 'intermediate' | 'advanced';
  educationalElements?: EducationalElement[];
  is_published?: boolean;
  user_id?: string;
  thumbnail_url?: string | null;
  created_at?: string;
  updated_at?: string;
  illustrations?: { url: string; scene: string }[];
  branches?: Record<string, StoryBranch>;
  currentBranchId?: string;
  generatedStory?: string;
  narrationUrl?: string;
}

// Story generation options
export interface StoryGenerationOptions {
  title: string;
  character: Character;
  setting: string;
  theme: string;
  length: StoryLength;
}

// Story branch type
export interface StoryBranch {
  id: string;
  content: {
    en: string[];
    es: string[];
  };
  choices?: {
    text: string;
    nextBranchId: string;
  }[];
}

// Story paragraph type
export type ParagraphType = 'paragraph' | 'heading1' | 'heading2' | 'heading3';

export interface StoryParagraph {
  content: string;
  type: ParagraphType;
  index: number;
}

// Story prompt type for AI generation
export interface StoryPrompt {
  character: {
    name: string;
    age: string;
    traits: string[];
    appearance: string;
  };
  theme: string;
  setting: string;
  targetAge: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  language: 'en' | 'es';
  style?: 'adventure' | 'fantasy' | 'educational' | 'bedtime';
  educationalFocus?: string[];
}

// Font size options
export type FontSize = 'small' | 'medium' | 'large';

// Theme color options
export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

import { ReactNode } from 'react';

export type ParagraphType = 'paragraph' | 'heading1' | 'heading2' | 'heading3';
export type FontSize = 'small' | 'medium' | 'large';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;
  text: string;
}

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

export interface AccessibilitySettings {
  contrast: 'normal' | 'high';
  motionReduced: boolean;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: number;
}

type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Story {
  author: string;
  createdAt: number;
  illustrations: { url: string; scene: string }[] | undefined;
  prompt(prompt: any): unknown;
  id: string;
  title: string;
  description?: string;
  content: {
    en: string[];
    es: string[];
  };
  character: {
    name: string;
    age?: string;
    traits?: string[];
  };
  setting: string;
  theme: string;
  plot_elements?: string[];
  is_published: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string | null;
}

export interface StoryParagraph {
  content: string;
  type: ParagraphType;
  index: number;
}

// Constants
export const WORDS_PER_PAGE: Record<FontSize, number> = {
  small: 250,
  medium: 200,
  large: 150,
};

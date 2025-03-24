export type ParagraphType = 'paragraph' | 'heading1' | 'heading2' | 'heading3';
export type FontSize = 'small' | 'medium' | 'large';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface StoryMetadata {
  wordCount: number;
  readingTime: number;
  targetAge: number;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: string;
  setting: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessibilitySettings {
  contrast: 'normal' | 'high';
  motionReduced: boolean;
  fontSize: FontSize;
  lineHeight: number;
}

export interface StoryData {
  id: string;
  title: string;
  content: string;
  metadata: StoryMetadata;
  accessibility: AccessibilitySettings;
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

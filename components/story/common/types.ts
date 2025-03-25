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

export interface StoryData {
  id: string;
  userId: string;
  title: string;
  description: string;
  content: {
    en: string[];
    es: string[];
  };
  mainCharacter: {
    name: string;
    age: string;
    traits: string[];
    appearance: string;
  };
  setting: string;
  theme: string;
  plotElements: string[];
  targetAge: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
  metadata: StoryMetadata;
  accessibility: AccessibilitySettings;
}

export type Story = StoryData;

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

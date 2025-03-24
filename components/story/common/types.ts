// Theme types
export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;
  background: string;
  text: string;
}

// Story types
export interface StoryMetadata {
  theme: string;
  age: string;
  readingLevel: string;
  genre: string[];
  keywords: string[];
}

export interface Story {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  metadata: StoryMetadata;
  pages: string[];
}

// Component prop types
export interface AudioControlsProps {
  isPlaying: boolean;
  volume: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  themeColors: ThemeColors;
}

export interface NavigationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  themeColors: ThemeColors;
}

export interface ActionControlsProps {
  onDownload?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  themeColors: ThemeColors;
}

export interface StoryHeaderProps {
  title: string;
  author: string;
  date: string;
  theme: string;
  themeColors: ThemeColors;
}

// Font size type
export type FontSize = 'small' | 'medium' | 'large';

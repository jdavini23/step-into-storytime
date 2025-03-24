/** @jsxImportSource @emotion/react */
'use client';

import { useState, useMemo, useEffect, useRef, useCallback, useReducer } from 'react';
import { css } from '@emotion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import AnimatedStoryElement from './AnimatedStoryElement';
import ThemeOverlay from './ThemeOverlay';
import AmbientSoundPlayer from './AmbientSoundPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { storyPreviewStyles } from './StoryPreviewStyles';
import { themeColors } from './theme-colors';
import type { ThemeType } from './theme-colors';
import '@/styles/story-preview.css';

import {
  ArrowLeft,
  Download,
  Share2,
  Save,
  Edit,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

// Theme types and colors
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

const defaultTheme: ThemeColors = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
};

interface StoryMetadata {
  wordCount: number;
  readingTime: number;
  targetAge: number;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: ThemeType;
  setting: string;
  createdAt: string;
  updatedAt: string;
}

interface AccessibilitySettings {
  contrast: 'normal' | 'high';
  motionReduced: boolean;
  fontSize: FontSize;
  lineHeight: number;
}

interface StoryData {
  id: string;
  title: string;
  content: string;
  metadata: StoryMetadata;
  accessibility: AccessibilitySettings;
}

interface StoryPreviewProps {
  story: string;
  storyData: StoryData;
  onBack: () => void;
  onSave: () => Promise<void>;
}

type ParagraphType = 'paragraph' | 'heading1' | 'heading2' | 'heading3';
type FontSize = 'small' | 'medium' | 'large';

interface StoryParagraph {
  content: string;
  type: ParagraphType;
  index: number;
}

// State management
type PreviewAction = 
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_FONT_SIZE'; payload: FontSize }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'TOGGLE_AUTO_PLAY'; payload: boolean }
  | { type: 'SET_THEME'; payload: ThemeType };

interface PreviewState {
  currentPage: number;
  fontSize: FontSize;
  soundEnabled: boolean;
  autoPlayEnabled: boolean;
  theme: ThemeType;
}

const previewReducer = (state: PreviewState, action: PreviewAction): PreviewState => {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: action.payload };
    case 'TOGGLE_AUTO_PLAY':
      return { ...state, autoPlayEnabled: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

// Words per page based on font size
const WORDS_PER_PAGE: Record<FontSize, number> = {
  small: 250,
  medium: 200,
  large: 150,
};

export default function StoryPreview({
  story,
  storyData,
  onBack,
  onSave,
}: StoryPreviewProps) {
  const [activeTab, setActiveTab] = useState<'read' | 'edit'>('read');
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format story text to extract title and content
  const formatStoryText = useCallback(
    (text: string) => {
      if (!text) return { title: '', content: '' };

      const lines = text.split('\n');
      const firstLine = lines[0] || '';
      let title = '';
      let content = '';

      // If first line is a heading, use it as title
      if (firstLine.startsWith('#')) {
        const titleMatch = firstLine.match(/^(#+)\s*(.*)$/);
        if (titleMatch) {
          title = titleMatch[2].trim();
          content = lines.slice(1).join('\n').trim();
        }
      } else {
        // If no title is found, use the entire text as content
        content = text;
      }

      console.log('Extracted title:', title);
      console.log('Extracted content:', content);
      // Process content to ensure proper markdown formatting
      // Make sure headings have proper markdown syntax
      content = content
        .split('\n')
        .map(line => {
          // Ensure headings have proper space after # symbols
          if (line.startsWith('#')) {
            const match = line.match(/^(#+)(\S)/);
            if (match) {
              return `${match[1]} ${match[2]}${line.substring(match[0].length)}`;
            }
          }
          return line;
        })
        .join('\n');
      
      return { title, content };
    },
    []
  );

  // Use reducer for complex state management
  const [state, dispatch] = useReducer(previewReducer, {
    currentPage: 0,
    fontSize: 'medium',
    soundEnabled: false,
    autoPlayEnabled: false,
    theme: storyData?.metadata?.theme ?? 'friendship',
  });

  // Virtualization for performance
  const paragraphs = useMemo(() => {
    const formattedText = formatStoryText(story);
    
    interface ParagraphResult {
      content: string;
      type: ParagraphType;
      index: number;
    }

    const result: ParagraphResult[] = formattedText.content
      .split('\n')
      .filter((line: string) => line.trim() !== '') // Remove empty lines
      .map((content: string, index: number): ParagraphResult => {
      // Determine the type of content based on markdown syntax
      let type: ParagraphType = 'paragraph';
      if (content.startsWith('# ')) {
        type = 'heading1';
      } else if (content.startsWith('## ')) {
        type = 'heading2';
      } else if (content.startsWith('### ')) {
        type = 'heading3';
      }
      
      return {
        content,
        type,
        index,
      };
      });
    
    return result;
  }, [story, formatStoryText]);

  const virtualizer = useVirtualizer({
    count: paragraphs.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  // Accessibility hooks
  const a11yProps = useMemo(() => ({
    role: 'article',
    'aria-label': `Story: ${storyData.title}`,
    'aria-live': 'polite' as const,
    'aria-atomic': true,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        dispatch({ type: 'SET_PAGE', payload: state.currentPage + 1 });
      } else if (e.key === 'ArrowLeft') {
        dispatch({ type: 'SET_PAGE', payload: Math.max(0, state.currentPage - 1) });
      }
    },
  }), [state.currentPage, storyData.title]);

  // Theme colors based on story theme
  const currentThemeColors = useMemo((): ThemeColors => {
    const colors = themeColors[state.theme as keyof typeof themeColors];
    return colors || defaultTheme;
  }, [state.theme]);

  // Define CSS variables for theme colors
  const themeVariables = {
    '--primary-color': currentThemeColors.primary,
    '--secondary-color': currentThemeColors.secondary,
    '--accent-color': currentThemeColors.accent,
  } as React.CSSProperties;

  // Process story for PageTurner by splitting paragraphs
  const storyParagraphs = useMemo(() => {
    if (!story) return [];

    // Create paragraphs array starting with the title
    const paragraphs: StoryParagraph[] = [
      {
        content: formatStoryText(story).title || storyData?.title || 'Untitled Story',
        type: 'heading1',
        index: 0,
      },
    ];

    // Split remaining content into paragraphs
    const contentParagraphs = formatStoryText(story).content
      .split(/\n\n+/)
      .filter((p: string) => p.trim().length > 0)
      .map(
        (content: string, i: number): StoryParagraph => ({
          content: content.trim(),
          type: content.startsWith('#') ? 'heading1' : 'paragraph',
          index: i + 1,
        })
      );

    return [...paragraphs, ...contentParagraphs];
  }, [story, formatStoryText, storyData?.title]);

  // Split story into pages
  const storyPages = useMemo(() => {
    const wordsPerPage = WORDS_PER_PAGE[state.fontSize];
    const pages: StoryParagraph[][] = [];
    let currentPage: StoryParagraph[] = [];
    let wordCount = 0;

    storyParagraphs.forEach((paragraph) => {
      const paragraphWordCount = paragraph.content.split(/\s+/).length;

      // Always put title on its own page
      if (paragraph.type === 'heading1') {
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
        }
        pages.push([paragraph]);
        currentPage = [];
        wordCount = 0;
        return;
      }

      // Check if adding this paragraph would exceed the word limit
      if (wordCount + paragraphWordCount > wordsPerPage && currentPage.length > 0) {
        pages.push([...currentPage]);
        currentPage = [];
        wordCount = 0;
      }

      currentPage.push(paragraph);
      wordCount += paragraphWordCount;
    });

    // Add any remaining paragraphs
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }, [storyParagraphs, state.fontSize]);

  // Auto-advance pages
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.autoPlayEnabled) {
      interval = setInterval(() => {
        dispatch({ type: 'SET_PAGE', payload: state.currentPage + 1 });
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [state.autoPlayEnabled, state.currentPage]);

  // Handle saving
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
      setActiveTab('read');
    } catch (error) {
      console.error('Error saving story:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = async () => {
    try {
      await onBack();
    } catch (error) {
      console.error('Error navigating back:', error);
    }
  };

  const handleDownload = () => {
    // Create a blob with the story content
    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyData.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show fun animation for kid engagement
    playSuccessAnimation();
  };

  const handleShare = () => {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator
        .share({
          title: storyData.title,
          text: 'Check out this story I created with Step Into Storytime!',
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(
        'Sharing is not supported in your browser. You can copy the URL manually.'
      );
    }

    // Visual feedback when sharing
    playSuccessAnimation();
  };

  // Fun animation effect for successful actions
  const playSuccessAnimation = () => {
    if (containerRef.current) {
      const element = containerRef.current;
      element.classList.add('animate-wiggle');
      setTimeout(() => {
        element.classList.remove('animate-wiggle');
      }, 1000);
    }
  };

  // Toggle full screen for a more immersive reading experience
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Navigate between pages
  const goToNextPage = () => {
    const maxPage = storyPages.length - 1;
    if (state.currentPage < maxPage) {
      dispatch({ type: 'SET_PAGE', payload: state.currentPage + 1 });
    }
  };

  const goToPrevPage = () => {
    if (state.currentPage > 0) {
      dispatch({ type: 'SET_PAGE', payload: state.currentPage - 1 });
    }
  };

  // Get font size class based on current setting
  const getFontSizeClass = () => {
    switch (state.fontSize) {
      case 'small':
        return 'text-base md:text-lg';
      case 'large':
        return 'text-xl md:text-2xl';
      case 'medium':
      default:
        return 'text-lg md:text-xl';
    }
  };

  // Render ambient sound player with optional setting
  const renderAmbientSoundPlayer = () => {
    if (!storyData?.metadata?.setting) return null;
    return (
      <AmbientSoundPlayer
        theme={storyData.metadata.theme}
        setting={storyData.metadata.setting}
        isEnabled={state.soundEnabled}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className={`story-preview-container font-size-${state.fontSize}`}
      style={themeVariables}
      {...a11yProps}
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="story-content"
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const paragraph = paragraphs[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className={`story-paragraph responsive-text-${
                  paragraph.type === 'heading1' ? 'xl' : 'base'
                }`}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="story-heading-1"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="story-heading-2"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="story-heading-3"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className="story-paragraph"
                        {...props}
                      />
                    )
                  }}
                >
                  {paragraph.content}
                </ReactMarkdown>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div
        className="p-4 md:p-6 border-t flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${currentThemeColors.primary}10, ${currentThemeColors.secondary}20)`,
          borderTop: `2px solid ${currentThemeColors.primary}30`,
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {renderAmbientSoundPlayer()}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'TOGGLE_SOUND', payload: !state.soundEnabled })}
            className="hover:bg-slate-100"
          >
            {state.soundEnabled ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
            <span className="sr-only">{state.soundEnabled ? 'Mute' : 'Sound'}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="hidden md:flex items-center bg-white/90 hover:bg-white shadow-sm"
              style={{
                borderColor: currentThemeColors.accent,
                color: currentThemeColors.accent,
              }}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="hidden md:flex items-center bg-white/90 hover:bg-white shadow-sm"
              style={{
                borderColor: currentThemeColors.secondary,
                color: currentThemeColors.secondary,
              }}
            >
              <Share2 className="h-3.5 w-3.5 mr-1" />
              Share
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="relative overflow-hidden"
              style={{
                backgroundColor: currentThemeColors.primary,
                borderColor: currentThemeColors.primary,
              }}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Save Story
                </>
              )}
              {/* Sparkle effect on hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full hover:animate-shine" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile bottom controls */}
      <div className="md:hidden flex items-center justify-around p-3 border-t shadow-inner bg-white/80 backdrop-blur-sm">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center text-xs"
          onClick={handleDownload}
          style={{ color: currentThemeColors.accent }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white shadow-sm"
            style={{ border: `2px solid ${currentThemeColors.accent}20` }}
          >
            <Download className="h-5 w-5" />
          </div>
          Download
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center text-xs"
          onClick={handleShare}
          style={{ color: currentThemeColors.secondary }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white shadow-sm"
            style={{ border: `2px solid ${currentThemeColors.secondary}20` }}
          >
            <Share2 className="h-5 w-5" />
          </div>
          Share
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center text-xs"
          onClick={() => dispatch({ type: 'TOGGLE_AUTO_PLAY', payload: !state.autoPlayEnabled })}
          style={{ color: currentThemeColors.accent }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white shadow-sm"
            style={{ border: `2px solid ${currentThemeColors.accent}20` }}
          >
            <Zap className="h-5 w-5" />
          </div>
          {state.autoPlayEnabled ? 'Stop' : 'Auto'} Play
        </motion.button>
      </div>

      {/* CSS is now imported from /styles/story-preview.css */}
    </div>
  );
}

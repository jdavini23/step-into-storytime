/** @jsxImportSource @emotion/react */
'use client';

import { useReducer, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StoryData, ThemeColors, FontSize } from '../common/types';
import StoryHeader from '../common/StoryHeader';
import StoryText from '../common/StoryText';
import AudioControls from '../common/AudioControls';
import NavigationControls from '../common/NavigationControls';
import ActionControls from '../common/ActionControls';
import { formatStoryText } from './utils/formatters';
import { buttonVariants } from '@/components/ui/styles';

// Animation variants
const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// State management
type PreviewAction =
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_FONT_SIZE'; payload: FontSize }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'TOGGLE_AUTO_PLAY'; payload: boolean }
  | { type: 'SET_THEME'; payload: string };

interface PreviewState {
  currentPage: number;
  fontSize: FontSize;
  soundEnabled: boolean;
  autoPlayEnabled: boolean;
  theme: string;
}

const previewReducer = (
  state: PreviewState,
  action: PreviewAction
): PreviewState => {
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

interface PreviewContainerProps {
  story: string;
  storyData: StoryData;
  onBack?: () => void;
  onSave?: () => Promise<void>;
  themeColors: ThemeColors;
  className?: string;
}

export default function PreviewContainer({
  story,
  storyData,
  onBack,
  onSave,
  themeColors,
  className,
}: PreviewContainerProps) {
  const [state, dispatch] = useReducer(previewReducer, {
    currentPage: 0,
    fontSize: 'medium',
    soundEnabled: false,
    autoPlayEnabled: false,
    theme: storyData?.metadata?.theme ?? 'default',
  });

  const { paragraphs, totalPages } = formatStoryText(story);

  const handleDownload = useCallback(() => {
    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyData.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [story, storyData.title]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: storyData.title,
          text: 'Check out this story I created with Step Into Storytime!',
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      alert(
        'Sharing is not supported in your browser. You can copy the URL manually.'
      );
    }
  }, [storyData.title]);

  return (
    <motion.div
      {...fadeInOut}
      className={cn(
        'flex flex-col h-full bg-background rounded-lg shadow-lg overflow-hidden',
        'border border-border/50 transition-colors',
        'dark:bg-background/95 dark:border-border/30',
        className
      )}
    >
      <StoryHeader
        title={storyData.title}
        onBack={onBack}
        theme={state.theme}
        className="border-b border-border/10 bg-card/50"
      />

      <div className="flex-1 overflow-hidden relative">
        <StoryText
          paragraphs={paragraphs}
          themeColors={themeColors}
          fontSize={state.fontSize}
          className="prose dark:prose-invert max-w-none p-6"
        />
      </div>

      <div
        className={cn(
          'flex flex-col md:flex-row items-center justify-between gap-4 p-4',
          'border-t border-border/10 bg-card/50',
          'transition-colors'
        )}
      >
        <AudioControls
          isPlaying={state.autoPlayEnabled}
          onPlayPause={() =>
            dispatch({
              type: 'TOGGLE_AUTO_PLAY',
              payload: !state.autoPlayEnabled,
            })
          }
          onVolumeChange={(volume: number) =>
            dispatch({ type: 'TOGGLE_SOUND', payload: volume > 0 })
          }
          themeColors={themeColors}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'text-muted-foreground hover:text-foreground'
          )}
        />

        <NavigationControls
          currentPage={state.currentPage}
          totalPages={totalPages}
          onPrevious={() =>
            dispatch({ type: 'SET_PAGE', payload: state.currentPage - 1 })
          }
          onNext={() =>
            dispatch({ type: 'SET_PAGE', payload: state.currentPage + 1 })
          }
          themeColors={themeColors}
          className={cn('flex items-center gap-2', 'text-muted-foreground')}
        />

        <ActionControls
          onDownload={handleDownload}
          onShare={handleShare}
          onSave={onSave}
          showSave={!!onSave}
          themeColors={themeColors}
          className={cn(
            'flex items-center gap-2',
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'text-muted-foreground hover:text-foreground'
          )}
        />
      </div>
    </motion.div>
  );
}

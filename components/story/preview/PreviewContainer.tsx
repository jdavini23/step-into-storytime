/** @jsxImportSource @emotion/react */
'use client';

import { useReducer, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Story, ThemeColors, FontSize } from '@/components/story/common/types';
import { storyStyles } from '@/components/story/common/styles';
import StoryHeader from '@/components/story/common/StoryHeader';
import StoryText from '@/components/story/common/StoryText';
import AudioControls from '@/components/story/common/AudioControls';
import NavigationControls from '@/components/story/common/NavigationControls';
import ActionControls from '@/components/story/common/ActionControls';
import { formatStoryText } from './utils/formatters';

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

interface PreviewContainerProps {
  story: Story;
  themeColors: ThemeColors;
}

const initialState: PreviewState = {
  currentPage: 1,
  fontSize: 'medium',
  soundEnabled: true,
  autoPlayEnabled: false,
  theme: 'default'
};

export default function PreviewContainer({ story, themeColors }: PreviewContainerProps) {
  const [state, dispatch] = useReducer(previewReducer, initialState);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const handleFontSizeChange = useCallback((size: FontSize) => {
    dispatch({ type: 'SET_FONT_SIZE', payload: size });
  }, []);

  const handleSoundToggle = useCallback((enabled: boolean) => {
    dispatch({ type: 'TOGGLE_SOUND', payload: enabled });
  }, []);

  const handleAutoPlayToggle = useCallback((enabled: boolean) => {
    dispatch({ type: 'TOGGLE_AUTO_PLAY', payload: enabled });
  }, []);

  const formattedContent = formatStoryText(story.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      css={storyStyles(themeColors)}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <StoryHeader
        title={story.title}
        author={story.author}
        date={story.createdAt}
        theme={story.metadata.theme}
        themeColors={themeColors}
      />

      <main className="my-8">
        <StoryText
          content={formattedContent}
          fontSize={state.fontSize}
          themeColors={themeColors}
        />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AudioControls
            isPlaying={state.autoPlayEnabled}
            volume={70}
            onPlayPause={() => handleAutoPlayToggle(!state.autoPlayEnabled)}
            onVolumeChange={() => {}}
            themeColors={themeColors}
          />

          <NavigationControls
            currentPage={state.currentPage}
            totalPages={story.pages.length}
            onPrevious={() => handlePageChange(Math.max(1, state.currentPage - 1))}
            onNext={() => handlePageChange(Math.min(story.pages.length, state.currentPage + 1))}
            themeColors={themeColors}
          />

          <ActionControls
            themeColors={themeColors}
            onDownload={() => {/* TODO: Implement download */}}
            onShare={() => {/* TODO: Implement share */}}
            onSave={() => {/* TODO: Implement save */}}
          />
        </div>
      </footer>
    </motion.div>
  );
}

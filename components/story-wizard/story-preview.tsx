/** @jsxImportSource @emotion/react */
'use client';

import { useState } from 'react';
import { themeColors } from './theme-colors';
import type { ThemeType } from './theme-colors';
import type { StoryData } from '@/components/story/common/types';
import PreviewContainer from '@/components/story/preview/PreviewContainer';

interface StoryPreviewProps {
  story: string;
  storyData: StoryData;
  onBack: () => void;
  onSave: () => Promise<void>;
}

export default function StoryPreview({
  story,
  storyData,
  onBack,
  onSave,
}: StoryPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get theme colors
  const currentThemeColors = themeColors[storyData?.metadata?.theme as ThemeType] || themeColors.default;

  // Handle saving with loading state
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
    } catch (error) {
      console.error('Error saving story:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PreviewContainer
      story={story}
      storyData={storyData}
      onBack={onBack}
      onSave={handleSave}
      themeColors={currentThemeColors}
    />
  );
}

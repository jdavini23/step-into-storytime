'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import type { StoryData } from '@/components/story/common/types';
import {
  StoryContainer,
  StoryHeader,
  StoryHeaderLeft,
  StoryTitle,
  StoryContent,
  StoryParagraph,
  StoryControls,
} from './story-preview-components';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/styles';
import { getStoryPreviewClass } from './StoryPreviewStyles';

// Animation variants
const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

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

  const paragraphs = story.split('\n').filter(Boolean);

  // Common save button props
  const saveButtonProps = {
    onClick: handleSave,
    disabled: isSaving,
    className: cn(
      buttonVariants({ variant: 'default' }),
      'bg-primary hover:bg-primary/90 transition-colors'
    ),
  };

  return (
    <motion.div {...fadeInOut} className={getStoryPreviewClass('container')}>
      <div className={getStoryPreviewClass('header')}>
        <div className={getStoryPreviewClass('headerLeft')}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={cn(
              'text-muted-foreground hover:text-foreground transition-colors'
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Button {...saveButtonProps}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Story'}
        </Button>
      </div>

      <h1 className={getStoryPreviewClass('title')}>{storyData.title}</h1>

      <div className={getStoryPreviewClass('content')}>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={getStoryPreviewClass('paragraph')}>
            {paragraph}
          </p>
        ))}
      </div>

      <div className={getStoryPreviewClass('controls')}>
        <div className="flex justify-end w-full">
          <Button {...saveButtonProps}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Story'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

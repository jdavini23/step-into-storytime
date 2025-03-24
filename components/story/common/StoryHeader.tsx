/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storyStyles } from './styles';

interface StoryHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  theme?: string;
}

export default function StoryHeader({
  title,
  onBack,
  showBackButton = true,
  theme = 'default'
}: StoryHeaderProps) {
  return (
    <header css={storyStyles.header}>
      <div css={storyStyles.headerLeft}>
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline">Back</span>
          </Button>
        )}
        
        <div css={storyStyles.headerInfo}>
          <h1 css={storyStyles.title}>{title}</h1>
        </div>
      </div>
    </header>
  );
}

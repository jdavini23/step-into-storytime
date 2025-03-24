/** @jsxImportSource @emotion/react */
'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { storyStyles } from './styles';
import { ThemeColors } from './types';

interface NavigationControlsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  currentPage: number;
  totalPages: number;
  themeColors?: ThemeColors;
  className?: string;
}

export default function NavigationControls({
  onPrevious,
  onNext,
  currentPage,
  totalPages,
  themeColors,
  className = '',
}: NavigationControlsProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`} css={storyStyles.controls}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={currentPage <= 0}
        className="hover:bg-slate-100"
        style={themeColors ? {
          color: themeColors.secondary,
          '--hover-color': `${themeColors.secondary}10`,
        } as React.CSSProperties : undefined}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous page</span>
      </Button>

      <span className="text-sm text-slate-600">
        Page {currentPage + 1} of {totalPages}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={currentPage >= totalPages - 1}
        className="hover:bg-slate-100"
        style={themeColors ? {
          color: themeColors.secondary,
          '--hover-color': `${themeColors.secondary}10`,
        } as React.CSSProperties : undefined}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}

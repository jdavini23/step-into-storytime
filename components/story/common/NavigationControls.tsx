/** @jsxImportSource @emotion/react */
'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  className,
}: NavigationControlsProps) {
  const getThemeStyles = () => {
    if (!themeColors) return {};
    return {
      '--theme-secondary': themeColors.secondary,
      '--theme-hover': `${themeColors.secondary}10`,
    } as React.CSSProperties;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-2 rounded-lg',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
      style={getThemeStyles()}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={currentPage <= 0}
        className={cn(
          'hover:bg-muted transition-colors duration-200',
          themeColors && 'text-[--theme-secondary] hover:bg-[--theme-hover]'
        )}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous page</span>
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {currentPage + 1} of {totalPages}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={currentPage >= totalPages - 1}
        className={cn(
          'hover:bg-muted transition-colors duration-200',
          themeColors && 'text-[--theme-secondary] hover:bg-[--theme-hover]'
        )}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}

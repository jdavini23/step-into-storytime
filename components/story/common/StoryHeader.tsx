'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoryHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  theme?: string;
  className?: string;
}

export default function StoryHeader({
  title,
  onBack,
  showBackButton = true,
  theme = 'default',
  className,
}: StoryHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between py-4 px-6 border-b',
        theme === 'fantasy' && 'bg-story-fantasy/5 border-story-fantasy/10',
        theme === 'adventure' &&
          'bg-story-adventure/5 border-story-adventure/10',
        theme === 'mystery' && 'bg-story-mystery/5 border-story-mystery/10',
        className
      )}
    >
      <div className="flex items-center gap-4">
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

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
      </div>
    </header>
  );
}

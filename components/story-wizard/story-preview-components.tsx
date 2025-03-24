'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cardVariants } from '@/components/ui/styles';

interface StoryComponentProps {
  children: ReactNode;
  className?: string;
}

export const StoryContainer = ({
  children,
  className,
}: StoryComponentProps) => (
  <div
    className={cn(
      cardVariants({ variant: 'default' }),
      'min-h-[600px] overflow-hidden',
      'bg-gradient-to-r from-background to-background/50',
      'border-border',
      className
    )}
  >
    {children}
  </div>
);

export const StoryHeader = ({ children, className }: StoryComponentProps) => (
  <header
    className={cn(
      'flex justify-between items-center',
      'mb-6 p-4',
      'bg-background border-b border-border',
      className
    )}
  >
    {children}
  </header>
);

export const StoryHeaderLeft = ({
  children,
  className,
}: StoryComponentProps) => (
  <div className={cn('flex items-center gap-4', className)}>{children}</div>
);

export const StoryHeaderInfo = ({
  children,
  className,
}: StoryComponentProps) => (
  <div className={cn('flex flex-col gap-1', className)}>{children}</div>
);

export const StoryTitle = ({ children, className }: StoryComponentProps) => (
  <h1
    className={cn(
      'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
      'text-foreground',
      'px-6 mb-8',
      className
    )}
  >
    {children}
  </h1>
);

export const StoryMetadata = ({ children, className }: StoryComponentProps) => (
  <div
    className={cn(
      'flex items-center gap-4',
      'text-sm text-muted-foreground',
      className
    )}
  >
    {children}
  </div>
);

export const StoryContent = ({ children, className }: StoryComponentProps) => (
  <div
    className={cn(
      'px-6 py-4',
      'prose prose-slate dark:prose-invert',
      'max-w-none',
      className
    )}
  >
    {children}
  </div>
);

export const StoryParagraph = ({
  children,
  className,
}: StoryComponentProps) => (
  <p
    className={cn(
      'text-lg md:text-xl leading-relaxed',
      'text-foreground',
      'mb-6',
      className
    )}
  >
    {children}
  </p>
);

export const StoryControls = ({ children, className }: StoryComponentProps) => (
  <div
    className={cn(
      'sticky bottom-0',
      'flex items-center',
      'p-4 mt-8',
      'bg-background/80 backdrop-blur-sm',
      'border-t border-border',
      className
    )}
  >
    {children}
  </div>
);

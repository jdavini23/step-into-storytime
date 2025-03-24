import { css } from '@emotion/react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const storyPreviewVariants = {
  container: cva(
    cn(
      'relative rounded-xl shadow-lg border overflow-hidden min-h-[400px]',
      'bg-gradient-to-r from-background to-card'
    )
  ),

  header: cva(
    cn('flex justify-between items-center mb-6 p-4', 'bg-card border-b')
  ),

  headerLeft: cva('flex items-center gap-4'),

  headerInfo: cva('flex flex-col gap-2'),

  title: cva(
    cn(
      'font-display text-4xl leading-tight my-8 text-center',
      'text-foreground',
      'drop-shadow-sm transition-colors',
      'dark:text-foreground/90'
    )
  ),

  metadata: cva(cn('flex items-center gap-4 text-sm', 'text-muted-foreground')),

  content: cva(
    cn(
      'font-sans max-w-[65ch] mx-auto text-foreground p-8',
      'min-h-[60vh] relative flex flex-col',
      'dark:text-foreground/90'
    )
  ),

  paragraph: cva(
    cn(
      'text-lg leading-relaxed my-5 indent-8',
      'text-foreground/90 tracking-wide',
      'first:indent-0 first:text-xl first:leading-relaxed',
      'first:first-letter:text-5xl first:first-letter:font-display',
      'first:first-letter:float-left first:first-letter:mr-1',
      'first:first-letter:leading-none first:first-letter:pt-1',
      'dark:text-foreground/80'
    )
  ),

  pageNavigation: cva(
    cn('flex items-center justify-center gap-4', 'mt-auto pt-8 border-t')
  ),

  controls: cva('flex items-center gap-2'),

  tabButton: cva(cn('transition-colors', 'hover:bg-primary/20'), {
    variants: {
      isActive: {
        true: 'bg-primary/10 border-primary/30 text-primary',
        false: 'bg-transparent border-border text-muted-foreground',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }),

  tooltip: cva(
    cn(
      'absolute bg-popover p-2 rounded-md shadow-md z-50 text-xs',
      'text-popover-foreground border border-border'
    )
  ),
};

// Helper function to apply variants with type safety
export const getStoryPreviewClass = (
  variant: keyof typeof storyPreviewVariants,
  props?: Record<string, boolean | string | undefined>
) => {
  const variantFn = storyPreviewVariants[variant];
  return variantFn(props);
};

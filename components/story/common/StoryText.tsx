'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { StoryParagraph, ThemeColors, FontSize } from './types';

interface StoryTextProps {
  paragraphs: StoryParagraph[];
  themeColors: ThemeColors;
  fontSize?: FontSize;
  className?: string;
}

export default function StoryText({
  paragraphs,
  themeColors,
  fontSize = 'medium',
  className,
}: StoryTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: paragraphs.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-base md:text-lg';
      case 'large':
        return 'text-xl md:text-2xl';
      case 'medium':
      default:
        return 'text-lg md:text-xl';
    }
  };

  const getThemeStyles = () => {
    return {
      '--theme-primary': themeColors.primary,
      '--theme-secondary': themeColors.secondary,
      '--theme-accent': themeColors.accent,
    } as React.CSSProperties;
  };

  return (
    <div
      ref={containerRef}
      className={cn('h-full overflow-auto', className)}
      style={getThemeStyles()}
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-6"
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const paragraph = paragraphs[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className={cn(paragraph.type === 'heading1' ? 'mb-6' : 'mb-4')}
              >
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className={cn(
                          'text-3xl md:text-4xl font-bold mb-4 leading-tight',
                          'text-[--theme-primary] drop-shadow-sm'
                        )}
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className={cn(
                          'text-2xl md:text-3xl font-semibold mb-3 mt-6',
                          'text-[--theme-secondary]'
                        )}
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className={cn(
                          'text-xl md:text-2xl font-medium mb-2 mt-4',
                          'text-[--theme-accent]'
                        )}
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className={cn(
                          'mb-4 leading-relaxed',
                          getFontSizeClass()
                        )}
                        {...props}
                      />
                    ),
                  }}
                >
                  {paragraph.content}
                </ReactMarkdown>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

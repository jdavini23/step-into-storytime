'use client';

import { useState, useEffect, useCallback, useRef, TouchEvent } from 'react';
import {
  motion,
  AnimatePresence,
  AnimationControls,
  useAnimation,
} from 'framer-motion';
import type { StoryData } from '@/components/story/common/types';
import { cn } from '@/lib/utils';
import StoryTextRenderer from './StoryTextRenderer';
import AudioController from './AudioController';
import { useSoundEffects } from './SoundEffects';
import { InteractiveStoryErrorBoundary } from './ErrorBoundary';
import { usePerformanceMonitor } from './usePerformanceMonitor';

interface InteractiveStoryViewerProps {
  story: StoryData;
  className?: string;
}

export default function InteractiveStoryViewer({
  story,
  className,
}: InteractiveStoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const controls = useAnimation();
  // Split story content into pages (temporary implementation)
  const pages = story.content?.[language] || [];

  // Initialize sound effects
  const { handleWordEffect, playPageFlip } = useSoundEffects(volume, isMuted);
  const { getMetrics, trackInteractionStart, trackInteractionEnd } =
    usePerformanceMonitor();

  // Animation variants
  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    }),
  };

  const handlePageChange = useCallback(
    (direction: 'next' | 'prev') => {
      if (isAnimating) return;
      trackInteractionStart();
      setIsAnimating(true);

      setCurrentPage((prevPage) => {
        const newPage =
          direction === 'next'
            ? Math.min(prevPage + 1, pages.length - 1)
            : Math.max(prevPage - 1, 0);
        setActiveWordIndex(null);
        playPageFlip();
        return newPage;
      });

      setIsAnimating(false);
      trackInteractionEnd();
    },
    [
      isAnimating,
      pages.length,
      playPageFlip,
      setActiveWordIndex,
      trackInteractionStart,
      trackInteractionEnd,
    ]
  );

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const handleWordClick = useCallback(
    (word: string) => {
      trackInteractionStart();
      handleWordEffect(word);
      trackInteractionEnd();
    },
    [handleWordEffect, trackInteractionStart, trackInteractionEnd]
  );

  const handleWordHighlight = useCallback((index: number) => {
    setActiveWordIndex(index);
  }, []);

  // Log performance metrics periodically
  useEffect(() => {
    const logInterval = setInterval(() => {
      const metrics = getMetrics();
      console.debug('Story Viewer Performance:', metrics);
    }, 10000);

    return () => clearInterval(logInterval);
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;

    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Prevent vertical scrolling while swiping
    if (Math.abs(diff) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isSwiping) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Minimum swipe distance threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentPage < pages.length - 1) {
        handlePageChange('next');
      } else if (diff < 0 && currentPage > 0) {
        handlePageChange('prev');
      }
    }

    setIsSwiping(false);
  };

  return (
    <InteractiveStoryErrorBoundary>
      <div
        ref={containerRef}
        className={cn(
          'relative min-h-screen w-full max-w-4xl mx-auto',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75',
          'flex flex-col overflow-hidden touch-pan-y',
          'sm:rounded-lg sm:min-h-[80vh] sm:my-8'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-prose mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">{story.title}</h1>
              <div className="flex gap-2">
                {/* Language toggle buttons with responsive sizing */}
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md',
                    language === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={cn(
                    'px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md',
                    language === 'es'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  ES
                </button>
              </div>
            </div>

            {/* Story content with responsive text size */}
            <motion.div
              animate={controls}
              variants={pageVariants}
              initial="enter"
              onAnimationComplete={handleAnimationComplete}
            >
              <StoryTextRenderer
                text={pages[currentPage]}
                isActive={!isAnimating}
                onWordClick={handleWordClick}
                className="text-lg sm:text-xl leading-relaxed"
              />
            </motion.div>
          </div>
        </div>

        {/* Navigation controls with responsive spacing and sizing */}
        <div className="p-3 sm:p-4 flex justify-between items-center bg-gradient-to-t from-background to-transparent">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 0 || isAnimating}
            className={cn(
              'px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            Previous
          </button>

          <span className="text-sm sm:text-base text-muted-foreground">
            Page {currentPage + 1} of {pages.length}
          </span>

          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage === pages.length - 1 || isAnimating}
            className={cn(
              'px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            Next
          </button>
        </div>

        {/* Audio controls with responsive positioning */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative">
          <AudioController
            text={pages[currentPage]}
            language={language}
            onWordHighlight={handleWordHighlight}
            className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75"
          />
        </div>
      </div>
    </InteractiveStoryErrorBoundary>
  );
}

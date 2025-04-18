'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStory } from '@/contexts/story-context';
import Loading from '@/components/loading';
import StoryHeader from './story-header';
import { cn } from '@/lib/utils';
import type { Story } from '@/lib/types';
import styles from './story-content.module.css';
interface StoryContentProps {
  storyId: string;
  className?: string;
}

interface StoryContent {
  en: string[] | string;
  es: string[] | string;
}

export default function StoryContent({
  storyId,
  className,
}: StoryContentProps) {
  const { state, fetchStory } = useStory();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await fetchStory(storyId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        setIsLoading(false);
      }
    };

    loadStory();
  }, [storyId, fetchStory]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!state.currentStory) return <EmptyMessage message="Story not found" />;

  return <StoryDisplay className={className} />;
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-6 text-center">
      <p className="text-destructive">{message}</p>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="p-6 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function StoryDisplay({ className }: { className?: string }) {
  const { currentStory } = useStory().state;
  if (!currentStory) return null;

  const authorName = currentStory.character?.name
    ? `Created by ${currentStory.character.name}'s family`
    : 'Anonymous';

  let paragraphs: string[] = [];
  const rawContent = currentStory.content;

  // Helper function to split text into paragraphs
  const splitIntoParagraphs = (text: string) => {
    return text
      .split(/\\n|\n/) // Split on both escaped and regular line breaks
      .map((p) => p.trim())
      .filter(Boolean);
  };

  // Helper function to calculate reading time
  const calculateReadingTime = (text: string, wordsPerMinute = 150) => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // Handle potentially stringified content
  let readingText = '';
  if (typeof rawContent === 'string') {
    try {
      // Try to parse if it's a stringified object
      const parsed = JSON.parse(rawContent) as StoryContent;
      if (Array.isArray(parsed.en)) {
        paragraphs = parsed.en.flatMap((text) =>
          splitIntoParagraphs(text.toString())
        );
        readingText = parsed.en.join(' ');
      } else if (typeof parsed.en === 'string') {
        paragraphs = splitIntoParagraphs(parsed.en);
        readingText = parsed.en;
      }
    } catch (e) {
      // If parsing fails, treat it as plain text
      paragraphs = splitIntoParagraphs(rawContent);
      readingText = rawContent;
    }
  } else if (typeof rawContent === 'object' && rawContent !== null) {
    // Handle content that's already an object
    const storyContent = rawContent as StoryContent;
    if (Array.isArray(storyContent.en)) {
      paragraphs = storyContent.en.flatMap((text) =>
        splitIntoParagraphs(text.toString())
      );
      readingText = storyContent.en.join(' ');
    } else if (typeof storyContent.en === 'string') {
      paragraphs = splitIntoParagraphs(storyContent.en);
      readingText = storyContent.en;
    }
  }
  const readingTime = calculateReadingTime(readingText);

  return (
    <div
      className={cn(
        // Storybook card styles
        'rounded-3xl shadow-2xl border border-yellow-200',
        'bg-gradient-to-br from-yellow-50 via-amber-100 to-yellow-200',
        'parchment-texture', // Optional: add a custom class for a subtle texture if available
        'mx-auto w-full max-w-2xl',
        'transition-colors',
        'animate-fadein', // Gentle entrance animation
        'animate-pop-on-hover', // Playful pop on hover/tap
        className
      )}
      style={{
        // Optional: fallback parchment color if custom class is not available
        backgroundColor: '#fdf6e3',
        // Add a little extra padding for the storybook feel
        boxShadow: '0 8px 32px 0 rgba(100, 80, 30, 0.10)',
      }}
    >
      <div className="p-6 md:p-10">
        <StoryHeader
          title={currentStory.title}
          author={authorName}
          date={
            currentStory.created_at
              ? new Date(currentStory.created_at).toLocaleDateString()
              : ''
          }
          theme={currentStory.theme ?? ''}
          readingTimeMinutes={readingTime}
        />

        <div className="mt-8">
          <StoryIllustration
            title={currentStory.title}
            illustrations={(currentStory as any).illustrations}
          />
          <StoryText paragraphs={paragraphs} />
        </div>
      </div>
    </div>
  );
}

function StoryIllustration({
  title,
  illustrations,
}: {
  title: string;
  illustrations?: { url: string; scene: string }[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!illustrations || illustrations.length === 0) {
    return (
      <div
        className={cn(
          'relative h-64 md:h-96 mb-8 rounded-xl overflow-hidden',
          'shadow-md border border-border/10',
          'dark:border-border/5',
          'transition-colors'
        )}
      >
        <Image
          src="/placeholder.svg?height=400&width=800"
          alt={`Illustration for ${title}`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative h-64 md:h-96 mb-8 rounded-xl overflow-hidden',
        'shadow-md border border-border/10',
        'dark:border-border/5',
        'transition-colors'
      )}
    >
      {illustrations.map((illustration, index) => (
        <div
          key={illustration.url}
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Image
            src={illustration.url}
            alt={`Illustration ${index + 1} for ${title}`}
            fill
            className="object-cover"
          />
        </div>
      ))}

      {illustrations.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {illustrations.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex
                  ? 'bg-primary'
                  : 'bg-primary/30 hover:bg-primary/50'
              )}
              onClick={() => setCurrentIndex(index)}
              aria-label={`View illustration ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StoryText({ paragraphs }: { paragraphs: string[] }) {
  // Split text into paragraphs based on line breaks and sentence structure
  const formattedParagraphs = paragraphs.flatMap((paragraph) => {
    // Split on line breaks first
    return paragraph
      .split(/\\n/) // Handle escaped line breaks
      .flatMap((p) => p.split('\n')) // Handle regular line breaks
      .map((p) => p.trim())
      .filter(Boolean); // Remove empty strings
  });

  return (
    <article
      className={cn(
        'prose prose-lg max-w-none',
        'prose-headings:text-foreground',
        'prose-p:text-muted-foreground',
        'dark:prose-invert',
        'transition-colors',
        'text-xl md:text-2xl', // Larger font size
        'leading-relaxed md:leading-loose', // More line height
        'px-2 md:px-4 py-2', // Padding for comfort
        'max-h-[40vh] md:max-h-[60vh] overflow-y-auto', // Scrollable if long
        'animate-fadein', // Subtle fade-in animation
        styles['storybook-scrollbar'] // Custom scrollbar
      )}
      tabIndex={0} // Make scrollable area keyboard accessible
      aria-label="Story text"
    >
      {formattedParagraphs.map((paragraph, index) => (
        <p
          key={index}
          className={cn('mb-6', 'text-muted-foreground', 'transition-colors')}
        >
          {paragraph}
        </p>
      ))}
    </article>
  );
}

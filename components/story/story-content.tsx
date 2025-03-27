'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStory } from '@/contexts/story-context';
import Loading from '@/components/loading';
import StoryHeader from './story-header';
import { cn } from '@/lib/utils';

interface StoryContentProps {
  storyId: string;
  className?: string;
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

  const authorName =
    currentStory.author ||
    (currentStory.character?.name
      ? `Created by ${currentStory.character.name}'s family`
      : 'Anonymous');

  const paragraphs =
    typeof currentStory.content === 'string'
      ? (currentStory.content as string).split('\n').filter(Boolean)
      : Array.isArray(currentStory.content)
      ? currentStory.content
      : typeof currentStory.content === 'object' &&
        (currentStory.content as any)?.en
      ? (currentStory.content as any).en
      : [];

  return (
    <div
      className={cn(
        'bg-card rounded-xl shadow-lg',
        'border border-border/10',
        'dark:bg-card/95 dark:border-border/5',
        'transition-colors',
        className
      )}
    >
      <div className="p-6 md:p-10">
        <StoryHeader
          title={currentStory.title}
          author={authorName}
          date={new Date(
            currentStory.createdAt || Date.now()
          ).toLocaleDateString()}
          theme={currentStory.theme}
        />

        <div className="mt-8">
          <StoryIllustration
            title={currentStory.title}
            illustrations={currentStory.illustrations}
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
  return (
    <article
      className={cn(
        'prose prose-lg max-w-none',
        'prose-headings:text-foreground',
        'prose-p:text-muted-foreground',
        'dark:prose-invert',
        'transition-colors'
      )}
    >
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className={cn(
            'text-xl leading-relaxed mb-6',
            'text-muted-foreground',
            'transition-colors'
          )}
        >
          {paragraph}
        </p>
      ))}
    </article>
  );
}

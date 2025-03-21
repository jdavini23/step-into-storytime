'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStory } from '@/contexts/story-context';
import Loading from '@/components/loading';
import StoryHeader from './story-header';

interface StoryContentProps {
  storyId: string;
}

export default function StoryContent({ storyId }: StoryContentProps) {
  const { state, fetchStory } = useStory();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStory = async () => {
      try {
        setIsLoading(true);
        await fetchStory(storyId);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to load story'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadStory();
  }, [storyId, fetchStory]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!state.currentStory) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600">Story not found</p>
      </div>
    );
  }

  // Get author name from main character's name if author is not set
  const authorName =
    state.currentStory.author ||
    (state.currentStory.mainCharacter?.name
      ? `Created by ${state.currentStory.mainCharacter.name}'s family`
      : 'Anonymous');

  // Format the story content by splitting into paragraphs
  const paragraphs =
    state.currentStory.content?.split('\n').filter(Boolean) || [];

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 md:p-10">
        <StoryHeader
          title={state.currentStory.title}
          author={authorName}
          date={new Date(
            state.currentStory.createdAt || Date.now()
          ).toLocaleDateString()}
          theme={state.currentStory.theme}
        />

        <div className="mt-8">
          {/* Story illustration */}
          <div className="relative h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-md">
            <Image
              src="/placeholder.svg?height=400&width=800"
              alt={`Illustration for ${state.currentStory.title}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Story text */}
          <article className="prose prose-lg max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-xl leading-relaxed text-slate-800 mb-6"
              >
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}

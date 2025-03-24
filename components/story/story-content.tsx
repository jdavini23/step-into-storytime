'use client';

import { useEffect, useState } from 'react';
import { useStory } from '@/contexts/story-context';
import Loading from '@/components/loading';
import StoryHeader from './common/StoryHeader';
import AudioControls from './common/AudioControls';
import NavigationControls from './common/NavigationControls';
import ActionControls from './common/ActionControls';
import { themeColors } from '../story-wizard/theme-colors';
import type { ThemeType } from '../story-wizard/theme-colors';

interface StoryContentProps {
  storyId: string;
}

export default function StoryContent({ storyId }: StoryContentProps) {
  const { state, fetchStory } = useStory();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Since we've checked for null above, we can safely use currentStory here
  const { currentStory } = state;
  const currentThemeColors = themeColors[currentStory.metadata.theme as ThemeType] || themeColors.default;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StoryHeader
        title={currentStory.title}
        author={currentStory.author}
        date={currentStory.createdAt}
        theme={currentStory.metadata.theme}
        themeColors={currentThemeColors}
      />

      <main className="my-8">
        <div className="prose prose-lg max-w-none">
          {currentStory.content}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <AudioControls
            isPlaying={isPlaying}
            volume={volume}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onVolumeChange={setVolume}
            themeColors={currentThemeColors}
          />

          <NavigationControls
            currentPage={currentPage}
            totalPages={currentStory.pages.length}
            onPrevious={() => setCurrentPage(p => Math.max(1, p - 1))}
            onNext={() => setCurrentPage(p => Math.min(currentStory.pages.length, p + 1))}
            themeColors={currentThemeColors}
          />

          <ActionControls
            themeColors={currentThemeColors}
            onDownload={() => {/* TODO: Implement download */}}
            onShare={() => {/* TODO: Implement share */}}
            onSave={() => {/* TODO: Implement save */}}
          />
        </div>
      </footer>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-6 text-center">
      <p className="text-red-600">Error: {message}</p>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="p-6 text-center">
      <p className="text-slate-600">{message}</p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStory } from '@/contexts/story-context';
import Loading from '@/components/loading';
import { ErrorBoundary } from '@/components/error-boundary';
import BranchingStoryViewer from '@/components/story/interactive/BranchingStoryViewer';

interface InteractiveStoryPageProps {
  params: {
    storyId: string;
  };
}

export default function InteractiveStoryPage({
  params,
}: InteractiveStoryPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const storyId = routeParams?.storyId as string;
  const { state, fetchStory } = useStory();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) return;

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

  const handleStoryComplete = () => {
    router.push(`/story/${storyId}/complete`);
  };

  if (!storyId) return <div>Story not found</div>;
  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!state.currentStory) return <div>Story not found</div>;

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">
              {state.currentStory.title}
            </h1>
            <BranchingStoryViewer
              story={state.currentStory}
              onComplete={handleStoryComplete}
              className="mb-8"
            />
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}

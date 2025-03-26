import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Story, StoryBranch } from '@/contexts/story-context';
import InteractiveWord from './InteractiveWord';
import { processInteractiveText } from '@/lib/interactive-text-processor';
import useSound from 'use-sound';

interface BranchingStoryViewerProps {
  story: Story;
  onComplete?: () => void;
  className?: string;
}

export default function BranchingStoryViewer({
  story,
  onComplete,
  className,
}: BranchingStoryViewerProps) {
  const [currentBranch, setCurrentBranch] = useState<StoryBranch | null>(null);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  // Sound effects
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
  const [playMagic] = useSound('/sounds/magic.mp3', { volume: 0.4 });
  const [playTransition] = useSound('/sounds/transition.mp3', { volume: 0.3 });

  useEffect(() => {
    if (story.branches && Object.keys(story.branches).length > 0) {
      const startingBranchId =
        story.currentBranchId || Object.keys(story.branches)[0];
      setCurrentBranch(story.branches[startingBranchId]);
      setStoryHistory([startingBranchId]);
    }
  }, [story]);

  const handleWordInteraction = useCallback(
    (word: string, type: string) => {
      // Play appropriate sound effect
      if (type === 'magic') {
        playMagic();
      } else {
        playClick();
      }

      // Increment interaction counter
      setInteractionCount((prev) => prev + 1);
    },
    [playMagic, playClick]
  );

  const handleChoiceSelection = async (nextBranchId: string) => {
    if (!story.branches || isTransitioning) return;

    setIsTransitioning(true);
    playTransition();

    // Animate out current content
    await new Promise((resolve) => setTimeout(resolve, 500));

    const nextBranch = story.branches[nextBranchId];
    if (nextBranch) {
      setCurrentBranch(nextBranch);
      setStoryHistory((prev) => [...prev, nextBranchId]);
    }

    setIsTransitioning(false);
  };

  const handleGoBack = async () => {
    if (storyHistory.length <= 1 || isTransitioning) return;

    setIsTransitioning(true);
    playTransition();

    // Animate out current content
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newHistory = storyHistory.slice(0, -1);
    const previousBranchId = newHistory[newHistory.length - 1];

    if (story.branches && story.branches[previousBranchId]) {
      setCurrentBranch(story.branches[previousBranchId]);
      setStoryHistory(newHistory);
    }

    setIsTransitioning(false);
  };

  const renderInteractiveContent = (content: string) => {
    const { segments } = processInteractiveText(content);

    return (
      <div className="prose prose-lg max-w-none dark:prose-invert">
        {segments.map((segment, index) =>
          segment.isInteractive && segment.type ? (
            <InteractiveWord
              key={`${segment.text}-${index}`}
              word={segment.text}
              type={segment.type}
              onInteract={handleWordInteraction}
            />
          ) : (
            <span key={`text-${index}`}>{segment.text}</span>
          )
        )}
      </div>
    );
  };

  if (!currentBranch) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBranch.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Story Content */}
          <Card className="p-6">
            {renderInteractiveContent(currentBranch.content)}

            {/* Branch Illustration */}
            {currentBranch.illustration && (
              <div className="relative h-64 md:h-96 my-6 rounded-xl overflow-hidden">
                <Image
                  src={currentBranch.illustration.url}
                  alt={currentBranch.illustration.scene}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Choices */}
            {currentBranch.choices.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-semibold mb-4">
                  What happens next?
                </h3>
                <div className="grid gap-3">
                  {currentBranch.choices.map((choice) => (
                    <Button
                      key={choice.nextBranchId}
                      variant="outline"
                      className="w-full text-left justify-start h-auto py-3 px-4"
                      onClick={() => handleChoiceSelection(choice.nextBranchId)}
                      disabled={isTransitioning}
                    >
                      {choice.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                disabled={storyHistory.length <= 1 || isTransitioning}
              >
                Go Back
              </Button>

              {currentBranch.choices.length === 0 && (
                <Button
                  variant="default"
                  onClick={onComplete}
                  disabled={isTransitioning}
                >
                  Finish Story
                </Button>
              )}
            </div>

            {/* Interaction Counter */}
            <div className="mt-4 text-sm text-muted-foreground text-right">
              Discoveries: {interactionCount}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

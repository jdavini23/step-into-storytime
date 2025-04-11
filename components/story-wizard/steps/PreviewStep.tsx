'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStepManager } from '../StepManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Story, StoryPrompt, Character } from '@/lib/types';
import { storySettings } from '@/lib/constants';

interface PreviewStepProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
}

export default function PreviewStep({ onComplete, onError }: PreviewStepProps) {
  const { storyData, setStoryData, isGenerating, setIsGenerating, dispatch } =
    useStepManager();
  const [error, setError] = useState<string | null>(null);

  const setting = storyData.setting ? storySettings[storyData.setting] : null;

  const handleGenerateStory = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: {
            character: {
              name: storyData.character?.name || '',
              age: storyData.character?.age || 8,
              traits: storyData.character?.traits || [],
            },
            setting: storyData.setting || '',
            theme: storyData.theme || '',
            targetAge: 8,
            readingLevel: storyData.readingLevel || 'beginner',
            language: 'en',
            style: 'bedtime',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      const updatedStoryData = { ...storyData, ...data };
      setStoryData(updatedStoryData);
      onComplete(data as Story);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while generating the story';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {setting && (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {setting.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{setting.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </>
            )}
          </div>

          {storyData.character && (
            <div>
              <h3 className="font-semibold">Main Character</h3>
              <p>
                {storyData.character.name} -{' '}
                {storyData.character.traits.join(', ')}
                {storyData.character.age &&
                  ` - Age: ${storyData.character.age}`}
              </p>
            </div>
          )}

          {storyData.theme && (
            <div>
              <h3 className="font-semibold">Theme</h3>
              <p>{storyData.theme}</p>
            </div>
          )}

          {storyData.length && (
            <div>
              <h3 className="font-semibold">Story Length</h3>
              <p>{storyData.length}</p>
            </div>
          )}
        </div>
      </Card>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleGenerateStory} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Story'}
        </Button>
      </div>
    </motion.div>
  );
}

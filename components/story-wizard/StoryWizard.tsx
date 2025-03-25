'use client';

import { ChatContainer } from '../chat/ChatContainer';
import type { StoryData } from '../story/common/types';
import type { StoryDataState } from '../chat/types';
import { useState } from 'react';

interface StoryWizardProps {
  onComplete: (story: StoryData) => void;
  onError: (error: string) => void;
}

export default function StoryWizard({ onComplete, onError }: StoryWizardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStoryContent = async (storyData: StoryDataState): Promise<StoryData> => {
    // Convert StoryDataState to StoryData
    const story: StoryData = {
      id: Date.now().toString(),
      userId: '', // Will be set by the API
      title: `${storyData.character?.name}'s Adventure`,
      description: `A story about ${storyData.character?.name}`,
      content: {
        en: [''], // Will be populated by the API
        es: ['Translation will be added later...'],
      },
      targetAge: parseInt(storyData.character?.age || '6'),
      readingLevel: 'beginner',
      theme: storyData.theme || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mainCharacter: {
        name: storyData.character?.name || '',
        age: storyData.character?.age || '',
        traits: storyData.character?.traits || [],
        appearance: '',
      },
      setting: '',
      plotElements: [],
      metadata: {
        targetAge: parseInt(storyData.character?.age || '6'),
        difficulty: 'easy',
        theme: storyData.theme || '',
        setting: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: 0,
        readingTime: 0,
      },
      accessibility: {
        contrast: 'normal',
        motionReduced: false,
        fontSize: 'medium',
        lineHeight: 1.5,
      },
    };
    return story;
  };

  const handleComplete = async (storyData: StoryDataState) => {
    setLoading(true);
    setError(null);

    try {
      const story = await generateStoryContent(storyData);
      onComplete(story);
    } catch (err) {
      if (err instanceof Error) {
        setError('Failed to generate story. Please try again.');
        onError(err.message);
      } else {
        setError('An unexpected error occurred.');
        onError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Your Story</h1>
      {loading && <p>Generating story...</p>}
      {error && <p className="error">{error}</p>}
      <ChatContainer onComplete={handleComplete} onError={onError} />
    </div>
  );
}

'use client';

import { ChatContainer } from '../chat/ChatContainer';
import type { StoryData } from '../story/common/types';
import type { StoryDataState } from '../chat/types';

interface StoryWizardProps {
  onComplete: (story: StoryData) => void;
  onError: (error: string) => void;
}

export default function StoryWizard({ onComplete, onError }: StoryWizardProps) {
  const handleComplete = (storyData: StoryDataState) => {
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
    onComplete(story);
  };

  return <ChatContainer onComplete={handleComplete} onError={onError} />;
}

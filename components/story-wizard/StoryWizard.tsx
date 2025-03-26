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
      user_id: '', // Will be set by the API
      title: `${storyData.character?.name}'s Adventure`,
      description: `A story about ${storyData.character?.name}`,
      content: { en: [], es: [] }, // Will be populated by the API
      main_character: {
        name: storyData.character?.name || '',
        age: storyData.character?.age || '',
        traits: storyData.character?.traits || [],
      },
      setting: storyData.setting || null,
      theme: storyData.theme || null,
      plot_elements: [],
      is_published: false,
      thumbnail_url: null,
      targetAge: 0,
      readingLevel: 'beginner',
    };
    onComplete(story);
  };

  return <ChatContainer onComplete={handleComplete} onError={onError} />;
}

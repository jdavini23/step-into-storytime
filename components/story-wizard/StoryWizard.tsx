'use client';

import { ChatContainer } from '../chat/ChatContainer';
import type { Story } from '../story/common/types';
import type { StoryDataState } from '../chat/types';
import { useState } from 'react';

interface StoryWizardProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
}

export default function StoryWizard({ onComplete, onError }: StoryWizardProps) {
  const [storyData, setStoryData] = useState<StoryDataState>({
    character: {
      name: '',
      age: '',
      traits: [],
    },
    setting: '',
    theme: '',
    length: 'medium',
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ChatContainer onComplete={onComplete} onError={onError} />
    </div>
  );
}

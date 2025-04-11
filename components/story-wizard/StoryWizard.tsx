'use client';

import { ChatContainer } from '../chat/ChatContainer';
import type { Story } from '../story/common/types';
import type { StoryDataState } from '../chat/types';
import { useState } from 'react';
import {
  StepManagerProvider,
  StepManager as WizardStepManager,
  useStepManager,
  WIZARD_STEPS,
} from './StepManager';
import { WizardContainer, WizardContent } from './wizard-components';
import WelcomeStep from './steps/WelcomeStep';
import { CharacterStep } from './steps/CharacterStep';
import { SettingStep } from './steps/SettingStep';
import { ThemeStep } from './steps/ThemeStep';
import { LengthStep } from './steps/LengthStep';

interface StoryWizardProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
}

interface Character {
  name: string;
  age: string;
  traits: string[];
}

const DEFAULT_CHARACTER: Character = {
  name: '',
  age: '',
  traits: [],
};

type StoryLength = 'short' | 'medium' | 'long';

function WizardSteps({ onComplete, onError }: StoryWizardProps) {
  const { state, dispatch } = useStepManager();
  const [storyData, setStoryData] = useState<{
    character: Character;
    setting: string;
    theme: string;
    length: StoryLength;
  }>({
    character: DEFAULT_CHARACTER,
    setting: '',
    theme: '',
    length: 'medium',
  });

  const handleComplete = (storyData: StoryDataState) => {
    if (!storyData.character?.name) {
      onError('Character name is required');
      return;
    }

    // Transform StoryDataState into Story type
    const story: Story = {
      id: '', // Will be set by backend
      title: `${storyData.character.name}'s Adventure`,
      content: {
        en: [],
        es: [],
      },
      character: {
        name: storyData.character.name,
        age: storyData.character.age || '',
        traits: storyData.character.traits || [],
      },
      setting: storyData.setting || '',
      theme: storyData.theme || '',
      author: '', // Will be set by backend
      createdAt: Date.now(), // Current timestamp in milliseconds
      illustrations: undefined,
      prompt: () => {}, // Placeholder function
      is_published: false,
      user_id: '', // Will be set by backend
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      plot_elements: [],
      thumbnail_url: null,
    };
    onComplete(story);
  };

  const handleStepComplete = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleCharacterChange = (character: Character) => {
    setStoryData((prev) => ({ ...prev, character }));
    handleStepComplete();
  };

  const handleSettingChange = (setting: string) => {
    setStoryData((prev) => ({ ...prev, setting }));
    handleStepComplete();
  };

  const handleThemeChange = (theme: string) => {
    setStoryData((prev) => ({ ...prev, theme }));
    handleStepComplete();
  };

  const handleLengthChange = (length: StoryLength) => {
    setStoryData((prev) => ({ ...prev, length }));
    handleStepComplete();
  };

  // Render the current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 'WELCOME':
        return <WelcomeStep />;
      case 'CHARACTER':
        return (
          <CharacterStep
            character={storyData.character}
            onCharacterChange={handleCharacterChange}
          />
        );
      case 'SETTING':
        return (
          <SettingStep
            selectedSetting={storyData.setting}
            onSettingChange={handleSettingChange}
          />
        );
      case 'THEME':
        return (
          <ThemeStep
            selectedTheme={storyData.theme}
            onThemeChange={handleThemeChange}
          />
        );
      case 'LENGTH':
        return (
          <LengthStep
            selectedLength={storyData.length}
            onLengthChange={handleLengthChange}
          />
        );
      case 'PREVIEW':
        return <ChatContainer onComplete={handleComplete} onError={onError} />;
      default:
        return null;
    }
  };

  return <WizardContent>{renderStep()}</WizardContent>;
}

export default function StoryWizard(props: StoryWizardProps) {
  return (
    <StepManagerProvider>
      <WizardContainer className="w-full max-w-4xl mx-auto">
        <WizardStepManager>
          <WizardSteps {...props} />
        </WizardStepManager>
      </WizardContainer>
    </StepManagerProvider>
  );
}

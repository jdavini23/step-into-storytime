'use client';

import { useState } from 'react';
import WizardContainer from '../wizard-ui/WizardContainer';
import CharacterStep from '../wizard-ui/steps/CharacterStep';
import SettingStep from '../wizard-ui/steps/SettingStep';
import ThemeStep from '../wizard-ui/steps/ThemeStep';
import LengthStep from '../wizard-ui/steps/LengthStep';
import ConfettiCelebration from './ConfettiCelebration';
import type { Story } from '@/lib/types';

interface StoryWizardProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
}

const StoryWizard: React.FC<StoryWizardProps> = ({ onComplete, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  // API call for story generation
  const handleFinish = async (wizardData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: {
            character: wizardData.character,
            setting: wizardData.setting,
            theme: wizardData.theme,
            length: wizardData.length,
            readingLevel: 'beginner',
            language: 'en',
            style: 'bedtime',
          },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API error');
      }
      const story = await response.json();
      setLoading(false);
      setCelebrate(true);
      setTimeout(() => {
        setCelebrate(false);
        onComplete(story);
      }, 2600); // allow confetti to finish
    } catch (e: any) {
      setLoading(false);
      setError('Failed to generate story. Please try again.');
      onError(e.message || 'Failed to generate story.');
    }
  };

  return (
    <div className="relative">
      <WizardContainer
        steps={[
          <CharacterStep key="character" />,
          <SettingStep key="setting" />,
          <ThemeStep key="theme" />,
          <LengthStep key="length" />,
        ]}
        onFinish={handleFinish}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/60 z-50 rounded-xl">
          <div className="flex flex-col items-center gap-4">
            <span className="loader border-4 border-primary border-t-transparent rounded-full w-12 h-12 animate-spin"></span>
            <span className="text-primary font-semibold">
              Generating your story...
            </span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow">
          {error}
        </div>
      )}
      {celebrate && <ConfettiCelebration active={celebrate} />}
    </div>
  );
};

export default StoryWizard;

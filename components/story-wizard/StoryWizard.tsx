'use client';

import { useState, useEffect, useRef } from 'react';
import WizardContainer from '../wizard-ui/WizardContainer';
import CharacterStep from '../wizard-ui/steps/CharacterStep';
import SettingStep from '../wizard-ui/steps/SettingStep';
import ThemeStep from '../wizard-ui/steps/ThemeStep';
import LengthStep from '../wizard-ui/steps/LengthStep';
import ConfettiCelebration from './ConfettiCelebration';
import type { Story } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import type { WizardData } from '../wizard-ui/wizard-context';

interface StoryWizardProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
}

const StoryWizard: React.FC<StoryWizardProps> = ({ onComplete, onError }) => {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading]);

  // API call for story generation
  const handleFinish = async (wizardData: WizardData) => {
    setLoading(true);
    setError(null);
    console.log('[StoryWizard] handleFinish called with data:', wizardData);

    // Basic validation before sending
    if (
      !wizardData.character ||
      !wizardData.character.age ||
      !wizardData.length ||
      !wizardData.readingLevel
    ) {
      console.error(
        '[StoryWizard] Missing essential data for API call:',
        wizardData
      );
      setError(
        'Oops! Some required information is missing. Please go back and check.'
      );
      onError('Missing required information.');
      setLoading(false);
      return;
    }

    // Construct the payload more carefully based on our plan
    const payload = {
      character: wizardData.character,
      setting: wizardData.setting,
      theme: wizardData.theme,
      length: wizardData.length,
      readingLevel: wizardData.readingLevel,
    };

    console.log('[StoryWizard] Sending payload to API:', payload);

    try {
      // Use the specific wizardData fields to build the request
      const response = await fetchWithAuth('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[StoryWizard] API Error Response:', errorData);
        throw new Error(errorData.error || 'API error');
      }
      const story = await response.json();
      console.log('[StoryWizard] Story generated successfully:', story.id);
      setLoading(false);
      setCelebrate(true);
      setTimeout(() => {
        setCelebrate(false);
        onComplete(story);
      }, 2600); // allow confetti to finish
    } catch (e: any) {
      console.error('[StoryWizard] Error during story generation:', e);
      setLoading(false);
      // Provide more specific error message if possible
      const message = e.message?.includes('required information')
        ? e.message
        : 'Failed to generate story. Please try again.';
      setError(message);
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
          <div className="flex flex-col items-center gap-4 w-64">
            <span className="loader border-4 border-primary border-t-transparent rounded-full w-12 h-12 animate-spin"></span>
            <span className="text-primary font-semibold">
              {elapsed <= 10
                ? 'Generating your story...'
                : 'Still working... Thanks for your patience!'}
            </span>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  elapsed > 10 ? 'bg-yellow-400 animate-pulse' : 'bg-primary'
                }`}
                style={{ width: `${Math.min((elapsed / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-gray-600 dark:text-gray-300 text-sm">
              Estimated wait: ~10 seconds
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              Elapsed: {elapsed} second{elapsed === 1 ? '' : 's'}
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

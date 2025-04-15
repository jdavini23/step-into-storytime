'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepManagerProvider, useStepManager } from './StepManager';
import WelcomeStep from './steps/WelcomeStep';
import { CharacterStep } from './steps/CharacterStep';
import { StoryContextStep } from './steps/StoryContextStep';
import { EducationalStep } from './steps/EducationalStep';
import PreviewStep from './steps/PreviewStep';
import WizardProgress from './navigation/WizardProgress';
import type { Story } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface StoryWizardProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
}

function WizardContent({ onComplete, onError }: StoryWizardProps) {
  const { state, dispatch } = useStepManager();

  const getCurrentStep = () => {
    switch (state.currentStep) {
      case 'WELCOME':
        return <WelcomeStep />;
      case 'CHARACTER':
        return <CharacterStep />;
      case 'SETTING':
        return <StoryContextStep />;
      case 'THEME':
        return <EducationalStep />;
      case 'PREVIEW':
        return <PreviewStep onComplete={onComplete} onError={onError} />;
      default:
        return <WelcomeStep />;
    }
  };

  // Validation logic for navigation buttons (CharacterStep only for now)
  let canGoNext = true;
  if (state.currentStep === 'CHARACTER') {
    const char = state.storyData.character;
    canGoNext =
      !!char?.name &&
      !!char?.gender &&
      Array.isArray(char?.traits) &&
      char?.traits.length > 0;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <WizardProgress />
      <div className="min-h-[500px] max-h-[calc(100vh-6rem)] flex flex-col bg-white/30 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 p-6"
            >
              {getCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Modal Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-md border-t shadow-lg z-10 px-6 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'PREV_STEP' })}
              className="px-8 shadow-sm"
            >
              Back
            </Button>
            <Button
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              disabled={!canGoNext}
              className="px-8 shadow-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoryWizard(props: StoryWizardProps) {
  return (
    <StepManagerProvider>
      <WizardContent {...props} />
    </StepManagerProvider>
  );
}

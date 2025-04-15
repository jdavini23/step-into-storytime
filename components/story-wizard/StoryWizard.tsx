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

interface StoryWizardProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
}

function WizardContent({ onComplete, onError }: StoryWizardProps) {
  const { state } = useStepManager();

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <WizardProgress />
      <div className="min-h-[500px] relative bg-white/30 backdrop-blur-sm rounded-xl p-6 shadow-lg">
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

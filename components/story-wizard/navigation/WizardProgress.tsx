'use client';

import { motion } from 'framer-motion';
import { useStepManager } from '../StepManager';

const STEPS = [
  { id: 'WELCOME', label: 'Welcome', icon: '👋' },
  { id: 'CHARACTER', label: 'Character', icon: '🦸‍♂️' },
  { id: 'SETTING', label: 'Story Time', icon: '⏰' },
  { id: 'THEME', label: 'Learning', icon: '📚' },
  { id: 'PREVIEW', label: 'Preview', icon: '✨' },
];

export default function WizardProgress() {
  const { state, dispatch } = useStepManager();
  const currentStepIndex = STEPS.findIndex(
    (step) => step.id === state.currentStep
  );

  const handleStepClick = (stepId: string, index: number) => {
    if (index < currentStepIndex) {
      dispatch({ type: 'SET_STEP', payload: stepId as any });
    }
  };

  return (
    <div className="relative mb-8">
      {/* Progress Bar */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: '0%' }}
          animate={{
            width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step Indicators */}
      <div className="relative flex justify-between">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id, index)}
              disabled={index > currentStepIndex}
              className={`flex flex-col items-center ${
                index <= currentStepIndex
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed'
              }`}
            >
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                  ${
                    isComplete
                      ? 'bg-primary text-white'
                      : isCurrent
                      ? 'bg-primary/10 text-primary border-2 border-primary'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {step.icon}
              </motion.div>
              <span
                className={`mt-2 text-sm font-medium
                ${isComplete || isCurrent ? 'text-primary' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

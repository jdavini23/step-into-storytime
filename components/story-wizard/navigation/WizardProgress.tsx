'use client';

import { motion } from 'framer-motion';
import { useStepManager } from '../StepManager';
import { useRef } from 'react';

const STEPS = [
  { id: 'WELCOME', label: 'Welcome', icon: '👋' },
  { id: 'CHARACTER', label: 'Character', icon: '🦸‍♂️' },
  { id: 'SETTING', label: 'Story Time', icon: '⏰' },
  { id: 'THEME', label: 'Learning', icon: '📚' },
  { id: 'PREVIEW', label: 'Preview', icon: '✨' },
];

const MASCOT = '⭐'; // Replace with SVG/Lottie later

export default function WizardProgress() {
  const { state, dispatch } = useStepManager();
  const currentStepIndex = STEPS.findIndex(
    (step) => step.id === state.currentStep
  );
  const mascotRef = useRef<HTMLDivElement>(null);

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
        {/* Mascot animation */}
        <motion.div
          ref={mascotRef}
          className="absolute -top-7 left-0 z-10 text-3xl drop-shadow-lg"
          initial={false}
          animate={{
            x: `calc(${
              (currentStepIndex / (STEPS.length - 1)) * 100
            }% - 1.5rem)`,
            rotate: 0,
            scale: 1.1,
          }}
          transition={{
            x: { type: 'spring', stiffness: 200, duration: 0.5 },
            rotate: { type: 'tween', duration: 0.3, ease: 'easeInOut' },
            scale: { type: 'tween', duration: 0.3, ease: 'easeInOut' },
          }}
          aria-label="progress mascot"
        >
          {MASCOT}
        </motion.div>
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
              aria-label={`Go to step: ${step.label}`}
            >
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-4
                  ${
                    isComplete
                      ? 'bg-primary text-white border-primary shadow-lg'
                      : isCurrent
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-400 shadow-lg animate-glow'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}
                animate={{
                  scale: isCurrent ? [1, 1.2, 0.95, 1.1, 1] : 1,
                  boxShadow: isCurrent
                    ? '0 0 16px 4px #facc15, 0 0 8px 2px #fde68a'
                    : 'none',
                }}
                transition={{
                  scale: isCurrent
                    ? {
                        duration: 0.6,
                        type: 'tween',
                        ease: 'easeInOut',
                      }
                    : {
                        type: 'spring',
                        stiffness: 300,
                      },
                  boxShadow: {
                    duration: 0.6,
                    type: 'tween',
                    ease: 'easeInOut',
                  },
                }}
              >
                {step.icon}
              </motion.div>
              <span
                className={`mt-2 text-base font-bold
                ${isComplete || isCurrent ? 'text-primary' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 8px 2px #fde68a;
          }
          50% {
            box-shadow: 0 0 24px 8px #facc15;
          }
          100% {
            box-shadow: 0 0 8px 2px #fde68a;
          }
        }
        .animate-glow {
          animation: glow 1.2s infinite;
        }
      `}</style>
    </div>
  );
}

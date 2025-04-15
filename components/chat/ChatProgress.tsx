'use client';

import { cn } from '@/lib/utils';
import { STORY_STEPS, type StepId } from '@/lib/story-steps';

interface ChatProgressProps {
  currentStep: StepId;
}

interface StepGroup {
  title: string;
  titleColor: string;
  steps: StepId[];
}

const STEP_GROUPS: StepGroup[] = [
  {
    title: 'Character Creation',
    titleColor: 'text-[#81C784]',
    steps: ['character'],
  },
  {
    title: 'World Building',
    titleColor: 'text-[#FFB74D]',
    steps: ['setting'],
  },
  {
    title: 'Story Elements',
    titleColor: 'text-[#FF8A65]',
    steps: ['theme'],
  },
  {
    title: 'Finalization',
    titleColor: 'text-[#BA68C8]',
    steps: ['length', 'preview', 'complete'],
  },
];

export function ChatProgress({ currentStep }: ChatProgressProps) {
  return (
    <div className="space-y-8">
      {STEP_GROUPS.map((group) => (
        <div key={group.title} className="space-y-3">
          <h3 className={cn('text-sm font-medium', group.titleColor)}>
            {group.title}
          </h3>
          {group.steps.map((stepId) => {
            const step = STORY_STEPS[stepId];
            return (
              <div
                key={stepId}
                className={cn(
                  'flex items-center gap-4 pl-2',
                  currentStep === stepId && 'opacity-100',
                  currentStep !== stepId && 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium',
                    step.color,
                    'bg-white border-2',
                    currentStep === stepId
                      ? 'border-current'
                      : 'border-gray-200'
                  )}
                >
                  {group.steps.indexOf(stepId) + 1}
                </div>
                <span className={cn('text-sm font-medium', step.color)}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

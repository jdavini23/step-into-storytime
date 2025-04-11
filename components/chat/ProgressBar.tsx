import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConversationStep } from './types';

interface ProgressBarProps {
  currentStep: ConversationStep;
  className?: string;
}

const steps: { step: ConversationStep; label: string }[] = [
  { step: 'character_name', label: 'Name' },
  { step: 'character_traits', label: 'Traits' },
  { step: 'setting', label: 'Setting' },
  { step: 'theme', label: 'Theme' },
  { step: 'length', label: 'Length' },
];

export function ProgressBar({ currentStep, className }: ProgressBarProps) {
  const currentIndex = steps.findIndex((s) => s.step === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        {steps.map(({ step, label }) => (
          <div
            key={step}
            className={cn(
              'flex flex-col items-center',
              step === currentStep && 'text-primary font-medium'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center mb-1',
                step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {steps.findIndex((s) => s.step === step) + 1}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

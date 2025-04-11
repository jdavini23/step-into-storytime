import { cn } from '@/lib/utils';
import { steps } from './ChatSteps';
import type { StepNumber } from './ChatSteps';

interface ChatProgressProps {
  currentStep: StepNumber;
}

export function ChatProgress({ currentStep }: ChatProgressProps) {
  return (
    <div className="space-y-8">
      {/* Character Creation Group */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#81C784]">
          Character Creation
        </h3>
        {steps.slice(1, 4).map((step) => (
          <div
            key={step.number}
            className={cn(
              'flex items-center gap-4 pl-2',
              currentStep === step.number && 'opacity-100',
              currentStep !== step.number && 'opacity-50'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium',
                step.color,
                'bg-white border-2',
                currentStep === step.number
                  ? 'border-current'
                  : 'border-gray-200'
              )}
            >
              {steps.indexOf(step)}
            </div>
            <span className={cn('text-sm font-medium', step.color)}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Setting Group */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#FFB74D]">World Building</h3>
        {steps.slice(4, 5).map((step) => (
          <div
            key={step.number}
            className={cn(
              'flex items-center gap-4 pl-2',
              currentStep === step.number && 'opacity-100',
              currentStep !== step.number && 'opacity-50'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium',
                step.color,
                'bg-white border-2',
                currentStep === step.number
                  ? 'border-current'
                  : 'border-gray-200'
              )}
            >
              {steps.indexOf(step)}
            </div>
            <span className={cn('text-sm font-medium', step.color)}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Story Elements Group */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#FF8A65]">Story Elements</h3>
        {steps.slice(5, 7).map((step) => (
          <div
            key={step.number}
            className={cn(
              'flex items-center gap-4 pl-2',
              currentStep === step.number && 'opacity-100',
              currentStep !== step.number && 'opacity-50'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium',
                step.color,
                'bg-white border-2',
                currentStep === step.number
                  ? 'border-current'
                  : 'border-gray-200'
              )}
            >
              {steps.indexOf(step)}
            </div>
            <span className={cn('text-sm font-medium', step.color)}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Finalization Group */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#BA68C8]">Finalization</h3>
        {steps.slice(7).map((step) => (
          <div
            key={step.number}
            className={cn(
              'flex items-center gap-4 pl-2',
              currentStep === step.number && 'opacity-100',
              currentStep !== step.number && 'opacity-50'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium',
                step.color,
                'bg-white border-2',
                currentStep === step.number
                  ? 'border-current'
                  : 'border-gray-200'
              )}
            >
              {steps.indexOf(step)}
            </div>
            <span className={cn('text-sm font-medium', step.color)}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

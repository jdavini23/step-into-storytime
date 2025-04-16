import React, { useContext } from 'react';
import { WizardContext } from './wizard-context';
import { motion } from 'framer-motion';

const stepLabels = ['Character', 'Setting', 'Theme', 'Length'];

const WizardProgress: React.FC = () => {
  const { currentStep, isStepValid } = useContext(WizardContext);
  const totalSteps = stepLabels.length;
  const percent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {stepLabels[currentStep]}
        </span>
      </div>
      <div
        className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Progress: ${Math.round(percent)}%`}
      >
        <motion.div
          className="absolute left-0 top-0 h-2 bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isValid = isStepValid(index);

          return (
            <div
              key={label}
              className="flex flex-col items-center"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${isCompleted ? 'bg-indigo-500 scale-100' : ''}
                  ${
                    isCurrent
                      ? 'bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900'
                      : ''
                  }
                  ${
                    !isCompleted && !isCurrent
                      ? 'bg-gray-300 dark:bg-gray-600'
                      : ''
                  }
                  ${
                    !isValid && isCurrent
                      ? 'bg-red-500 ring-red-100 dark:ring-red-900'
                      : ''
                  }
                `}
              />
              <span
                className={`
                  text-xs mt-1 transition-colors duration-200
                  ${
                    isCurrent
                      ? 'text-indigo-700 dark:text-indigo-400 font-medium'
                      : ''
                  }
                  ${!isCurrent ? 'text-gray-500 dark:text-gray-400' : ''}
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardProgress;

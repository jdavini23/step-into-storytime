import React, { ReactNode, useContext, useEffect } from 'react';
import { WizardProvider, WizardContext } from './wizard-context';
import WizardProgress from './WizardProgress';
import WizardNavigation from './WizardNavigation';
import { motion, AnimatePresence } from 'framer-motion';

interface WizardContainerProps {
  steps: ReactNode[];
  onFinish?: (data: any) => void;
}

const DecorativeBackground = () => (
  <>
    {/* Top left star */}
    <svg
      aria-hidden="true"
      className="absolute top-2 left-2 w-8 h-8 opacity-30 text-yellow-200 pointer-events-none"
      fill="none"
      viewBox="0 0 32 32"
    >
      <path
        d="M16 2l3.09 9.26L28 12.27l-7 6.86L22.18 30 16 24.27 9.82 30 11 19.13l-7-6.86 8.91-1.01z"
        fill="currentColor"
      />
    </svg>
    {/* Bottom right moon */}
    <svg
      aria-hidden="true"
      className="absolute bottom-4 right-4 w-10 h-10 opacity-20 text-indigo-200 pointer-events-none"
      fill="none"
      viewBox="0 0 40 40"
    >
      <path
        d="M30 36c-8.837 0-16-7.163-16-16 0-4.418 1.79-8.418 4.686-11.314C11.316 10.686 8 16.045 8 22c0 8.837 7.163 16 16 16 5.955 0 11.314-3.316 13.314-8.686C38.418 34.21 34.418 36 30 36z"
        fill="currentColor"
      />
    </svg>
    {/* Sparkle right */}
    <svg
      aria-hidden="true"
      className="absolute top-10 right-12 w-6 h-6 opacity-25 text-pink-200 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 2v4M12 18v4M4 12h4M16 12h4M7.757 7.757l2.829 2.829M13.414 13.414l2.829 2.829M7.757 16.243l2.829-2.829M13.414 10.586l2.829-2.829"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full bg-white dark:bg-gray-800" />
      </div>
    </div>
  </div>
);

const WizardContainerInner: React.FC<WizardContainerProps> = ({
  steps,
  onFinish,
}) => {
  const { currentStep, canGoNext, data, goNext, goBack, isLoading } =
    useContext(WizardContext);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleFinish = () => {
    if (onFinish) onFinish(data);
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle navigation when not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowRight' && canGoNext && !isLastStep) {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft' && !isFirstStep) {
        e.preventDefault();
        goBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canGoNext, isLastStep, isFirstStep, goNext, goBack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-50 to-yellow-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <DecorativeBackground />
      <div
        className="w-full max-w-xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg flex flex-col gap-4 sm:gap-6 relative"
        role="dialog"
        aria-label="Story Creation Wizard"
      >
        <WizardProgress />
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoadingSpinner />
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex-1 min-h-[300px] flex flex-col justify-center"
            >
              {steps[currentStep]}
            </motion.div>
          )}
        </AnimatePresence>
        <WizardNavigation
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          canGoNext={canGoNext}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
};

const WizardContainer: React.FC<WizardContainerProps> = (props) => (
  <WizardProvider>
    <WizardContainerInner {...props} />
  </WizardProvider>
);

export default WizardContainer;

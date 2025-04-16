import React, { useContext } from 'react';
import { WizardContext } from './wizard-context';
import { motion } from 'framer-motion';

interface WizardNavigationProps {
  isLastStep: boolean;
  isFirstStep: boolean;
  canGoNext: boolean;
  onFinish?: () => void;
}

const SparkleSVG = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block ml-2 animate-sparkle">
    <g>
      <circle cx="11" cy="11" r="4" fill="#fffbe8" />
      <path d="M11 2v3M11 17v3M2 11h3M17 11h3M5.6 5.6l2.1 2.1M14.3 14.3l2.1 2.1M5.6 16.4l2.1-2.1M14.3 7.7l2.1-2.1" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  </svg>
);

const ArrowLeft = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12 16l-4-4 4-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const ArrowRight = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M8 16l4-4-4-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const WizardNavigation: React.FC<WizardNavigationProps> = ({ isLastStep, isFirstStep, canGoNext, onFinish }) => {
  const { goNext, goBack } = useContext(WizardContext);
  return (
    <div className="flex justify-between items-center mt-8 gap-4">
      <button
        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-gray-200 bg-white text-indigo-700 font-semibold shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={goBack}
        disabled={isFirstStep}
        aria-label="Go to previous step"
      >
        <ArrowLeft />
        Back
      </button>
      {isLastStep ? (
        <motion.button
          className="relative overflow-visible inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-yellow-200 via-pink-200 to-indigo-200 text-indigo-800 font-bold text-lg shadow-lg transition hover:from-yellow-300 hover:to-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onFinish}
          disabled={!canGoNext}
          aria-label="Finish story wizard"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="relative z-10 flex items-center">
            Generate Story
            <SparkleSVG />
          </span>
          {/* Animated sparkles */}
          <motion.span
            className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5], y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          >
            <SparkleSVG />
          </motion.span>
        </motion.button>
      ) : (
        <button
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-yellow-200 via-pink-200 to-indigo-200 text-indigo-800 font-bold text-lg shadow-lg transition hover:from-yellow-300 hover:to-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Go to next step"
        >
          Next
          <ArrowRight />
        </button>
      )}
    </div>
  );
};

export default WizardNavigation;

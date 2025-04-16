import React, { useContext } from 'react';
import { WizardContext } from './wizard-context';

const stepLabels = ['Character', 'Setting', 'Theme', 'Length'];

const WizardProgress: React.FC = () => {
  const { currentStep } = useContext(WizardContext);
  const totalSteps = stepLabels.length;
  const percent = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-indigo-700">Step {currentStep + 1} of {totalSteps}</span>
        <span className="text-xs text-gray-400">{stepLabels[currentStep]}</span>
      </div>
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-2 bg-gradient-to-r from-indigo-400 via-pink-400 to-yellow-300 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default WizardProgress;

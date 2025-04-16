import React, { useContext, ReactNode } from 'react';
import { WizardContext } from './wizard-context';

interface CoreStepManagerProps {
  children: ReactNode[];
}

const CoreStepManager: React.FC<CoreStepManagerProps> = ({ children }) => {
  const { currentStep } = useContext(WizardContext);
  return <div>{children[currentStep]}</div>;
};

export default CoreStepManager;

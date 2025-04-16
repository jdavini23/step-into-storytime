import React, { createContext, useState, ReactNode, useCallback } from 'react';

export interface WizardData {
  [key: string]: any;
}

export interface WizardContextProps {
  data: WizardData;
  updateData: (values: Partial<WizardData>) => void;
  currentStep: number;
  goNext: () => void;
  goBack: () => void;
  goTo: (index: number) => void;
  canGoNext: boolean;
  setCanGoNext: (valid: boolean) => void;
}

const defaultContext: WizardContextProps = {
  data: {},
  updateData: () => {},
  currentStep: 0,
  goNext: () => {},
  goBack: () => {},
  goTo: () => {},
  canGoNext: true,
  setCanGoNext: () => {},
};

export const WizardContext = createContext<WizardContextProps>(defaultContext);

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WizardData>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [canGoNext, setCanGoNext] = useState<boolean>(true);

  const updateData = (values: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...values }));
  };
  const goNext = () => setCurrentStep(prev => prev + 1);
  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const goTo = (index: number) => setCurrentStep(index);

  // Reset canGoNext to true on step change
  React.useEffect(() => {
    setCanGoNext(true);
  }, [currentStep]);

  return (
    <WizardContext.Provider value={{ data, updateData, currentStep, goNext, goBack, goTo, canGoNext, setCanGoNext }}>
      {children}
    </WizardContext.Provider>
  );
};

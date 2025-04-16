import React, {
  createContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

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
  errors: { [key: string]: string };
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  isStepValid: (step: number) => boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
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
  errors: {},
  setError: () => {},
  clearError: () => {},
  isStepValid: () => true,
  isLoading: false,
  setIsLoading: () => {},
};

export const WizardContext = createContext<WizardContextProps>(defaultContext);

const STORAGE_KEY = 'step_into_storytime_wizard_data';

export const WizardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize data from localStorage if available
  const [data, setData] = useState<WizardData>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [canGoNext, setCanGoNext] = useState<boolean>(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Persist data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const updateData = useCallback((values: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...values }));
  }, []);

  const goNext = useCallback(() => setCurrentStep((prev) => prev + 1), []);
  const goBack = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );
  const goTo = useCallback((index: number) => setCurrentStep(index), []);

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const isStepValid = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 0: // Character
          return Boolean(
            data.character?.name &&
              data.character?.gender &&
              !errors['character']
          );
        case 1: // Setting
          return Boolean(data.setting && !errors['setting']);
        case 2: // Theme
          return Boolean(data.theme && !errors['theme']);
        case 3: // Length
          return Boolean(data.length && !errors['length']);
        default:
          return true;
      }
    },
    [data, errors]
  );

  // Reset canGoNext to true on step change
  useEffect(() => {
    setCanGoNext(isStepValid(currentStep));
  }, [currentStep, isStepValid]);

  const contextValue = useMemo(
    () => ({
      data,
      updateData,
      currentStep,
      goNext,
      goBack,
      goTo,
      canGoNext,
      setCanGoNext,
      errors,
      setError,
      clearError,
      isStepValid,
      isLoading,
      setIsLoading,
    }),
    [
      data,
      updateData,
      currentStep,
      goNext,
      goBack,
      goTo,
      canGoNext,
      setCanGoNext,
      errors,
      setError,
      clearError,
      isStepValid,
      isLoading,
      setIsLoading,
    ]
  );

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};

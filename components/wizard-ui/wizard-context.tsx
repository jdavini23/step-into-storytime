import React, {
  createContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

// Define a more specific type for Wizard Data for better type safety
export interface CharacterData {
  name?: string;
  age?: number | '';
  gender?: string;
  traits?: string[];
}

// Export the type alias
export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WizardData {
  character?: CharacterData;
  setting?: string;
  theme?: string;
  length?: number; // 5, 10, 15
  readingLevel?: ReadingLevel;
  // Add other potential future fields here as optional
  [key: string]: any; // Keep index signature for flexibility if needed, but prefer explicit props
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
  data: { length: 5 }, // Default length to 5 as in LengthStep
  updateData: () => {},
  currentStep: 0,
  goNext: () => {},
  goBack: () => {},
  goTo: () => {},
  canGoNext: false, // Default to false until first step validation runs
  setCanGoNext: () => {},
  errors: {},
  setError: () => {},
  clearError: () => {},
  isStepValid: () => false,
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
    if (typeof window === 'undefined') return defaultContext.data; // Use default data server-side
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Merge saved data with defaults to ensure all keys exist if structure changes
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...defaultContext.data, ...parsed };
    } catch (e) {
      console.error('Failed to parse wizard data from localStorage', e);
      localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
      return defaultContext.data;
    }
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  // Initialize canGoNext based on the initial step and data
  // Initialize with default false, useEffect below will set the correct initial value.
  const [canGoNext, setCanGoNext] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Persist data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save wizard data to localStorage', e);
      }
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

  // Updated isStepValid function
  const isStepValid = useCallback(
    (step: number, currentData = data, currentErrors = errors): boolean => {
      switch (step) {
        case 0: // Character
          // Add check for age and traits as well, based on CharacterStep logic
          return Boolean(
            currentData.character?.name &&
              currentData.character?.gender &&
              currentData.character?.age && // Added age check
              Number(currentData.character.age) >= 2 &&
              Number(currentData.character.age) <= 12 &&
              currentData.character?.traits && // Added traits check
              currentData.character.traits.length > 0 &&
              !currentErrors['character.name'] && // Example of more specific error keys
              !currentErrors['character.age'] &&
              !currentErrors['character.gender'] &&
              !currentErrors['character.traits']
          );
        case 1: // Setting
          return Boolean(currentData.setting && !currentErrors['setting']);
        case 2: // Theme
          return Boolean(currentData.theme && !currentErrors['theme']);
        case 3: // Length & Reading Level
          return Boolean(
            currentData.length &&
              currentData.readingLevel && // Added readingLevel check
              !currentErrors['length'] &&
              !currentErrors['readingLevel']
          );
        default:
          // Assume subsequent steps (like preview/generate) are valid if prior ones are
          // Or add specific logic if needed
          return true;
      }
    },
    [data, errors] // Keep dependencies
  );

  // Update canGoNext whenever the relevant data for the current step changes
  // This effect will run after initial render and set the correct value
  useEffect(() => {
    setCanGoNext(isStepValid(currentStep, data, errors));
    // It might be better to run validation inside the specific step component
    // and call setCanGoNext from there, rather than relying on this effect.
  }, [currentStep, data, errors, isStepValid]);

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

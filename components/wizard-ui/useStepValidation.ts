import { useContext, useEffect } from 'react';
import { WizardContext } from './wizard-context';

export const useStepValidation = (
  validateFn: () => { isValid: boolean; error?: string },
  deps: any[] = []
) => {
  const { setCanGoNext, setError, clearError } = useContext(WizardContext);

  useEffect(() => {
    const { isValid, error } = validateFn();
    setCanGoNext(isValid);

    if (error) {
      setError('step', error);
    } else {
      clearError('step');
    }
  }, deps);
};

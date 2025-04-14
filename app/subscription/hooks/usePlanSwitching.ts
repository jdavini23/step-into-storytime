import { useState, useCallback } from 'react';
import { switchPlan as switchPlanApi } from '@/lib/api/subscription';
import { ERROR_MESSAGES } from '@/lib/constants/subscription';
import type { SubscriptionStatus } from '@/contexts/subscription-context';

interface UsePlanSwitchingResult {
  isSwitching: boolean;
  error: string | null;
  switchPlan: (productId: string) => Promise<void>;
  retry: () => void;
  optimisticTier: string | null;
}

export function usePlanSwitching(currentTier?: string): UsePlanSwitchingResult {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProductId, setLastProductId] = useState<string | null>(null);
  const [optimisticTier, setOptimisticTier] = useState<string | null>(null);

  const switchPlan = useCallback(async (productId: string) => {
    setIsSwitching(true);
    setError(null);
    setLastProductId(productId);
    setOptimisticTier(productId); // Optimistically update the tier
    try {
      await switchPlanApi(productId);
    } catch (err) {
      setError(ERROR_MESSAGES.switchFailed);
      setOptimisticTier(currentTier || null); // Rollback on error
    } finally {
      setIsSwitching(false);
    }
  }, [currentTier]);

  const retry = useCallback(() => {
    if (lastProductId) {
      switchPlan(lastProductId);
    }
  }, [lastProductId, switchPlan]);

  return {
    isSwitching,
    error,
    switchPlan,
    retry,
    optimisticTier,
  };
}

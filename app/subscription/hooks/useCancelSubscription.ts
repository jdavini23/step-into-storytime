import { useState, useCallback } from 'react';
import { cancelSubscription as cancelSubscriptionApi } from '@/lib/api/subscription';
import { ERROR_MESSAGES } from '@/lib/constants/subscription';
import type { SubscriptionStatus } from '@/contexts/subscription-context';

interface UseCancelSubscriptionResult {
  isCancelling: boolean;
  error: string | null;
  cancelSubscription: () => Promise<void>;
  retry: () => void;
  optimisticStatus: SubscriptionStatus | null;
}

export function useCancelSubscription(currentStatus: SubscriptionStatus): UseCancelSubscriptionResult {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useState<SubscriptionStatus | null>(null);
  const [attempted, setAttempted] = useState(false);

  const cancelSubscription = useCallback(async () => {
    setIsCancelling(true);
    setError(null);
    setOptimisticStatus('canceled');
    setAttempted(true);
    try {
      await cancelSubscriptionApi();
    } catch (err) {
      setError(ERROR_MESSAGES.cancelFailed);
      setOptimisticStatus(currentStatus); // Rollback
    } finally {
      setIsCancelling(false);
    }
  }, [currentStatus]);

  const retry = useCallback(() => {
    if (attempted) {
      cancelSubscription();
    }
  }, [attempted, cancelSubscription]);

  return {
    isCancelling,
    error,
    cancelSubscription,
    retry,
    optimisticStatus,
  };
}

import React from 'react';
import type { SubscriptionStatus } from '@/contexts/subscription-context';

interface StatusBannerProps {
  status: SubscriptionStatus;
  message?: string;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ status, message }) => {
  // TODO: Implement status banner UI
  // Accessibility: Use role alert for screen readers
  return <div role="alert">{message || status}</div>;
};

export default React.memo(StatusBanner);

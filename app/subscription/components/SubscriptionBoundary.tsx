import React from 'react';

interface SubscriptionBoundaryProps {
  isLoading: boolean;
  error?: string;
  children: React.ReactNode;
  onRetry?: () => void;
}

const SubscriptionBoundary: React.FC<SubscriptionBoundaryProps> = ({ isLoading, error, children, onRetry }) => {
  if (isLoading) return <div>Loading...</div>;
  if (error) return (
    <div>
      <div>Error: {error}</div>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
  return <>{children}</>;
};

export default SubscriptionBoundary;

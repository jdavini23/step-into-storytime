import React from 'react';
import type { Product, Price, SubscriptionStatus } from '@/contexts/subscription-context';

interface PlanCardProps {
  product: Product;
  price: Price;
  status: SubscriptionStatus;
  isCurrent: boolean;
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ product, price, status, isCurrent, onSelect }) => {
  // TODO: Implement plan card UI and logic
  return (
    <div>
      {/* Plan card content goes here */}
      <button onClick={onSelect} disabled={isCurrent} aria-pressed={isCurrent}>
        {isCurrent ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
};

export default React.memo(PlanCard);

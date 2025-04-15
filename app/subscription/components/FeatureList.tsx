import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Product } from '@/contexts/subscription-context';

interface FeatureListProps {
  plans: Product[];
  currentTier: string;
  PRICING_PLANS: Record<string, any>;
}

const FeatureList: React.FC<FeatureListProps> = ({ plans, currentTier, PRICING_PLANS }) => {
  // Find the plan matching current tier
  const currentPlan = plans.find((plan) => plan.tier === currentTier) || {
    tier: 'free',
    features: PRICING_PLANS.free.features,
  };

  // Ensure features is always an array of strings
  let features: string[] = [];
  if (Array.isArray(currentPlan.features)) {
    features = currentPlan.features.map((feature) =>
      typeof feature === 'string' ? feature : JSON.stringify(feature)
    );
  } else if (currentPlan.features) {
    if (typeof currentPlan.features === 'string') {
      features = [currentPlan.features];
    } else if (typeof currentPlan.features === 'object') {
      features = Object.entries(currentPlan.features).map(
        ([key, value]) => `${key}: ${value}`
      );
    }
  }

  return (
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
};

export default React.memo(FeatureList);

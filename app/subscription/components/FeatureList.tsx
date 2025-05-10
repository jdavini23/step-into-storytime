import React from 'react';
import { Check } from 'lucide-react';
import { FetchedPlan } from '@/contexts/subscription-context'; 
import { SubscriptionTier } from '@/types/subscription';

interface FeatureListProps {
  plans: FetchedPlan[]; 
  currentTier: string;
}

const FeatureList: React.FC<FeatureListProps> = ({ plans, currentTier }) => {
  const currentPlan = plans.find(plan => plan.metadata?.tier === currentTier);
  const freePlan = plans.find(plan => plan.metadata?.tier === 'free');

  const featuresToDisplay = currentPlan?.features || freePlan?.features || [];

  if (!featuresToDisplay.length) {
    return <p className="text-sm text-gray-500">No features listed for this plan.</p>;
  }

  return (
    <ul className="space-y-2">
      {featuresToDisplay.map((feature, index) => (
        <li key={index} className="flex items-center">
          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  );
};

export default FeatureList;

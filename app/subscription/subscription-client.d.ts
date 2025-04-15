interface PlanFeature {
  name: string;
}

interface UISubscriptionPlan {
  id: string;
  tier: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: PlanFeature[];
  is_popular: boolean;
}

interface SubscriptionClientProps {
  initialPlans: UISubscriptionPlan[];
}

declare const SubscriptionClient: React.FC<SubscriptionClientProps>;
export default SubscriptionClient;

export type PlanType = 'free' | 'unlimited' | 'family';

export type FeatureKey =
  | 'Unlimited story generations'
  | 'All genres + interactive stories'
  | 'Save and revisit stories'
  | 'Custom character creation'
  | 'Audio narration feature'
  | 'Available in 3 languages'
  | 'Download stories (PDF, audio)'
  | 'Up to 4 family profiles'
  | 'Shared family story library'
  | 'Parental content controls'
  | 'Profile-based preferences'
  | 'Weekly featured stories'
  | 'Priority support'
  | 'Early feature access'
  | '5 story generations per month'
  | 'Basic story genres'
  | 'English language only'
  | 'Basic character options'
  | '24-hour story access'
  | 'Web reading only'
  | 'Watermarked content';

export interface PricingState {
  isLoading: PlanType | null;
  error: string | null;
}

export interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  color: string;
  icon: React.ReactNode;
  accentColor: string;
  buttonColor: string;
  highlighted?: boolean;
  isLoading?: boolean;
  onButtonClick: () => void;
}

import { FeatureKey } from '@/types/pricing';

export const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  'Unlimited story generations':
    'Create as many unique stories as you want with no monthly limits',
  'All genres + interactive stories':
    'Access all story types including adventure, fantasy, and educational tales with branching narratives',
  'Save and revisit stories':
    'Keep your favorite stories forever in your personal library',
  'Custom character creation':
    'Design unique characters with specific traits, personalities, and appearances',
  'Audio narration feature':
    'Listen to your stories with high-quality AI voice narration',
  'Available in 3 languages':
    'Stories available in English, Spanish, and French',
  'Download stories (PDF, audio)':
    'Save stories offline in PDF format or as audio files',
  'Up to 4 family profiles':
    'Create separate profiles for up to 4 family members',
  'Shared family story library': 'Access all stories across family profiles',
  'Parental content controls':
    'Set age-appropriate content filters and monitor activity',
  'Profile-based preferences':
    'Customize story themes and complexity for each profile',
  'Weekly featured stories': 'Get access to new curated stories every week',
  'Priority support': '24/7 priority customer service',
  'Early feature access': 'Be the first to try new features and updates',
  '5 story generations per month': 'Create up to 5 unique stories every month',
  'Basic story genres':
    'Access to essential story types like bedtime and adventure',
  'English language only': 'Stories available in English',
  'Basic character options': 'Customize basic character traits',
  '24-hour story access': 'Stories available for 24 hours after generation',
  'Web reading only': 'Read stories on our website',
  'Watermarked content': 'Stories include a small watermark',
};

export const PRICING_PLANS = {
  free: {
    title: 'Free Plan',
    price: '0',
    period: 'month',
    description: 'Perfect for first-time users or casual storytellers',
    features: [
      '5 story generations per month',
      'Basic story genres',
      'English language only',
      'Basic character options',
      '24-hour story access',
      'Web reading only',
      'Watermarked content',
    ],
    buttonText: 'Get Started',
    color: 'bg-gray-100',
    accentColor: 'text-gray-600',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    highlighted: false,
  },
  unlimited: {
    title: 'Story Creator',
    price: '4.99',
    period: 'month',
    description: 'Ideal for solo parents and storytellers',
    features: [
      'Unlimited story generations',
      'All genres + interactive stories',
      'Save and revisit stories',
      'Custom character creation',
      'Audio narration feature',
      'Available in 3 languages',
      'Download stories (PDF, audio)',
    ],
    buttonText: 'Start Creating',
    color: 'bg-blue-100',
    accentColor: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    highlighted: true,
  },
  family: {
    title: 'Family Plan',
    price: '9.99',
    period: 'month',
    description: 'Perfect for multi-user households',
    features: [
      'Unlimited story generations',
      'All genres + interactive stories',
      'Save and revisit stories',
      'Custom character creation',
      'Audio narration feature',
      'Available in 3 languages',
      'Download stories (PDF, audio)',
      'Up to 4 family profiles',
      'Shared family story library',
      'Parental content controls',
      'Profile-based preferences',
      'Weekly featured stories',
      'Priority support',
      'Early feature access',
    ],
    buttonText: 'Start Family Stories',
    color: 'bg-purple-100',
    accentColor: 'text-purple-600',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    highlighted: false,
  },
};

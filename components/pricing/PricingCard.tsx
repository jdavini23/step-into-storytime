import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PricingCardProps, FeatureKey } from '@/types/pricing';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

const ALL_POSSIBLE_FEATURES: FeatureKey[] = [
  '5 story generations per month',
  'Basic story genres',
  'English language only',
  'Basic character options',
  '24-hour story access',
  'Web reading only',
  'Watermarked content',
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
];

const FEATURE_DESCRIPTIONS_MAP: Record<FeatureKey, string> = {
  '5 story generations per month': 'Create up to 5 stories each month.',
  'Basic story genres': 'Access to core story genres.',
  'English language only': 'Stories generated only in English.',
  'Basic character options': 'Limited options for character customization.',
  '24-hour story access': 'Generated stories are available for 24 hours.',
  'Web reading only': 'Read stories directly on the website.',
  'Watermarked content': 'Generated stories may contain a watermark.',
  'Unlimited story generations': 'Create as many stories as you like!',
  'All genres + interactive stories': 'Access all available genres, including interactive story formats.',
  'Save and revisit stories': 'Save your favorite stories to your personal library.',
  'Custom character creation': 'Full options for creating unique characters.',
  'Audio narration feature': 'Listen to your stories with generated audio narration.',
  'Available in 3 languages': 'Generate stories in English, Spanish, and French.',
  'Download stories (PDF, audio)': 'Download stories as PDF documents or audio files.',
  'Up to 4 family profiles': 'Create and manage profiles for up to 4 family members.',
  'Shared family story library': 'Access a shared library of stories across family profiles.',
  'Parental content controls': 'Set content filters and controls for child profiles.',
  'Profile-based preferences': 'Save individual preferences for each profile.',
  'Weekly featured stories': 'Access exclusive featured stories each week.',
  'Priority support': 'Get faster responses from our support team.',
  'Early feature access': 'Be the first to try new features.',
};

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  color,
  icon,
  accentColor,
  buttonColor,
  highlighted = false,
  isLoading = false,
  onButtonClick,
  tier,
}: PricingCardProps) {
  const router = useRouter();
  // Initialize Supabase client using useState, removing empty generic type
  const [supabase] = useState(() => createClientComponentClient());

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true); // State to track initial auth check

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error.message);
        }
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Unexpected error fetching session:', error);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUserSession();
  }, [supabase]); // Re-run if supabase client instance changes (though unlikely)

  const handleCheckout = async () => {
    if (checkingAuth) {
      console.log('Still checking authentication state...');
      return;
    }

    if (!user) {
      console.log('User not logged in, redirecting to /sign-in');
      router.push('/sign-in?redirect=/pricing');
      return;
    }

    console.log('User logged in, proceeding with checkout for tier:', tier);
    console.log(`User ID: ${user.id}`);

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to initiate checkout';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Checkout API Error Response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Failed to initiate checkout (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }

      console.log(
        'Checkout initiated successfully. API should handle redirect.',
      );
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message);
    }
  };

  return (
    <div
      role="listitem"
      aria-label={`${title} Plan`}
      className={`relative ${highlighted ? 'mt-6' : ''}`}
    >
      {highlighted && (
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-violet-600 text-white px-6 py-1.5 rounded-full text-sm font-semibold shadow-lg shadow-violet-200/50 z-10 animate-bounce-subtle ring-2 ring-violet-200"
          aria-label="Popular plan badge"
        >
          Popular
        </div>
      )}
      <div
        className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-violet-500 ${
          highlighted ? 'ring-2 ring-violet-500 shadow-2xl' : 'shadow-xl'
        }`}
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCheckout();
          }
        }}
      >
        <div
          className={`${color} p-6 text-center border-b ${accentColor} transition-colors duration-300`}
        >
          <div
            className="mx-auto bg-white rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-md"
            aria-hidden="true"
          >
            {icon}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-slate-900">{price}</span>
            {period && (
              <span
                className="text-slate-600"
                aria-label={`per ${period.replace('/', '')}`}
              >
                {period}
              </span>
            )}
          </div>
          <p className="text-slate-600 mb-4">{description}</p>
        </div>
        <div className="bg-white p-6">
          <ul
            className="space-y-3 mb-6"
            role="list"
            aria-label={`${title} plan features`}
          >
            {ALL_POSSIBLE_FEATURES.map((featureName) => {
              const isIncluded = features.includes(featureName);

              return (
                <li
                  key={featureName}
                  className="flex items-start text-slate-700 relative group"
                  role="listitem"
                >
                  <div
                    className={`h-5 w-5 rounded-full ${
                      isIncluded ? 'bg-green-100' : 'bg-red-100'
                    } flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 transition-colors duration-200`}
                    aria-hidden="true"
                  >
                    {isIncluded ? (
                      <CheckIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <XMarkIcon className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`text-left text-sm ${
                          isIncluded
                            ? 'text-slate-700 hover:text-violet-700'
                            : 'text-slate-400 line-through'
                        } cursor-help transition-colors duration-200`}
                      >
                        {featureName}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="z-50 bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 max-w-[250px]"
                    >
                      <p className="text-sm text-slate-700">
                        {FEATURE_DESCRIPTIONS_MAP[featureName]}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
          <Button
            className={`w-full ${buttonColor} text-white relative transition-all duration-200`}
            onClick={handleCheckout}
            disabled={checkingAuth || isLoading}
            aria-label={`Choose ${title} plan`}
          >
            {checkingAuth
              ? 'Checking...'
              : isLoading
                ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  )
                : buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}

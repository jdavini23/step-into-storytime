'use client';

import { useRouter } from 'next/navigation';
import { Crown, Wand2, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

type PlanType = 'free' | 'unlimited' | 'family';

interface PricingCardProps {
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
  onButtonClick: () => void;
}

export default function PricingSection() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const selectedPlan: PlanType | null = null; // Placeholder for selected plan

  const handlePricingButtonClick = (plan: PlanType) => {
    if (authState.isAuthenticated) {
      // If user is logged in, take them to a subscription page
      router.push(`/subscription?plan=${plan}`);
    } else {
      // If user is not logged in, take them to sign up
      router.push(`/sign-up?plan=${plan}`);
    }
  };

  return (
    // Fix responsive issues in pricing section
    <section className="py-20 md:py-28" id="pricing">
      <div className="responsive-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-sm font-medium mb-4">
            <Crown className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Simple Pricing</span>
          </div>
          <h2 className="responsive-text-2xl font-bold text-slate-900 mb-4">
            Start Your Storytelling Journey Today
          </h2>
          <p className="responsive-text-base text-slate-600 max-w-2xl mx-auto">
            Create magical stories that inspire imagination and bring families
            together
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free tier */}
          <div
            className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
              selectedPlan === 'free'
                ? 'ring-2 ring-violet-500 shadow-2xl'
                : 'shadow-xl'
            }`}
          >
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center border-b border-slate-200">
              <div className="mx-auto bg-white rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-md">
                <BookOpen
                  className="h-6 w-6 text-slate-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Free Plan
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">$0</span>
                <span className="text-slate-600"> /month</span>
              </div>
              <p className="text-slate-600 mb-4">
                Perfect for first-time users or casual storytellers
              </p>
            </div>
            <div className="bg-white p-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>5 story generations per month</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>Basic story genres</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>English language only</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>Basic character options</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>24-hour story access</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>Web reading only</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>Watermarked content</span>
                </li>
              </ul>
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white touch-target"
                onClick={() => handlePricingButtonClick('free')}
              >
                Start Free
              </Button>
            </div>
          </div>

          <PricingCard
            title="Story Creator"
            price="$4.99"
            period="per month"
            description="Unlock unlimited storytelling possibilities with advanced features"
            features={[
              'Unlimited story generations',
              'All genres + interactive stories',
              'Save and revisit stories',
              'Custom character creation',
              'Audio narration feature',
              'Available in 3 languages',
              'Download stories (PDF, audio)',
            ]}
            buttonText="Choose Plan"
            color="bg-gradient-to-br from-violet-50 to-violet-100"
            icon={<Wand2 className="h-6 w-6 text-violet-600" />}
            accentColor="border-violet-200"
            buttonColor="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            highlighted={true}
            onButtonClick={() => handlePricingButtonClick('unlimited')}
          />

          <PricingCard
            title="Family Plan"
            price="$9.99"
            period="per month"
            description="The ultimate storytelling experience for the whole family"
            features={[
              'Everything in Story Creator',
              'Up to 4 family profiles',
              'Shared family story library',
              'Parental content controls',
              'Profile-based preferences',
              'Weekly featured stories',
              'Priority support',
              'Early feature access',
            ]}
            buttonText="Choose Family Plan"
            color="bg-gradient-to-br from-amber-50 to-amber-100"
            icon={<Crown className="h-6 w-6 text-amber-600" />}
            accentColor="border-amber-200"
            buttonColor="bg-amber-600 hover:bg-amber-700"
            onButtonClick={() => handlePricingButtonClick('family')}
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
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
  onButtonClick,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        highlighted ? 'ring-2 ring-violet-500 shadow-2xl' : 'shadow-xl'
      }`}
    >
      <div className={`${color} p-6 text-center border-b ${accentColor}`}>
        <div className="mx-auto bg-white rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-md">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-slate-900">{price}</span>
          {period && <span className="text-slate-600"> {period}</span>}
        </div>
        <p className="text-slate-600 mb-4">{description}</p>
      </div>
      <div className="bg-white p-6">
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-slate-700">
              <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                <Star className="h-3 w-3 text-violet-600" fill="#7c3aed" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full ${buttonColor} text-white`}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

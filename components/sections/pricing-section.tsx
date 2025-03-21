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
            <span>Flexible Plans</span>
          </div>
          <h2 className="responsive-text-2xl font-bold text-slate-900 mb-4">
            Pick the Perfect Plan for Your Family
          </h2>
          <p className="responsive-text-base text-slate-600 max-w-2xl mx-auto">
            Choose the magical adventure that fits your family's storytelling
            needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Pricing cards with improved responsive design */}
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
                Try It Out
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">Free</span>
              </div>
              <p className="text-slate-600 mb-4">
                Perfect for families just beginning their storytelling journey
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
                  <span>3 stories per month</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>Basic themes</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>Simple customization</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Star
                      className="h-3 w-3 text-violet-600"
                      fill="#7c3aed"
                      aria-hidden="true"
                    />
                  </div>
                  <span>Web reading</span>
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
            title="Unlimited Adventures"
            price="$9.99"
            period="per month"
            description="Our most popular plan for endless storytelling fun"
            features={[
              'Unlimited stories',
              'All themes & settings',
              'Advanced character creation',
              'Download as PDF',
              'New themes monthly',
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
            title="Storytime for Everyone"
            price="$14.99"
            period="per month"
            description="The ultimate family storytelling experience"
            features={[
              'Everything in Unlimited',
              'Up to 5 family profiles',
              'Audio narration',
              'Print-ready illustrations',
              'Priority new features',
              'Exclusive themes',
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

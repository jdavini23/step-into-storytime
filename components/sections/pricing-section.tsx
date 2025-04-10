'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Wand2, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PlanType, PricingState } from '@/types/pricing';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function PricingSection() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [pricingState, setPricingState] = useState<PricingState>({
    isLoading: null,
    error: null,
  });

  const handlePricingButtonClick = async (plan: PlanType) => {
    try {
      setPricingState((prev) => ({ ...prev, isLoading: plan, error: null }));

      if (authState.isAuthenticated) {
        await router.push(`/subscription?plan=${plan}`);
      } else {
        await router.push(`/sign-up?plan=${plan}`);
      }
    } catch (error) {
      setPricingState((prev) => ({
        ...prev,
        error: 'Unable to process your request. Please try again.',
      }));
    } finally {
      setPricingState((prev) => ({ ...prev, isLoading: null }));
    }
  };

  const ErrorMessage = () =>
    pricingState.error ? (
      <div className="text-red-600 text-center mt-4" role="alert">
        {pricingState.error}
      </div>
    ) : null;

  return (
    <section
      className="py-12 sm:py-16 md:py-20 lg:py-28 px-4 sm:px-6 lg:px-8"
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      <div className="responsive-container">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div
            className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-sm font-medium mb-4"
            role="banner"
          >
            <Crown className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>Simple Pricing</span>
          </div>
          <h2
            id="pricing-heading"
            className="responsive-text-2xl font-bold text-slate-900 mb-4"
          >
            Start Your Storytelling Journey Today
          </h2>
          <p className="responsive-text-base text-slate-600 max-w-2xl mx-auto">
            Create magical stories that inspire imagination and bring families
            together
          </p>
        </div>

        <TooltipProvider delayDuration={300}>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto"
            role="list"
            aria-label="Pricing plans"
          >
            <PricingCard
              title="Free Plan"
              price="$0"
              period="/month"
              description="Perfect for first-time users or casual storytellers"
              features={[
                '5 story generations per month',
                'Basic story genres',
                'English language only',
                'Basic character options',
                '24-hour story access',
                'Web reading only',
                'Watermarked content',
              ]}
              buttonText="Start Free"
              color="bg-gradient-to-br from-slate-50 to-slate-100"
              icon={
                <BookOpen
                  className="h-6 w-6 text-slate-600"
                  aria-hidden="true"
                />
              }
              accentColor="border-slate-300"
              buttonColor="bg-slate-900 hover:bg-slate-800"
              isLoading={pricingState.isLoading === 'free'}
              onButtonClick={() => handlePricingButtonClick('free')}
            />

            <PricingCard
              title="Story Creator"
              price="$4.99"
              period="/month"
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
              icon={
                <Wand2 className="h-6 w-6 text-violet-600" aria-hidden="true" />
              }
              accentColor="border-violet-200"
              buttonColor="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              highlighted={true}
              isLoading={pricingState.isLoading === 'unlimited'}
              onButtonClick={() => handlePricingButtonClick('unlimited')}
            />

            <PricingCard
              title="Family Plan"
              price="$9.99"
              period="/month"
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
              icon={
                <Crown className="h-6 w-6 text-amber-600" aria-hidden="true" />
              }
              accentColor="border-amber-200"
              buttonColor="bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              isLoading={pricingState.isLoading === 'family'}
              onButtonClick={() => handlePricingButtonClick('family')}
            />
          </div>
        </TooltipProvider>
        <ErrorMessage />
      </div>
    </section>
  );
}

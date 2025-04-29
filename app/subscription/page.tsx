import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SubscriptionPlan } from '@/components/subscription/SubscriptionPlan';

export const metadata: Metadata = {
  title: 'Subscription Plans',
  description: 'Choose a subscription plan that works for you.',
};

const plans = [
  {
    name: 'Basic',
    description: 'Perfect for getting started with AI story generation',
    features: [
      '10 stories per month',
      'Basic character customization',
      'Standard story themes',
      'Text-only stories',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!,
    price: 9.99,
    interval: 'month',
  },
  {
    name: 'Pro',
    description: 'For families who want the full storytelling experience',
    features: [
      'Unlimited stories',
      'Advanced character customization',
      'Premium story themes',
      'Audio narration',
      'Downloadable stories',
      'Priority support',
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    price: 19.99,
    interval: 'month',
  },
];

export default async function SubscriptionPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is logged in and already has an active subscription, redirect to dashboard
  if (session?.user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', session.user.id)
      .single();

    if (subscription?.status === 'active') {
      redirect('/dashboard');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Select a subscription that best fits your storytelling needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <SubscriptionPlan
            key={plan.name}
            name={plan.name}
            description={plan.description}
            features={plan.features}
            priceId={plan.priceId}
            price={plan.price}
            interval={plan.interval}
          />
        ))}
      </div>
    </div>
  );
}

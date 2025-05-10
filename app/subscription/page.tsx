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
      { name: '10 stories per month', included: true },
      { name: 'Basic character customization', included: true },
      { name: 'Standard story themes', included: true },
      { name: 'Text-only stories', included: true },
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!,
    price: '9.99',
    interval: 'month',
  },
  {
    name: 'Pro',
    description: 'For families who want the full storytelling experience',
    features: [
      { name: 'Unlimited stories', included: true },
      { name: 'Advanced character customization', included: true },
      { name: 'Premium story themes', included: true },
      { name: 'Audio narration', included: true },
      { name: 'Downloadable stories', included: true },
      { name: 'Priority support', included: true },
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    price: '19.99',
    interval: 'month',
  },
];

export default async function SubscriptionPage() {
  const supabase = createServerComponentClient({ cookies });

  // First get the session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error fetching session:', sessionError);
    return null;
  }

  // Then get the user if we have a session
  const {
    data: { user },
    error: userError,
  } = session
    ? await supabase.auth.getUser()
    : { data: { user: null }, error: null };

  if (userError) {
    console.error('Error fetching user:', userError);
    return null;
  }

  // If user is logged in and already has an active subscription, redirect to dashboard
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
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

import { Suspense } from 'react';
import SubscriptionClient from './subscription-client';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import { cache } from 'react';

const createServerSupabaseClient = cache(() => {
  return createServerComponentClient<Database>({ cookies });
});

export default async function SubscriptionPage() {
  const supabase = createServerSupabaseClient();

  const { data: subscriptionPlans, error } = await supabase
    .from('subscription_plans')
    .select('id, tier, name, description, price_monthly, features')
    .order('price_monthly', { ascending: true });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    return <div>Error loading subscription plans</div>;
  }

  const plans =
    subscriptionPlans?.map((plan) => ({
      id: plan.id.toString(),
      tier: plan.tier,
      name: plan.name,
      description: plan.description,
      price: plan.price_monthly,
      interval: 'month',
      features: Object.entries(plan.features || {})
        .filter(([_, enabled]) => enabled)
        .map(([name]) => ({ name: name.split('_').join(' ') })),
      is_popular: plan.tier === 'story_creator',
    })) || [];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionClient initialPlans={plans} />
    </Suspense>
  );
}

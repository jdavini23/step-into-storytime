import { Suspense } from 'react';
import SubscriptionClient from './subscription-client';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import { cache } from 'react';

const createServerSupabaseClient = cache(async () => {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => {
        cookieStore.set({ name, value, ...options });
      },
      remove: (name: string, options: any) => {
        cookieStore.delete({ name, ...options });
      },
    },
  });
});

export default async function SubscriptionPage() {
  const supabase = await createServerSupabaseClient();

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

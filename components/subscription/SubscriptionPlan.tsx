'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/hooks/useSession';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { Check, X } from 'lucide-react';

interface Feature {
  name: string;
  included: boolean;
}

interface SubscriptionPlanProps {
  name: string;
  description: string;
  price: string;
  features: Feature[];
  priceId: string;
  interval: string;
}

export function SubscriptionPlan({
  name,
  description,
  price,
  features,
  priceId,
  interval,
}: SubscriptionPlanProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { session, loading } = useSession();
  const { supabase } = useAuth(); // Use supabase from useAuth

  const handleSubscribe = async () => {
    try {
      if (loading) {
        toast({
          title: 'Loading',
          description: 'Please wait...',
        });
        return;
      }

      if (!session) {
        // Store intended subscription in localStorage
        localStorage.setItem('intended_price_id', priceId);
        router.push('/sign-in');
        return;
      }

      // Use the session directly from the hook
      if (!session.access_token) {
         toast({
          title: 'Unauthorized',
          description: 'Please sign in to subscribe.',
        });
        return;
      }


      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      router.push(data.url);
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="rounded-lg border p-8 shadow-sm">
      <h3 className="text-2xl font-semibold">{name}</h3>
      <p className="mt-2 text-gray-500">{description}</p>
      <p className="mt-4 text-4xl font-bold">{price}</p>
      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            {feature.included ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
            <span className="ml-3">{feature.name}</span>
          </li>
        ))}
      </ul>
      <Button onClick={handleSubscribe} className="mt-8 w-full">
        Subscribe
      </Button>
    </div>
  );
}

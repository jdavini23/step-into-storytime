'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface SubscriptionCheckoutProps {
  priceId: string;
  buttonText?: string;
  className?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
}

export function SubscriptionCheckout({
  priceId,
  buttonText = 'Subscribe',
  className,
  variant = 'default',
}: SubscriptionCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    console.log('[SubscriptionCheckout] handleCheckout called. Price ID:', priceId);
    try {
      setLoading(true);
      console.log('[SubscriptionCheckout] Fetching /api/stripe/create-checkout-session...');

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? 'Loading...' : buttonText}
    </Button>
  );
}

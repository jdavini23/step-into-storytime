'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSubscription } from '@/contexts/subscription-context';
import { FEATURE_DESCRIPTIONS } from '@/constants/pricing';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature: keyof typeof FEATURE_DESCRIPTIONS;
  fallback?: React.ReactNode;
}

export function SubscriptionGuard({
  children,
  feature,
  fallback,
}: SubscriptionGuardProps) {
  const {
    hasFeature,
    getSubscriptionTier,
    canGenerateStory,
    getRemainingStories,
  } = useSubscription();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Special handling for story generation
  if (feature === 'Unlimited story generations') {
    if (!canGenerateStory()) {
      return (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <Lock className="h-5 w-5 mr-2 text-amber-600" />
              Story Limit Reached
            </CardTitle>
            <CardDescription className="text-amber-700">
              You've reached your monthly limit of 5 free stories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6 text-center">
              <div>
                <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <p className="text-amber-800 mb-4">
                  Upgrade to the Story Creator or Family plan for unlimited
                  story generation.
                </p>
                <p className="text-sm text-amber-600">
                  Stories remaining this month: {getRemainingStories()}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              asChild
            >
              <Link href="/subscription">Upgrade Now</Link>
            </Button>
          </CardFooter>
        </Card>
      );
    }
    return <>{children}</>;
  }

  // Check if user has access to the feature
  const hasAccess = hasFeature(feature);
  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback UI
  const currentTier = getSubscriptionTier();
  const requiredTier =
    currentTier === 'free'
      ? 'Story Creator'
      : currentTier === 'story_creator'
      ? 'Family'
      : 'Family';

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <Lock className="h-5 w-5 mr-2 text-amber-600" />
          Premium Feature
        </CardTitle>
        <CardDescription className="text-amber-700">
          This feature requires the {requiredTier} plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-6 text-center">
          <div>
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-amber-800 mb-4">
              {FEATURE_DESCRIPTIONS[feature]}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          asChild
        >
          <Link href="/subscription">Upgrade Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

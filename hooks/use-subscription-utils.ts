'use client';

import { SubscriptionTier, StoryUsage, Subscription } from '@/types/subscription';

export function getSubscriptionTier(subscription: Subscription | null): SubscriptionTier {
  if (!subscription || !subscription.subscription_plans) return 'free';
  return subscription.subscription_plans.tier as SubscriptionTier;
}

export function canGenerateStory(
  subscription: Subscription | null, 
  storyUsage: StoryUsage | null
): boolean {
  if (!subscription) return true; // Allow one free story before setup

  const tier = getSubscriptionTier(subscription);
  if (tier !== 'free') return true;

  if (!storyUsage) return true;

  // Check if reset_date is older than a month
  const resetDate = new Date(storyUsage.reset_date);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  if (resetDate < monthAgo) {
    return true;
  }

  // Get story limit from subscription plan
  const storyLimit = subscription.subscription_plans?.story_limit ?? 1;
  return storyUsage.story_count < storyLimit;
}

export function getRemainingStories(
  subscription: Subscription | null, 
  storyUsage: StoryUsage | null
): number {
  const tier = getSubscriptionTier(subscription);
  if (tier !== 'free') return Infinity;

  if (!storyUsage) return 1; // Default to 1 free story

  // Get story limit from subscription plan
  const storyLimit = subscription?.subscription_plans?.story_limit ?? 1;

  const resetDate = storyUsage.reset_date ? new Date(storyUsage.reset_date) : null;
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  if (!resetDate || resetDate < monthAgo) {
    return storyLimit;
  }

  return Math.max(0, storyLimit - storyUsage.story_count);
}

export function hasFeature(
  subscription: Subscription | null,
  feature: string
): boolean {
  if (!subscription || !subscription.subscription_plans) return false;

  // Assuming features is an array of strings
  const features = subscription.subscription_plans.features;
  return Array.isArray(features) ? features.includes(feature) : false;
}

export function getRemainingDays(
  subscription: Subscription | null
): number | null {
  if (!subscription || !subscription.current_period_end) {
    return null;
  }

  const currentPeriodEnd = new Date(subscription.current_period_end);
  const now = new Date();
  const diff = currentPeriodEnd.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

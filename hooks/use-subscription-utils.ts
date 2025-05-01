"use client";

import {
  DbSubscription,
  StoryUsage,
  SubscriptionTier,
} from "@/types/subscription";

export function getSubscriptionTier(
  subscription: DbSubscription | null,
): SubscriptionTier {
  // Rely on the plan_id directly from the user_subscriptions table
  if (!subscription || subscription.plan_id === "free") {
     return "free";
  }
  return subscription.plan_id as SubscriptionTier;
}

export function canGenerateStory(
  subscription: DbSubscription | null,
  storyUsage: StoryUsage | null,
): boolean {
  if (!subscription) return true; // Allow one free story before setup

  const tier = getSubscriptionTier(subscription);
  if (tier !== "free") return true;

  if (!storyUsage) return true;

  // Check if reset_date is older than a month
  const resetDate = new Date(storyUsage.reset_date);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  if (resetDate < monthAgo) {
    return true;
  }

  // Free tier gets 1 story per month
  return storyUsage.story_count < 1;
}

export function getRemainingStories(
  subscription: DbSubscription | null,
  storyUsage: StoryUsage | null,
): number {
  const tier = getSubscriptionTier(subscription);
  if (tier !== "free") return Infinity;

  if (!storyUsage) return 1; // Default to 1 free story

  const resetDate = storyUsage.reset_date
    ? new Date(storyUsage.reset_date)
    : null;
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  if (!resetDate || resetDate < monthAgo) {
    return 1; // Reset to 1 free story
  }

  return Math.max(0, 1 - storyUsage.story_count);
}

export function hasFeature(
  subscription: DbSubscription | null,
  feature: string,
): boolean {
  const tier = getSubscriptionTier(subscription);

  // Define features for each tier
  const tierFeatures: Record<SubscriptionTier, string[]> = {
    free: ["Basic story generation"],
    story_creator: [
      "Basic story generation",
      "Advanced story generation",
      "Audio narration",
      "Unlimited stories",
    ],
    family: [
      "Basic story generation",
      "Advanced story generation",
      "Audio narration",
      "Unlimited stories",
      "Multiple profiles",
    ],
  };

  return tierFeatures[tier]?.includes(feature) ?? false;
}

export function getRemainingDays(
  subscription: DbSubscription | null,
): number | null {
  if (!subscription || !subscription.current_period_end) return null;

  const endDate = new Date(subscription.current_period_end);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

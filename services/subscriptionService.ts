'use client';

import { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { PostgrestError } from '@supabase/supabase-js';
import { Subscription, SubscriptionTier, StoryUsage } from '@/types/subscription';

// Helper to get client
function getBrowserClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function fetchSubscription(): Promise<{ 
  data: Subscription | null; 
  error: Error | null 
}> {
  try {
    const response = await fetch('/api/subscriptions', {
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export async function createSubscription(
  tier: SubscriptionTier
): Promise<{ data: Subscription | null; error: Error | null }> {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to create subscription');
    }

    return { data: responseData, error: null };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to create subscription') 
    };
  }
}

export async function cancelSubscription(): Promise<{
  data: Subscription | null;
  error: Error | null;
}> {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'canceled' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel subscription');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export async function updateSubscription(
  tier: SubscriptionTier
): Promise<{ data: Subscription | null; error: Error | null }> {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tier }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update subscription');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export async function incrementStoryUsage(
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = getBrowserClient();
    const { data: success, error } = await supabase.rpc(
      'increment_story_usage',
      { user_id: userId }
    );

    if (error) throw error;
    return { success: !!success, error: null };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export async function fetchStoryUsage(
  userId: string
): Promise<{ data: StoryUsage | null; error: PostgrestError | null }> {
  try {
    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from('story_usage')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    console.error('Error fetching story usage:', error);
    return { 
      data: null, 
      error: error instanceof PostgrestError 
        ? error 
        : { message: 'Unknown error', details: '', hint: '', code: '' } as PostgrestError 
    };
  }
}

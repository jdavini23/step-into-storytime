import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { 
  DbSubscription, 
  SubscriptionState, 
  SubscriptionAction, 
  StoryUsage,
  Product
} from '@/types/subscription';
import { fetchSubscription, fetchStoryUsage } from '@/lib/api/subscription';
import { useAuth } from '@/lib/auth/AuthContext';

// Default subscription plans - will be replaced with data from API
const DEFAULT_PLANS: Product[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    features: ['5 stories per month', 'Basic customization', 'Text-only stories'],
  },
  {
    id: 'story_creator',
    name: 'Story Creator',
    tier: 'story_creator',
    features: ['30 stories per month', 'Advanced customization', 'Audio narration', 'Save stories'],
  },
  {
    id: 'family',
    name: 'Family',
    tier: 'family',
    features: ['Unlimited stories', 'Multiple child profiles', 'Premium themes', 'Priority support'],
  },
];

const initialState: SubscriptionState = {
  isInitialized: false,
  subscription: null,
  storyUsage: null,
  isLoading: false,
  error: null,
};

function subscriptionReducer(state: SubscriptionState, action: SubscriptionAction): SubscriptionState {
  switch (action.type) {
    case 'SET_SUBSCRIPTION':
      return { ...state, subscription: action.payload, isInitialized: true };
    case 'SET_STORY_USAGE':
      return { ...state, storyUsage: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

type SubscriptionContextType = {
  state: SubscriptionState;
  availablePlans: Product[];
  refreshSubscription: () => Promise<void>;
  isSubscribed: boolean;
  currentTier: string;
  remainingStories: number;
  totalStories: number;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const [availablePlans, setAvailablePlans] = useState<Product[]>(DEFAULT_PLANS);
  const { state: authState } = useAuth();

  // Computed properties
  const isSubscribed = !!state.subscription && ['active', 'trialing'].includes(state.subscription.status);
  
  // Get current tier - default to 'free' if no subscription
  const currentTier = isSubscribed 
    ? state.subscription?.subscription_plans?.tier || 'free'
    : 'free';
  
  // Helper function to get the story limit based on subscription tier
  const getStoryLimit = (): number => {
    // If user has an active subscription, get the limit from their plan
    if (isSubscribed && state.subscription?.subscription_plans?.tier) {
      const tier = state.subscription.subscription_plans.tier;
      // Return limit based on tier
      switch (tier) {
        case 'family':
          return 999; // Unlimited (using a high number)
        case 'story_creator':
          return 30; // Story Creator tier limit
        default:
          return 5; // Free tier limit
      }
    }
    // Default to free tier
    return 5;
  };

  // Calculate remaining stories
  const remainingStories = state.storyUsage 
    ? Math.max(0, getStoryLimit() - state.storyUsage.story_count)
    : 5; // Default to free tier limit
  
  // Total stories allowed
  const totalStories = getStoryLimit();

  // Fetch subscription data
  const refreshSubscription = async () => {
    if (!authState.user) {
      dispatch({ type: 'SET_SUBSCRIPTION', payload: null });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Fetch subscription data
      const subscription = await fetchSubscription();
      dispatch({ type: 'SET_SUBSCRIPTION', payload: subscription });
      
      // Fetch usage data if we have a user
      if (authState.user.id) {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const usage = await fetchStoryUsage(
          authState.user.id,
          firstDayOfMonth.toISOString(),
          lastDayOfMonth.toISOString()
        );
        
        dispatch({ type: 'SET_STORY_USAGE', payload: usage as unknown as StoryUsage });
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load subscription data'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Fetch subscription data when user changes
  useEffect(() => {
    refreshSubscription();
  }, [authState.user?.id]);

  // Fetch available plans
  useEffect(() => {
    // TODO: Replace with API call to fetch plans
    // For now, using default plans
    setAvailablePlans(DEFAULT_PLANS);
  }, []);

  const value = {
    state,
    availablePlans,
    refreshSubscription,
    isSubscribed,
    currentTier,
    remainingStories,
    totalStories
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

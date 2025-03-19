"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

// Define types
export type SubscriptionTier = "free" | "basic" | "premium"
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "unpaid"

export interface SubscriptionFeature {
  id: string
  name: string
  description: string
  quantity: number
}

export interface Subscription {
  id: string
  user_id: string
  status: SubscriptionStatus
  plan_id: string
  subscription_start: string | null
  subscription_end: string | null
  trial_end: string | null
  payment_provider: "stripe" | "paypal" | null
  payment_provider_id: string | null
  created_at: string
  updated_at: string
  features?: SubscriptionFeature[]
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: "month" | "year"
  tier: SubscriptionTier
  features: string[]
  is_popular?: boolean
}

export interface SubscriptionState {
  subscription: Subscription | null
  availablePlans: SubscriptionPlan[]
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

type SubscriptionAction =
  | { type: "INITIALIZE"; payload: { subscription: Subscription | null; plans: SubscriptionPlan[] } }
  | { type: "SET_SUBSCRIPTION"; payload: Subscription | null }
  | { type: "SET_PLANS"; payload: SubscriptionPlan[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_SUBSCRIPTION" }

// Create initial state
const initialState: SubscriptionState = {
  subscription: null,
  availablePlans: [],
  isLoading: false,
  error: null,
  isInitialized: false,
}

// Create reducer
const subscriptionReducer = (state: SubscriptionState, action: SubscriptionAction): SubscriptionState => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        subscription: action.payload.subscription,
        availablePlans: action.payload.plans,
        isLoading: false,
        isInitialized: true,
      }
    case "SET_SUBSCRIPTION":
      return {
        ...state,
        subscription: action.payload,
        isLoading: false,
      }
    case "SET_PLANS":
      return {
        ...state,
        availablePlans: action.payload,
        isLoading: false,
      }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "CLEAR_SUBSCRIPTION":
      return {
        ...state,
        subscription: null,
        isLoading: false,
      }
    default:
      return state
  }
}

// Create context
interface SubscriptionContextType {
  state: SubscriptionState
  fetchSubscription: () => Promise<void>
  createSubscription: (planId: string) => Promise<void>
  cancelSubscription: () => Promise<void>
  updateSubscription: (planId: string) => Promise<void>
  getSubscriptionTier: () => SubscriptionTier
  hasFeature: (featureId: string) => boolean
  getRemainingDays: () => number | null
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Create provider
export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState)
  const { state: authState } = useAuth()
  const router = useRouter()

  // Sample subscription plans - in a real app, these would come from your database
  const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free",
      description: "Basic access with limited features",
      price: 0,
      interval: "month",
      tier: "free",
      features: ["3 stories per month", "Basic themes", "Web reading"],
    },
    {
      id: "basic",
      name: "Unlimited Adventures",
      description: "Unlimited stories and more features",
      price: 9.99,
      interval: "month",
      tier: "basic",
      features: [
        "Unlimited stories",
        "All themes & settings",
        "Advanced character creation",
        "Download as PDF",
        "New themes monthly",
      ],
      is_popular: true,
    },
    {
      id: "premium",
      name: "Family Plan",
      description: "Everything for the whole family",
      price: 14.99,
      interval: "month",
      tier: "premium",
      features: [
        "Everything in Unlimited",
        "Up to 5 family profiles",
        "Audio narration",
        "Print-ready illustrations",
        "Priority new features",
        "Exclusive themes",
      ],
    },
  ]

  // Initialize subscription state
  const initializeSubscription = useCallback(async () => {
    const userId = authState.user?.id

    if (!userId) {
      dispatch({
        type: "INITIALIZE",
        payload: {
          subscription: null,
          plans: SUBSCRIPTION_PLANS,
        },
      })
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })

      // Fetch user's subscription
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscription_items(*)
        `)
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is fine for new users
        console.error("Error fetching subscription:", error)
        throw error
      }

      dispatch({
        type: "INITIALIZE",
        payload: {
          subscription: subscription as Subscription | null,
          plans: SUBSCRIPTION_PLANS,
        },
      })
    } catch (error) {
      console.error("Error initializing subscription:", error)
      dispatch({
        type: "INITIALIZE",
        payload: {
          subscription: null,
          plans: SUBSCRIPTION_PLANS,
        },
      })
    }
  }, []) // Remove dependencies to break the circular dependency

  // Initialize subscription when auth state changes
  useEffect(() => {
    if (authState.isInitialized) {
      initializeSubscription()
    }
  }, [authState.isInitialized, initializeSubscription])

  // Fetch user's subscription
  const fetchSubscription = async () => {
    if (!authState.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your subscription",
        variant: "destructive",
      })
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          subscription_items(*)
        `)
        .eq("user_id", authState.user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: subscription as Subscription | null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch subscription. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Create a new subscription
  const createSubscription = async (planId: string) => {
    if (!authState.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a subscription",
        variant: "destructive",
      })
      router.push("/sign-in")
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })

      // In a real app, this would create a checkout session with Stripe or another payment provider
      // For this demo, we'll create a subscription record directly

      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)

      if (!plan) {
        throw new Error("Invalid subscription plan")
      }

      // Create subscription record
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: authState.user.id,
          status: plan.price === 0 ? "active" : "trialing",
          plan_id: planId,
          subscription_start: new Date().toISOString(),
          subscription_end: plan.price === 0 ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          trial_end: plan.price === 0 ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          payment_provider: plan.price === 0 ? null : "stripe",
          payment_provider_id: plan.price === 0 ? null : `demo_${Date.now()}`,
        })
        .select()
        .single()

      if (error) throw error

      // Update user profile with subscription tier
      await supabase.from("profiles").update({ subscription_tier: plan.tier }).eq("id", authState.user.id)

      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: subscription as Subscription,
      })

      toast({
        title: "Subscription created",
        description: `You are now subscribed to the ${plan.name} plan`,
        variant: "success",
      })

      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create subscription. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!authState.user || !state.subscription) {
      toast({
        title: "No active subscription",
        description: "You don't have an active subscription to cancel",
        variant: "destructive",
      })
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })

      // In a real app, this would cancel the subscription with the payment provider

      // Update subscription status
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          subscription_end: new Date().toISOString(),
        })
        .eq("id", state.subscription.id)
        .eq("user_id", authState.user.id)

      if (error) throw error

      // Update user profile
      await supabase.from("profiles").update({ subscription_tier: "free" }).eq("id", authState.user.id)

      // Refresh subscription data
      await fetchSubscription()

      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled",
        variant: "success",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel subscription. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Update subscription
  const updateSubscription = async (planId: string) => {
    if (!authState.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update your subscription",
        variant: "destructive",
      })
      router.push("/sign-in")
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)

      if (!plan) {
        throw new Error("Invalid subscription plan")
      }

      if (!state.subscription) {
        // Create new subscription if none exists
        return await createSubscription(planId)
      }

      // In a real app, this would update the subscription with the payment provider

      // Update subscription record
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .update({
          plan_id: planId,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", state.subscription.id)
        .eq("user_id", authState.user.id)
        .select()
        .single()

      if (error) throw error

      // Update user profile
      await supabase.from("profiles").update({ subscription_tier: plan.tier }).eq("id", authState.user.id)

      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: subscription as Subscription,
      })

      toast({
        title: "Subscription updated",
        description: `Your subscription has been updated to the ${plan.name} plan`,
        variant: "success",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update subscription. Please try again."

      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Get current subscription tier
  const getSubscriptionTier = (): SubscriptionTier => {
    if (!state.subscription || state.subscription.status !== "active") {
      return "free"
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === state.subscription.plan_id)
    return plan?.tier || "free"
  }

  // Check if subscription has a specific feature
  const hasFeature = (featureId: string): boolean => {
    if (!state.subscription || state.subscription.status !== "active") {
      // Free tier features
      const freePlan = SUBSCRIPTION_PLANS.find((p) => p.id === "free")
      return freePlan?.features.includes(featureId) || false
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === state.subscription.plan_id)
    return plan?.features.includes(featureId) || false
  }

  // Get remaining days in subscription or trial
  const getRemainingDays = (): number | null => {
    if (!state.subscription) {
      return null
    }

    const now = new Date()
    let endDate: Date | null = null

    if (state.subscription.status === "trialing" && state.subscription.trial_end) {
      endDate = new Date(state.subscription.trial_end)
    } else if (state.subscription.subscription_end) {
      endDate = new Date(state.subscription.subscription_end)
    }

    if (!endDate) {
      return null
    }

    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }

  return (
    <SubscriptionContext.Provider
      value={{
        state,
        fetchSubscription,
        createSubscription,
        cancelSubscription,
        updateSubscription,
        getSubscriptionTier,
        hasFeature,
        getRemainingDays,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

// Create hook for using the context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext)

  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }

  return context
}


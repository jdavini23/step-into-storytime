"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { BookOpen, Loader2, ArrowLeft, Crown, Wand2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state: authState } = useAuth()
  const { state: subscriptionState, createSubscription, getSubscriptionTier } = useSubscription()

  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Get plan from URL if available
  useEffect(() => {
    const planParam = searchParams.get("plan")
    if (planParam) {
      setSelectedPlan(planParam)
    }
  }, [searchParams])

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push(`/sign-in?returnTo=${encodeURIComponent("/subscription")}`)
    }
  }, [authState.isAuthenticated, authState.isLoading, router])

  const handleSubscribe = async () => {
    if (!selectedPlan) return

    setIsLoading(true)
    try {
      await createSubscription(selectedPlan)
      // Redirect handled in createSubscription
    } catch (error) {
      console.error("Subscription error:", error)
      setIsLoading(false)
    }
  }

  // Get current subscription tier
  const currentTier = getSubscriptionTier()

  if (authState.isLoading || !subscriptionState.isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto" />
          <p className="mt-4 text-lg text-slate-600">Loading subscription options...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, the useEffect will handle redirect
  if (!authState.isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50">
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mr-2">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Step Into Storytime</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <h1 className="text-3xl font-bold text-slate-900">Choose Your Subscription Plan</h1>
            <p className="text-lg text-slate-600 mt-2">
              Select the perfect plan for your family's storytelling journey
            </p>

            {subscriptionState.subscription && (
              <div className="mt-4">
                <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50">
                  Current Plan: <span className="font-semibold ml-1 capitalize">{currentTier}</span>
                </Badge>
                <Link href="/subscription/manage">
                  <Button variant="link" className="text-violet-600 h-auto p-0 ml-2">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-6">
            {subscriptionState.availablePlans.map((plan) => (
              <div key={plan.id}>
                <RadioGroupItem value={plan.id} id={plan.id} className="peer sr-only" />
                <Label
                  htmlFor={plan.id}
                  className={`
                    flex flex-col sm:flex-row items-start gap-4 rounded-lg border p-4 
                    hover:bg-slate-50 hover:border-slate-300 
                    peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50 
                    [&:has([data-state=checked])]:border-violet-600 [&:has([data-state=checked])]:bg-violet-50
                    ${plan.is_popular ? "ring-2 ring-violet-200 shadow-md" : "border-slate-200 shadow-sm"}
                  `}
                >
                  <div
                    className={`
                    flex h-12 w-12 shrink-0 items-center justify-center rounded-full
                    ${plan.id === "free" ? "bg-slate-100" : plan.id === "basic" ? "bg-violet-100" : "bg-amber-100"}
                  `}
                  >
                    {plan.id === "free" ? (
                      <BookOpen className="h-6 w-6 text-slate-600" />
                    ) : plan.id === "basic" ? (
                      <Wand2 className="h-6 w-6 text-violet-600" />
                    ) : (
                      <Crown className="h-6 w-6 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-lg font-semibold">{plan.name}</p>
                        {plan.is_popular && (
                          <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                            Popular
                          </span>
                        )}
                        {currentTier === plan.tier && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Current Plan
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold">
                        {plan.price === 0 ? (
                          "Free"
                        ) : (
                          <>
                            ${plan.price}
                            <span className="text-sm font-normal text-slate-500">/{plan.interval}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 mb-3">{plan.description}</p>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Star className="h-3.5 w-3.5 text-violet-600 mr-2 flex-shrink-0" fill="#7c3aed" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              onClick={handleSubscribe}
              disabled={
                !selectedPlan ||
                isLoading ||
                currentTier === subscriptionState.availablePlans.find((p) => p.id === selectedPlan)?.tier
              }
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : currentTier === subscriptionState.availablePlans.find((p) => p.id === selectedPlan)?.tier ? (
                "Current Plan"
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}


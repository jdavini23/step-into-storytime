"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Crown, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"

interface SubscriptionStatusProps {
  showManageButton?: boolean
  showUpgradeButton?: boolean
  compact?: boolean
}

export function SubscriptionStatus({
  showManageButton = true,
  showUpgradeButton = true,
  compact = false,
}: SubscriptionStatusProps) {
  const { state: subscriptionState, getSubscriptionTier, getRemainingDays } = useSubscription()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTier = getSubscriptionTier()
  const remainingDays = getRemainingDays()
  const subscription = subscriptionState.subscription

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center">
          <Crown className={`h-5 w-5 mr-2 ${currentTier === "free" ? "text-slate-400" : "text-violet-500"}`} />
          <div>
            <p className="font-medium capitalize">{currentTier} Plan</p>
            {subscription?.status === "trialing" && remainingDays !== null && (
              <p className="text-xs text-slate-500">{remainingDays} days left in trial</p>
            )}
          </div>
        </div>
        {showManageButton && (
          <Link href="/subscription/manage">
            <Button variant="ghost" size="sm" className="h-8">
              Manage
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Crown className={`h-5 w-5 mr-2 ${currentTier === "free" ? "text-slate-400" : "text-violet-500"}`} />
          Subscription Status
        </CardTitle>
        <CardDescription>Your current subscription plan and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Current Plan</p>
              <p className="font-medium text-lg capitalize">{currentTier} Plan</p>
            </div>
            {subscription && (
              <Badge
                className={`
                ${
                  subscription.status === "active"
                    ? "bg-green-500"
                    : subscription.status === "trialing"
                      ? "bg-blue-500"
                      : subscription.status === "canceled"
                        ? "bg-orange-500"
                        : "bg-slate-500"
                }
              `}
              >
                {subscription.status === "active"
                  ? "Active"
                  : subscription.status === "trialing"
                    ? "Trial"
                    : subscription.status === "canceled"
                      ? "Canceled"
                      : subscription.status}
              </Badge>
            )}
          </div>

          {subscription?.status === "trialing" && remainingDays !== null && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Trial Period</p>
                <p className="text-sm">You have {remainingDays} days left in your trial period.</p>
              </div>
            </div>
          )}

          {subscription?.status === "canceled" && (
            <div className="bg-orange-50 text-orange-800 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Subscription Canceled</p>
                <p className="text-sm">
                  Your subscription has been canceled and will end on{" "}
                  {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : "N/A"}
                  .
                </p>
              </div>
            </div>
          )}

          {currentTier === "free" && !subscription && (
            <div className="bg-slate-50 p-3 rounded-md flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-slate-400" />
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-sm">You're currently on the free plan with limited features.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {showManageButton && subscription && (
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/subscription/manage">Manage Subscription</Link>
          </Button>
        )}

        {showUpgradeButton && currentTier === "free" && (
          <Button
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            asChild
          >
            <Link href="/subscription">Upgrade Plan</Link>
          </Button>
        )}

        {showUpgradeButton && currentTier === "basic" && (
          <Button
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            asChild
          >
            <Link href="/subscription">Upgrade to Premium</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}


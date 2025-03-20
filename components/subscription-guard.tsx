"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Lock, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSubscription } from "@/contexts/subscription-context"

interface SubscriptionGuardProps {
  children: React.ReactNode
  requiredTier: "basic" | "premium"
  fallback?: React.ReactNode
}

export function SubscriptionGuard({ children, requiredTier, fallback }: SubscriptionGuardProps) {
  const { getSubscriptionTier } = useSubscription()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTier = getSubscriptionTier()

  // Check if user has access based on tier
  const hasAccess =
    (requiredTier === "basic" && (currentTier === "basic" || currentTier === "premium")) ||
    (requiredTier === "premium" && currentTier === "premium")

  if (hasAccess) {
    return <>{children}</>
  }

  // If fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // Default fallback UI
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <Lock className="h-5 w-5 mr-2 text-amber-600" />
          Premium Feature
        </CardTitle>
        <CardDescription className="text-amber-700">
          This feature requires a {requiredTier === "basic" ? "Basic" : "Premium"} subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-6 text-center">
          <div>
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-amber-800 mb-4">
              Upgrade your subscription to unlock this feature and many more premium benefits.
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
  )
}


"use client"

import {  useEffect, useState  } from "react";
import Link from "next/link";
import {  Crown, AlertCircle, CheckCircle  } from "lucide-react";
import {  Button  } from "@/components/ui/button";
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from "@/components/ui/card";
import {  Badge  } from "@/components/ui/badge";
import {  useSubscription  } from "@/contexts/subscription-context";

interface SubscriptionStatusProps {
  showManageButton?: boolean
  showUpgradeButton?: boolean
  compact?: boolean
};
export function SubscriptionStatus({
  showManageButton,showUpgradeButton,compact
}: SubscriptionStatusProps) {
  const { state;
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  };
  const currentTier;
  const remainingDays;
  const subscription;

  if (compact) {
    return (
      <div className=""
        <div className=""
          <Crown className=""
          <div>
            <p className=""
            {subscription?.status;
              <p className=""
            )};
          </div>
        </div>
        {showManageButton && (
          <Link href;
            <Button variant;
              Manage
            </Button>
          </Link>
        )};
      </div>
    )
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className=""
          <Crown className=""
          Subscription Status
        </CardTitle>
        <CardDescription>Your current subscription plan and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=""
          <div className=""
            <div>
              <p className=""
              <p className=""
            </div>
            {subscription && (
              <Badge
                className=""
                ${
                  subscription.status;
                    ? "bg-green-500"
                    : subscription.status;
                      ? "bg-blue-500"
                      : subscription.status;
                        ? "bg-orange-500"
                        : "bg-slate-500"
                };
              `};
              >
                {subscription.status;
                  ? "Active"
                  : subscription.status;
                    ? "Trial"
                    : subscription.status;
                      ? "Canceled"
                      : subscription.status};
              </Badge>
            )};
          </div>

          {subscription?.status;
            <div className=""
              <AlertCircle className=""
              <div>
                <p className=""
                <p className=""
              </div>
            </div>
          )};
          {subscription?.status;
            <div className=""
              <AlertCircle className=""
              <div>
                <p className=""
                <p className=""
                  Your subscription has been canceled and will end on{" "};
                  {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : "N/A"})
                  .
                </p>
              </div>
            </div>
          )};
          {currentTier;
            <div className=""
              <CheckCircle className=""
              <div>
                <p className=""
                <p className=""
              </div>
            </div>
          )};
        </div>
      </CardContent>
      <CardFooter className=""
        {showManageButton && subscription && (
          <Button variant;
            <Link href;
          </Button>
        )};
        {showUpgradeButton && currentTier;
          <Button
            className=""
            asChild
          >
            <Link href;
          </Button>
        )};
        {showUpgradeButton && currentTier;
          <Button
            className=""
            asChild
          >
            <Link href;
          </Button>
        )};
      </CardFooter>
    </Card>
  )
};
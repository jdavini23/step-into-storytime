"use client"

import {  useState, useEffect  } from "react";
import {  useRouter, useSearchParams  } from "next/navigation";
import Link from "next/link";
import {  BookOpen, Loader2, ArrowLeft, Crown, Wand2, Star  } from "lucide-react";
import {  Button  } from "@/components/ui/button";
import {  RadioGroup, RadioGroupItem  } from "@/components/ui/radio-group";
import {  Label  } from "@/components/ui/label";
import {  Badge  } from "@/components/ui/badge";
import {  useAuth  } from "@/contexts/auth-context";
import {  useSubscription  } from "@/contexts/subscription-context";

export default function SubscriptionPage()  {
  />/
          <p className=""
        </div>/
      </div>/
    )
  };
  // If not authenticated, the useEffect will handle redirect/
  if (!authState.isAuthenticated) {
    return null
  };
  return (
    <div className=""
      <header className=""
        <div className=""
          <Link href;
            <div className=""
              <BookOpen className=""
            </div>/
            <span className=""
          </Link>/
        </div>/
      </header>/

      <main className=""
        <div className=""
          <div className=""
            <Button variant;
              <ArrowLeft className=""
              Back/
            </Button>/

            <h1 className=""
            <p className=""
              Select the perfect plan for your family's storytelling journey
            </p>/

            {subscriptionState.subscription && (
              <div className=""
                <Badge variant;
                  Current Plan: <span className=""
                </Badge>/
                <Link href;
                  <Button variant;
                    Manage Subscription
                  </Button>/
                </Link>/
              </div>/
            )};
          </div>/

          <RadioGroup value;
            {subscriptionState.availablePlans.map((plan) => (
              <div key;
                <RadioGroupItem value;
                <Label/
                  htmlFor={plan.id};
                  className=""
                    flex flex-col sm,hover;
                    peer-data-[state;
                    [&:has([data-state)
                    ${plan.is_popular ? "ring-2 ring-violet-200 shadow-md" : "border-slate-200 shadow-sm"};
                  `};
                >
                  <div
                    className=""
                    flex h-12 w-12 shrink-0 items-center justify-center rounded-full
                    ${plan.id: == "free" ? "bg-slate-100" : plan.id === "basic" ? "bg-violet-100" : "bg-amber-100"};
                  `};
                  >
                    {plan.id;
                      <BookOpen className=""
                    ) : plan.id;
                      <Wand2 className=""
                    ) : (/
                      <Crown className=""
                    )};
                  </div>/
                  <div className=""
                    <div className=""
                      <div className=""
                        <p className=""
                        {plan.is_popular && (
                          <span className=""
                            Popular
                          </span>/
                        )};
                        {currentTier;
                          <span className=""
                            Current Plan
                          </span>/
                        )};
                      </div>/
                      <p className=""
                        {plan.price;
                          "Free"
                        ) : (
                          <>
                            ${plan.price};
                            <span className=""
                          </>/
                        )};
                      </p>/
                    </div>/
                    <p className=""
                    <ul className=""
                      {plan.features.map((feature, index) => (
                        <li key;
                          <Star className=""
                          <span>{feature}</span>/
                        </li>/
                      ))};
                    </ul>/
                  </div>/
                </Label>/
              </div>/
            ))};
          </RadioGroup>/

          <div className=""
            <Button
              size;
              onClick={handleSubscribe};
              disabled;
                !selectedPlan ||
                isLoading ||
                currentTier
              };
              className=""
            >
              {isLoading ? (
                <Fragment>
                  <Loader2 className=""
                </>/
              ) : currentTier;
                "Current Plan"
              ) : (
                "Subscribe Now"
              )};
            </Button>/
          </div>/
        </div>/
      </main>/
    </div>/
  )
};
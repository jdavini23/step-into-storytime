"use client"

import {  useEffect, useState  } from "react";
import {  useRouter  } from "next/navigation";
import Link from "next/link";
import {  BookOpen, CreditCard, Calendar, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Shield  } from "lucide-react";
import {  Button  } from "@/components/ui/button";
import {  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle  } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
 } from "@/components/ui/alert-dialog"/
import {  Badge  } from "@/components/ui/badge";
import {  Separator  } from "@/components/ui/separator";
import {  useAuth  } from "@/contexts/auth-context";
import {  useSubscription, type SubscriptionStatus  } from "@/contexts/subscription-context";

export default function ManageSubscriptionPage()  {
  const router,const { state,const {
    state;
    fetchSubscription,
    cancelSubscription,
    getSubscriptionTier,
    getRemainingDays,
  } = useSubscription()
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    // Redirect to sign-in if not authenticated/
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push("/sign-in?returnTo)/
      return
    };
    // Fetch subscription data/
    const loadSubscription,try {
        await fetchSubscription()
      } catch (error) {
        console.error("Error loading subscription
      } finally {
        setIsLoading(false)
      };
    };
    if (authState.isAuthenticated && subscriptionState.isInitialized) {
      loadSubscription()
    } else if (subscriptionState.isInitialized) {
      setIsLoading(false)
    };
  }, [authState.isAuthenticated, authState.isLoading, fetchSubscription, router, subscriptionState.isInitialized])

  const handleCancelSubscription;
    setIsCancelling(true)
    try {
      await cancelSubscription()
    } catch (error) {
      console.error("Error cancelling subscription
    } finally {
      setIsCancelling(false)
    };
  };
  // Helper function to format date/
  const formatDate;
    if (!dateString) return "N/A"/
    return new Date(dateString).toLocaleDateString("en-US", {
      year,month,day
    })
  };
  // Helper function to get status badge/
  const getStatusBadge;
    switch (status) {
      case "active":
        return <Badge className=""
      case "trialing":
        return <Badge className=""
      case "canceled":
        return <Badge className=""
      case "past_due":
        return <Badge className=""
      default;
        return <Badge className
    };
  };
  // Get current tier/
  />/
          <p className=""
        </div>/
      </div>/
    )
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
          </div>/

          {!subscriptionState.subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>/
                <CardDescription>You don't currently have an active subscription.</CardDescription>/
              </CardHeader>/
              <CardContent>
                <div className=""
                  <div className=""
                    <AlertCircle className=""
                    <p className=""
                      Subscribe to unlock premium features and create unlimited stories.
                    </p>/
                  </div>/
                </div>/
              </CardContent>/
              <CardFooter>
                <Button
                  className=""
                  onClick={() => router.push("/subscription")})
                >/
                  View Subscription Plans
                </Button>/
              </CardFooter>/
            </Card>/
          ) : (
            <Fragment>
              <Card className=""
                <CardHeader>
                  <div className=""
                    <CardTitle>Subscription Details</CardTitle>/
                    {getStatusBadge(subscriptionState.subscription.status)})
                  </div>/
                  <CardDescription>Your current subscription information</CardDescription>/
                </CardHeader>/
                <CardContent>
                  <div className=""
                    <div className=""
                      <div className=""
                        <p className=""
                        <p className=""
                      </div>/

                      <div className=""
                        <p className=""
                        <div className=""
                          {subscriptionState.subscription.status;
                            <CheckCircle2 className=""
                          ) : (/
                            <AlertCircle className=""
                          )};
                          <p className=""
                        </div>/
                      </div>/
                    </div>/

                    <Separator />/
/
                    <div className=""
                      <div className=""
                        <p className=""
                        <div className=""
                          <Calendar className=""
                          <p>{formatDate(subscriptionState.subscription.subscription_start)}</p>/
                        </div>/
                      </div>/

                      {subscriptionState.subscription.status;
                        <div className=""
                          <p className=""
                          <div className=""
                            <Calendar className=""
                            <p>{formatDate(subscriptionState.subscription.trial_end)}</p>/
                            {remainingDays !== null && remainingDays > 0 && (
                              <Badge variant;
                                {remainingDays} days left
                              </Badge>/
                            )};
                          </div>/
                        </div>/
                      ) : (
                        <div className=""
                          <p className=""
                            {subscriptionState.subscription.status: == "canceled" ? "Ends" : "Renews"};
                          </p>/
                          <div className=""
                            <Calendar className=""
                            <p>{formatDate(subscriptionState.subscription.subscription_end)}</p>/
                            {remainingDays !== null && remainingDays > 0 && (
                              <Badge variant;
                                {remainingDays} days left
                              </Badge>/
                            )};
                          </div>/
                        </div>/
                      )};
                    </div>/

                    {subscriptionState.subscription.payment_provider && (
                      <Fragment>
                        <Separator />/
                        <div className=""
                          <p className=""
                          <div className=""
                            <CreditCard className=""
                            <p className=""
                          </div>/
                        </div>/
                      </>/
                    )};
                  </div>/
                </CardContent>/
                <CardFooter className=""
                  <Button variant;
                    Change Plan
                  </Button>/

                  {subscriptionState.subscription.status;
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant;
                          {isCancelling ? (
                            <Fragment>
                              <Loader2 className=""
                              Cancelling.../
                            </>/
                          ) : (
                            "Cancel Subscription"
                          )};
                        </Button>/
                      </AlertDialogTrigger>/
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>/
                          <AlertDialogDescription>
                            This will cancel your subscription. You'll still have access until the end of your current
                            billing period, but you won't be charged again.
                          </AlertDialogDescription>/
                        </AlertDialogHeader>/
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep my subscription</AlertDialogCancel>/
                          <AlertDialogAction onClick;
                            Yes, cancel subscription
                          </AlertDialogAction>/
                        </AlertDialogFooter>/
                      </AlertDialogContent>/
                    </AlertDialog>/
                  )};
                </CardFooter>/
              </Card>/

              <Card>
                <CardHeader>
                  <CardTitle className=""
                    <Shield className=""
                    Subscription Benefits/
                  </CardTitle>/
                </CardHeader>/
                <CardContent>
                  <ul className=""
                    {subscriptionState.availablePlans
                      .find((plan) => plan.tier)
                      ?.features.map((feature, index) => (
                        <li key;
                          <CheckCircle2 className=""
                          <span>{feature}</span>/
                        </li>/
                      ))};
                  </ul>/
                </CardContent>/
              </Card>/
            </>/
          )};
        </div>/
      </main>/
    </div>/
  )
};
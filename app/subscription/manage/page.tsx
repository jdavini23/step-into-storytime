'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import {
  useSubscription,
  type SubscriptionStatus,
} from '@/contexts/subscription-context';

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const {
    state: subscriptionState,
    fetchSubscription,
    cancelSubscription,
    getSubscriptionTier,
    getRemainingDays,
  } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/sign-in?returnTo=/subscription/manage');
      return;
    }

    // Only fetch subscription if authenticated and not already loaded
    if (authState.isAuthenticated && !subscriptionState.isInitialized) {
      console.log('[DEBUG] ManageSubscription useEffect:', {
        authLoading: authState.isLoading,
        authInitialized: authState.isInitialized,
        subscriptionLoading: subscriptionState.isLoading,
        subscriptionInitialized: subscriptionState.isInitialized,
      });
      const loadSubscription = async () => {
        try {
          await fetchSubscription();
        } catch (error) {
          console.error('[DEBUG] Error loading subscription:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadSubscription();
    } else if (subscriptionState.isInitialized) {
      setIsLoading(false);
    }
  }, [
    authState.isAuthenticated,
    authState.isLoading,
    authState.isInitialized,
    fetchSubscription,
    router,
    subscriptionState.isInitialized,
  ]);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await cancelSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'canceled':
        return <Badge className="bg-orange-500">Canceled</Badge>;
      case 'past_due':
        return <Badge className="bg-red-500">Past Due</Badge>;
      default:
        return <Badge className="bg-slate-500">{status}</Badge>;
    }
  };

  // Get current tier
  const currentTier = getSubscriptionTier();

  // Get remaining days
  const remainingDays = getRemainingDays();

  if (isLoading || authState.isLoading || !subscriptionState.isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto" />
          <p className="mt-4 text-lg text-slate-600">
            Loading subscription details...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {!authState.isInitialized
              ? 'Initializing auth...'
              : !subscriptionState.isInitialized
              ? 'Loading subscription...'
              : 'Please wait...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50">
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mr-2">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              Step Into Storytime
            </span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">
              Manage Subscription
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              View and manage your subscription details
            </p>
          </div>

          {!subscriptionState.subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  You don't currently have an active subscription.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">
                      Subscribe to unlock premium features and create unlimited
                      stories.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  onClick={() => router.push('/subscription')}
                >
                  View Subscription Plans
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Subscription Details</CardTitle>
                    {getStatusBadge(subscriptionState.subscription.status)}
                  </div>
                  <CardDescription>
                    Your current subscription information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Plan</p>
                        <p className="font-medium text-lg capitalize">
                          {currentTier} Plan
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Status</p>
                        <div className="flex items-center">
                          {subscriptionState.subscription.status ===
                          'active' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                          )}
                          <p className="font-medium capitalize">
                            {subscriptionState.subscription.status}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Start Date</p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                          <p>
                            {formatDate(
                              subscriptionState.subscription.subscription_start
                            )}
                          </p>
                        </div>
                      </div>

                      {subscriptionState.subscription.status === 'trialing' ? (
                        <div className="space-y-1">
                          <p className="text-sm text-slate-500">Trial Ends</p>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                            <p>
                              {formatDate(
                                subscriptionState.subscription.trial_end
                              )}
                            </p>
                            {remainingDays !== null && remainingDays > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {remainingDays} days left
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-slate-500">
                            {subscriptionState.subscription.status ===
                            'canceled'
                              ? 'Ends'
                              : 'Renews'}
                          </p>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                            <p>
                              {formatDate(
                                subscriptionState.subscription.subscription_end
                              )}
                            </p>
                            {remainingDays !== null && remainingDays > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {remainingDays} days left
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {subscriptionState.subscription.payment_provider && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-sm text-slate-500">
                            Payment Method
                          </p>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-slate-400 mr-2" />
                            <p className="capitalize">
                              {subscriptionState.subscription.payment_provider}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => router.push('/subscription')}
                  >
                    Change Plan
                  </Button>

                  {subscriptionState.subscription.status === 'active' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full sm:w-auto"
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            'Cancel Subscription'
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will cancel your subscription. You'll still
                            have access until the end of your current billing
                            period, but you won't be charged again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            No, keep my subscription
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancelSubscription}>
                            Yes, cancel subscription
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 text-violet-500 mr-2" />
                    Subscription Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {subscriptionState.availablePlans
                      .find((plan) => plan.tier === currentTier)
                      ?.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature.name}</span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

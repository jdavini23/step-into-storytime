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
import PlanCard from '../components/PlanCard';
import StatusBanner from '../components/StatusBanner';
import ConfirmationDialog from '../components/ConfirmationDialog';
import SubscriptionBoundary from '../components/SubscriptionBoundary';
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
  type Product,
  type Price,
} from '@/contexts/subscription-context';
import { PRICING_PLANS } from '@/constants/pricing';
import {
  PLAN_STATUS_LABELS,
  ERROR_MESSAGES,
  ACTION_LABELS,
} from '@/lib/constants/subscription';
import {
  fetchSubscription,
  switchPlan,
  cancelSubscription as cancelSubscriptionApi,
} from '@/lib/api/subscription';
import FeatureList from '../components/FeatureList';
import { usePlanSwitching } from '../hooks/usePlanSwitching';
import { useCancelSubscription } from '../hooks/useCancelSubscription';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Tooltip } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

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

  const currentTier = getSubscriptionTier();
  const {
    isSwitching,
    error: switchError,
    switchPlan,
    retry: retrySwitchPlan,
    optimisticTier,
  } = usePlanSwitching(currentTier);

  const subscriptionStatus = subscriptionState.subscription
    ?.status as SubscriptionStatus;
  const {
    isCancelling,
    error: cancelError,
    cancelSubscription: cancelSubscriptionHook,
    retry: retryCancel,
    optimisticStatus,
  } = useCancelSubscription(subscriptionStatus);

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentPrice, setCurrentPrice] = useState<Price | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(true);

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/sign-in?returnTo=/subscription/manage');
    }
  }, [authState.isLoading, authState.isAuthenticated, router]);

  useEffect(() => {
    if (
      authState.isAuthenticated &&
      !subscriptionState.isInitialized &&
      !subscriptionState.isLoading
    ) {
      fetchSubscription().catch((error) => {
        console.error('[DEBUG] Error loading subscription:', error);
      });
    }
  }, [
    authState.isAuthenticated,
    subscriptionState.isInitialized,
    subscriptionState.isLoading,
    fetchSubscription,
  ]);

  useEffect(() => {
    if (subscriptionState.subscription && subscriptionState.availablePlans) {
      const product = subscriptionState.availablePlans.find(
        (plan) =>
          plan.tier === subscriptionState.subscription?.subscription_plans?.tier
      );

      if (product?.prices?.length) {
        setCurrentProduct(product);
        setCurrentPrice(product.prices[0]);
      }
    }
  }, [subscriptionState.subscription, subscriptionState.availablePlans]);

  const remainingDays = getRemainingDays();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      case 'incomplete':
        return <Badge className="bg-slate-500">Pending</Badge>;
      case 'incomplete_expired':
        return <Badge className="bg-red-500">Expired</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500">Unpaid</Badge>;
      default:
        return <Badge className="bg-slate-500">{status}</Badge>;
    }
  };

  const effectiveTier = optimisticTier || currentTier;
  const effectiveStatus = optimisticStatus || subscriptionStatus;

  const handleCancel = async () => {
    try {
      await cancelSubscriptionHook();
      toast({
        title: 'Subscription canceled',
        description:
          'Your subscription has been canceled. You will retain access until the end of the billing period.',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'An error occurred.',
      });
    }
  };

  const showOnboardingNudge =
    !subscriptionState.subscription || effectiveTier === 'free';

  const quotaUsed = (subscriptionState as any).usage?.storiesUsed || 0;
  const quotaTotal = (subscriptionState as any).usage?.storiesQuota || 1;
  const showUpgradeBanner =
    effectiveTier === 'free' && quotaUsed / quotaTotal > 0.8;

  const userName =
    typeof authState.user?.user_metadata?.name === 'string'
      ? authState.user.user_metadata.name
      : authState.user?.email?.split('@')[0];

  if (subscriptionState.isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Skeleton className="h-32 w-full rounded-xl mb-6" />
        <Skeleton className="h-32 w-full rounded-xl mb-6" />
        <Skeleton className="h-20 w-full rounded-xl" />
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
              className="mb-4 focus:ring-2 focus:ring-violet-400"
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

          {/* Error Banner */}
          {(error || switchError || cancelError) && (
            <StatusBanner
              status="canceled"
              message={String(error || switchError || cancelError)}
            />
          )}
          {(error || switchError || cancelError) && (
            <button
              className="text-xs text-violet-700 underline mt-1 mb-4 focus:ring-2 focus:ring-violet-400"
              onClick={() => setShowErrorDetails((v) => !v)}
              aria-expanded={showErrorDetails}
            >
              {showErrorDetails ? 'Hide details' : 'Show details'}
            </button>
          )}
          {showErrorDetails && (
            <pre className="bg-slate-100 text-xs text-slate-800 rounded-lg p-3 mb-4 overflow-x-auto">
              {JSON.stringify(error || switchError || cancelError, null, 2)}
            </pre>
          )}

          {/* Onboarding Nudge */}
          {showOnboardingNudge && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-xl mb-6 flex items-center gap-3 animate-slide-fade-in">
              <Info className="h-5 w-5 text-yellow-500" />
              <span>
                Unlock more features by upgrading your plan!{' '}
                <button
                  className="underline font-semibold hover:text-violet-700 ml-1"
                  onClick={() => router.push('/subscription')}
                >
                  See plans
                </button>
              </span>
            </div>
          )}

          {/* Upgrade Suggestion Banner */}
          {showUpgradeBanner && (
            <div className="bg-violet-50 border-l-4 border-violet-400 text-violet-800 p-4 rounded-xl mb-6 flex items-center gap-3 animate-slide-fade-in">
              <Info className="h-5 w-5 text-violet-500 animate-bounce" />
              <span>
                You're close to your monthly story limit.{' '}
                <button
                  className="underline font-semibold hover:text-violet-700 ml-1"
                  onClick={() => router.push('/subscription')}
                >
                  Upgrade now
                </button>{' '}
                for unlimited stories!
              </span>
            </div>
          )}

          {/* Removed redundant Subscription Status Banner */}

          {!subscriptionState.subscription ? (
            <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-slate-200 bg-white/90 dark:bg-slate-900/90 p-2 sm:p-6 animate-slide-fade-in">
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
              <CardFooter className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:scale-105 active:scale-95 hover:brightness-105 focus:ring-2 focus:ring-violet-400 min-h-[44px] min-w-[44px] transition-transform"
                  onClick={() => router.push('/subscription')}
                >
                  View Subscription Plans
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-slate-200 bg-white/90 dark:bg-slate-900/90 p-2 sm:p-6 animate-slide-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Subscription Details</CardTitle>
                    {getStatusBadge(effectiveStatus)}
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
                        <p className="font-medium text-lg capitalize bg-gradient-to-r from-violet-700 to-indigo-500 bg-clip-text text-transparent">
                          {effectiveTier} Plan
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Status</p>
                        <div className="flex items-center">
                          {effectiveStatus === 'active' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                          )}
                          <p className="font-medium capitalize">
                            {effectiveStatus}
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

                      {effectiveStatus === 'trialing' ? (
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
                            {effectiveStatus === 'canceled' ? 'Ends' : 'Renews'}
                          </p>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                            <p className="font-semibold text-indigo-700 dark:text-indigo-300 text-lg">
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
                <CardFooter className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto hover:scale-105 active:scale-95 hover:ring-2 hover:ring-violet-400 focus:ring-2 focus:ring-violet-400 min-h-[44px] min-w-[44px] transition-transform"
                    onClick={() => router.push('/subscription')}
                  >
                    {ACTION_LABELS.upgrade}
                  </Button>

                  {effectiveStatus === 'active' && (
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto hover:scale-105 active:scale-95 hover:ring-2 hover:ring-red-300 focus:ring-2 focus:ring-red-400 min-h-[44px] min-w-[44px] transition-transform"
                      disabled={isCancelling}
                      onClick={() => setShowCancelDialog(true)}
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        ACTION_LABELS.cancel
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Plan Card Section - Modularized */}
              {subscriptionState.availablePlans &&
                subscriptionState.availablePlans.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-slide-fade-in">
                    {subscriptionState.availablePlans.map((plan) => {
                      const price =
                        plan.prices && plan.prices.length > 0
                          ? plan.prices[0]
                          : undefined;
                      // Only render if price exists (or adjust PlanCard to handle undefined price)
                      if (!price) return null;
                      // Only allow valid SubscriptionStatus values
                      return (
                        <PlanCard
                          key={plan.id}
                          product={plan}
                          price={price}
                          status={effectiveStatus}
                          isCurrent={plan.tier === effectiveTier}
                          onSelect={() => switchPlan(plan.id)}
                        />
                      );
                    })}
                  </div>
                )}

              <div className="h-1 w-full bg-gradient-to-r from-violet-200/0 via-violet-300 to-violet-200/0 my-8 rounded-full" />

              <Card className="shadow-md rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white dark:from-slate-800 dark:to-slate-900 mt-8 animate-slide-fade-in">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-xl font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-slate-800 rounded-lg px-3 py-2 mb-2">
                    <Shield className="h-5 w-5 text-violet-500 mr-2 animate-spin-slow" />
                    Subscription Benefits
                  </CardTitle>
                  <button
                    className="ml-2 px-2 py-1 rounded focus:ring-2 focus:ring-violet-400 text-violet-700 dark:text-violet-300 text-sm font-medium hover:bg-violet-100 dark:hover:bg-slate-700 transition"
                    aria-expanded={benefitsOpen}
                    onClick={() => setBenefitsOpen((v) => !v)}
                  >
                    {benefitsOpen ? 'Hide' : 'Show'}
                  </button>
                </CardHeader>
                {benefitsOpen && (
                  <CardContent>
                    <FeatureList
                      plans={subscriptionState.availablePlans ?? []}
                      currentTier={effectiveTier}
                      PRICING_PLANS={PRICING_PLANS}
                    />
                  </CardContent>
                )}
              </Card>

              <div className="flex justify-end mt-4">
                <a
                  href="/faq"
                  className="text-xs underline text-slate-500 hover:text-violet-700 focus:ring-2 focus:ring-violet-400"
                >
                  Need help? Visit our FAQ
                </a>
              </div>
            </>
          )}
        </div>
      </main>
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
          <ConfirmationDialog
            open={showCancelDialog}
            title="Are you sure?"
            description="This will cancel your subscription. You'll still have access until the end of your current billing period, but you won't be charged again."
            onCancel={() => setShowCancelDialog(false)}
            onConfirm={handleCancel}
            isLoading={isCancelling}
          />
        </div>
      )}
      <Toaster />
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes slide-fade-in {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-slide-fade-in {
          animation: slide-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2.5s linear infinite;
        }
      `}</style>
    </div>
  );
}

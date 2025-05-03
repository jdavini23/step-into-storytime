'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PLAN_STATUS_LABELS } from '@/lib/constants/subscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DbSubscription } from '@/types/subscription';

interface SubscriptionManagerProps {
  subscription: DbSubscription;
  onRefresh: () => void;
}

export function SubscriptionManager({ subscription, onRefresh }: SubscriptionManagerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> {PLAN_STATUS_LABELS[status as keyof typeof PLAN_STATUS_LABELS]}</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" /> {PLAN_STATUS_LABELS[status as keyof typeof PLAN_STATUS_LABELS]}</Badge>;
      case 'past_due':
      case 'unpaid':
        return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" /> {PLAN_STATUS_LABELS[status as keyof typeof PLAN_STATUS_LABELS]}</Badge>;
      case 'canceled':
      case 'incomplete':
      case 'incomplete_expired':
        return <Badge className="bg-red-500"><AlertCircle className="w-3 h-3 mr-1" /> {PLAN_STATUS_LABELS[status as keyof typeof PLAN_STATUS_LABELS]}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      const data = await response.json();
      
      toast({
        title: 'Subscription Canceled',
        description: `Your subscription will end on ${formatDate(data.currentPeriodEnd)}`,
      });
      
      setShowCancelDialog(false);
      onRefresh();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const planName = subscription.subscription_plans?.name || 'Unknown Plan';
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const isCanceled = subscription.status === 'canceled' || subscription.cancel_at_period_end;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">{planName}</CardTitle>
            <CardDescription>
              {getStatusBadge(subscription.status)}
              {subscription.cancel_at_period_end && (
                <Badge variant="outline" className="ml-2">Cancels at period end</Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Period</p>
              <p className="text-sm">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </p>
            </div>
            {subscription.trial_end && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trial Ends</p>
                <p className="text-sm">{formatDate(subscription.trial_end)}</p>
              </div>
            )}
          </div>
          
          {isCanceled && (
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                {subscription.cancel_at_period_end 
                  ? `Your subscription will end on ${formatDate(subscription.current_period_end)}.` 
                  : 'Your subscription has been canceled.'}
              </p>
              {subscription.cancel_at_period_end && (
                <p className="text-amber-800 dark:text-amber-300 text-sm mt-2">
                  You can continue using premium features until this date.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
        
        {isActive && !subscription.cancel_at_period_end && (
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">Cancel Subscription</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Subscription</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period on {formatDate(subscription.current_period_end)}.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelDialog(false)}
                  disabled={isLoading}
                >
                  Keep Subscription
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? 'Canceling...' : 'Confirm Cancellation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}

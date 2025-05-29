import React from 'react';
import { CheckCircle2, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SubscriptionStatus } from '@/types/subscription';
import type { Product, Price } from '@/types/subscription';

interface PlanCardProps {
  product: Product;
  price: Price;
  status: SubscriptionStatus;
  isCurrent: boolean;
  isLoading?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  product,
  price,
  status,
  isCurrent,
  isLoading = false,
}) => {
  const isPremium = product.name.toLowerCase().includes('premium');
  const features = product.features || [];

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col border-2 border-transparent">
        <CardHeader>
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse mb-2" />
          <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'h-full flex flex-col transition-all duration-200',
        isCurrent
          ? 'border-2 border-primary shadow-lg'
          : 'opacity-70',
        isPremium && 'ring-2 ring-yellow-400/30'
      )}
    >
      <CardHeader className="relative">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {product.name}
              {isPremium && <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />}
            </CardTitle>
            <CardDescription className="mt-1">
              {product.description}
            </CardDescription>
          </div>
          {isCurrent && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Current Plan
            </Badge>
          )}
        </div>
        
        <div className="mt-4">
          <div className="text-3xl font-bold">
            ${price.unit_amount / 100}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
          {price.interval === 'year' && (
            <div className="text-sm text-muted-foreground">
              Billed annually (${(price.unit_amount * 12 / 100).toFixed(2)}/year)
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <ul className="space-y-3">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default React.memo(PlanCard);

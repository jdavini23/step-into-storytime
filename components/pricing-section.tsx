'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for trying out our platform',
    features: [
      'Create up to 3 stories per month',
      'Basic character customization',
      'Standard story templates',
      'Email support',
    ],
  },
  {
    name: 'Premium',
    price: '9.99',
    description: 'For families who love storytelling',
    features: [
      'Unlimited story creation',
      'Advanced character customization',
      'All story templates',
      'Priority support',
      'Family sharing (up to 5 members)',
      'Download stories as PDF',
    ],
  },
  {
    name: 'Professional',
    price: '29.99',
    description: 'For educators and institutions',
    features: [
      'Everything in Premium',
      'Classroom management tools',
      'Student progress tracking',
      'Educational resources',
      'Bulk story generation',
      '24/7 dedicated support',
    ],
  },
];

export function PricingSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that best fits your storytelling needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-lg shadow-sm border border-border"
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Create Magical Stories with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Step into a world where imagination meets artificial intelligence.
            Create personalized stories that captivate and inspire young minds.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/create">Start Creating</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

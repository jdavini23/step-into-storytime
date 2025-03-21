'use client';

import { Wand2, Brain, Sparkles, Users } from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Storytelling',
    description:
      'Our advanced AI creates unique, engaging stories tailored to your preferences.',
    icon: Wand2,
  },
  {
    title: 'Educational Content',
    description:
      'Stories that not only entertain but also help children learn and grow.',
    icon: Brain,
  },
  {
    title: 'Personalized Experience',
    description:
      "Create characters and settings that resonate with your child's interests.",
    icon: Sparkles,
  },
  {
    title: 'Family Collaboration',
    description:
      'Share and collaborate on stories with family members and friends.',
    icon: Users,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Why Choose Step Into Storytime?
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover the magic of AI-powered storytelling with our unique
            features.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-card rounded-lg shadow-sm">
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

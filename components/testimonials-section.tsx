'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Parent',
    content:
      "Step Into Storytime has transformed our bedtime routine. My kids love creating their own stories and can't wait to see what adventures await!",
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Teacher',
    content:
      "As an educator, I've found this platform incredibly valuable. It helps students develop creativity and reading comprehension in a fun way.",
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Parent',
    content:
      'The personalized stories have helped my child develop a love for reading. The AI-generated content is always engaging and age-appropriate.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of happy families creating magical stories together.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 bg-card rounded-lg shadow-sm">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                {testimonial.content}
              </p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

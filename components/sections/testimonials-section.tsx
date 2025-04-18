import Image from 'next/image';
import { Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-sm font-medium mb-4">
            <Users className="h-4 w-4 mr-2" />
            <span>Happy Families</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            What Families Are Saying
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Join thousands of families creating unforgettable bedtime moments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <TestimonialCard
            quote="My daughter asks for her personalized unicorn story every night! It's become our special bedtime ritual."
            name="Sarah M."
            role="Mom of 2"
            image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
          />

          <TestimonialCard
            quote="I love that I'm the hero in my own space adventure! The aliens are funny and the stories are always different."
            name="Ethan, age 7"
            role="Junior Astronaut"
            image="https://images.unsplash.com/photo-1513959663939-eb7424f0e121?w=150&h=150&fit=crop"
          />

          <TestimonialCard
            quote="As a busy dad, I appreciate how quick it is to create a new story. My son's face lights up every time!"
            name="Michael T."
            role="Father of a superhero fan"
            image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
          />
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  image: string;
}

function TestimonialCard({ quote, name, role, image }: TestimonialCardProps) {
  return (
    <Card
      className="border-0 shadow-xl h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      aria-label="Testimonial"
    >
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <div className="mr-4">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white ring-4 ring-white">
              <Image
                src={image}
                alt={`${name}'s profile picture`}
                width={150}
                height={150}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{name}</p>
            <p className="text-sm text-slate-500">{role}</p>
          </div>
        </div>
        <div className="pt-2">
          <div className="flex mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-4 w-4 text-amber-400"
                fill="#fbbf24"
                aria-hidden="true"
              />
            ))}
          </div>
          <blockquote className="italic text-slate-700">"{quote}"</blockquote>
        </div>
      </CardContent>
    </Card>
  );
}

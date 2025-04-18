'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import StoryCreatorOverlay from '@/components/overlays/story-creator-overlay';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import ProductTourOverlay from '../overlays/product-tour-overlay';

export default function HeroSection() {
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showProductTour, setShowProductTour] = useState(false);

  const handleStoryStart = () => {
    setShowOverlay(true);
  };

  const handleOverlayComplete = () => {
    setShowOverlay(false);
    router.push('/create');
  };

  return (
    <>
      <AnimatePresence>
        {showOverlay && (
          <StoryCreatorOverlay onComplete={handleOverlayComplete} />
        )}
      </AnimatePresence>
      <ProductTourOverlay
        open={showProductTour}
        onOpenChange={setShowProductTour}
      />
      <section
        className="relative overflow-hidden py-12 sm:py-16 md:py-20"
        aria-label="Hero section"
      >
        <div className="absolute inset-0 z-0">
          {/* Modern gradient background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50"
            aria-hidden="true"
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
            <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <div
                className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-sm font-medium mb-4 sm:mb-6"
                role="banner"
              >
                <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>AI-Powered Storytelling</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                Create Magical{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                  Bedtime Stories
                </span>{' '}
                in Seconds
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                Step Into Storytime transforms your ideas into personalized
                adventures that captivate children's imagination and create
                lasting memories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6 sm:mb-8">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg"
                  onClick={handleStoryStart}
                  aria-label="Start creating your story"
                >
                  Start Your Story{' '}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg"
                  onClick={() => setShowProductTour(true)}
                  aria-label="Watch demo video"
                >
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="flex -space-x-3">
                  {[
                    {
                      src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
                      alt: 'Happy parent Sarah',
                    },
                    {
                      src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
                      alt: 'Happy parent Michael',
                    },
                    {
                      src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
                      alt: 'Happy parent Emma',
                    },
                    {
                      src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
                      alt: 'Happy parent Lisa',
                    },
                  ].map((profile, i) => (
                    <div
                      key={i}
                      className="inline-block h-8 sm:h-10 w-8 sm:w-10 rounded-full ring-4 ring-white overflow-hidden bg-white"
                    >
                      <Image
                        src={profile.src}
                        alt={profile.alt}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div
                    className="flex items-center mb-1"
                    role="img"
                    aria-label="5 star rating"
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400"
                        fill="#fbbf24"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Trusted by 10,000+ families
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:mt-0 mt-8">
              <HeroImage />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroImage() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="relative mx-auto max-w-2xl lg:max-w-none">
      <div className="relative bg-gradient-to-br from-sky-100 to-indigo-100 rounded-3xl shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0">
          <div className="bg-amber-400 p-2 rounded-bl-2xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0">
          <div className="bg-sky-400 p-2 rounded-tr-2xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
              Emma's Space Adventure
            </h3>
            <p className="text-slate-700 text-xs sm:text-sm mb-3">
              A personalized journey through the stars with Captain Emma and her
              robot friend Blip.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Created 2 minutes ago
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-violet-600 hover:text-violet-700"
                onClick={() => setShowPreview(true)}
                aria-label="Preview Emma's Space Adventure story"
              >
                Preview{' '}
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emma's Space Adventure</DialogTitle>
            <DialogDescription>
              A preview of what your personalized story could look like
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-slate max-w-none">
            <p>
              In the vast expanse of space, young Captain Emma and her trusty
              robot companion Blip embarked on an extraordinary adventure. Their
              spaceship, powered by stardust and imagination, sailed through
              cosmic clouds of purple and gold.
            </p>
            <p>
              As they ventured deeper into the unknown, they discovered a
              constellation that looked exactly like Emma's favorite toy - her
              teddy bear! "Look, Blip!" Emma exclaimed, her eyes twinkling with
              wonder...
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowPreview(false);
                router.push('/create');
              }}
            >
              Create Your Own Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

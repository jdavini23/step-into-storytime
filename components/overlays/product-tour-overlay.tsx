import React, { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

interface ProductTourOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const slides = [
  {
    title: 'Step 1: Personalize Your Story',
    description:
      "Choose your child's name, favorite character, and adventure theme to begin crafting a magical bedtime story.",
    image: '/placeholder.svg',
  },
  {
    title: 'Step 2: Preview Instantly',
    description:
      'See your story come to life in real-time as you make selections. Preview the text and get ready for storytime!',
    image: '/placeholder.svg',
  },
  {
    title: 'Step 3: Listen or Save',
    description:
      'Enjoy AI narration or save your favorite stories to your vault for bedtime, classroom, or sharing with family.',
    image: '/placeholder.svg',
  },
];

export default function ProductTourOverlay({
  open,
  onOpenChange,
}: ProductTourOverlayProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0); // for animation

  const handleNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, slides.length - 1));
  };
  const handleBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };
  const handleClose = () => {
    setStep(0);
    setDirection(0);
    onOpenChange(false);
  };
  const handleSkip = handleClose;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{slides[step].title}</DialogTitle>
          <DialogDescription>{slides[step].description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4 min-h-[220px]">
          {/* Animated slide */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col items-center w-full"
            >
              <Image
                src={slides[step].image}
                alt={slides[step].title}
                width={180}
                height={180}
                className="mb-4 rounded-xl border shadow"
              />
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-2 mb-2">
                {slides.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full transition-all duration-200 ${
                      idx === step
                        ? 'bg-violet-600 scale-125'
                        : 'bg-gray-300 scale-100'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <DialogFooter>
          <div className="flex w-full justify-between items-center gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
              aria-label="Back"
            >
              Back
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              aria-label="Skip Tour"
              className="text-xs px-2"
            >
              Skip Tour
            </Button>
            {step < slides.length - 1 ? (
              <Button onClick={handleNext} aria-label="Next">
                Next
              </Button>
            ) : (
              <Button onClick={handleClose} aria-label="Close">
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStepManager } from '../StepManager';
import { Sparkles, Wand2 } from 'lucide-react';

export default function WelcomeStep() {
  const { state, dispatch } = useStepManager();

  const handleCreateStory = () => {
    // Reset the wizard state and move to the first step
    dispatch({ type: 'RESET_WIZARD' });
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col items-center justify-center text-center space-y-8"
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Step Into Storytime</h1>
        <p className="text-xl text-gray-600">
          Create magical bedtime stories for your little ones
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" onClick={handleCreateStory} className="min-w-[200px]">
          <Sparkles className="mr-2 h-5 w-5" />
          Create a Story
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            // TODO: Implement surprise me functionality
          }}
          className="min-w-[200px]"
        >
          <Wand2 className="mr-2 h-5 w-5" />
          Surprise Me
        </Button>
      </div>
    </motion.div>
  );
}

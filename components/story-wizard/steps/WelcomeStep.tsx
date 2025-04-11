import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStepManager } from '../StepManager';
import { Sparkles, Wand2 } from 'lucide-react';

interface WelcomeStepProps {
  className?: string;
}

export default function WelcomeStep({ className }: WelcomeStepProps) {
  const { dispatch } = useStepManager();

  const handleStart = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleSurpriseMe = () => {
    // TODO: Implement random story generation
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 text-center"
    >
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Step Into Storytime
        </h1>
        <p className="text-muted-foreground text-lg">
          Let's create a magical bedtime story together!
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <Button size="lg" onClick={handleStart} className="w-full">
          <Wand2 className="mr-2 h-4 w-4" />
          Create a Story
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleSurpriseMe}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Surprise Me
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        We'll guide you through creating a unique story step by step
      </p>
    </motion.div>
  );
}

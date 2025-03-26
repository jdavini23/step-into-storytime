'use client';

import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface StoryLength {
  id: string;
  title: string;
  description: string;
  wordCount: string;
}

interface LengthStepProps {
  selectedLength: 'short' | 'medium' | 'long';
  onLengthChange: (length: 'short' | 'medium' | 'long') => void;
}

const STORY_LENGTHS: StoryLength[] = [
  {
    id: 'short',
    title: 'Short Story',
    description: 'Perfect for a quick bedtime story.',
    wordCount: '300-500 words',
  },
  {
    id: 'medium',
    title: 'Medium Story',
    description: 'Ideal for a regular bedtime reading session.',
    wordCount: '500-800 words',
  },
  {
    id: 'long',
    title: 'Long Story',
    description: 'Great for an extended storytelling experience.',
    wordCount: '800-1200 words',
  },
];

export function LengthStep({
  selectedLength,
  onLengthChange,
}: LengthStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Choose Story Length</h2>
      <p className="text-muted-foreground">How long should the story be?</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['short', 'medium', 'long'] as const).map((length) => (
          <Card
            key={length}
            className={cn(
              'p-4 cursor-pointer transition-colors',
              selectedLength === length
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            )}
            onClick={() => onLengthChange(length)}
          >
            <h3 className="font-semibold capitalize">{length}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {length === 'short' && '5 minutes'}
              {length === 'medium' && '10 minutes'}
              {length === 'long' && '15 minutes'}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

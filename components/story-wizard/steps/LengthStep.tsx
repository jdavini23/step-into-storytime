'use client';

import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { lengthSchema, LENGTH_OPTIONS, type StoryLength } from '@/lib/types';
import StepHelperText from '../StepHelperText';

interface LengthStepProps {
  length: StoryLength;
  onLengthChange: (length: StoryLength) => void;
  onValidationError?: (error: string) => void;
}

export function LengthStep({
  length,
  onLengthChange,
  onValidationError,
}: LengthStepProps) {
  const validateAndUpdate = (value: string) => {
    try {
      const validated = lengthSchema.parse(value);
      onLengthChange(validated);
    } catch (error) {
      if (error instanceof Error && onValidationError) {
        onValidationError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StepHelperText message="How long and colorful should your story be?" />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Choose Story Length</h2>
          <p className="text-muted-foreground">
            How long should your story be?
          </p>
        </div>

        <RadioGroup
          value={length}
          onValueChange={validateAndUpdate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {(Object.entries(LENGTH_OPTIONS) as [StoryLength, string][]).map(
            ([value, label]) => (
              <Card
                key={value}
                className={cn(
                  'relative p-4 cursor-pointer transition-all',
                  length === value ? 'border-primary' : ''
                )}
                onClick={() => validateAndUpdate(value)}
              >
                <RadioGroupItem value={value} id={value} className="sr-only" />
                <Label htmlFor={value} className="cursor-pointer">
                  <div className="font-semibold mb-1 capitalize">{value}</div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </Label>
              </Card>
            )
          )}
        </RadioGroup>
      </div>
    </div>
  );
}

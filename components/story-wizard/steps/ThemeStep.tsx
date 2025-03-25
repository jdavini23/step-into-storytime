'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ThemeStepProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

const THEMES = [
  {
    id: 'friendship',
    title: 'Friendship',
    description: 'A story about making friends and working together.',
  },
  {
    id: 'courage',
    title: 'Courage',
    description: 'A story about being brave and facing your fears.',
  },
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'A story about exploring and learning new things.',
  },
  {
    id: 'kindness',
    title: 'Kindness',
    description: 'A story about helping others and showing compassion.',
  },
];

export function ThemeStep({ selectedTheme, onThemeChange }: ThemeStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Choose a Theme</h2>
      <p className="text-muted-foreground">
        What message should the story convey?
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {THEMES.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              'p-4 cursor-pointer transition-colors',
              selectedTheme === theme.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            )}
            onClick={() => onThemeChange(theme.id)}
          >
            <h3 className="font-semibold">{theme.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {theme.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

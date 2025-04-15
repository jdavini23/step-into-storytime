'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { themeSchema } from '@/lib/types';
import StepHelperText from '../StepHelperText';

const SUGGESTED_THEMES = [
  'Friendship',
  'Adventure',
  'Discovery',
  'Courage',
  'Kindness',
  'Magic',
  'Family',
  'Learning',
  'Teamwork',
  'Imagination',
] as const;

interface ThemeStepProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  onValidationError?: (error: string) => void;
}

export function ThemeStep({
  theme,
  onThemeChange,
  onValidationError,
}: ThemeStepProps) {
  const validateAndUpdate = (value: string) => {
    try {
      const validated = themeSchema.parse(value);
      onThemeChange(validated);
    } catch (error) {
      if (error instanceof Error && onValidationError) {
        onValidationError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StepHelperText message="What kind of adventure will it be?" />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Choose Your Theme</h2>
          <p className="text-muted-foreground">
            What is the main message or feeling of your story?
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Story Theme</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => validateAndUpdate(e.target.value)}
              placeholder="Enter a theme..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Suggested Themes:</Label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_THEMES.map((suggestedTheme) => (
                <Badge
                  key={suggestedTheme}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => validateAndUpdate(suggestedTheme)}
                >
                  {suggestedTheme}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

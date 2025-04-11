'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { settingSchema } from '@/lib/types';

const SUGGESTED_SETTINGS = [
  'Enchanted Forest',
  'Space Station',
  'Underwater City',
  'Magic School',
  "Dragon's Castle",
  'Pirate Ship',
  'Fairy Garden',
  'Dinosaur Park',
  'Cloud Kingdom',
  'Time Machine',
] as const;

interface SettingStepProps {
  setting: string;
  onSettingChange: (setting: string) => void;
  onValidationError?: (error: string) => void;
}

export function SettingStep({
  setting,
  onSettingChange,
  onValidationError,
}: SettingStepProps) {
  const validateAndUpdate = (value: string) => {
    try {
      const validated = settingSchema.parse(value);
      onSettingChange(validated);
    } catch (error) {
      if (error instanceof Error && onValidationError) {
        onValidationError(error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Choose Your Setting</h2>
        <p className="text-muted-foreground">
          Where will your story take place?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="setting">Story Setting</Label>
          <Input
            id="setting"
            value={setting}
            onChange={(e) => validateAndUpdate(e.target.value)}
            placeholder="Enter a magical place..."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Suggested Settings:</Label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SETTINGS.map((suggestedSetting) => (
              <Badge
                key={suggestedSetting}
                variant="outline"
                className="cursor-pointer hover:bg-secondary"
                onClick={() => validateAndUpdate(suggestedSetting)}
              >
                {suggestedSetting}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

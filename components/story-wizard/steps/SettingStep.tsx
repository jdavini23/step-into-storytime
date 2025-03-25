'use client';

import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Setting {
  id: string;
  title: string;
  description: string;
}

interface SettingStepProps {
  selectedSetting: string;
  onSettingChange: (setting: string) => void;
}

const SETTINGS: Setting[] = [
  {
    id: 'enchanted-forest',
    title: 'Enchanted Forest',
    description:
      'A magical forest filled with mystical creatures and ancient secrets.',
  },
  {
    id: 'space-station',
    title: 'Space Station',
    description: 'A futuristic space station orbiting a distant planet.',
  },
  {
    id: 'underwater-city',
    title: 'Underwater City',
    description: 'A hidden city beneath the ocean waves.',
  },
  {
    id: 'dragon-castle',
    title: 'Dragon Castle',
    description: 'An ancient castle where dragons and humans live together.',
  },
];

export function SettingStep({
  selectedSetting,
  onSettingChange,
}: SettingStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Choose a Setting</h2>
        <p className="text-muted-foreground">
          Where will your story take place?
        </p>
      </div>

      <RadioGroup
        value={selectedSetting}
        onValueChange={onSettingChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {SETTINGS.map((setting) => (
          <Card
            key={setting.id}
            className={`relative p-4 cursor-pointer transition-all ${
              selectedSetting === setting.id ? 'border-primary' : ''
            }`}
            onClick={() => onSettingChange(setting.id)}
          >
            <RadioGroupItem
              value={setting.id}
              id={setting.id}
              className="sr-only"
            />
            <Label htmlFor={setting.id} className="cursor-pointer">
              <div className="font-semibold mb-2">{setting.title}</div>
              <p className="text-sm text-muted-foreground">
                {setting.description}
              </p>
            </Label>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStepManager } from '../StepManager';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { storySettings, type StorySettings } from '@/lib/constants';

interface StoryContext {
  setting: StorySettings;
  description: string;
}

export function StoryContextStep() {
  const { state, dispatch } = useStepManager();
  const [context, setContext] = useState<StoryContext>({
    setting: (state.storyData.setting as StorySettings) || '',
    description: state.storyData.settingDescription || '',
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!context.setting) {
      setError('Please select a setting for your story');
      return;
    }

    dispatch({
      type: 'UPDATE_STORY_DATA',
      payload: {
        setting: context.setting,
        settingDescription: context.description,
      },
    });
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {/* Setting Selection */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
          <Label className="text-lg font-semibold mb-4 block">
            Story Setting
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(storySettings).map(([key, setting]) => (
              <button
                key={key}
                onClick={() => {
                  setContext((prev) => ({
                    ...prev,
                    setting: key as StorySettings,
                  }));
                  setError('');
                }}
                className={`p-6 rounded-lg border-2 transition text-left
                  ${
                    context.setting === key
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/20 hover:border-primary/40'
                  }`}
              >
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  {setting.icon} {setting.label}
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  {setting.description}
                </p>
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>

        {/* Setting Details */}
        {context.setting && (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <Label className="text-lg font-semibold mb-4 block">
              Setting Details (Optional)
            </Label>
            <Input
              placeholder="Add more details about the setting..."
              value={context.description}
              onChange={(e) =>
                setContext((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'PREV_STEP' })}
        >
          Back
        </Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}

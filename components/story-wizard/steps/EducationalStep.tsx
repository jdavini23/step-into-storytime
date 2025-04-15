'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStepManager } from '../StepManager';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  educationalElements,
  type EducationalElement,
  readingLevels,
  type ReadingLevel,
  storyThemes,
  type StoryTheme,
} from '@/lib/constants';
import StepHelperText from '../StepHelperText';

interface EducationalContext {
  elements: EducationalElement[];
  readingLevel: ReadingLevel;
  theme: StoryTheme;
}

export function EducationalStep() {
  const { state, dispatch } = useStepManager();
  const [context, setContext] = useState<EducationalContext>({
    elements: state.storyData.educationalElements || [],
    readingLevel: (state.storyData.readingLevel as ReadingLevel) || 'beginner',
    theme: (state.storyData.theme as StoryTheme) || 'friendship',
  });
  const [error, setError] = useState('');

  const toggleElement = (element: EducationalElement) => {
    setContext((prev) => ({
      ...prev,
      elements: prev.elements.includes(element)
        ? prev.elements.filter((e) => e !== element)
        : [...prev.elements, element],
    }));
  };

  const handleNext = () => {
    if (!context.theme) {
      setError('Please select a theme for your story');
      return;
    }

    dispatch({
      type: 'UPDATE_STORY_DATA',
      payload: {
        educationalElements: context.elements,
        readingLevel: context.readingLevel,
        theme: context.theme,
      },
    });
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StepHelperText message="Want to add a lesson or value to your story? (Optional)" />
      <div className="h-full flex flex-col">
        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          {/* Theme Selection */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <Label className="text-lg font-semibold mb-4 block">
              Story Theme
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(storyThemes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => {
                    setContext((prev) => ({
                      ...prev,
                      theme: key as StoryTheme,
                    }));
                    setError('');
                  }}
                  className={`p-6 rounded-lg border-2 transition text-left
                    ${
                      context.theme === key
                        ? 'border-primary bg-primary/5'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                >
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    {theme.icon} {theme.label}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {theme.description}
                  </p>
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          {/* Reading Level Selection */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <Label className="text-lg font-semibold mb-4 block">
              Reading Level
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(readingLevels).map(([key, level]) => (
                <button
                  key={key}
                  onClick={() =>
                    setContext((prev) => ({
                      ...prev,
                      readingLevel: key as ReadingLevel,
                    }))
                  }
                  className={`p-6 rounded-lg border-2 transition
                    ${
                      context.readingLevel === key
                        ? 'border-primary bg-primary/5'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                >
                  <h4 className="text-lg font-semibold">{level.label}</h4>
                  <p className="text-sm text-gray-600">Ages {level.ageRange}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {level.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Educational Elements */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <Label className="text-lg font-semibold mb-4 block">
              Educational Elements (Optional)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(educationalElements).map(([key, element]) => (
                <button
                  key={key}
                  onClick={() => toggleElement(key as EducationalElement)}
                  className={`p-4 rounded-lg border-2 transition
                    ${
                      context.elements.includes(key as EducationalElement)
                        ? 'border-primary bg-primary/5'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                >
                  <span className="text-2xl mb-2 block">{element.icon}</span>
                  <h4 className="text-sm font-semibold">{element.label}</h4>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation - Fixed at bottom */}
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
    </div>
  );
}

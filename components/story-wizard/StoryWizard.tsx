'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { CharacterStep } from './steps/CharacterStep';
import { StoryData } from '../story/common/types';
import { LengthStep } from './steps/LengthStep';
import { SettingStep } from './steps/SettingStep';
// Using a different file to fix module resolution issues
import { ThemeStep } from './steps/ThemeStepComponent';

interface Setting {
  id: string;
  title: string;
  description: string;
}

interface Theme {
  id: string;
  title: string;
  description: string;
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

const THEMES: Theme[] = [
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

type WizardStep = 'character' | 'setting' | 'theme' | 'length';

interface StoryWizardProps {
  onComplete: (story: StoryData) => void;
  onError: (error: string) => void;
}

const steps: WizardStep[] = ['character', 'setting', 'theme', 'length'];

export default function StoryWizard({ onComplete, onError }: StoryWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('character');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    character: {
      name: '',
      age: '',
      traits: [] as string[],
    },
    setting: '',
    theme: '',
    length: 'medium' as 'short' | 'medium' | 'long',
  });

  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const prevStep = steps[currentStepIndex - 1];
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  const handleCharacterChange = (character: typeof formData.character) => {
    setFormData((prev) => ({ ...prev, character }));
  };

  const handleSettingChange = (setting: string) => {
    setFormData((prev) => ({ ...prev, setting }));
  };

  const handleThemeChange = (theme: string) => {
    setFormData((prev) => ({ ...prev, theme }));
  };

  const handleLengthChange = (length: 'short' | 'medium' | 'long') => {
    setFormData((prev) => ({ ...prev, length }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'character':
        return (
          <CharacterStep
            character={formData.character}
            onCharacterChange={handleCharacterChange}
          />
        );
      case 'setting':
        return (
          <SettingStep
            selectedSetting={formData.setting}
            onSettingChange={handleSettingChange}
          />
        );
      case 'theme':
        return (
          <ThemeStep
            selectedTheme={formData.theme}
            onThemeChange={handleThemeChange}
          />
        );
      case 'length':
        return (
          <LengthStep
            selectedLength={formData.length}
            onLengthChange={handleLengthChange}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsGenerating(true);

      // Prepare the request payload
      const payload = {
        title: `${formData.character.name}'s ${
          SETTINGS.find((s) => s.id === formData.setting)?.title || 'Adventure'
        }`,
        mainCharacter: {
          name: formData.character.name,
          age: formData.character.age,
          traits: formData.character.traits,
        },
        setting:
          SETTINGS.find((s) => s.id === formData.setting)?.description ||
          formData.setting,
        theme:
          THEMES.find((t) => t.id === formData.theme)?.description ||
          formData.theme,
        plotElements: [],
      };

      // Call the API
      const response = await fetch('/api/generate-story/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate story');
      }

      const data = await response.json();

      // Get the initial branch content
      const initialContent = data.content;
      const branches = data.branches;

      // Create the story object
      const story: StoryData = {
        id: Date.now().toString(),
        userId: '', // This will be set by the API
        title: payload.title,
        description: `A story about ${formData.character.name} in ${
          SETTINGS.find((s) => s.id === formData.setting)?.title
        }`,
        content: {
          en: [initialContent],
          es: ['Translation will be added later...'], // TODO: Add translation
        },
        targetAge: parseInt(formData.character.age) || 6,
        readingLevel: 'beginner',
        theme: formData.theme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mainCharacter: {
          name: formData.character.name,
          age: formData.character.age,
          traits: formData.character.traits,
          appearance: '',
        },
        setting:
          SETTINGS.find((s) => s.id === formData.setting)?.description ||
          formData.setting,
        plotElements: [],
        metadata: {
          targetAge: parseInt(formData.character.age) || 6,
          difficulty: 'easy',
          theme: formData.theme,
          setting: SETTINGS.find((s) => s.id === formData.setting)?.title || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          wordCount: initialContent.split(/\s+/).length,
          readingTime: Math.ceil(initialContent.split(/\s+/).length / 200),
        },
        accessibility: {
          contrast: 'normal',
          motionReduced: false,
          fontSize: 'medium',
          lineHeight: 1.5,
        },
      };

      onComplete(story);
    } catch (error) {
      console.error('Story generation error:', error);
      onError(
        error instanceof Error
          ? error.message
          : 'Failed to generate story. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStepIndex === 0 || isGenerating}
        >
          Back
        </Button>
        {currentStepIndex === steps.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Story...
              </>
            ) : (
              'Create Story'
            )}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
    </Card>
  );
}

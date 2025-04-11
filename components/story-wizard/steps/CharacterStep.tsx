'use client';

import { motion } from 'framer-motion';
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import { useStepManager } from '../StepManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { characterTraits } from '@/lib/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const MAX_TRAITS = 3;

export function CharacterStep() {
  const { state, dispatch } = useStepManager();
  const [character, setCharacter] = useState({
    name: state.storyData.character?.name || '',
    age: state.storyData.character?.age || '',
    traits: state.storyData.character?.traits || [],
    appearance: state.storyData.character?.appearance || '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleTraitToggle = (trait: string) => {
    setError(null);
    setCharacter((prev) => {
      const traits = prev.traits.includes(trait)
        ? prev.traits.filter((t: string) => t !== trait)
        : prev.traits.length < MAX_TRAITS
        ? [...prev.traits, trait]
        : prev.traits;

      if (!prev.traits.includes(trait) && prev.traits.length >= MAX_TRAITS) {
        setError(`You can only select up to ${MAX_TRAITS} traits`);
      }

      return {
        ...prev,
        traits,
      };
    });
  };

  const handleNext = () => {
    if (!character.name) {
      setError('Please enter a character name');
      return;
    }

    if (character.traits.length === 0) {
      setError('Please select at least one trait');
      return;
    }

    dispatch({
      type: 'UPDATE_STORY_DATA',
      payload: {
        character: {
          name: character.name,
          age: character.age ? Number(character.age) : undefined,
          traits: character.traits,
        },
      },
    });
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex-1 w-full max-w-6xl mx-auto p-6 mb-40"
      >
        {/* Character Builder Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visual Character Creator */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold mb-4">Design Your Hero</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  value={character.name}
                  onChange={(e) => {
                    setError(null);
                    setCharacter((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  placeholder="Enter a name..."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={character.age}
                  onChange={(e) => {
                    setError(null);
                    setCharacter((prev) => ({ ...prev, age: e.target.value }));
                  }}
                  placeholder="How old are they?"
                  className="w-full"
                  type="number"
                  min="1"
                  max="12"
                />
              </div>

              <div className="space-y-2">
                <Label>Character Traits (Select 1-{MAX_TRAITS})</Label>
                <div className="flex flex-wrap gap-2">
                  {characterTraits.map((trait: string) => (
                    <Button
                      key={trait}
                      variant={
                        character.traits.includes(trait) ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handleTraitToggle(trait)}
                      className="rounded-full"
                      disabled={
                        !character.traits.includes(trait) &&
                        character.traits.length >= MAX_TRAITS
                      }
                    >
                      {trait}
                    </Button>
                  ))}
                </div>
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          {/* Character Preview */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold mb-4">Preview</h3>
            <div className="aspect-square rounded-lg bg-gradient-to-b from-primary/5 to-primary/20 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">
                  {character.traits.includes('Brave')
                    ? '🦸‍♂️'
                    : character.traits.includes('Kind')
                    ? '🤗'
                    : character.traits.includes('Smart')
                    ? '🤓'
                    : '😊'}
                </span>
                {character.name && (
                  <p className="text-xl font-semibold">{character.name}</p>
                )}
                {character.age && (
                  <p className="text-sm text-gray-600">Age: {character.age}</p>
                )}
                {character.traits.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {character.traits.join(' • ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixed Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'PREV_STEP' })}
              className="px-8 shadow-sm"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!character.name || character.traits.length === 0}
              className="px-8 shadow-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

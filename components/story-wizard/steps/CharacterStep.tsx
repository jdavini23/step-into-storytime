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

export function CharacterStep() {
  const { state, dispatch } = useStepManager();
  const [character, setCharacter] = useState({
    name: state.storyData.character?.name || '',
    age: state.storyData.character?.age || '',
    traits: state.storyData.character?.traits || [],
    appearance: state.storyData.character?.appearance || '',
  });

  const handleTraitToggle = (trait: string) => {
    setCharacter((prev) => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter((t: string) => t !== trait)
        : [...prev.traits, trait],
    }));
  };

  const handleNext = () => {
    if (!character.name) {
      return; // Show error
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
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
                onChange={(e) =>
                  setCharacter((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter a name..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                value={character.age}
                onChange={(e) =>
                  setCharacter((prev) => ({ ...prev, age: e.target.value }))
                }
                placeholder="How old are they?"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Character Traits</Label>
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
                  >
                    {trait}
                  </Button>
                ))}
              </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'PREV_STEP' })}
        >
          Back
        </Button>
        <Button onClick={handleNext} disabled={!character.name}>
          Next
        </Button>
      </div>
    </motion.div>
  );
}

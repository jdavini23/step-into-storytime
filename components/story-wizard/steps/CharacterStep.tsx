'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Character {
  name: string;
  age: string;
  traits: string[];
}

interface CharacterStepProps {
  character: Character;
  onCharacterChange: (character: Character) => void;
}

const SUGGESTED_TRAITS = [
  'Brave',
  'Curious',
  'Kind',
  'Creative',
  'Funny',
  'Smart',
  'Adventurous',
  'Caring',
  'Determined',
  'Friendly',
];

export function CharacterStep({
  character,
  onCharacterChange,
}: CharacterStepProps) {
  const [newTrait, setNewTrait] = useState('');

  const addTrait = (trait: string) => {
    if (trait && !character.traits.includes(trait)) {
      onCharacterChange({
        ...character,
        traits: [...character.traits, trait],
      });
    }
    setNewTrait('');
  };

  const removeTrait = (trait: string) => {
    onCharacterChange({
      ...character,
      traits: character.traits.filter((t) => t !== trait),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create Your Character</h2>
        <p className="text-muted-foreground">
          Tell us about the main character of your story.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Character Name</Label>
          <Input
            id="name"
            value={character.name}
            onChange={(e) =>
              onCharacterChange({ ...character, name: e.target.value })
            }
            placeholder="Enter character name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Character Age</Label>
          <Input
            id="age"
            type="number"
            min="1"
            max="12"
            value={character.age}
            onChange={(e) =>
              onCharacterChange({ ...character, age: e.target.value })
            }
            placeholder="Enter age (1-12)"
          />
        </div>

        <div className="space-y-2">
          <Label>Character Traits</Label>
          <div className="flex flex-wrap gap-2">
            {character.traits.map((trait) => (
              <Badge
                key={trait}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTrait(trait)}
              >
                {trait} ×
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newTrait}
              onChange={(e) => setNewTrait(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTrait(newTrait);
                }
              }}
              placeholder="Add a trait"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => addTrait(newTrait)}
            >
              Add
            </Button>
          </div>

          <div className="mt-2">
            <Label className="text-sm">Suggested Traits:</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SUGGESTED_TRAITS.filter(
                (trait) => !character.traits.includes(trait)
              ).map((trait) => (
                <Badge
                  key={trait}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => addTrait(trait)}
                >
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

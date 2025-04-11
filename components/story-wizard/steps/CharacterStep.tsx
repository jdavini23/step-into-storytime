'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Character, characterSchema } from '@/lib/types';
import { SUGGESTED_TRAITS } from '@/lib/story-steps';

interface CharacterStepProps {
  character: Character;
  onCharacterChange: (character: Character) => void;
  onValidationError?: (error: string) => void;
}

export function CharacterStep({
  character,
  onCharacterChange,
  onValidationError,
}: CharacterStepProps) {
  const [newTrait, setNewTrait] = useState('');

  const validateAndUpdate = (
    updatedCharacter: Omit<Character, 'age'> & { age: string }
  ) => {
    try {
      const validated = characterSchema.parse(updatedCharacter);
      onCharacterChange(validated);
    } catch (error) {
      if (error instanceof Error && onValidationError) {
        onValidationError(error.message);
      }
    }
  };

  const addTrait = (trait: string) => {
    if (trait && !character.traits.includes(trait)) {
      validateAndUpdate({
        ...character,
        age: String(character.age),
        traits: [...character.traits, trait],
      });
    }
    setNewTrait('');
  };

  const removeTrait = (trait: string) => {
    validateAndUpdate({
      ...character,
      age: String(character.age),
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
              validateAndUpdate({
                ...character,
                name: e.target.value,
                age: String(character.age),
              })
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
              validateAndUpdate({ ...character, age: e.target.value })
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

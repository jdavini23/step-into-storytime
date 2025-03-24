'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Character {
  name: string;
  age: string;
  traits: string[];
  appearance: string;
}

interface CharacterCreatorProps {
  onSubmit: (character: Character) => void;
  className?: string;
}

export default function CharacterCreator({
  onSubmit,
  className,
}: CharacterCreatorProps) {
  const [character, setCharacter] = useState<Character>({
    name: '',
    age: '',
    traits: [],
    appearance: '',
  });
  const [currentTrait, setCurrentTrait] = useState('');

  const handleAddTrait = () => {
    if (currentTrait.trim() && character.traits.length < 5) {
      setCharacter((prev) => ({
        ...prev,
        traits: [...prev.traits, currentTrait.trim()],
      }));
      setCurrentTrait('');
    }
  };

  const handleRemoveTrait = (trait: string) => {
    setCharacter((prev) => ({
      ...prev,
      traits: prev.traits.filter((t) => t !== trait),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (character.name && character.age) {
      onSubmit(character);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor="name">Character Name</Label>
        <Input
          id="name"
          value={character.name}
          onChange={(e) =>
            setCharacter((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter character name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Character Age</Label>
        <Input
          id="age"
          value={character.age}
          onChange={(e) =>
            setCharacter((prev) => ({ ...prev, age: e.target.value }))
          }
          placeholder="Enter character age"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="traits">Character Traits (max 5)</Label>
        <div className="flex gap-2">
          <Input
            id="traits"
            value={currentTrait}
            onChange={(e) => setCurrentTrait(e.target.value)}
            placeholder="Enter a trait"
            disabled={character.traits.length >= 5}
          />
          <Button
            type="button"
            onClick={handleAddTrait}
            disabled={!currentTrait.trim() || character.traits.length >= 5}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {character.traits.map((trait) => (
            <Badge
              key={trait}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {trait}
              <button
                type="button"
                onClick={() => handleRemoveTrait(trait)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {trait}</span>
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appearance">Character Appearance</Label>
        <Textarea
          id="appearance"
          value={character.appearance}
          onChange={(e) =>
            setCharacter((prev) => ({ ...prev, appearance: e.target.value }))
          }
          placeholder="Describe your character's appearance"
          className="min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!character.name || !character.age}
      >
        Create Character
      </Button>
    </form>
  );
}

'use client';

import { motion } from 'framer-motion';
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  useState,
  useRef,
} from 'react';
import { useStepManager } from '../StepManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { characterTraits } from '@/lib/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import StepHelperText from '../StepHelperText';

const MAX_TRAITS = 3;
const BUTTON_SOUND_URL = '/sounds/button-press.mp3'; // Place a cartoon-like sound in public/sounds/

interface CharacterState {
  name: string;
  age: string;
  gender: 'Male' | 'Female' | '';
  traits: string[];
  appearance?: string;
}

export function CharacterStep() {
  const { state, dispatch } = useStepManager();
  const [character, setCharacter] = useState<CharacterState>({
    name: state.storyData.character?.name || '',
    age: state.storyData.character?.age
      ? String(state.storyData.character?.age)
      : '',
    gender: (state.storyData.character?.gender as 'Male' | 'Female') || '',
    traits: state.storyData.character?.traits || [],
    appearance: state.storyData.character?.appearance || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playButtonSound = () => {
    if (!muted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

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
    if (!character.gender) {
      setError('Please select a gender');
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
          gender: character.gender,
          traits: character.traits,
        },
      },
    });
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <div className="h-full flex flex-col">
      <StepHelperText message="Let's pick your hero's name and look!" />
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
                <Label>Gender</Label>
                <div className="flex gap-4">
                  {['Male', 'Female'].map((g) => (
                    <motion.div
                      key={g}
                      whileTap={{ scale: 1.15, rotate: -5 }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="inline-block"
                    >
                      <Button
                        variant={character.gender === g ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => {
                          setError(null);
                          setCharacter((prev) => ({
                            ...prev,
                            gender: g as 'Male' | 'Female',
                          }));
                          playButtonSound();
                        }}
                        className={`rounded-full px-10 py-4 text-xl font-bold shadow-lg border-2 ${
                          character.gender === g
                            ? 'bg-pink-200 border-pink-400 text-pink-900'
                            : 'bg-yellow-100 border-yellow-300 text-yellow-700'
                        }`}
                        aria-pressed={character.gender === g}
                      >
                        {g}
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-xs underline text-gray-500 hover:text-gray-700"
                    onClick={() => setMuted((m) => !m)}
                  >
                    {muted ? 'Unmute sound effects' : 'Mute sound effects'}
                  </button>
                </div>
                <audio ref={audioRef} src={BUTTON_SOUND_URL} preload="auto" />
              </div>

              <div className="space-y-2">
                <Label>Character Traits (Select 1-{MAX_TRAITS})</Label>
                <div className="flex flex-wrap gap-2">
                  {characterTraits.map((trait: string) => (
                    <motion.div
                      key={trait}
                      whileTap={{ scale: 1.15, rotate: 5 }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="inline-block"
                    >
                      <Button
                        variant={
                          character.traits.includes(trait)
                            ? 'default'
                            : 'outline'
                        }
                        size="lg"
                        onClick={() => {
                          handleTraitToggle(trait);
                          playButtonSound();
                        }}
                        className={`rounded-full px-8 py-3 text-lg font-bold shadow-md border-2 ${
                          character.traits.includes(trait)
                            ? 'bg-blue-200 border-blue-400 text-blue-900'
                            : 'bg-green-100 border-green-300 text-green-700'
                        }`}
                        disabled={
                          !character.traits.includes(trait) &&
                          character.traits.length >= MAX_TRAITS
                        }
                      >
                        {trait}
                      </Button>
                    </motion.div>
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
                {character.gender && (
                  <p className="text-sm text-gray-600">
                    Gender: {character.gender}
                  </p>
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
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { WizardContext } from '../wizard-context';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { characterTraits } from '../../../lib/constants';
import { Alert, AlertDescription } from '../../ui/alert';
import { AlertCircle } from 'lucide-react';

interface CharacterForm {
  name: string;
  age: number | '';
  gender: string;
  traits: string[];
  customTrait: string;
}

const TeddyBearSVG = () => (
  <svg
    aria-hidden="true"
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    className="inline-block align-middle mr-2 -mt-1"
  >
    <circle cx="24" cy="28" r="12" fill="#fde68a" />
    <circle cx="14" cy="18" r="5" fill="#fde68a" />
    <circle cx="34" cy="18" r="5" fill="#fde68a" />
    <ellipse cx="24" cy="34" rx="4" ry="2.5" fill="#fbbf24" />
    <ellipse cx="24" cy="28" rx="7" ry="6" fill="#fff" />
    <ellipse cx="24" cy="30.5" rx="2.5" ry="1.5" fill="#fbbf24" />
    <circle cx="20" cy="27" r="1" fill="#444" />
    <circle cx="28" cy="27" r="1" fill="#444" />
    <ellipse cx="24" cy="31.5" rx="1" ry="0.5" fill="#444" />
  </svg>
);

const genderOptions = [
  {
    value: 'boy',
    label: 'Boy',
    icon: (
      <span role="img" aria-label="Boy">
        🧒
      </span>
    ),
  },
  {
    value: 'girl',
    label: 'Girl',
    icon: (
      <span role="img" aria-label="Girl">
        👧
      </span>
    ),
  },
];

const traitOptions = [
  'Brave',
  'Curious',
  'Kind',
  'Silly',
  'Adventurous',
  'Creative',
  'Helpful',
  'Gentle',
];

const areArraysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
};

const CharacterStep: React.FC = () => {
  const { data, updateData, setCanGoNext } = useContext(WizardContext);
  const [customTrait, setCustomTrait] = useState('');
  const { register, setValue, getValues, formState, watch } =
    useForm<CharacterForm>({
      defaultValues: {
        name: data.character?.name || '',
        age: data.character?.age || '',
        gender: data.character?.gender || '',
        traits: data.character?.traits || [],
        customTrait: '',
      },
      mode: 'onChange',
    });

  // Watch for changes
  const watchedName = watch('name');
  const watchedAge = watch('age');
  const watchedGender = watch('gender');
  const watchedTraits = watch('traits');

  useEffect(() => {
    setCanGoNext(
      Boolean(
        watchedName &&
          watchedGender &&
          watchedTraits &&
          watchedTraits.length > 0 &&
          watchedAge &&
          Number(watchedAge) >= 2 &&
          Number(watchedAge) <= 12
      )
    );
  }, [watchedName, watchedGender, watchedTraits, watchedAge, setCanGoNext]);

  // Only update context if values actually changed
  useEffect(() => {
    const prev = data.character || {};
    if (
      watchedName !== prev.name ||
      watchedAge !== prev.age ||
      watchedGender !== prev.gender ||
      !areArraysEqual(watchedTraits || [], prev.traits || [])
    ) {
      updateData({
        character: {
          name: watchedName,
          age: watchedAge,
          gender: watchedGender,
          traits: watchedTraits,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedName, watchedAge, watchedGender, watchedTraits]);

  // Badge toggle logic
  const toggleTrait = (trait: string) => {
    const traits = getValues('traits') || [];
    if (traits.includes(trait)) {
      setValue(
        'traits',
        traits.filter((t) => t !== trait),
        { shouldValidate: true }
      );
    } else {
      setValue('traits', [...traits, trait], { shouldValidate: true });
    }
  };

  const handleAddCustomTrait = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customTrait.trim();
    if (val && !watchedTraits.includes(val)) {
      setValue('traits', [...watchedTraits, val], { shouldValidate: true });
    }
    setCustomTrait('');
  };

  return (
    <form className="space-y-6" autoComplete="off">
      <div className="flex items-center gap-2 mb-2">
        <TeddyBearSVG />
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          Who is this story for?
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Let's make it personal! Tell us about your child's name, age, gender,
        and favorite traits.
      </p>
      <div className="space-y-3">
        <label className="block font-semibold">Child's Name</label>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 text-xl pointer-events-none select-none">
              ✨
            </span>
            <input
              {...register('name', { required: true })}
              className="w-full rounded-full py-3 pl-10 pr-4 text-base font-semibold shadow-md border-2 border-gray-200 bg-gradient-to-r from-yellow-50 via-pink-50 to-indigo-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 outline-none"
              placeholder="e.g. Jamie ✨"
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <label className="block font-semibold">Age</label>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xl text-yellow-400">🎂</span>
          {[...Array(11)].map((_, i) => {
            const age = i + 2;
            const selected = watchedAge == age;
            return (
              <button
                key={age}
                type="button"
                className={`px-4 py-2 rounded-full border-2 text-base font-semibold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400
                  bg-gradient-to-r from-yellow-100 via-pink-100 to-indigo-100
                  ${
                    selected
                      ? 'border-indigo-500 text-indigo-800 scale-105 shadow-md ring-2 ring-indigo-200'
                      : 'border-gray-200 text-gray-700 hover:scale-105 hover:shadow-lg'
                  }
                `}
                onClick={() => setValue('age', age, { shouldValidate: true })}
                aria-pressed={selected}
                tabIndex={0}
              >
                {age}
                {selected && (
                  <span
                    className="ml-1 animate-bounce text-yellow-400 select-none"
                    aria-hidden="true"
                  >
                    🎈
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        <label className="block font-semibold">Gender</label>
        <div className="flex gap-3">
          {genderOptions.map((g) => (
            <button
              type="button"
              key={g.value}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                watchedGender === g.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
              onClick={() =>
                setValue('gender', g.value, { shouldValidate: true })
              }
              aria-pressed={watchedGender === g.value}
              tabIndex={0}
            >
              <span className="text-xl mb-1">{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <label className="block font-semibold">Traits</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {traitOptions.map((trait) => (
            <button
              type="button"
              key={trait}
              className={`px-3 py-1 rounded-full border-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                watchedTraits.includes(trait)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
              onClick={() => toggleTrait(trait)}
              aria-pressed={watchedTraits.includes(trait)}
              tabIndex={0}
            >
              {trait}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center mt-2">
          <input
            type="text"
            value={customTrait}
            onChange={(e) => setCustomTrait(e.target.value)}
            className="input input-bordered rounded-full py-2 px-4 text-sm shadow-sm border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 flex-1 min-w-0"
            placeholder="Add custom trait"
            aria-label="Add custom trait"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomTrait(e);
              }
            }}
          />
          <button
            type="button"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-200 via-pink-200 to-indigo-200 text-indigo-700 font-semibold shadow transition hover:from-yellow-300 hover:to-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!customTrait.trim()}
            onClick={handleAddCustomTrait}
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10 4v12M4 10h12"
                stroke="#a21caf"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add
          </button>
        </div>
      </div>
    </form>
  );
};

export default CharacterStep;

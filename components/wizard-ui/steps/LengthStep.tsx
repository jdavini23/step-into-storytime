import React, { useEffect } from 'react';
import { useContext } from 'react';
import { WizardContext, WizardData, ReadingLevel } from '../wizard-context';

const lengths = [5, 10, 15];
const readingLevels = [
  { value: 'beginner', label: 'Beginner', icon: '🌱' }, // Seedling for beginner
  { value: 'intermediate', label: 'Intermediate', icon: '🌳' }, // Tree for intermediate
  { value: 'advanced', label: 'Advanced', icon: '⭐' }, // Star for advanced
];

const MoonHourglassSVG = () => (
  <svg
    aria-hidden="true"
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    className="inline-block mr-2 -mt-1"
  >
    <ellipse cx="18" cy="30" rx="10" ry="3" fill="#c7d2fe" />
    <ellipse cx="18" cy="6" rx="8" ry="3" fill="#fef08a" />
    <rect x="14" y="8" width="8" height="16" rx="4" fill="#fbbf24" />
    <ellipse cx="18" cy="24" rx="4" ry="1.5" fill="#fbbf24" />
  </svg>
);

const LengthStep: React.FC = () => {
  const { data, updateData, setCanGoNext } = useContext(WizardContext);
  const selectedLength = data.length || 5; // Default length
  const selectedReadingLevel = data.readingLevel || ''; // Default reading level

  // Validation: require both length and reading level
  useEffect(() => {
    const isValid =
      lengths.includes(selectedLength) &&
      readingLevels.some((level) => level.value === selectedReadingLevel);
    setCanGoNext(isValid);
  }, [selectedLength, selectedReadingLevel, setCanGoNext]);

  const handleLengthSelect = (val: number) => {
    updateData({ length: val });
  };

  const handleReadingLevelSelect = (val: string) => {
    updateData({ readingLevel: val as ReadingLevel });
  };

  return (
    <form className="space-y-8" autoComplete="off">
      {' '}
      {/* Increased spacing */}
      {/* Length Selection Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MoonHourglassSVG />
          <h2 className="text-2xl font-bold text-indigo-700">
            How long should the story be?
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Pick a bedtime-perfect length (in minutes).
        </p>
        <div className="space-y-3">
          {/* <label className="block font-semibold">Story Length (minutes)</label> Removed redundant label */}
          <div className="flex gap-4">
            {lengths.map((len, i) => {
              // Playful icons and gradients for each pill
              const icons = ['\u{1F550}', '\u{1F319}', '\u{2B50}']; // Clock, Moon, Star
              const gradients = [
                'from-yellow-100 via-pink-100 to-indigo-100',
                'from-pink-100 via-indigo-100 to-yellow-100',
                'from-indigo-100 via-yellow-100 to-pink-100',
              ];
              const selected = selectedLength === len;
              return (
                <button
                  key={len}
                  type="button"
                  className={`relative px-7 py-4 rounded-full border-2 text-lg font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex flex-col items-center justify-center
                    bg-gradient-to-r ${gradients[i]}
                    ${
                      selected
                        ? 'border-indigo-500 text-indigo-800 scale-105 shadow-xl ring-2 ring-indigo-200'
                        : 'border-gray-200 text-gray-700 hover:scale-105 hover:shadow-lg'
                    }
                  `}
                  onClick={() => handleLengthSelect(len)}
                  aria-pressed={selected}
                  tabIndex={0}
                >
                  <span className="text-2xl mb-1" aria-hidden="true">
                    {String.fromCodePoint(icons[i].codePointAt(0)!)}
                  </span>
                  <span className="leading-none">{len} min</span>
                  {/* Removed confusing bounce animation */}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Reading Level Selection Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" role="img" aria-label="Books">
            📚
          </span>
          <h2 className="text-2xl font-bold text-indigo-700">
            Choose the reading complexity
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Select a level that matches the child's reading ability.
        </p>
        <div className="space-y-3">
          {/* <label className="block font-semibold">Reading Level</label> Removed redundant label */}
          <div className="flex gap-4">
            {readingLevels.map((level) => {
              const selected = selectedReadingLevel === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  className={`relative px-7 py-4 rounded-full border-2 text-lg font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex flex-col items-center justify-center
                    bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 /* Different gradient */
                    ${
                      selected
                        ? 'border-purple-500 text-purple-800 scale-105 shadow-xl ring-2 ring-purple-200'
                        : 'border-gray-200 text-gray-700 hover:scale-105 hover:shadow-lg'
                    }
                  `}
                  onClick={() => handleReadingLevelSelect(level.value)}
                  aria-pressed={selected}
                  tabIndex={0}
                >
                  <span className="text-2xl mb-1" aria-hidden="true">
                    {level.icon}
                  </span>
                  <span className="leading-none">{level.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </form>
  );
};

export default LengthStep;

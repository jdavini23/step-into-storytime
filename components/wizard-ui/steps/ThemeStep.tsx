import React, { useEffect } from 'react';
import { useContext } from 'react';
import { WizardContext } from '../wizard-context';
import { themeSchema } from '@/lib/validation/storyWizard';

const themes = [
  { value: 'adventure', label: 'Adventure', icon: (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><rect x="6" y="20" width="20" height="6" rx="3" fill="#fbbf24"/><polygon points="16,6 26,20 6,20" fill="#f59e42"/></svg>
  ) },
  { value: 'friendship', label: 'Friendship', icon: (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><circle cx="12" cy="16" r="6" fill="#fca5a5"/><circle cx="20" cy="16" r="6" fill="#a5b4fc"/><ellipse cx="16" cy="24" rx="8" ry="3" fill="#fef08a"/></svg>
  ) },
  { value: 'mystery', label: 'Mystery', icon: (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><ellipse cx="16" cy="20" rx="8" ry="5" fill="#a3e635"/><ellipse cx="16" cy="14" rx="5" ry="8" fill="#6366f1"/><ellipse cx="16" cy="10" rx="2" ry="1" fill="#fff"/></svg>
  ) },
  { value: 'kindness', label: 'Kindness', icon: (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><path d="M16 29s-8-6.5-8-12.5S11.5 6 16 12.5 24 10.5 24 16.5 16 29 16 29z" fill="#fbbf24"/></svg>
  ) },
];

const validateThemeStep = (value: string) => {
  const result = themeSchema.safeParse(value);
  return {
    isValid: result.success,
    error: result.success ? undefined : result.error.errors[0]?.message,
  };
};

const ThemeStep: React.FC = () => {
  const { data, updateData, setCanGoNext } = useContext(WizardContext);
  const value = data.theme || '';

  useEffect(() => {
    const validation = validateThemeStep(value);
    setCanGoNext(validation.isValid);
  }, [value, setCanGoNext]);

  const handleSelect = (val: string) => {
    updateData({ theme: val });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
          What’s the story’s vibe? <span className="inline-block animate-wiggle">🦊</span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">Pick a theme to guide the adventure’s spirit.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {themes.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${value === t.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
            onClick={() => handleSelect(t.value)}
            aria-pressed={value === t.value}
            tabIndex={0}
          >
            {t.icon}
            <span className="mt-2">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeStep;

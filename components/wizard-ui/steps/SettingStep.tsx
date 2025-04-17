import React, { useEffect } from 'react';
import { useContext } from 'react';
import { WizardContext } from '../wizard-context';
import { settingSchema } from '@/lib/validation/storyWizard';

const settings = [
  { value: 'forest', label: 'Enchanted Forest', icon: (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="20" r="8" fill="#bbf7d0"/><path d="M16 6l-4 8h8l-4-8z" fill="#34d399"/><rect x="14" y="20" width="4" height="6" rx="2" fill="#a3e635"/></svg>
  ) },
  { value: 'space', label: 'Outer Space', icon: (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#a5b4fc"/><circle cx="16" cy="16" r="7" fill="#6366f1"/><circle cx="21" cy="11" r="2" fill="#facc15"/></svg>
  ) },
  { value: 'castle', label: 'Mystic Castle', icon: (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><rect x="8" y="14" width="16" height="10" fill="#fca5a5"/><rect x="12" y="8" width="8" height="6" fill="#f87171"/><rect x="14" y="4" width="4" height="4" fill="#fbbf24"/></svg>
  ) },
  { value: 'ocean', label: 'Dreamy Ocean', icon: (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32"><ellipse cx="16" cy="24" rx="10" ry="4" fill="#7dd3fc"/><ellipse cx="16" cy="18" rx="8" ry="3" fill="#38bdf8"/><ellipse cx="16" cy="13" rx="6" ry="2" fill="#0ea5e9"/></svg>
  ) },
];

const validateSettingStep = (value: string) => {
  const result = settingSchema.safeParse(value);
  return {
    isValid: result.success,
    error: result.success ? undefined : result.error.errors[0]?.message,
  };
};

const SettingStep: React.FC = () => {
  const { data, updateData, setCanGoNext } = useContext(WizardContext);
  const value = data.setting || '';

  useEffect(() => {
    const validation = validateSettingStep(value);
    setCanGoNext(validation.isValid);
  }, [value, setCanGoNext]);

  const handleSelect = (val: string) => {
    updateData({ setting: val });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
          Where will the adventure happen? <span className="inline-block animate-wiggle">🌙</span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">Pick a magical setting for the story to unfold.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {settings.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${value === s.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
            onClick={() => handleSelect(s.value)}
            aria-pressed={value === s.value}
            tabIndex={0}
          >
            {s.icon}
            <span className="mt-2">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingStep;

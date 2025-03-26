'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Option {
  label: string;
  value: string;
}

interface MultipleChoiceProps {
  options: Option[];
  onSelect: (value: string | string[]) => void;
  multiSelect?: boolean;
}

export default function MultipleChoice({
  options,
  onSelect,
  multiSelect = false,
}: MultipleChoiceProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleSelect = (value: string) => {
    if (multiSelect) {
      // Toggle selection for multi-select
      const newSelected = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];

      setSelectedValues(newSelected);
    } else {
      // Single select - immediately submit
      onSelect(value);
    }
  };

  const handleSubmit = () => {
    if (multiSelect) {
      onSelect(selectedValues);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ scale: 1 }}
          >
            <button
              type="button"
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                multiSelect && selectedValues.includes(option.value)
                  ? 'border-violet-600 bg-violet-50 text-violet-900'
                  : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50'
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <div className="flex items-center">
                {multiSelect && (
                  <div
                    className={`h-5 w-5 rounded-full border mr-2 flex items-center justify-center ${
                      selectedValues.includes(option.value)
                        ? 'border-violet-600 bg-violet-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedValues.includes(option.value) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                )}
                <span>{option.label}</span>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {multiSelect && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={selectedValues.length === 0}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

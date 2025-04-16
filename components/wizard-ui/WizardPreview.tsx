import React, { useContext } from 'react';
import { WizardContext } from './wizard-context';
import { motion, AnimatePresence } from 'framer-motion';

const generatePreviewMessage = (data: any, currentStep: number) => {
  if (!data.character?.name) {
    return 'Start by adding a character to begin your story...';
  }
  if (!data.setting) {
    return `${data.character.name} is waiting for their story setting...`;
  }
  if (!data.theme) {
    return `${data.character.name} is ready to explore ${data.setting}...`;
  }
  if (!data.length) {
    return `${data.character.name}'s ${data.theme} adventure in ${data.setting} is taking shape...`;
  }
  return `Get ready for ${data.character.name}'s ${data.length}-minute ${data.theme} adventure in ${data.setting}!`;
};

const PreviewField: React.FC<{
  label: string;
  value: any;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <motion.li
    initial={highlight ? { backgroundColor: 'rgba(99, 102, 241, 0.1)' } : {}}
    animate={{ backgroundColor: 'rgba(99, 102, 241, 0)' }}
    transition={{ duration: 1 }}
    className="flex items-center gap-2"
  >
    <span className="font-semibold text-gray-700 dark:text-gray-300">
      {label}:
    </span>
    {value ? (
      <span className="text-gray-900 dark:text-gray-100">{value}</span>
    ) : (
      <span className="text-gray-400 dark:text-gray-500 italic">(not set)</span>
    )}
  </motion.li>
);

const WizardPreview: React.FC = () => {
  const { data, currentStep } = useContext(WizardContext);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 shadow-md">
      <h3 className="font-bold text-lg mb-2 text-primary flex items-center gap-2">
        Story Preview
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          ({Math.round(((currentStep + 1) / 4) * 100)}% complete)
        </span>
      </h3>

      <div className="space-y-4">
        <ul className="space-y-2 text-sm">
          <PreviewField
            label="Character"
            value={data.character?.name}
            highlight={currentStep === 0}
          />
          <PreviewField
            label="Gender"
            value={data.character?.gender}
            highlight={currentStep === 0}
          />
          <PreviewField
            label="Traits"
            value={data.character?.traits?.join(', ')}
            highlight={currentStep === 0}
          />
          <PreviewField
            label="Setting"
            value={data.setting}
            highlight={currentStep === 1}
          />
          <PreviewField
            label="Theme"
            value={data.theme}
            highlight={currentStep === 2}
          />
          <PreviewField
            label="Length"
            value={data.length ? `${data.length} min` : undefined}
            highlight={currentStep === 3}
          />
        </ul>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
          >
            <p className="text-sm italic text-gray-600 dark:text-gray-300">
              {generatePreviewMessage(data, currentStep)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WizardPreview;

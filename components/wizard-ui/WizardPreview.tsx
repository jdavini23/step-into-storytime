import React, { useContext } from 'react';
import { WizardContext } from './wizard-context';

const WizardPreview: React.FC = () => {
  const { data } = useContext(WizardContext);
  return (
    <div className="bg-gradient-to-br from-blue-100 to-pink-100 dark:from-gray-900 dark:to-gray-700 rounded-xl p-4 shadow-md min-h-[120px]">
      <h3 className="font-bold text-lg mb-2 text-primary">Story Preview</h3>
      <ul className="space-y-1 text-sm">
        <li><span className="font-semibold">Character:</span> {data.character?.name || <span className="text-gray-400">(not set)</span>}</li>
        <li><span className="font-semibold">Gender:</span> {data.character?.gender || <span className="text-gray-400">(not set)</span>}</li>
        <li><span className="font-semibold">Traits:</span> {data.character?.traits?.join(', ') || <span className="text-gray-400">(not set)</span>}</li>
        <li><span className="font-semibold">Setting:</span> {data.setting || <span className="text-gray-400">(not set)</span>}</li>
        <li><span className="font-semibold">Theme:</span> {data.theme || <span className="text-gray-400">(not set)</span>}</li>
        <li><span className="font-semibold">Length:</span> {data.length ? `${data.length} min` : <span className="text-gray-400">(not set)</span>}</li>
      </ul>
    </div>
  );
};

export default WizardPreview;

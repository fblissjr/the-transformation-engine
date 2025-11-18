
import React, { useState } from 'react';
import { Prompt } from '../../types';

interface ShareModalProps {
  prompt: Prompt;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ prompt, onClose }) => {
  const [fieldsToShare, setFieldsToShare] = useState({
    naturalLanguageInput: true,
    settingsSnapshot: true,
    structuredOutput: true,
    normalizedOutput: true,
    tags: true,
  });

  const handleCheckboxChange = (field: keyof typeof fieldsToShare) => {
    setFieldsToShare(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const generateLink = () => {
    const dataToShare: Partial<Prompt> = {};
    if (fieldsToShare.naturalLanguageInput) dataToShare.naturalLanguageInput = prompt.naturalLanguageInput;
    if (fieldsToShare.settingsSnapshot) dataToShare.settingsSnapshot = prompt.settingsSnapshot;
    if (fieldsToShare.structuredOutput) dataToShare.structuredOutput = prompt.structuredOutput;
    if (fieldsToShare.normalizedOutput) dataToShare.normalizedOutput = prompt.normalizedOutput;
    if (fieldsToShare.tags) dataToShare.tags = prompt.tags;

    const jsonString = JSON.stringify(dataToShare);
    const base64String = btoa(jsonString);
    const url = `${window.location.origin}/share?data=${encodeURIComponent(base64String)}`;

    navigator.clipboard.writeText(url).then(() => {
      alert('Shareable link copied to clipboard!');
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Share Prompt</h2>
          <p className="text-sm text-gray-400 mt-1">Select the fields you want to include in the shareable link.</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.keys(fieldsToShare).map((field) => (
              <label key={field} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fieldsToShare[field as keyof typeof fieldsToShare]}
                  onChange={() => handleCheckboxChange(field as keyof typeof fieldsToShare)}
                  className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-600 focus:ring-offset-gray-800"
                />
                <span className="text-gray-200 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="p-6 bg-gray-800/50 border-t border-gray-700 flex justify-end items-center gap-4 rounded-b-lg">
          <button onClick={onClose} className="text-gray-300 hover:text-white font-medium py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={generateLink} className="bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-500 transition-colors">
            Generate & Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

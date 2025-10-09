import React, { useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import * as geminiService from '../services/geminiService';
import { LogoIcon } from './icons';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const { setApiKey } = useApiKey();
  const [localKey, setLocalKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Trim whitespace from the key
    const trimmedKey = localKey.trim();

    // Check if key contains spaces
    if (trimmedKey.includes(' ')) {
      setError('API Key should not contain spaces. Please check your key.');
      return;
    }

    setIsValidating(true);
    const isValid = await geminiService.validateApiKey(trimmedKey);
    setIsValidating(false);
    if (isValid) {
      setApiKey(trimmedKey);
      onClose();
    } else {
      setError('Invalid API Key. Please check your key and try again.');
    }
  };
  
  const handleSkip = () => {
    sessionStorage.setItem('apiKeySkipped', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl p-8 max-w-lg w-full text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-4">
            <LogoIcon />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Set Your API Key</h2>
        <p className="text-gray-400 mb-6">Enter your Gemini API Key to enable generation features. Your key is stored locally and sent directly to Google.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            onBlur={(e) => setLocalKey(e.target.value.trim())}
            placeholder="Enter your Gemini API Key"
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-md px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
          <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={handleSkip}
                className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
                Skip for Now
            </button>
            <button
              type="submit"
              disabled={isValidating || !localKey}
              className="w-full bg-amber-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isValidating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating...
                </>
              ) : 'Save Key'}
            </button>
          </div>
        </form>

        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default ApiKeyModal;
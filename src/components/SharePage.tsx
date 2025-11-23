
import React, { useEffect, useState } from 'react';
import { Prompt } from '../../types';
import { usePrompts } from '../contexts/PromptContext';
import { LogoIcon, ImportIcon } from './icons';

/**
 * SharePage component
 *
 * A standalone page for viewing and importing shared prompts.
 * It reads the prompt data from the URL query parameters (base64 encoded).
 * Users can import the shared prompt into their own workspace.
 *
 * @returns The rendered SharePage component.
 */
const SharePage: React.FC = () => {
  const [sharedPrompt, setSharedPrompt] = useState<Partial<Prompt> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addPrompt } = usePrompts();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

    if (data) {
      try {
        const decodedString = atob(decodeURIComponent(data));
        const parsedPrompt = JSON.parse(decodedString);
        setSharedPrompt(parsedPrompt);
      } catch (e) {
        setError('Invalid or corrupted share data.');
        console.error("Failed to parse share data:", e);
      }
    } else {
      setError('No share data found in the URL.');
    }
  }, []);

  const handleImport = async () => {
    if (sharedPrompt) {
        const newPromptData: Omit<Prompt, 'id' | 'createdAt'> = {
            title: sharedPrompt.naturalLanguageInput?.substring(0, 40) + '... (Imported)' || 'Imported Prompt',
            naturalLanguageInput: sharedPrompt.naturalLanguageInput || '',
            structuredOutput: sharedPrompt.structuredOutput || '',
            normalizedOutput: sharedPrompt.normalizedOutput || '',
            settingsSnapshot: sharedPrompt.settingsSnapshot || '{}',
            tags: sharedPrompt.tags || '[]',
            isFavorite: false,
        };
        await addPrompt(newPromptData);
        alert('Prompt imported successfully!');
        window.location.href = '/'; // Redirect to main app
    }
  };

  if (error) {
    return <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-950 text-white p-8">...</div>;
  }

  if (!sharedPrompt) {
    return <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-950 text-white">Loading Shared Prompt...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-300">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
            <LogoIcon />
            <div>
            <h1 className="text-lg font-bold text-white">The Transformation Engine</h1>
            <p className="text-xs text-gray-400">Shared Prompt</p>
            </div>
        </div>
        <button onClick={handleImport} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors text-sm">
            <ImportIcon /> Import to My Workspace
        </button>
      </header>
      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
            {sharedPrompt.naturalLanguageInput && (
                <div>
                    <h2 className="text-sm font-medium text-gray-400 mb-2">Creative Idea</h2>
                    <p className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 text-gray-100">{sharedPrompt.naturalLanguageInput}</p>
                </div>
            )}
            {sharedPrompt.structuredOutput && (
                <div>
                    <h2 className="text-sm font-medium text-gray-400 mb-2">Structured Prompt</h2>
                    <pre className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 text-gray-100 whitespace-pre-wrap font-mono text-sm">{sharedPrompt.structuredOutput}</pre>
                </div>
            )}
            {sharedPrompt.normalizedOutput && (
                <div>
                    <h2 className="text-sm font-medium text-gray-400 mb-2">Plain Language</h2>
                    <p className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 text-gray-100">{sharedPrompt.normalizedOutput}</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default SharePage;

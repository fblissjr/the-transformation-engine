import React, { useState, useEffect } from 'react';
import { useIntermediate } from '../../context/IntermediateContext';
import { usePrompts } from '../../context/PromptContext';
import { transformToModel } from '../../services/transformers';

const FormatExportPanel: React.FC = () => {
  const { activeIntermediate } = useIntermediate();
  const { addPrompt } = usePrompts();
  const [targetModel, setTargetModel] = useState<'sora2' | 'veo3' | 'generic'>('sora2');
  const [transformedOutput, setTransformedOutput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  // Transform on model change or intermediate update
  useEffect(() => {
    if (!activeIntermediate) {
      setTransformedOutput('');
      setCharCount(0);
      return;
    }

    try {
      const transformed = transformToModel(activeIntermediate, targetModel);
      setTransformedOutput(transformed);
      setCharCount(transformed.length);
    } catch (error) {
      console.error('Transformation error:', error);
      setTransformedOutput('Error: Failed to transform intermediate');
      setCharCount(0);
    }
  }, [activeIntermediate, targetModel]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transformedOutput);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const exportAndSave = async () => {
    if (!activeIntermediate) return;

    try {
      const prompt = {
        title: activeIntermediate.title,
        naturalLanguageInput: activeIntermediate.sources.text || '',
        structuredOutput: transformedOutput,
        normalizedOutput: '',
        settingsSnapshot: JSON.stringify({}), // Default empty settings
        tags: JSON.stringify(activeIntermediate.tags),
        isFavorite: false,
      };

      await addPrompt(prompt);
      alert('Prompt saved to library successfully!');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt to library');
    }
  };

  if (!activeIntermediate) return null;

  const getCharCountColor = () => {
    if (targetModel !== 'sora2') return 'text-gray-400';
    if (charCount > 2500) return 'text-red-500 font-bold';
    if (charCount > 2200) return 'text-amber-500';
    return 'text-green-500';
  };

  const hasAudioContent = Boolean(
    activeIntermediate.structure.audio?.dialogue ||
    activeIntermediate.structure.audio?.ambient ||
    activeIntermediate.structure.audio?.soundEffects ||
    activeIntermediate.structure.audio?.music
  );

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-200">Export to Model Format</h3>
        <select
          value={targetModel}
          onChange={e => setTargetModel(e.target.value as 'sora2' | 'veo3' | 'generic')}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="sora2">Sora 2 (OpenAI)</option>
          <option value="veo3">Veo 3 (Google)</option>
          <option value="generic">Generic</option>
        </select>
      </div>

      {/* Warnings */}
      {targetModel === 'veo3' && !hasAudioContent && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-300">
            <strong>Warning:</strong> Veo 3 requires audio content. Add dialogue, ambient sounds, or music in the Audio tab.
          </p>
        </div>
      )}

      {targetModel === 'sora2' && charCount > 2500 && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-300">
            <strong>Error:</strong> Sora 2 has a 2500 character limit. Your prompt is {charCount} characters. Reduce detail or use fewer segments.
          </p>
        </div>
      )}

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
        <pre className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-4 text-xs text-gray-300 font-mono overflow-y-auto whitespace-pre-wrap">
          {transformedOutput || 'Transformed output will appear here...'}
        </pre>
      </div>

      {/* Character count */}
      <div className="flex items-center justify-between">
        <span className={`text-sm ${getCharCountColor()}`}>
          {targetModel === 'sora2' ? (
            <>Characters: {charCount} / 2500</>
          ) : (
            <>Characters: {charCount}</>
          )}
        </span>

        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            disabled={!transformedOutput}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
          >
            {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={exportAndSave}
            disabled={!transformedOutput || (targetModel === 'sora2' && charCount > 2500)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
          >
            Export & Save to Library
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormatExportPanel;

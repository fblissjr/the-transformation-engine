import React, { useState, useEffect } from 'react';
import { transformToModel } from '../services/transformers';
import type { IntermediatePrompt } from '../../types/intermediate';

interface IntermediateEditorProps {
  intermediate: IntermediatePrompt | null;
  onUpdate?: (updated: IntermediatePrompt) => void;
  onExport?: (yaml: string, model: 'sora2' | 'veo3' | 'generic') => void;
}

/**
 * IntermediateEditor component
 *
 * A rich editor for the intermediate representation of prompts (in Markdown format).
 * Allows users to edit the semantic structure directly and preview the transformed output
 * in different model formats (Sora 2, Veo 3, Generic).
 *
 * @param intermediate - The intermediate prompt data.
 * @param onUpdate - Callback when the markdown is updated.
 * @param onExport - Callback when the user exports the result.
 * @returns The rendered IntermediateEditor component.
 */
export const IntermediateEditor: React.FC<IntermediateEditorProps> = ({
  intermediate,
  onUpdate,
  onExport,
}) => {
  const [editedMarkdown, setEditedMarkdown] = useState('');
  const [selectedModel, setSelectedModel] = useState<'sora2' | 'veo3' | 'generic'>('sora2');
  const [previewYaml, setPreviewYaml] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (intermediate?.markdown) {
      setEditedMarkdown(intermediate.markdown);
      updatePreview(intermediate.markdown, selectedModel);
    }
  }, [intermediate]);

  const updatePreview = (markdown: string, model: 'sora2' | 'veo3' | 'generic') => {
    try {
      // Transform markdown to selected model format
      const intermediateWithUpdatedMarkdown = { ...intermediate!, markdown };
      const yaml = transformToModel(intermediateWithUpdatedMarkdown, model);
      setPreviewYaml(yaml);
      setCharacterCount(yaml.length);
    } catch (error) {
      console.error('Failed to transform intermediate:', error);
      setPreviewYaml('Error transforming intermediate');
    }
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    setEditedMarkdown(newMarkdown);
    updatePreview(newMarkdown, selectedModel);

    if (onUpdate && intermediate) {
      onUpdate({ ...intermediate, markdown: newMarkdown });
    }
  };

  const handleModelChange = (model: 'sora2' | 'veo3' | 'generic') => {
    setSelectedModel(model);
    updatePreview(editedMarkdown, model);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(previewYaml, selectedModel);
    }
  };

  const getCharacterColor = () => {
    if (selectedModel === 'sora2') {
      if (characterCount > 2500) return 'text-red-400';
      if (characterCount > 2000) return 'text-yellow-400';
      return 'text-green-400';
    }
    return 'text-gray-400';
  };

  const getCharacterLimit = () => {
    if (selectedModel === 'sora2') return ' / 2500 (Sora 2 limit)';
    return '';
  };

  if (!intermediate) {
    return (
      <div className="border border-gray-600 rounded-lg p-8 text-center text-gray-400">
        No intermediate generated yet. Generate a prompt to see the intermediate representation.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with model selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Intermediate Editor</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Export Format:</label>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm"
          >
            <option value="sora2">Sora 2 (OpenAI)</option>
            <option value="veo3">Veo 3 (Google)</option>
            <option value="generic">Generic</option>
          </select>
        </div>
      </div>

      {/* Character counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Preview character count:{' '}
          <span className={`font-mono font-semibold ${getCharacterColor()}`}>
            {characterCount}
            {getCharacterLimit()}
          </span>
        </span>
        {characterCount > 2500 && selectedModel === 'sora2' && (
          <span className="text-red-400 text-xs">
            ⚠️ Exceeds Sora 2 limit - will be truncated
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 -mb-px transition-colors ${
            activeTab === 'edit'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Edit Markdown
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 -mb-px transition-colors ${
            activeTab === 'preview'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Preview YAML
        </button>
      </div>

      {/* Content area */}
      <div className="border border-gray-600 rounded-lg bg-gray-800">
        {activeTab === 'edit' ? (
          <div className="relative">
            <textarea
              value={editedMarkdown}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              className="w-full h-96 p-4 bg-transparent font-mono text-sm resize-none focus:outline-none"
              placeholder="Edit intermediate markdown..."
              spellCheck={false}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              Markdown format
            </div>
          </div>
        ) : (
          <div className="relative">
            <pre className="w-full h-96 p-4 overflow-auto font-mono text-sm">
              <code>{previewYaml}</code>
            </pre>
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              YAML format ({selectedModel})
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="border border-gray-700 rounded p-3 bg-gray-800/50">
          <div className="text-gray-400 mb-1">Scene Type</div>
          <div className="font-medium">{intermediate.metadata?.scene_type || 'Not specified'}</div>
        </div>
        <div className="border border-gray-700 rounded p-3 bg-gray-800/50">
          <div className="text-gray-400 mb-1">Style</div>
          <div className="font-medium">{intermediate.metadata?.style || 'Not specified'}</div>
        </div>
        <div className="border border-gray-700 rounded p-3 bg-gray-800/50">
          <div className="text-gray-400 mb-1">Duration</div>
          <div className="font-medium">{intermediate.metadata?.duration || 'Not specified'}</div>
        </div>
        <div className="border border-gray-700 rounded p-3 bg-gray-800/50">
          <div className="text-gray-400 mb-1">Aspect Ratio</div>
          <div className="font-medium">{intermediate.metadata?.aspect_ratio || 'Not specified'}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors"
        >
          Export & Save to Library
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(previewYaml);
            alert('YAML copied to clipboard!');
          }}
          className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Copy YAML
        </button>
        <button
          onClick={() => handleModelChange(selectedModel === 'sora2' ? 'veo3' : 'sora2')}
          className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Switch to {selectedModel === 'sora2' ? 'Veo 3' : 'Sora 2'}
        </button>
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500 border-l-2 border-gray-700 pl-3">
        <p className="mb-1">
          <strong>Tip:</strong> Edit the markdown directly to refine the semantic structure.
        </p>
        <p>
          Changes update the preview in real-time. You can export to any format without regenerating.
        </p>
      </div>
    </div>
  );
};

interface IntermediateRefinementProps {
  intermediateId: string;
  onRefine: (refinementInstruction: string) => Promise<void>;
  isRefining: boolean;
}

/**
 * IntermediateRefinement component
 *
 * A component for iterative refinement of intermediate representations.
 * Allows users to provide natural language instructions to refine the structure.
 *
 * @param intermediateId - The ID of the intermediate prompt being refined.
 * @param onRefine - Callback to execute the refinement.
 * @param isRefining - Boolean indicating if a refinement is in progress.
 * @returns The rendered IntermediateRefinement component.
 */
export const IntermediateRefinement: React.FC<IntermediateRefinementProps> = ({
  intermediateId,
  onRefine,
  isRefining,
}) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    await onRefine(instruction);
    setInstruction('');
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-600 rounded-lg p-4 bg-gray-800">
      <h4 className="font-medium mb-3">Refine Intermediate</h4>
      <div className="space-y-3">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Describe how you want to refine the intermediate structure..."
          className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isRefining}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            This will create a new version while preserving the original
          </span>
          <button
            type="submit"
            disabled={isRefining || !instruction.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded transition-colors"
          >
            {isRefining ? 'Refining...' : 'Refine'}
          </button>
        </div>
      </div>
    </form>
  );
};

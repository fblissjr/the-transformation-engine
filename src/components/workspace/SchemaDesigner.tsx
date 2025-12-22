import React, { useState, useRef, useEffect } from 'react';
import { WandIcon, EditIcon } from '../icons';

const PRESETS = [
  // Generic presets (model-agnostic)
  { name: 'Video Scene', keys: ['scene', 'sound_effects', 'speech'] },
  { name: 'Music', keys: ['composition', 'instruments', 'mood', 'tempo'] },
  { name: 'Art Direction', keys: ['visual_style', 'color_palette', 'composition', 'mood'] },

  // Sora 2 presets (video+audio, comprehensive detail)
  { name: 'Sora 2: Cinematic', keys: ['temporal_progression', 'visual_description', 'camera_movement', 'cinematography', 'lighting', 'audio_design', 'style'] },
  { name: 'Sora 2: Social Media', keys: ['temporal_progression', 'visual_description', 'camera_movement', 'audio_design', 'style'] },
  { name: 'Sora 2: Product Demo', keys: ['visual_description', 'camera_movement', 'cinematography', 'lighting', 'audio_design', 'style'] },

  // Veo 3 presets (audio-first, 9-element framework)
  { name: 'Veo 3: Narrative Scene', keys: ['subject', 'context', 'action', 'audio_elements', 'camera_motion', 'lighting_mood', 'composition'] },
  { name: 'Veo 3: Cinematic Landscape', keys: ['subject', 'context', 'style', 'camera_motion', 'audio_elements', 'lighting_mood', 'background_setting'] },
  { name: 'Veo 3: Product Demo', keys: ['subject', 'action', 'audio_elements', 'camera_motion', 'lighting_mood', 'composition'] },
];

interface SchemaDesignerProps {
  schemaKeys: string[];
  onAddKey: (key: string) => void;
  onRemoveKey: (key: string) => void;
  onRenameKey: (oldKey: string, newKey: string) => void;
  onApplyPreset: (keys: string[]) => void;
  onInferSchema: (mode: 'additional' | 'full') => void;
  isLoading: boolean;
  hasInput: boolean;
}

/**
 * SchemaDesigner component
 *
 * Manages the structure fields (schema keys) for prompt generation.
 * Includes presets, AI suggestions, and model-specific tips.
 */
export const SchemaDesigner: React.FC<SchemaDesignerProps> = ({
  schemaKeys,
  onAddKey,
  onRemoveKey,
  onRenameKey,
  onApplyPreset,
  onInferSchema,
  isLoading,
  hasInput,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newKey, setNewKey] = useState('');

  const handleAddKey = () => {
    if (newKey && !schemaKeys.includes(newKey)) {
      onAddKey(newKey);
      setNewKey('');
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden flex-shrink-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-sm font-semibold text-white">Structure Fields</h3>
            <span className="text-xs text-gray-500 hidden sm:inline">(Define output sections)</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 sm:hidden">Define output sections</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-3 sm:p-4 pt-0 border-t border-gray-800 max-h-[400px] overflow-y-auto">
          {/* AI Suggestions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onInferSchema('additional')}
                disabled={isLoading || !hasInput}
                title="AI suggests additional fields based on your idea"
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium px-2 py-1 rounded hover:bg-gray-800"
              >
                <WandIcon className="w-3 h-3" />
                Suggest
              </button>
              <button
                onClick={() => onInferSchema('full')}
                disabled={isLoading || !hasInput}
                title="AI generates a complete new structure from scratch"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded hover:bg-gray-800"
              >
                <WandIcon className="w-3 h-3" />
                Regenerate
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="mb-3">
            <span className="text-xs text-gray-400 block mb-2">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => onApplyPreset(preset.keys)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sora 2 Tip */}
          {schemaKeys.includes('technical_specs') && (
            <div className="mb-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded text-xs text-blue-200">
              <strong className="text-blue-100">Sora 2 Tip:</strong> Describe how your scene evolves over time (start → middle → end). Include camera movements with specific speeds/distances. Aim for 300-500 words of comprehensive detail for best results.
            </div>
          )}

          {/* Veo 3 Tip */}
          {schemaKeys.includes('veo3_specs') && (
            <div className="mb-3 p-2 bg-green-900/20 border border-green-700/50 rounded text-xs text-green-200">
              <strong className="text-green-100">Veo 3 Tip:</strong> ALWAYS include audio elements (dialogue, ambient sounds, music) - Veo 3 generates native audio! Use the 9 elements framework (subject, context, action, audio, camera motion, etc.). Include detailed character descriptions for consistency. Professional cinematic terminology works great. Aim for 200-400 words with narrative structure.
            </div>
          )}

          {/* Schema Keys */}
          <div className="flex flex-wrap gap-2 items-center">
            {schemaKeys.map(key => (
              <SchemaKey key={key} initialKey={key} onRename={onRenameKey} onRemove={onRemoveKey} />
            ))}
            <form onSubmit={(e) => { e.preventDefault(); handleAddKey(); }} className="flex gap-1">
              <input
                type="text"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="custom_field"
                className="bg-gray-800 w-32 text-xs border border-gray-700 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-200 placeholder:text-gray-600"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors font-bold"
              >
                +
              </button>
            </form>
          </div>

          {/* Example Preview */}
          {schemaKeys.length > 0 && (
            <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-400 font-mono">
              <span className="text-gray-500">Example:</span> {schemaKeys[0]}: <span className="text-gray-300">"Your content here..."</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * SchemaKey component
 *
 * Renders a single schema key tag with rename and remove functionality.
 */
const SchemaKey: React.FC<{
  initialKey: string;
  onRename: (oldKey: string, newKey: string) => void;
  onRemove: (key: string) => void;
}> = ({ initialKey, onRename, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [key, setKey] = useState(initialKey);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (key.trim()) {
      onRename(initialKey, key.trim());
    } else {
      setKey(initialKey);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setKey(initialKey);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={key}
        onChange={e => setKey(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="bg-gray-800 text-xs border border-green-500 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 w-32 text-white"
      />
    );
  }

  return (
    <span className="bg-gray-700/80 text-gray-200 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2 group hover:bg-gray-700 transition-colors">
      {key}
      <button
        onClick={() => setIsEditing(true)}
        className="text-gray-500 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
        title="Rename"
      >
        <EditIcon className="h-3 w-3" />
      </button>
      <button
        onClick={() => onRemove(key)}
        className="text-gray-500 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100 font-bold"
        title="Remove"
      >
        x
      </button>
    </span>
  );
};

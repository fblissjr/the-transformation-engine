import React, { useState } from 'react';
import { MixOption, PromptSettings } from '../../../types';

interface MixOptionsPanelProps {
  mixOptions: MixOption[];
  onSettingsChange: (updater: (prev: PromptSettings) => PromptSettings) => void;
}

/**
 * MixOptionsPanel component
 *
 * Manages mix options for prompt transformation.
 * Supports built-in and custom mix options with CRUD operations.
 */
export const MixOptionsPanel: React.FC<MixOptionsPanelProps> = ({
  mixOptions,
  onSettingsChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const toggleMixOption = (optionId: string) => {
    onSettingsChange(prev => ({
      ...prev,
      mixOptions: prev.mixOptions.map(opt =>
        opt.id === optionId ? { ...opt, isEnabled: !opt.isEnabled } : opt
      )
    }));
  };

  const addCustomMixOption = () => {
    if (customName && customInstruction) {
      const newOption: MixOption = {
        id: `custom-${Date.now()}`,
        name: customName,
        instruction: customInstruction,
        isBuiltIn: false,
        isEnabled: true,
      };
      onSettingsChange(prev => ({
        ...prev,
        mixOptions: [...prev.mixOptions, newOption]
      }));
      setCustomName('');
      setCustomInstruction('');
      setShowAddCustom(false);
    }
  };

  const removeCustomMixOption = (optionId: string) => {
    onSettingsChange(prev => ({
      ...prev,
      mixOptions: prev.mixOptions.filter(opt => opt.id !== optionId)
    }));
  };

  const startEditing = (option: MixOption) => {
    setEditingId(option.id);
    setCustomName(option.name);
    setCustomInstruction(option.instruction);
    setShowAddCustom(false);
  };

  const updateMixOption = () => {
    if (editingId && customName && customInstruction) {
      onSettingsChange(prev => ({
        ...prev,
        mixOptions: prev.mixOptions.map(opt =>
          opt.id === editingId
            ? { ...opt, name: customName, instruction: customInstruction }
            : opt
        )
      }));
      cancelEditing();
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setCustomName('');
    setCustomInstruction('');
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Mix Options</h3>
          <span className="text-xs text-gray-500">(Transform output)</span>
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
        <div className="p-3 sm:p-4 pt-0 border-t border-gray-800">
          <div className="space-y-2">
            {mixOptions?.map(option => (
              <div key={option.id}>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.isEnabled}
                      onChange={() => toggleMixOption(option.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-white">{option.name}</span>
                    {option.isBuiltIn && (
                      <span className="text-xs text-gray-500">(built-in)</span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingId(viewingId === option.id ? null : option.id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                      title="View instruction"
                    >
                      {viewingId === option.id ? 'Hide' : 'View'}
                    </button>
                    {!option.isBuiltIn && (
                      <>
                        <button
                          onClick={() => startEditing(option)}
                          className="text-xs text-yellow-400 hover:text-yellow-300"
                          title="Edit option"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeCustomMixOption(option.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                          title="Remove option"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {viewingId === option.id && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 whitespace-pre-wrap">
                    {option.instruction}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add/Edit Custom Option Form */}
          {(showAddCustom || editingId) && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg space-y-3">
              <h4 className="text-sm font-medium text-white">
                {editingId ? 'Edit Mix Option' : 'Add Custom Mix Option'}
              </h4>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Option name"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Instruction for the AI (e.g., 'Make the output more cinematic')"
                rows={3}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={editingId ? updateMixOption : addCustomMixOption}
                  disabled={!customName || !customInstruction}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded transition-colors"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={() => {
                    cancelEditing();
                    setShowAddCustom(false);
                  }}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Custom Button */}
          {!showAddCustom && !editingId && (
            <button
              onClick={() => setShowAddCustom(true)}
              className="mt-3 w-full py-2 border border-dashed border-gray-700 hover:border-yellow-500 rounded text-sm text-gray-400 hover:text-yellow-400 transition-colors"
            >
              + Add Custom Mix Option
            </button>
          )}
        </div>
      )}
    </div>
  );
};

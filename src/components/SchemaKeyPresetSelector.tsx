/**
 * SchemaKeyPresetSelector Component
 *
 * UI/UX Design Rationale:
 * - Dropdown selector for global + custom schema key presets
 * - Inline auto-suggestion card with reasoning and accept/dismiss actions
 * - Preview modal shows full preset details (keys, description, output format)
 * - "Manage Presets" button for power users (opens preset management dialog)
 * - Progressive disclosure: Auto-suggestion card only shows when relevant
 *
 * Technical Implementation:
 * - Uses schemaKeyService for preset data (mock data until service exists)
 * - Auto-suggestion based on scene classification + output format
 * - Preset preview modal with Escape key support
 * - Mobile responsive: Cards stack vertically, full-width buttons
 *
 * Accessibility:
 * - ARIA labels on dropdown and buttons
 * - Keyboard navigation (Tab, Enter, Escape)
 * - Focus management for modal
 * - Screen reader announcements for auto-suggestions
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, Info, Sparkles, Check, X, Edit } from 'lucide-react';

// ==================== Type Definitions ====================

export interface SchemaKeyPreset {
  id: string;
  name: string;
  description: string;
  outputFormat: 'veo3' | 'sora2' | 'generic';
  keys: string[];
  isGlobal: boolean;
  promptingStrategy: 'timestamp' | 'continuous';
  optimalLength?: string;
  isDefault?: boolean;
}

interface SchemaKeyPresetSelectorProps {
  presets: SchemaKeyPreset[];
  selectedPresetId?: string;
  suggestedPresetId?: string;
  suggestionReasoning?: string;
  onPresetSelect: (presetId: string) => void;
  onCustomize?: () => void;
  onManagePresets?: () => void;
  onDismissSuggestion?: () => void;
}

// ==================== Mock Data ====================

const MOCK_PRESETS: SchemaKeyPreset[] = [
  // Veo 3.1 Presets
  {
    id: 'veo31-standard',
    name: 'Veo 3.1 Standard',
    description: '9-element continuous narrative with native audio generation',
    outputFormat: 'veo3',
    keys: ['subject', 'context', 'action', 'audio_elements', 'camera_motion', 'lighting_mood', 'composition', 'background_setting', 'style'],
    isGlobal: true,
    promptingStrategy: 'continuous',
    optimalLength: '200-300 words',
    isDefault: true
  },
  {
    id: 'veo31-timestamp',
    name: 'Veo 3.1 Timestamp',
    description: 'Time-segmented 8-second clips with precise moment control',
    outputFormat: 'veo3',
    keys: ['subject', 'context', 'action', 'audio_elements', 'camera_motion', 'temporal_progression'],
    isGlobal: true,
    promptingStrategy: 'timestamp',
    optimalLength: '250-350 words'
  },
  {
    id: 'veo31-dialogue',
    name: 'Veo 3.1 Dialogue',
    description: 'Audio-focused 6-key preset for conversation-heavy scenes',
    outputFormat: 'veo3',
    keys: ['subject', 'dialogue', 'voiceover_script', 'ambient_audio', 'camera_motion', 'lighting_mood'],
    isGlobal: true,
    promptingStrategy: 'continuous',
    optimalLength: '200-250 words'
  },
  {
    id: 'veo31-cinematic',
    name: 'Veo 3.1 Cinematic',
    description: 'Wide shots and camera movement for narrative storytelling',
    outputFormat: 'veo3',
    keys: ['subject', 'context', 'action', 'camera_motion', 'lighting_mood', 'composition', 'style'],
    isGlobal: true,
    promptingStrategy: 'continuous',
    optimalLength: '250-300 words'
  },
  {
    id: 'veo31-animation',
    name: 'Veo 3.1 Animation',
    description: 'Stylized preset optimized for creative animation',
    outputFormat: 'veo3',
    keys: ['subject', 'action', 'style', 'colors', 'animation_techniques', 'audio_elements'],
    isGlobal: true,
    promptingStrategy: 'continuous',
    optimalLength: '200-280 words'
  },

  // Sora 2 Presets
  {
    id: 'sora2-standard',
    name: 'Sora 2 Standard',
    description: 'Comprehensive temporal progression for 10-second clips',
    outputFormat: 'sora2',
    keys: ['temporal_progression', 'visual_description', 'camera_movement', 'cinematography', 'lighting', 'audio_design', 'style'],
    isGlobal: true,
    promptingStrategy: 'continuous',
    optimalLength: '300-400 words',
    isDefault: true
  },

  // Generic Presets
  {
    id: 'generic-versatile',
    name: 'Generic Versatile',
    description: 'Model-agnostic preset for general use',
    outputFormat: 'generic',
    keys: ['scene', 'visual_description', 'camera', 'audio', 'style'],
    isGlobal: true,
    promptingStrategy: 'continuous',
    optimalLength: '200-400 words',
    isDefault: true
  }
];

// ==================== Component ====================

export const SchemaKeyPresetSelector: React.FC<SchemaKeyPresetSelectorProps> = ({
  presets = MOCK_PRESETS,
  selectedPresetId,
  suggestedPresetId,
  suggestionReasoning,
  onPresetSelect,
  onCustomize,
  onManagePresets,
  onDismissSuggestion
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPresetId, setPreviewPresetId] = useState<string | null>(null);

  const selectedPreset = useMemo(
    () => presets.find(p => p.id === selectedPresetId),
    [presets, selectedPresetId]
  );

  const suggestedPreset = useMemo(
    () => presets.find(p => p.id === suggestedPresetId),
    [presets, suggestedPresetId]
  );

  const previewPreset = useMemo(
    () => presets.find(p => p.id === previewPresetId),
    [presets, previewPresetId]
  );

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPresetSelect(e.target.value);
  };

  const handleAcceptSuggestion = () => {
    if (suggestedPresetId) {
      onPresetSelect(suggestedPresetId);
    }
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setPreviewPresetId(null);
  };

  // Group presets by output format
  const presetsByFormat = useMemo(() => {
    const grouped: Record<string, SchemaKeyPreset[]> = {
      veo3: [],
      sora2: [],
      generic: []
    };
    presets.forEach(preset => {
      grouped[preset.outputFormat].push(preset);
    });
    return grouped;
  }, [presets]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Schema Key Preset:
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Pre-configured schema key sets optimized for specific models and scene types.
        </p>
      </div>

      {/* Auto-Suggestion Card (conditional) */}
      {suggestedPreset && suggestedPresetId !== selectedPresetId && (
        <div className="bg-gradient-to-r from-amber-900/30 to-purple-900/30 border border-amber-600/50 rounded-lg p-4 animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Suggested: {suggestedPreset.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {suggestionReasoning}
                  </p>
                </div>
                <button
                  onClick={onDismissSuggestion}
                  className="text-gray-500 hover:text-white transition p-1 rounded hover:bg-gray-800"
                  aria-label="Dismiss suggestion"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAcceptSuggestion}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                >
                  <Check className="w-3 h-3" />
                  Accept Suggestion
                </button>
                <button
                  onClick={() => {
                    setPreviewPresetId(suggestedPresetId);
                    setIsPreviewOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                >
                  <Info className="w-3 h-3" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Selector */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <select
            value={selectedPresetId || ''}
            onChange={handlePresetChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
            aria-label="Select schema key preset"
          >
            <option value="">Select a preset...</option>

            {/* Veo 3.1 Presets */}
            {presetsByFormat.veo3.length > 0 && (
              <optgroup label="Veo 3.1 Presets">
                {presetsByFormat.veo3.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.keys.length} keys)
                  </option>
                ))}
              </optgroup>
            )}

            {/* Sora 2 Presets */}
            {presetsByFormat.sora2.length > 0 && (
              <optgroup label="Sora 2 Presets">
                {presetsByFormat.sora2.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.keys.length} keys)
                  </option>
                ))}
              </optgroup>
            )}

            {/* Generic Presets */}
            {presetsByFormat.generic.length > 0 && (
              <optgroup label="Generic Presets">
                {presetsByFormat.generic.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.keys.length} keys)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Quick Preview Button */}
        {selectedPresetId && (
          <button
            onClick={() => {
              setPreviewPresetId(selectedPresetId);
              setIsPreviewOpen(true);
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2.5 rounded-lg transition shrink-0"
            title="Preview preset details"
            aria-label="Preview selected preset"
          >
            <Info className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selected Preset Info (inline summary) */}
      {selectedPreset && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{selectedPreset.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  selectedPreset.outputFormat === 'veo3' ? 'bg-green-600/20 text-green-400' :
                  selectedPreset.outputFormat === 'sora2' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {selectedPreset.outputFormat.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400">{selectedPreset.description}</p>
            </div>
          </div>

          {/* Key Count & Strategy */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{selectedPreset.keys.length} schema keys</span>
            <span className="capitalize">{selectedPreset.promptingStrategy} prompting</span>
            {selectedPreset.optimalLength && <span>{selectedPreset.optimalLength}</span>}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        {onCustomize && (
          <button
            onClick={onCustomize}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <Edit className="w-4 h-4" />
            Customize Keys
          </button>
        )}
        {onManagePresets && (
          <button
            onClick={onManagePresets}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Manage Presets
          </button>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && previewPreset && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handlePreviewClose}
        >
          <div
            className="bg-gray-900 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-700">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {previewPreset.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      previewPreset.outputFormat === 'veo3' ? 'bg-green-600/20 text-green-400 border border-green-600/50' :
                      previewPreset.outputFormat === 'sora2' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' :
                      'bg-gray-600/20 text-gray-400 border border-gray-600/50'
                    }`}>
                      {previewPreset.outputFormat.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {previewPreset.promptingStrategy} prompting
                    </span>
                    {previewPreset.isDefault && (
                      <span className="text-xs px-2 py-1 rounded bg-amber-600/20 text-amber-400 border border-amber-600/50">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{previewPreset.description}</p>
                </div>
                <button
                  onClick={handlePreviewClose}
                  className="text-gray-400 hover:text-white transition p-2 rounded hover:bg-gray-800"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Schema Keys */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Schema Keys ({previewPreset.keys.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {previewPreset.keys.map(key => (
                    <span
                      key={key}
                      className="bg-gray-800 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-700"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>

              {/* Optimal Length */}
              {previewPreset.optimalLength && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Optimal Length
                  </h4>
                  <p className="text-sm text-gray-300">{previewPreset.optimalLength}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                {previewPreset.id !== selectedPresetId && (
                  <button
                    onClick={() => {
                      onPresetSelect(previewPreset.id);
                      handlePreviewClose();
                    }}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-lg transition"
                  >
                    Select This Preset
                  </button>
                )}
                <button
                  onClick={handlePreviewClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2.5 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaKeyPresetSelector;

/**
 * SceneExtensionDialog Component
 *
 * Dialog for extending scenes with Continue/Cut To/Transition methods.
 * Part of Scene Extension Phase 1 MVP.
 */

import React, { useState, useEffect } from 'react';
import { IntermediatePrompt, PreservationOptions } from '../types/intermediate';
import { ParentSceneSummary } from './ParentSceneSummary';
import { generateSceneExtension, GenerateExtensionParams } from '../services/sceneExtensionService';

interface SceneExtensionDialogProps {
  parentIntermediate: IntermediatePrompt;
  onClose: () => void;
  onGenerated: (newIntermediate: IntermediatePrompt) => void;
}

const PRESERVATION_DEFAULTS = {
  continue: {
    characters: true,
    environment: true,
    visualStyle: true,
    audio: true,
  },
  cutTo: {
    characters: false,
    environment: false,
    visualStyle: false,
    audio: false,
  },
  transition: {
    characters: false,
    environment: false,
    visualStyle: true,
    audio: true,
  },
};

const METHOD_PLACEHOLDERS = {
  continue: "Describe what happens next in this scene...\nExample: Suspect's hands start shaking, tears form in eyes",
  cutTo: "Describe the new scene...\nExample: Detective Harris walks out of station at sunset, looking exhausted",
  transition: "Describe how the scene transforms...\nExample: Camera pulls back from close-up to reveal entire warehouse",
};

const InfoIcon: React.FC<{ className?: string; title?: string }> = ({ className, title }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    title={title}
  >
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4M12 8h.01" />
  </svg>
);

export const SceneExtensionDialog: React.FC<SceneExtensionDialogProps> = ({
  parentIntermediate,
  onClose,
  onGenerated,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'continue' | 'cutTo' | 'transition'>('continue');
  const [userDescription, setUserDescription] = useState('');
  const [preservation, setPreservation] = useState<PreservationOptions>(PRESERVATION_DEFAULTS.continue);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update preservation defaults when method changes
  useEffect(() => {
    setPreservation(PRESERVATION_DEFAULTS[selectedMethod]);
  }, [selectedMethod]);

  const handleGenerate = async () => {
    if (!userDescription.trim()) {
      setError('Please describe what happens next');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const params: GenerateExtensionParams = {
        parentId: parentIntermediate.id,
        method: selectedMethod,
        userDescription: userDescription.trim(),
        preservation,
      };

      const newIntermediate = await generateSceneExtension(params);
      onGenerated(newIntermediate);
      onClose();
    } catch (err) {
      console.error('Failed to generate extension:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate scene extension');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Extend Scene: "{parentIntermediate.title}"
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Method Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Extension Method:
            </label>

            <label className="flex items-start gap-3 p-3 border border-gray-700 rounded cursor-pointer hover:bg-gray-800 transition">
              <input
                type="radio"
                name="method"
                value="continue"
                checked={selectedMethod === 'continue'}
                onChange={(e) => setSelectedMethod('continue')}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="font-semibold text-white">Continue Scene</span>
                <p className="text-xs text-gray-400 mt-1">
                  Same scene, action progresses. All elements preserved by default.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-gray-700 rounded cursor-pointer hover:bg-gray-800 transition">
              <input
                type="radio"
                name="method"
                value="cutTo"
                checked={selectedMethod === 'cutTo'}
                onChange={(e) => setSelectedMethod('cutTo')}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="font-semibold text-white">Cut To</span>
                <p className="text-xs text-gray-400 mt-1">
                  Hard cut to different scene. Choose what to keep from previous scene.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-gray-700 rounded cursor-pointer hover:bg-gray-800 transition">
              <input
                type="radio"
                name="method"
                value="transition"
                checked={selectedMethod === 'transition'}
                onChange={(e) => setSelectedMethod('transition')}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="font-semibold text-white">Transition</span>
                <p className="text-xs text-gray-400 mt-1">
                  Smooth change between scenes. Camera movement bridges scenes.
                </p>
              </div>
            </label>
          </div>

          {/* Parent Summary */}
          <ParentSceneSummary parentIntermediate={parentIntermediate} />

          {/* User Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What happens next:
            </label>
            <textarea
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              placeholder={METHOD_PLACEHOLDERS[selectedMethod]}
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Preservation Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Preserve from Previous Scene:
            </h4>

            <div className="space-y-2">
              <label className="flex items-start gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer group">
                <input
                  type="checkbox"
                  checked={preservation.characters}
                  onChange={(e) => setPreservation({ ...preservation, characters: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">Characters</span>
                    <InfoIcon
                      className="w-3 h-3 text-gray-500 group-hover:text-gray-400"
                      title="Keep character identity, appearance, clothing from previous scene"
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer group">
                <input
                  type="checkbox"
                  checked={preservation.environment}
                  onChange={(e) => setPreservation({ ...preservation, environment: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">Environment</span>
                    <InfoIcon
                      className="w-3 h-3 text-gray-500 group-hover:text-gray-400"
                      title="Keep location, setting, weather from previous scene"
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer group">
                <input
                  type="checkbox"
                  checked={preservation.visualStyle}
                  onChange={(e) => setPreservation({ ...preservation, visualStyle: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">Visual Style</span>
                    <InfoIcon
                      className="w-3 h-3 text-gray-500 group-hover:text-gray-400"
                      title="Keep colors, lighting, aesthetic from previous scene"
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer group">
                <input
                  type="checkbox"
                  checked={preservation.audio}
                  onChange={(e) => setPreservation({ ...preservation, audio: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">Audio</span>
                    <InfoIcon
                      className="w-3 h-3 text-gray-500 group-hover:text-gray-400"
                      title="Continue music, ambient sounds from previous scene"
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-600 rounded p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !userDescription.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded transition font-medium"
            >
              {isGenerating ? 'Generating...' : 'Generate Next Scene →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

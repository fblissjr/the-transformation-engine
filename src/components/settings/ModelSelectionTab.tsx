import React, { useState, useEffect } from 'react';
import { useProviders } from '../../contexts/ProviderContext';
import { taskAssignmentService } from '../../services/taskAssignmentService';
import { ModelPicker } from '../ModelPicker';
import type { Model } from '../../../types/providers';
import type { PromptSettings } from '../../../types';

interface ModelSelectionTabProps {
  settings: PromptSettings;
  onSettingsChange: (settings: PromptSettings) => void;
  onSwitchToProviders?: () => void;
}

/**
 * ModelSelectionTab component
 *
 * Settings tab for configuring the default AI model for generation tasks.
 * Allows selecting a provider and a specific model, which becomes the global default.
 *
 * @param settings - Current prompt settings.
 * @param onSettingsChange - Callback when settings are updated.
 * @param onSwitchToProviders - Optional callback to switch to the Providers tab.
 * @returns The rendered ModelSelectionTab component.
 */
export const ModelSelectionTab: React.FC<ModelSelectionTabProps> = ({ settings, onSettingsChange, onSwitchToProviders }) => {
  const { providers, fetchModels } = useProviders();
  const [globalDefault, setGlobalDefault] = useState<{
    providerId: string;
    modelId: string;
  } | null>(null);
  const [models, setModels] = useState<Record<string, Model[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  useEffect(() => {
    loadGlobalDefault();
  }, []);

  const loadGlobalDefault = async () => {
    setIsLoading(true);
    try {
      const defaultSettings = await taskAssignmentService.getGlobalDefault();
      if (defaultSettings) {
        setGlobalDefault(defaultSettings);
        setSelectedProvider(defaultSettings.providerId);
        await loadModelsForProvider(defaultSettings.providerId);
      } else if (providers.length > 0) {
        // No global default set, use first provider
        const firstProvider = providers[0];
        setSelectedProvider(firstProvider.id);
        await loadModelsForProvider(firstProvider.id);
      }
    } catch (error) {
      console.error('Failed to load global default:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelsForProvider = async (providerId: string) => {
    if (models[providerId]) return models[providerId]; // Already loaded

    try {
      const providerModels = await fetchModels(providerId);
      setModels(prev => ({ ...prev, [providerId]: providerModels }));
      return providerModels;
    } catch (error) {
      console.error(`Failed to load models for provider ${providerId}:`, error);
      return [];
    }
  };

  const handleProviderChange = async (providerId: string) => {
    setSelectedProvider(providerId);

    // Load models and wait for them
    const providerModels = await loadModelsForProvider(providerId);

    // Auto-select first model for this provider
    if (providerModels && providerModels.length > 0) {
      await handleModelChange(providerId, providerModels[0].id);
    }
  };

  const handleModelChange = async (providerId: string, modelId: string) => {
    try {
      console.log('[ModelSelectionTab] Saving global default:', { providerId, modelId });

      // Update global default in IndexedDB
      await taskAssignmentService.setGlobalDefault(providerId, modelId);
      setGlobalDefault({ providerId, modelId });

      // Sync to settings for backward compatibility
      onSettingsChange({
        ...settings,
        modelName: modelId,
      });

      console.log('[ModelSelectionTab] Global default saved successfully');
    } catch (error) {
      console.error('Failed to update global default:', error);
      alert('Failed to save model selection');
    }
  };

  const getProviderName = (providerId: string): string => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || providerId;
  };

  const getModelName = (providerId: string, modelId: string): string => {
    const providerModels = models[providerId];
    if (!providerModels) return modelId;

    const model = providerModels.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">Loading model configuration...</p>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="max-w-2xl">
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-amber-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No Providers Configured</h3>
          <p className="text-sm text-gray-400 mb-4">
            You need to add at least one provider before you can select a model.
          </p>
          {onSwitchToProviders && (
            <button
              onClick={onSwitchToProviders}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
            >
              Go to Providers Tab
            </button>
          )}
          {!onSwitchToProviders && (
            <p className="text-sm text-gray-400">
              Go to the <strong>Providers</strong> tab to add OpenRouter, Gemini, OpenAI, or a local server.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Default Model Selection</h2>
        <p className="text-sm text-gray-400">
          Choose which AI provider and model to use for all generation tasks. This is your global default.
        </p>
      </div>

      {/* Current Selection Summary */}
      {globalDefault && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-500/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base font-semibold text-white">Currently Active</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Provider:</span>{' '}
                  <span className="font-medium text-white">{getProviderName(globalDefault.providerId)}</span>
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Model:</span>{' '}
                  <span className="font-medium text-white">{getModelName(globalDefault.providerId, globalDefault.modelId)}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Model Selection Form */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-white mb-4">Select Provider & Model</h3>

          {/* Provider Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                1. Choose Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Select a provider...</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                The AI service that will process your requests (OpenRouter, Gemini, OpenAI, etc.)
              </p>
            </div>

            {/* Model Selection */}
            {selectedProvider && models[selectedProvider] && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  2. Choose Model
                </label>
                <ModelPicker
                  providerId={selectedProvider}
                  models={models[selectedProvider]}
                  selectedModelId={globalDefault?.modelId || ''}
                  onSelect={(modelId) => handleModelChange(selectedProvider, modelId)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  The specific AI model to use. Different models have different capabilities and costs.
                </p>

                {/* Assign to All Tasks Button */}
                {globalDefault && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <button
                      onClick={async () => {
                        if (confirm('Apply this model to ALL tasks (Primary Generation, Mixing, Normalization, etc.)? This will override any custom task assignments.')) {
                          try {
                            await taskAssignmentService.applyToAllTasks(globalDefault.providerId, globalDefault.modelId);
                            alert('Model applied to all tasks successfully');
                          } catch (error) {
                            console.error('Failed to apply to all tasks:', error);
                            alert('Failed to apply model to all tasks');
                          }
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Assign to All Tasks
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Click this after changing models to apply your selection to all 9 tasks immediately
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-300 space-y-2">
              <p className="font-medium text-white">How This Works:</p>
              <ul className="space-y-1.5 text-gray-400">
                <li className="flex gap-2">
                  <span className="text-blue-400 shrink-0">•</span>
                  <span>Your selection here becomes the <strong className="text-white">global default</strong> for all AI tasks</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 shrink-0">•</span>
                  <span>The "AI Model" dropdown in the generation page will reflect this choice</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 shrink-0">•</span>
                  <span>Advanced users can configure different models per task in the <strong className="text-white">Task Assignment</strong> tab</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 shrink-0">•</span>
                  <span>Changes take effect immediately - no page reload required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Link */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Advanced Configuration</h4>
            <p className="text-xs text-gray-400">
              Configure different models for different tasks (generation, mixing, normalization, etc.)
            </p>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const event = new CustomEvent('switch-settings-tab', { detail: 'tasks' });
              window.dispatchEvent(event);
            }}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Go to Task Assignment →
          </a>
        </div>
      </div>

      {/* Reset Button */}
      <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-white mb-1">Reset All Tasks</h4>
            <p className="text-xs text-gray-400 mb-3">
              If generation is using the wrong provider/model, click this button to reset all task assignments to use your current global default.
            </p>
            <button
              onClick={async () => {
                if (!globalDefault) {
                  alert('Please select a provider and model first');
                  return;
                }
                if (confirm('This will reset ALL task assignments (Primary Generation, Mixing, Normalization, etc.) to use your current global default. Continue?')) {
                  try {
                    await taskAssignmentService.applyToAllTasks(globalDefault.providerId, globalDefault.modelId);
                    alert('All task assignments have been reset to the global default');
                  } catch (error) {
                    console.error('Failed to reset tasks:', error);
                    alert('Failed to reset task assignments');
                  }
                }
              }}
              className="text-sm bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 px-4 py-2 rounded-lg transition-colors border border-amber-600/40"
            >
              Reset All Tasks to Global Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

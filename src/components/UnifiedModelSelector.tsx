import React, { useState, useEffect } from 'react';
import { useProviders } from '../contexts/ProviderContext';
import { taskAssignmentService } from '../services/taskAssignmentService';
import type { Model } from '../../types/providers';

interface UnifiedModelSelectorProps {
  onModelChange?: (providerId: string, modelId: string) => void;
}

/**
 * UnifiedModelSelector component
 *
 * Single source of truth for model selection in the generation interface.
 * It reads from and writes to `taskAssignmentService.getGlobalDefault()`.
 * This component synchronizes with the settings page.
 *
 * @param onModelChange - Optional callback when the model selection changes.
 * @returns The rendered UnifiedModelSelector component.
 */
export const UnifiedModelSelector: React.FC<UnifiedModelSelectorProps> = ({ onModelChange }) => {
  const { providers, fetchModels } = useProviders();
  const [globalDefault, setGlobalDefault] = useState<{
    providerId: string;
    modelId: string;
  } | null>(null);
  const [models, setModels] = useState<Record<string, Model[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGlobalDefault();
  }, []);

  const loadGlobalDefault = async () => {
    setIsLoading(true);
    try {
      const defaultSettings = await taskAssignmentService.getGlobalDefault();
      if (defaultSettings) {
        setGlobalDefault(defaultSettings);
        await loadModelsForProvider(defaultSettings.providerId);
      } else if (providers.length > 0) {
        // No global default set, use first provider
        const firstProvider = providers[0];
        await loadModelsForProvider(firstProvider.id);
        const providerModels = await fetchModels(firstProvider.id);
        if (providerModels.length > 0) {
          await handleModelChange(firstProvider.id, providerModels[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load global default:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelsForProvider = async (providerId: string) => {
    if (models[providerId]) return; // Already loaded

    try {
      const providerModels = await fetchModels(providerId);
      setModels(prev => ({ ...prev, [providerId]: providerModels }));
    } catch (error) {
      console.error(`Failed to load models for provider ${providerId}:`, error);
    }
  };

  const handleModelChange = async (providerId: string, modelId: string) => {
    try {
      // Update global default in IndexedDB
      await taskAssignmentService.setGlobalDefault(providerId, modelId);
      setGlobalDefault({ providerId, modelId });

      // Notify parent component
      if (onModelChange) {
        onModelChange(providerId, modelId);
      }
    } catch (error) {
      console.error('Failed to update global default:', error);
      alert('Failed to save model selection');
    }
  };

  const getProviderName = (providerId: string): string => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || providerId;
  };

  const getModelDisplayName = (providerId: string, modelId: string): string => {
    const providerModels = models[providerId];
    if (!providerModels) return modelId;

    const model = providerModels.find(m => m.id === modelId);
    return model?.name || modelId;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          AI Model
        </h3>
        <div className="w-full bg-gray-800 text-gray-400 text-sm border border-gray-700 rounded-md px-3 py-2">
          Loading...
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          AI Model
        </h3>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/settings');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="w-full bg-amber-600/20 border border-amber-500/50 text-amber-300 text-sm rounded-md px-3 py-2 hover:bg-amber-600/30 transition-colors text-left"
        >
          Configure Providers in Settings
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Add OpenRouter, Gemini, OpenAI, or a local server to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          AI Model
        </h3>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/settings');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          title="Open settings to configure providers and models"
        >
          Configure
        </button>
      </div>

      {globalDefault && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Provider: {getProviderName(globalDefault.providerId)}</span>
          </div>
          <select
            value={globalDefault.modelId}
            onChange={async (e) => {
              await handleModelChange(globalDefault.providerId, e.target.value);
            }}
            className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {models[globalDefault.providerId]?.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            )) || (
              <option value={globalDefault.modelId}>
                {getModelDisplayName(globalDefault.providerId, globalDefault.modelId)}
              </option>
            )}
          </select>
          <p className="text-xs text-gray-500">
            Quick model switch. For advanced per-task configuration, use Settings.
          </p>
        </div>
      )}
    </div>
  );
};

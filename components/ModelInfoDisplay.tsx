import React, { useState, useEffect } from 'react';
import { useProviders } from '../context/ProviderContext';
import { taskAssignmentService } from '../services/taskAssignmentService';
import { TASK_IDS, TASK_METADATA } from '../types/providers';
import type { Model, TaskAssignment } from '../types/providers';

/**
 * Read-only display showing which model and sampler settings will be used for generation
 * Links to Settings for changes
 */
export const ModelInfoDisplay: React.FC = () => {
  const { providers, fetchModels } = useProviders();
  const [assignment, setAssignment] = useState<TaskAssignment | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssignment();
  }, []);

  const loadAssignment = async () => {
    setIsLoading(true);
    try {
      // Get the assignment for intermediate generation (the default generation task)
      const taskAssignment = await taskAssignmentService.getOrCreateAssignment(
        TASK_IDS.INTERMEDIATE_GENERATION
      );
      setAssignment(taskAssignment);

      // Load model info
      const providerModels = await fetchModels(taskAssignment.providerId);
      const modelInfo = providerModels.find(m => m.id === taskAssignment.modelId);
      setModel(modelInfo || null);
    } catch (error) {
      console.error('Failed to load model assignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderName = (providerId: string): string => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.name || providerId;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generation Settings
          </h3>
        </div>
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!assignment || providers.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Generation Settings
          </h3>
        </div>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/settings');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="w-full bg-amber-600/20 border border-amber-500/50 text-amber-300 text-sm rounded-md px-3 py-2 hover:bg-amber-600/30 transition-colors text-left"
        >
          Configure Provider & Model in Settings
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generation Settings
        </h3>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/settings');
            window.dispatchEvent(new PopStateEvent('popstate'));
            // Switch to Model Selection tab
            setTimeout(() => {
              const event = new CustomEvent('switch-settings-tab', { detail: 'model' });
              window.dispatchEvent(event);
            }, 100);
          }}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          title="Change model and settings"
        >
          Change
        </button>
      </div>

      <div className="space-y-3">
        {/* Model Info */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1">Provider & Model</div>
              <div className="text-sm text-white font-medium truncate">
                {getProviderName(assignment.providerId)}
              </div>
              <div className="text-xs text-gray-400 truncate mt-0.5">
                {model?.name || assignment.modelId}
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Sampler Settings */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-xs text-gray-500 mb-0.5">Temperature</div>
            <div className="text-sm text-white font-medium">{assignment.temperature}</div>
          </div>
          <div className="bg-gray-800/30 rounded p-2">
            <div className="text-xs text-gray-500 mb-0.5">Max Tokens</div>
            <div className="text-sm text-white font-medium">{assignment.maxTokens}</div>
          </div>
          {assignment.topP !== undefined && (
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-xs text-gray-500 mb-0.5">Top P</div>
              <div className="text-sm text-white font-medium">{assignment.topP}</div>
            </div>
          )}
          {assignment.enableStreaming && (
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-xs text-gray-500 mb-0.5">Streaming</div>
              <div className="text-sm text-green-400 font-medium">Enabled</div>
            </div>
          )}
        </div>

        {/* Info text */}
        <p className="text-xs text-gray-500 leading-relaxed">
          These settings apply to all generation tasks. To change, click "Change" above or visit Settings → Model Selection.
        </p>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { taskAssignmentService } from '../../services/taskAssignmentService';
import { useProviders } from '../../contexts/ProviderContext';
import { TASK_IDS, TASK_METADATA, type TaskId } from '../../../types/providers';
import { ModelPicker } from '../ModelPicker';
import type { Model } from '../../../types/providers';

/**
 * TaskAssignmentTab component
 *
 * Settings tab for configuring task-specific model assignments.
 * Allows setting a global default model and overriding it for specific tasks (e.g., primary generation, mixing).
 *
 * @returns The rendered TaskAssignmentTab component.
 */
export const TaskAssignmentTab: React.FC = () => {
  const { providers, fetchModels } = useProviders();
  const [usePerTaskAssignments, setUsePerTaskAssignments] = useState(false);
  const [globalDefault, setGlobalDefault] = useState<{
    providerId: string;
    modelId: string;
  } | null>(null);
  const [taskAssignments, setTaskAssignments] = useState<Record<string, any>>({});
  const [models, setModels] = useState<Record<string, Model[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const defaultSettings = await taskAssignmentService.getGlobalDefault();
    setGlobalDefault(defaultSettings);

    // Pre-load models for the current provider
    if (defaultSettings?.providerId) {
      await loadModelsForProvider(defaultSettings.providerId);
    }

    const assignments = await taskAssignmentService.getAllTaskAssignments();
    const assignmentMap: Record<string, any> = {};
    assignments.forEach((a) => {
      assignmentMap[a.taskId] = a;
    });
    setTaskAssignments(assignmentMap);

    // Pre-load models for all assigned providers
    const providerIds = new Set<string>();
    assignments.forEach((a) => {
      if (a.providerId) {
        providerIds.add(a.providerId);
      }
    });
    await Promise.all([...providerIds].map(id => loadModelsForProvider(id)));
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

  const handleGlobalDefaultChange = async (
    providerId: string,
    modelId: string
  ) => {
    await taskAssignmentService.setGlobalDefault(providerId, modelId);
    setGlobalDefault({ providerId, modelId });

    // Reload models for this provider
    await loadModelsForProvider(providerId);
  };

  const handleTaskAssignmentChange = async (
    taskId: TaskId,
    updates: any
  ) => {
    const existing = taskAssignments[taskId] || {};
    const updated = { ...existing, taskId, ...updates };
    await taskAssignmentService.setTaskAssignment(updated);
    setTaskAssignments({ ...taskAssignments, [taskId]: updated });

    // Reload models if provider changed
    if (updates.providerId) {
      await loadModelsForProvider(updates.providerId);
    }
  };

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getTaskAssignment = (taskId: TaskId) => {
    return (
      taskAssignments[taskId] || {
        taskId,
        providerId: globalDefault?.providerId || '',
        modelId: globalDefault?.modelId || '',
        enableStreaming: false,
        enableRewrite: false,
        temperature: TASK_METADATA[taskId].defaultTemperature,
        maxTokens: TASK_METADATA[taskId].defaultMaxTokens,
        topP: 1.0,
      }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Task Assignment</h3>

      {/* Global Default */}
      <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
        <h4 className="font-medium mb-3">Global Default</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Provider</label>
            <select
              value={globalDefault?.providerId || ''}
              onChange={async (e) => {
                const providerId = e.target.value;
                // Load models first
                const modelList = await loadModelsForProvider(providerId);
                const firstModel = modelList?.[0]?.id || '';
                if (firstModel) {
                  await handleGlobalDefaultChange(providerId, firstModel);
                }
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
            >
              <option value="">Select provider...</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {globalDefault?.providerId && models[globalDefault.providerId] && (
            <div>
              <label className="block text-sm mb-1">Model</label>
              <ModelPicker
                providerId={globalDefault.providerId}
                models={models[globalDefault.providerId]}
                selectedModelId={globalDefault.modelId}
                onSelect={(modelId) =>
                  handleGlobalDefaultChange(globalDefault.providerId, modelId)
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Per-Task Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="per-task-toggle"
          checked={usePerTaskAssignments}
          onChange={(e) => setUsePerTaskAssignments(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="per-task-toggle" className="text-sm cursor-pointer">
          Use different models per task (advanced)
        </label>
      </div>

      {/* Per-Task Assignments */}
      {usePerTaskAssignments && (
        <div className="space-y-2">
          {providers.length === 0 ? (
            <div className="text-center text-gray-400 py-8 border border-gray-700 rounded-lg">
              <p className="mb-2">No providers configured</p>
              <p className="text-sm">Add a provider in the Providers tab to configure task assignments</p>
            </div>
          ) : (
            Object.keys(TASK_IDS).map((key) => {
            const taskId = TASK_IDS[key as keyof typeof TASK_IDS];
            const metadata = TASK_METADATA[taskId];
            const assignment = getTaskAssignment(taskId);
            const isExpanded = expandedTasks.has(taskId);

            return (
              <div
                key={taskId}
                className="border border-gray-600 rounded-lg bg-gray-800"
              >
                <button
                  onClick={() => toggleTask(taskId)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
                >
                  <div>
                    <div className="font-medium">{metadata.name}</div>
                    <div className="text-xs text-gray-400">
                      {metadata.description}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-700 pt-3">
                    {/* Provider */}
                    <div>
                      <label className="block text-sm mb-1">Provider</label>
                      <select
                        value={assignment.providerId}
                        onChange={async (e) => {
                          const providerId = e.target.value;
                          // Load models for this provider first
                          await loadModelsForProvider(providerId);
                          await handleTaskAssignmentChange(taskId, {
                            providerId,
                          });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                      >
                        {providers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model */}
                    {assignment.providerId &&
                      models[assignment.providerId] && (
                        <div>
                          <label className="block text-sm mb-1">Model</label>
                          <ModelPicker
                            providerId={assignment.providerId}
                            models={models[assignment.providerId]}
                            selectedModelId={assignment.modelId}
                            onSelect={(modelId) =>
                              handleTaskAssignmentChange(taskId, { modelId })
                            }
                          />
                        </div>
                      )}

                    {/* Sampler Settings */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm mb-1">
                          Temperature
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={assignment.temperature}
                          onChange={(e) =>
                            handleTaskAssignmentChange(taskId, {
                              temperature: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="8192"
                          value={assignment.maxTokens}
                          onChange={(e) =>
                            handleTaskAssignmentChange(taskId, {
                              maxTokens: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                        />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={assignment.enableStreaming}
                          onChange={(e) =>
                            handleTaskAssignmentChange(taskId, {
                              enableStreaming: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Enable streaming</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={assignment.enableRewrite}
                          onChange={(e) =>
                            handleTaskAssignmentChange(taskId, {
                              enableRewrite: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          Prompt rewrite (model family optimization)
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      )}
    </div>
  );
};

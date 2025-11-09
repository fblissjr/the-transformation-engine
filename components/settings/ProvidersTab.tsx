import React, { useState, useEffect } from 'react';
import { useProviders } from '../../context/ProviderContext';
import type { Provider, ProviderType } from '../../types/providers';
import { taskAssignmentService } from '../../services/taskAssignmentService';

export const ProvidersTab: React.FC = () => {
  const {
    providers,
    addProvider,
    updateProvider,
    deleteProvider,
    addApiKey,
    testConnection,
    fetchModels,
  } = useProviders();

  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderType, setNewProviderType] = useState<ProviderType>('gemini');
  const [newProviderBaseUrl, setNewProviderBaseUrl] = useState('https://generativelanguage.googleapis.com/v1beta');
  const [newApiKeyValue, setNewApiKeyValue] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true); // Default to true for convenience
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [confirmingDefaultFor, setConfirmingDefaultFor] = useState<string | null>(null);

  const handleAddProvider = async () => {
    if (!newProviderName.trim() || !newProviderBaseUrl.trim() || !newApiKeyValue.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const provider = await addProvider(newProviderName, newProviderType, newProviderBaseUrl);
      await addApiKey(provider.id, newApiKeyValue);

      // If "Set as Default" is checked, set this provider as global default for all tasks
      if (setAsDefault) {
        const models = await fetchModels(provider.id);
        if (models && models.length > 0) {
          // Use first model as default
          await taskAssignmentService.setGlobalDefault(provider.id, models[0].id);
        }
      }

      setIsAddingProvider(false);
      setNewProviderName('');
      setNewApiKeyValue('');
      setSetAsDefault(true); // Reset to default checked
    } catch (error: any) {
      alert(`Failed to add provider: ${error.message}`);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const result = await testConnection(providerId);
      setTestResults({ ...testResults, [providerId]: result });
    } catch (error) {
      setTestResults({
        ...testResults,
        [providerId]: { success: false, error: 'Connection test failed' },
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (confirm('Are you sure you want to delete this provider? All associated API keys will be removed.')) {
      try {
        await deleteProvider(providerId);
      } catch (error: any) {
        alert(`Failed to delete provider: ${error.message}`);
      }
    }
  };

  const handleSetAsDefault = async (providerId: string) => {
    // Show confirmation UI instead of executing immediately
    setConfirmingDefaultFor(providerId);
  };

  const handleConfirmSetDefault = async (providerId: string) => {
    try {
      const models = await fetchModels(providerId);
      if (models && models.length > 0) {
        await taskAssignmentService.setGlobalDefault(providerId, models[0].id);
        setConfirmingDefaultFor(null);
      } else {
        alert('No models found for this provider');
      }
    } catch (error: any) {
      alert(`Failed to set as default: ${error.message}`);
    }
  };

  const handleCancelSetDefault = () => {
    setConfirmingDefaultFor(null);
  };

  const getProviderIcon = (type: ProviderType): string => {
    switch (type) {
      case 'openrouter':
        return '🌐';
      case 'openai':
        return '🤖';
      case 'gemini':
        return '💎';
      case 'local':
        return '🏠';
      default:
        return '⚙️';
    }
  };

  const getProviderTypeLabel = (type: ProviderType): string => {
    switch (type) {
      case 'openrouter':
        return 'OpenRouter';
      case 'openai':
        return 'OpenAI';
      case 'gemini':
        return 'Google Gemini';
      case 'local':
        return 'Local Server';
      default:
        return 'Custom';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Providers</h3>
        <button
          onClick={() => setIsAddingProvider(true)}
          className="px-4 py-2.5 min-h-11 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
        >
          + Add Provider
        </button>
      </div>

      {/* Add Provider Form */}
      {isAddingProvider && (
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
          <h4 className="font-medium mb-3">Add New Provider</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Provider Type</label>
              <select
                value={newProviderType}
                onChange={(e) => {
                  setNewProviderType(e.target.value as ProviderType);
                  // Update default base URL based on type
                  switch (e.target.value) {
                    case 'gemini':
                      setNewProviderBaseUrl('https://generativelanguage.googleapis.com/v1beta');
                      break;
                    case 'openrouter':
                      setNewProviderBaseUrl('https://openrouter.ai/api/v1');
                      break;
                    case 'openai':
                      setNewProviderBaseUrl('https://api.openai.com/v1');
                      break;
                    case 'local':
                      setNewProviderBaseUrl('http://localhost:8080/v1');
                      break;
                  }
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openrouter">OpenRouter (100+ models)</option>
                <option value="openai">OpenAI (GPT-4, o-series)</option>
                <option value="local">Local Server (OpenAI-compatible)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Provider Name</label>
              <input
                type="text"
                value={newProviderName}
                onChange={(e) => setNewProviderName(e.target.value)}
                placeholder="e.g., My OpenRouter"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Base URL</label>
              <input
                type="text"
                value={newProviderBaseUrl}
                onChange={(e) => setNewProviderBaseUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">API Key</label>
              <input
                type="password"
                value={newApiKeyValue}
                onChange={(e) => setNewApiKeyValue(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="setAsDefault"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
              <label htmlFor="setAsDefault" className="text-sm cursor-pointer">
                Set as default provider for all tasks
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddProvider}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              >
                Add Provider
              </button>
              <button
                onClick={() => setIsAddingProvider(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider List */}
      <div className="space-y-3">
        {providers.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No providers configured. Add one to get started.
          </div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.id}
              className="border border-gray-600 rounded-lg p-4 bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getProviderIcon(provider.type)}</span>
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-gray-400">
                        {getProviderTypeLabel(provider.type)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    {provider.baseUrl}
                  </div>
                  {testResults[provider.id] && (
                    <div
                      className={`mt-2 text-sm ${
                        testResults[provider.id].success
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {testResults[provider.id].success
                        ? `✓ Connected (${testResults[provider.id].modelCount} models available)`
                        : `✗ ${testResults[provider.id].error}`}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={testingProvider === provider.id}
                    className="px-4 py-2.5 min-h-11 bg-gray-700 hover:bg-gray-600 text-sm rounded transition-colors disabled:opacity-50"
                  >
                    {testingProvider === provider.id ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={() => handleSetAsDefault(provider.id)}
                    className="px-4 py-2.5 min-h-11 bg-green-900/50 hover:bg-green-900 text-sm rounded transition-colors"
                    title="Set as default provider for all tasks"
                  >
                    Set Default
                  </button>
                  <button
                    onClick={() => handleDeleteProvider(provider.id)}
                    className="px-4 py-2.5 min-h-11 bg-red-900/50 hover:bg-red-900 text-sm rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Inline confirmation panel */}
              {confirmingDefaultFor === provider.id && (
                <div className="mt-3 p-4 bg-amber-900/30 border-2 border-amber-600/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">Set as Global Default?</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        This will override <strong>all 9 task assignments</strong> (Primary Generation, Intermediate Generation, Mix Prompts, Normalize, Schema Inference, Media Description, Transform, Model Conversion, Prompt Rewrite) to use <strong>{provider.name}</strong> with its first available model.
                      </p>
                      <p className="text-xs text-amber-400 mb-3">
                        You can customize individual tasks later in the <strong>Task Assignment</strong> tab if needed.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmSetDefault(provider.id)}
                          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded transition-colors"
                        >
                          Confirm - Set as Default
                        </button>
                        <button
                          onClick={handleCancelSetDefault}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

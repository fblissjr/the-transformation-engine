import React, { useState, useEffect } from 'react';
import { useProviders } from '../../context/ProviderContext';
import type { Provider, ProviderType } from '../../types/providers';

export const ProvidersTab: React.FC = () => {
  const {
    providers,
    addProvider,
    updateProvider,
    deleteProvider,
    addApiKey,
    testConnection,
  } = useProviders();

  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderType, setNewProviderType] = useState<ProviderType>('openrouter');
  const [newProviderBaseUrl, setNewProviderBaseUrl] = useState('https://openrouter.ai/api/v1');
  const [newApiKeyValue, setNewApiKeyValue] = useState('');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const handleAddProvider = async () => {
    if (!newProviderName.trim() || !newProviderBaseUrl.trim() || !newApiKeyValue.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const provider = await addProvider(newProviderName, newProviderType, newProviderBaseUrl);
      await addApiKey(provider.id, newApiKeyValue);

      setIsAddingProvider(false);
      setNewProviderName('');
      setNewApiKeyValue('');
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
                    case 'openrouter':
                      setNewProviderBaseUrl('https://openrouter.ai/api/v1');
                      break;
                    case 'openai':
                      setNewProviderBaseUrl('https://api.openai.com/v1');
                      break;
                    case 'gemini':
                      setNewProviderBaseUrl('https://generativelanguage.googleapis.com/v1beta');
                      break;
                    case 'local':
                      setNewProviderBaseUrl('http://localhost:8080/v1');
                      break;
                  }
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
              >
                <option value="openrouter">OpenRouter (100+ models)</option>
                <option value="openai">OpenAI (GPT-4, o-series)</option>
                <option value="gemini">Google Gemini</option>
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
                    onClick={() => handleDeleteProvider(provider.id)}
                    className="px-4 py-2.5 min-h-11 bg-red-900/50 hover:bg-red-900 text-sm rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

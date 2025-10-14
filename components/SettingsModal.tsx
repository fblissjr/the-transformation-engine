import React, { useState } from 'react';
import { PromptSettings } from '../types';
import { DEFAULT_MODEL_SETTINGS, PRIMARY_GENERATION_PROMPT, SYNESTHETIC_MIXER_PROMPT, NORMALIZER_PROMPT, SCHEMA_INFERENCE_PROMPT } from '../constants';
import { ProvidersTab } from './settings/ProvidersTab';
import { TaskAssignmentTab } from './settings/TaskAssignmentTab';
import { TokenUsageTab } from './settings/TokenUsageTab';

interface SettingsModalProps {
  onClose: () => void;
  settings: PromptSettings;
  onSettingsChange: (settings: PromptSettings) => void;
}

type Tab = 'providers' | 'tasks' | 'model' | 'prompts' | 'tokens' | 'data';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState<Tab>('providers');

  // Local state for model settings (extracted from settings)
  const [localModelName, setLocalModelName] = useState<string>(settings.modelName || DEFAULT_MODEL_SETTINGS.modelName);
  const [localTemperature, setLocalTemperature] = useState<number>(DEFAULT_MODEL_SETTINGS.temperature || 1.0);
  const [localTopP, setLocalTopP] = useState<number>(DEFAULT_MODEL_SETTINGS.topP || 0.95);
  const [localMaxTokens, setLocalMaxTokens] = useState<number>(DEFAULT_MODEL_SETTINGS.maxTokens || 2048);

  // Local state for system prompts
  const [primaryPrompt, setPrimaryPrompt] = useState<string>(() => {
    const saved = localStorage.getItem('custom_primary_prompt');
    return saved || PRIMARY_GENERATION_PROMPT;
  });
  const [mixerPrompt, setMixerPrompt] = useState<string>(() => {
    const saved = localStorage.getItem('custom_mixer_prompt');
    return saved || SYNESTHETIC_MIXER_PROMPT;
  });
  const [normalizerPrompt, setNormalizerPrompt] = useState<string>(() => {
    const saved = localStorage.getItem('custom_normalizer_prompt');
    return saved || NORMALIZER_PROMPT;
  });
  const [schemaInferencePrompt, setSchemaInferencePrompt] = useState<string>(() => {
    const saved = localStorage.getItem('custom_schema_inference_prompt');
    return saved || SCHEMA_INFERENCE_PROMPT;
  });
  const [activePromptTab, setActivePromptTab] = useState<'primary' | 'mixer' | 'normalizer' | 'schema'>('primary');

  const handleClearCache = () => {
    if (confirm('Clear all cached data? This includes API responses and model lists.')) {
      // Clear localStorage cache
      localStorage.removeItem('gemini_models_cache');
      // Note: apiCache is in-memory, it will be cleared on page reload
      alert('Cache cleared successfully. Some in-memory cache will clear on page reload.');
    }
  };

  const handleClearAllData = async () => {
    if (confirm('WARNING: This will delete ALL your prompts, versions, providers, and settings. This cannot be undone. Are you sure?')) {
      if (confirm('FINAL WARNING: You are about to permanently delete all data. Continue?')) {
        try {
          // Clear IndexedDB
          const databases = ['TransformationEngineDB'];
          for (const dbName of databases) {
            const deleteRequest = indexedDB.deleteDatabase(dbName);
            await new Promise((resolve, reject) => {
              deleteRequest.onsuccess = () => resolve(true);
              deleteRequest.onerror = () => reject(deleteRequest.error);
              deleteRequest.onblocked = () => {
                console.warn(`Database ${dbName} deletion blocked - close other tabs`);
                resolve(true);
              };
            });
          }
          // Clear localStorage
          localStorage.clear();
          // Clear sessionStorage
          sessionStorage.clear();
          alert('All data cleared. The page will now reload.');
          window.location.reload();
        } catch (error) {
          console.error('Failed to clear data:', error);
          alert('Failed to clear all data. Please try manually clearing browser data or close other tabs using this app.');
        }
      }
    }
  };

  const handleSaveModelSettings = () => {
    // Update settings.modelName (which is the default model for generation)
    onSettingsChange({
      ...settings,
      modelName: localModelName,
    });
    onClose();
  };

  const handleResetModelSettings = () => {
    setLocalModelName(DEFAULT_MODEL_SETTINGS.modelName);
    setLocalTemperature(DEFAULT_MODEL_SETTINGS.temperature || 1.0);
    setLocalTopP(DEFAULT_MODEL_SETTINGS.topP || 0.95);
    setLocalMaxTokens(DEFAULT_MODEL_SETTINGS.maxTokens || 2048);
  };

  const handleSaveSystemPrompts = () => {
    localStorage.setItem('custom_primary_prompt', primaryPrompt);
    localStorage.setItem('custom_mixer_prompt', mixerPrompt);
    localStorage.setItem('custom_normalizer_prompt', normalizerPrompt);
    localStorage.setItem('custom_schema_inference_prompt', schemaInferencePrompt);
    alert('System prompts saved');
  };

  const handleResetSystemPrompts = () => {
    if (confirm('Reset all system prompts to defaults?')) {
      setPrimaryPrompt(PRIMARY_GENERATION_PROMPT);
      setMixerPrompt(SYNESTHETIC_MIXER_PROMPT);
      setNormalizerPrompt(NORMALIZER_PROMPT);
      setSchemaInferencePrompt(SCHEMA_INFERENCE_PROMPT);
      localStorage.removeItem('custom_primary_prompt');
      localStorage.removeItem('custom_mixer_prompt');
      localStorage.removeItem('custom_normalizer_prompt');
      localStorage.removeItem('custom_schema_inference_prompt');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full text-left flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4 shrink-0">Settings</h2>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-800 mb-4 shrink-0 gap-y-2">
          <TabButton label="Providers" isActive={activeTab === 'providers'} onClick={() => setActiveTab('providers')} />
          <TabButton label="Tasks" isActive={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <TabButton label="Model" isActive={activeTab === 'model'} onClick={() => setActiveTab('model')} />
          <TabButton label="System Prompts" isActive={activeTab === 'prompts'} onClick={() => setActiveTab('prompts')} />
          <TabButton label="Tokens" isActive={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')} />
          <TabButton label="Data" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {/* Providers Tab */}
          {activeTab === 'providers' && <ProvidersTab />}

          {/* Task Assignment Tab */}
          {activeTab === 'tasks' && <TaskAssignmentTab />}

          {/* Token Usage Tab */}
          {activeTab === 'tokens' && <TokenUsageTab />}

          {/* Model Settings Tab */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Model</label>
                <input
                  type="text"
                  value={localModelName}
                  onChange={e => setLocalModelName(e.target.value)}
                  className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="gemini-2.5-pro"
                />
                <p className="text-xs text-gray-500 mt-1">Model used for new prompts. Changes in generation page override per-session.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Temperature: {localTemperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localTemperature}
                  onChange={e => setLocalTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Controls randomness. Lower = more focused, Higher = more creative</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Top P: {localTopP}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localTopP}
                  onChange={e => setLocalTopP(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Nucleus sampling. Controls diversity of output</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Output Tokens</label>
                <input
                  type="number"
                  min="1"
                  max="8192"
                  value={localMaxTokens}
                  onChange={e => setLocalMaxTokens(parseInt(e.target.value))}
                  className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum length of generated response</p>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={handleResetModelSettings}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* System Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Edit the system prompts used for generation. Changes are saved to localStorage.
              </p>

              {/* Prompt tabs */}
              <div className="flex gap-2 border-b border-gray-700">
                <button
                  onClick={() => setActivePromptTab('primary')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    activePromptTab === 'primary' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Primary
                </button>
                <button
                  onClick={() => setActivePromptTab('mixer')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    activePromptTab === 'mixer' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Mixer
                </button>
                <button
                  onClick={() => setActivePromptTab('normalizer')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    activePromptTab === 'normalizer' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Normalizer
                </button>
                <button
                  onClick={() => setActivePromptTab('schema')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    activePromptTab === 'schema' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Schema
                </button>
              </div>

              {/* Prompt editor */}
              <div>
                {activePromptTab === 'primary' && (
                  <textarea
                    value={primaryPrompt}
                    onChange={e => setPrimaryPrompt(e.target.value)}
                    className="w-full h-96 bg-gray-800 text-white text-xs font-mono border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Primary generation system prompt..."
                  />
                )}
                {activePromptTab === 'mixer' && (
                  <textarea
                    value={mixerPrompt}
                    onChange={e => setMixerPrompt(e.target.value)}
                    className="w-full h-96 bg-gray-800 text-white text-xs font-mono border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mix prompts system prompt..."
                  />
                )}
                {activePromptTab === 'normalizer' && (
                  <textarea
                    value={normalizerPrompt}
                    onChange={e => setNormalizerPrompt(e.target.value)}
                    className="w-full h-96 bg-gray-800 text-white text-xs font-mono border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Normalizer system prompt..."
                  />
                )}
                {activePromptTab === 'schema' && (
                  <textarea
                    value={schemaInferencePrompt}
                    onChange={e => setSchemaInferencePrompt(e.target.value)}
                    className="w-full h-96 bg-gray-800 text-white text-xs font-mono border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Schema inference system prompt..."
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveSystemPrompts}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
                >
                  Save Prompts
                </button>
                <button
                  onClick={handleResetSystemPrompts}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Data & Cache Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Cache Management</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Cache includes API responses and model lists. Clearing cache does not delete your prompts.
                </p>
                <button
                  onClick={handleClearCache}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded transition-colors text-sm border border-gray-700"
                >
                  Clear All Cache
                </button>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-white mb-2">Data Management</h3>
                <p className="text-xs text-gray-400 mb-3">
                  This will permanently delete ALL your prompts, versions, settings, and cache. This action cannot be undone.
                </p>
                <button
                  onClick={handleClearAllData}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-medium py-2.5 px-4 rounded transition-colors text-sm border border-red-600/40 hover:border-red-600/60"
                >
                  Clear All Data (Permanent)
                </button>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-white mb-2">Storage Info</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Prompts are stored locally in IndexedDB</p>
                  <p>No data is sent to any server except Google Gemini API</p>
                  <p>API key is stored in memory only (not persisted to disk)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3 justify-end shrink-0 pt-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition-colors text-sm"
          >
            {activeTab === 'model' || activeTab === 'prompts' ? 'Cancel' : 'Done'}
          </button>
          {activeTab === 'model' && (
            <button
              onClick={handleSaveModelSettings}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded transition-colors text-sm"
            >
              Save Settings
            </button>
          )}
          {activeTab === 'prompts' && (
            <button
              onClick={() => {
                handleSaveSystemPrompts();
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded transition-colors text-sm"
            >
              Save & Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold transition-colors outline-none ${
      isActive ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white border-b-2 border-transparent'
    }`}
  >
    {label}
  </button>
);

export default SettingsModal;

import React, { useState, useEffect } from 'react';
import { PromptSettings } from '../../types';
import { DEFAULT_MODEL_SETTINGS, PRIMARY_GENERATION_PROMPT, SYNESTHETIC_MIXER_PROMPT, NORMALIZER_PROMPT, SCHEMA_INFERENCE_PROMPT } from '../../constants';
import { ProvidersTab } from './settings/ProvidersTab';
import { TaskAssignmentTab } from './settings/TaskAssignmentTab';
import { TokenUsageTab } from './settings/TokenUsageTab';
import { ModelSelectionTab } from './settings/ModelSelectionTab';

interface SettingsPageProps {
  settings: PromptSettings;
  onSettingsChange: (settings: PromptSettings) => void;
}

type Tab = 'model' | 'providers' | 'tasks' | 'prompts' | 'tokens' | 'data';

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState<Tab>('model');

  // Listen for tab switch events from other components
  useEffect(() => {
    const handleSwitchTab = (e: CustomEvent<Tab>) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('switch-settings-tab', handleSwitchTab as any);
    return () => {
      window.removeEventListener('switch-settings-tab', handleSwitchTab as any);
    };
  }, []);

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
      localStorage.removeItem('gemini_models_cache');
      alert('Cache cleared successfully. Some in-memory cache will clear on page reload.');
    }
  };

  const handleClearAllData = async () => {
    if (confirm('WARNING: This will delete ALL your prompts, versions, providers, and settings. This cannot be undone. Are you sure?')) {
      if (confirm('FINAL WARNING: You are about to permanently delete all data. Continue?')) {
        try {
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
          localStorage.clear();
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

  const handleClose = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close settings"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="shrink-0 border-b border-gray-800 bg-gray-900/50 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            <TabButton label="Model Selection" icon="🎯" isActive={activeTab === 'model'} onClick={() => setActiveTab('model')} />
            <TabButton label="Providers" icon="🔌" isActive={activeTab === 'providers'} onClick={() => setActiveTab('providers')} />
            <TabButton label="Task Assignment" icon="⚡" isActive={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
            <TabButton label="System Prompts" icon="📝" isActive={activeTab === 'prompts'} onClick={() => setActiveTab('prompts')} />
            <TabButton label="Token Usage" icon="💰" isActive={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')} />
            <TabButton label="Data & Cache" icon="🗄️" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Model Selection Tab */}
          {activeTab === 'model' && (
            <ModelSelectionTab
              settings={settings}
              onSettingsChange={onSettingsChange}
              onSwitchToProviders={() => setActiveTab('providers')}
            />
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && <ProvidersTab />}

          {/* Task Assignment Tab */}
          {activeTab === 'tasks' && <TaskAssignmentTab />}

          {/* Token Usage Tab */}
          {activeTab === 'tokens' && <TokenUsageTab />}

          {/* System Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">System Prompts</h2>
                <p className="text-sm text-gray-400">
                  Customize the system prompts used for generation. Changes are saved to localStorage.
                </p>
              </div>

              {/* Prompt tabs */}
              <div className="flex gap-2 border-b border-gray-700">
                <button
                  onClick={() => setActivePromptTab('primary')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    activePromptTab === 'primary' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Primary Generation
                </button>
                <button
                  onClick={() => setActivePromptTab('mixer')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    activePromptTab === 'mixer' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Prompt Mixer
                </button>
                <button
                  onClick={() => setActivePromptTab('normalizer')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    activePromptTab === 'normalizer' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Normalizer
                </button>
                <button
                  onClick={() => setActivePromptTab('schema')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    activePromptTab === 'schema' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Schema Inference
                </button>
              </div>

              {/* Prompt editor */}
              <div>
                {activePromptTab === 'primary' && (
                  <textarea
                    value={primaryPrompt}
                    onChange={e => setPrimaryPrompt(e.target.value)}
                    className="w-full h-[500px] bg-gray-800 text-white text-sm font-mono border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Primary generation system prompt..."
                  />
                )}
                {activePromptTab === 'mixer' && (
                  <textarea
                    value={mixerPrompt}
                    onChange={e => setMixerPrompt(e.target.value)}
                    className="w-full h-[500px] bg-gray-800 text-white text-sm font-mono border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mix prompts system prompt..."
                  />
                )}
                {activePromptTab === 'normalizer' && (
                  <textarea
                    value={normalizerPrompt}
                    onChange={e => setNormalizerPrompt(e.target.value)}
                    className="w-full h-[500px] bg-gray-800 text-white text-sm font-mono border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Normalizer system prompt..."
                  />
                )}
                {activePromptTab === 'schema' && (
                  <textarea
                    value={schemaInferencePrompt}
                    onChange={e => setSchemaInferencePrompt(e.target.value)}
                    className="w-full h-[500px] bg-gray-800 text-white text-sm font-mono border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Schema inference system prompt..."
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveSystemPrompts}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Save Prompts
                </button>
                <button
                  onClick={handleResetSystemPrompts}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* Data & Cache Tab */}
          {activeTab === 'data' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Data & Cache Management</h2>
                <p className="text-sm text-gray-400">
                  Manage your local data and cached content.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    Cache Management
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Cache includes API responses and model lists. Clearing cache does not delete your prompts.
                  </p>
                  <button
                    onClick={handleClearCache}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-colors border border-gray-700"
                  >
                    Clear All Cache
                  </button>
                </div>

                <div className="bg-red-900/10 border border-red-800/50 rounded-lg p-6">
                  <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Danger Zone
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    This will permanently delete ALL your prompts, versions, settings, and cache. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleClearAllData}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-medium py-3 px-4 rounded-lg transition-colors border border-red-600/40 hover:border-red-600/60"
                  >
                    Clear All Data (Permanent)
                  </button>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Privacy & Storage Info
                  </h3>
                  <div className="text-sm text-gray-400 space-y-2">
                    <p className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      All data stored locally in IndexedDB (never uploaded to any server)
                    </p>
                    <p className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      API keys encrypted with AES-GCM
                    </p>
                    <p className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Network requests monitored and logged
                    </p>
                    <p className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      100% client-side processing (no backend server)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ label: string; icon: string; isActive: boolean; onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    <span className="text-base">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default SettingsPage;

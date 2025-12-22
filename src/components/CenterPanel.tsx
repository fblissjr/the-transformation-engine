import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePrompts } from '../contexts/PromptContext';
import { useProviders } from '../contexts/ProviderContext';
import { useGeneration } from '../contexts/GenerationContext';
import { SparklesIcon, WandIcon } from './icons';
import { ConversationThread } from './ConversationThread';
import { ModelInfoDisplay } from './ModelInfoDisplay';
import * as configService from '../services/configService';
import * as promptService from '../services/promptService';
import { taskRouter } from '../services/taskRouter';
import { TASK_IDS } from '../../types/providers';
import { transformToModel } from '../services/transformers';
import { useMediaBlobUrls } from '../../hooks/useMediaBlobUrls';
import { MediaReference, Prompt } from '../../types';
import { BUILT_IN_MIX_OPTIONS } from '../../constants';
import { SceneClassificationPanel } from './SceneClassificationPanel';
import { TimestampPromptToggle } from './TimestampPromptToggle';
import { SchemaKeyPresetSelector } from './SchemaKeyPresetSelector';
import { useSceneClassification } from '../contexts/SceneClassificationContext';
import { MixOptionsPanel, SchemaDesigner, TemplateSelector } from './workspace';

/**
 * CenterPanel component
 *
 * The main workspace area for creating and configuring prompts.
 * It contains the input area for natural language descriptions, media uploads,
 * mix options configuration, schema design, and the generation controls.
 *
 * @returns The rendered CenterPanel component.
 */
const CenterPanel: React.FC = () => {
  const {
    settings,
    setSettings,
    naturalLanguageInput,
    setNaturalLanguageInput,
    mediaReferences,
    addMediaReference,
    removeMediaReference,
    describeMedia,
    isDescribing,
    describingMessage,
    generate,
    isLoading,
    progress,
    loadingMessage,
    inferSchema,
    structuredOutput,
    setStructuredOutput,
    selectPrompt,
    addPrompt,
  } = usePrompts();
  const { providers } = useProviders();
  const apiKey = useMemo(() => {
    const defaultProvider = providers.find(p => p.enabled);
    return defaultProvider?.apiKeys?.[0]?.key || null;
  }, [providers]);
  const {
    generatedIntermediate,
    selectedExportModel,
    setSelectedExportModel,
    cancelGeneration,
    // Phase 11.3: Revision request flow
    revisionRequest,
    conversationHistory,
    answerRevisionRequest,
    clearRevisionRequest,
    // Phase 2.1: UX Redesign - Final Output State
    finalOutput,
    genericFinalOutput,
    systemSpecificFinalOutput,
    structuredViewData,
    handleExportFormatChange,
  } = useGeneration();

  // Scene classification and schema key presets
  const {
    classification,
    setClassification,
    selectedPresetId,
    customPresets,
    selectPreset,
    promptingStrategy,
    setPromptingStrategy,
    autoSuggestedPresetId,
    suggestionReasoning
  } = useSceneClassification();

  // Load blob URLs for media references
  const mediaBlobUrls = useMediaBlobUrls(mediaReferences);

  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [editedSystemPrompt, setEditedSystemPrompt] = useState<string | null>(null);
  const [editedUserPrompt, setEditedUserPrompt] = useState<string | null>(null);
  const [isEditingPrompts, setIsEditingPrompts] = useState(false);
  const [templateOverride, setTemplateOverride] = useState<'auto' | 'generic'>('auto');
  const configFileInputRef = useRef<HTMLInputElement>(null);

  // Collapsible sections state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);


  // Initialize mixOptions with built-in options if not set
  useEffect(() => {
    if (!settings.mixOptions || settings.mixOptions.length === 0) {
      setSettings(s => ({
        ...s,
        mixOptions: BUILT_IN_MIX_OPTIONS.map(opt => ({ ...opt })),
      }));
    }
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      try {
        await addMediaReference(files[i]);
      } catch (err) {
        console.error('Failed to add media:', err);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Export/Import handlers
  const handleExportConfig = () => {
    try {
      // Legacy export - model settings now managed via task assignments
      const legacyModelSettings = {
        modelName: '', // Deprecated - use Settings → Task Assignment
        maxTokens: 2048,
        temperature: 1.0,
        topP: 0.95,
      };
      const configJson = configService.exportConfig(
        settings,
        legacyModelSettings,
        [],
        undefined
      );
      configService.downloadConfig(configJson);
    } catch (error) {
      console.error('Failed to export config:', error);
      alert('Failed to export configuration');
    }
  };

  const handleImportConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const jsonString = await configService.readConfigFile(file);
      const config = configService.importConfig(jsonString);

      // Apply imported settings
      setSettings(prev => ({
        ...prev,
        ...config.settings,
        textDirection: prev.textDirection, // Keep legacy field from current settings
      }));

      alert('Configuration imported successfully');
    } catch (error) {
      console.error('Failed to import config:', error);
      alert('Failed to import configuration: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    // Reset file input
    if (configFileInputRef.current) {
      configFileInputRef.current.value = '';
    }
  };

  // Handle generation with optional custom prompts
  const handleGenerate = async () => {
    // If there are no edited prompts, use the regular generate function from context
    if (!editedSystemPrompt && !editedUserPrompt) {
      await generate();
      return;
    }

    // Custom generation with edited prompts
    // NOTE: This is a power-user feature that bypasses the normal generation flow
    // It allows direct manipulation of system and user prompts
    if (!apiKey) {
      alert('Please configure a provider in Settings → Providers tab.');
      return;
    }

    const userInput = editedUserPrompt || naturalLanguageInput;
    const systemPrompt = editedSystemPrompt || promptService.generatePrimaryPrompt(naturalLanguageInput, settings);

    try {
      // Use taskRouter for multi-provider support (even in custom prompt mode)
      const turn = await taskRouter.executeTask(
        TASK_IDS.PRIMARY_GENERATION,
        userInput,
        systemPrompt,
        {}
      );

      const result = turn.response;

      // Set the output and save to DB
      setStructuredOutput(result);

      const newPromptData: Omit<Prompt, 'id' | 'createdAt'> = {
        title: userInput.substring(0, 40) + '...',
        naturalLanguageInput: userInput,
        mediaReferences: mediaReferences.length > 0 ? mediaReferences : undefined,
        structuredOutput: result,
        normalizedOutput: '',
        settingsSnapshot: JSON.stringify(settings),
        tags: '[]',
        isFavorite: false,
      };

      const savedPrompt = await addPrompt(newPromptData);
      selectPrompt(savedPrompt);

      // Reset edited prompts after successful generation
      setEditedSystemPrompt(null);
      setEditedUserPrompt(null);
      setIsEditingPrompts(false);
    } catch (error) {
      console.error('Generation with custom prompts failed:', error);
      alert('Generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <main className="flex-1 h-full flex flex-col bg-gray-950">
      <div className="flex-1 p-2 sm:p-4 flex flex-col gap-3 sm:gap-4 overflow-y-auto pt-16 lg:pt-4">
        {/* Main Prompt Input */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <label htmlFor="main-input" className="text-sm font-semibold text-white flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              Your Creative Idea
            </label>
            <span className="text-xs text-gray-500">Describe your scene, character, or concept</span>
          </div>
          <textarea
            id="main-input"
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-100 placeholder:text-gray-500 text-sm"
            placeholder="A chef teaches a cooking class in a busy kitchen..."
            value={naturalLanguageInput}
            onChange={e => setNaturalLanguageInput(e.target.value)}
          />

          {/* Media Upload Section */}
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-md transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Image/Video
              </button>
              {mediaReferences.length > 0 && (
                <button
                  onClick={describeMedia}
                  disabled={isLoading || isDescribing}
                  className="flex items-center gap-2 text-sm bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-md transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isDescribing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <WandIcon className="w-4 h-4" />
                      Describe with AI
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Media Thumbnails */}
            {mediaReferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mediaReferences.map(media => {
                  // Use thumbnail for quick display, fallback to blob URL
                  const displayUrl = media.thumbnail || mediaBlobUrls.get(media.id) || '';
                  const fullUrl = mediaBlobUrls.get(media.id) || '';

                  return (
                    <div key={media.id} className="relative group">
                      <div className="w-16 h-16 rounded overflow-hidden border border-gray-700 bg-gray-800">
                        {media.type === 'image' ? (
                          <img
                            src={displayUrl}
                            alt={media.filename}
                            className="w-full h-full object-cover"
                            onMouseEnter={(e) => {
                              // Show full resolution on hover if available
                              if (fullUrl && fullUrl !== displayUrl) {
                                (e.target as HTMLImageElement).src = fullUrl;
                              }
                            }}
                          />
                        ) : (
                          <video src={fullUrl} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <button
                        onClick={() => removeMediaReference(media.id)}
                        className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Phase 11.3: Conversation Thread for REVISION_REQUEST (Veo 3.1 scene-type detection) */}
        {revisionRequest && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <ConversationThread
              revisionRequest={revisionRequest}
              conversationHistory={conversationHistory}
              onSubmitAnswers={answerRevisionRequest}
              onCancel={clearRevisionRequest}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Primary Action Buttons - Prominent Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          {/* Export Format Selector - ABOVE Generate Button */}
          <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Export Format:
            </label>
            <select
              value={selectedExportModel}
              onChange={(e) => handleExportFormatChange(e.target.value as 'sora2' | 'veo3' | 'generic')}
              disabled={isLoading}
              className="w-full bg-gray-900 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="sora2">Sora 2 (OpenAI) - 2,500 char limit</option>
              <option value="veo3">Veo 3 (Google) - 3,000 char limit</option>
              <option value="generic">Generic - No limit</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select which format to generate. You can change this later without regenerating.
            </p>
          </div>

          {(isLoading || isDescribing) && (
            <div className="mb-3">
              <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {(loadingMessage || describingMessage) && (
                <p className="text-xs text-gray-400 text-center animate-pulse">
                  {loadingMessage || describingMessage}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {isLoading ? (
              <button
                onClick={cancelGeneration}
                className="flex-1 bg-red-600 text-white font-bold py-3 px-4 sm:px-6 rounded-lg shadow-lg hover:bg-red-500 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel Request</span>
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!naturalLanguageInput}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 px-4 sm:px-6 rounded-lg shadow-lg hover:from-amber-500 hover:to-orange-500 hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Generate Prompt</span>
              </button>
            )}
          </div>
        </div>

        {/* Phase 2.1: Final Output Display */}
        {finalOutput && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                Final Output
                <span className={`text-xs px-2 py-1 rounded ${
                  selectedExportModel === 'sora2' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' :
                  selectedExportModel === 'veo3' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                }`}>
                  {selectedExportModel === 'sora2' && 'Sora 2'}
                  {selectedExportModel === 'veo3' && 'Veo 3'}
                  {selectedExportModel === 'generic' && 'Generic'}
                </span>
              </h3>

              {/* Format Quick Switcher */}
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-gray-400">Switch:</span>
                <button
                  onClick={() => handleExportFormatChange(selectedExportModel === 'sora2' ? 'veo3' : selectedExportModel === 'veo3' ? 'generic' : 'sora2')}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors"
                >
                  {selectedExportModel === 'sora2' ? 'Veo 3' : selectedExportModel === 'veo3' ? 'Generic' : 'Sora 2'}
                </button>
              </div>
            </div>

            {/* Output Display */}
            <div className="relative">
              <pre className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-4 overflow-x-auto font-mono text-xs sm:text-sm text-gray-300 whitespace-pre-wrap min-h-[200px] sm:min-h-[300px] max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                <code>{finalOutput}</code>
              </pre>

              {/* Character Count */}
              <CharacterCount
                content={finalOutput}
                model={selectedExportModel}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3">
              <CopyButton
                content={finalOutput}
                format={selectedExportModel}
              />
              <button
                onClick={async () => {
                  // Save to library with current format
                  const newPromptData: Omit<Prompt, 'id' | 'createdAt'> = {
                    title: naturalLanguageInput.substring(0, 40) + '...',
                    naturalLanguageInput: naturalLanguageInput,
                    structuredOutput: finalOutput,
                    normalizedOutput: '',
                    settingsSnapshot: JSON.stringify(settings),
                    tags: '[]',
                    isFavorite: false,
                  };
                  const savedPrompt = await addPrompt(newPromptData);
                  selectPrompt(savedPrompt);
                  alert('Saved to library!');
                }}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Save to Library
              </button>
            </div>
          </div>
        )}

        {/* Template Selection */}
        <TemplateSelector
          schemaKeys={settings.schemaKeys}
          templateOverride={templateOverride}
          onTemplateOverrideChange={setTemplateOverride}
        />

        {/* Two Column Layout - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Mix Options - Extracted Component */}
          <MixOptionsPanel
            mixOptions={settings.mixOptions || []}
            onSettingsChange={setSettings}
          />

          {/* Model & Sampler Info - Read-only display */}
          <ModelInfoDisplay />
        </div>

        {/* Schema Designer - Collapsible */}
        <SchemaDesigner
          schemaKeys={settings.schemaKeys}
          onAddKey={(key) => setSettings(prev => ({...prev, schemaKeys: [...prev.schemaKeys, key]}))}
          onRemoveKey={(keyToRemove) => setSettings(prev => ({...prev, schemaKeys: prev.schemaKeys.filter(k => k !== keyToRemove)}))}
          onRenameKey={(oldKey, newKey) => {
            if (newKey && !settings.schemaKeys.includes(newKey)) {
              setSettings(prev => ({...prev, schemaKeys: prev.schemaKeys.map(k => k === oldKey ? newKey : k)}));
            }
          }}
          onApplyPreset={(keys) => setSettings(prev => ({...prev, schemaKeys: keys}))}
          onInferSchema={inferSchema}
          isLoading={isLoading}
          hasInput={!!naturalLanguageInput}
        />
      </div>

      {/* Bottom Bar - Collapsible Advanced Section */}
      <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm shrink-0">
        {/* Export/Import Config - Collapsible */}
        <div className="bg-gray-900/50 border-b border-gray-800">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-sm font-medium text-gray-300">Advanced Settings</span>
              <span className="text-xs text-gray-500">(Export/Import, Preview)</span>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showAdvancedSettings && (
            <div className="p-3 sm:p-4 pt-0 border-t border-gray-800 space-y-3">
              {/* Export/Import Config */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400 mr-2">Configuration:</span>
                <button
                  onClick={handleExportConfig}
                  title="Export configuration"
                  className="flex items-center gap-2 text-gray-400 hover:text-white font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <input
                  ref={configFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="hidden"
                />
                <button
                  onClick={() => configFileInputRef.current?.click()}
                  title="Import configuration"
                  className="flex items-center gap-2 text-gray-400 hover:text-white font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12" />
                  </svg>
                  Import
                </button>
              </div>

              {/* Scene Classification & Prompting Strategy */}
              <div className="border-t border-gray-700 pt-3 space-y-4">
                <SceneClassificationPanel
                  classification={classification}
                  onClassificationChange={setClassification}
                  autoDetect={true}
                  showPresets={true}
                />

                <TimestampPromptToggle
                  strategy={promptingStrategy}
                  onStrategyChange={setPromptingStrategy}
                  disabled={selectedPresetId === 'veo31-timestamp'}
                  disabledReason="Veo 3.1 Timestamp preset enforces timestamp strategy"
                />

                <SchemaKeyPresetSelector
                  presets={customPresets}
                  selectedPresetId={selectedPresetId}
                  suggestedPresetId={autoSuggestedPresetId}
                  suggestionReasoning={suggestionReasoning}
                  onPresetSelect={selectPreset}
                  onCustomize={() => {}}
                  onManagePresets={() => {}}
                />
              </div>

        {/* Prompt Preview Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowPromptPreview(!showPromptPreview)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm font-medium text-white">Preview Prompt</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                detectedTemplate === 'sora2' ? 'bg-blue-500/20 text-blue-300' :
                detectedTemplate === 'veo3' ? 'bg-purple-500/20 text-purple-300' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {detectedTemplate === 'sora2' && 'Sora 2'}
                {detectedTemplate === 'veo3' && 'Veo 3'}
                {detectedTemplate === 'generic' && 'Generic'}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showPromptPreview ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPromptPreview && naturalLanguageInput && (
            <div className="px-4 pb-4 space-y-3">
              {/* Edit/Reset buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (isEditingPrompts) {
                      // Save edits
                      setIsEditingPrompts(false);
                    } else {
                      // Enter edit mode
                      if (!editedSystemPrompt) {
                        setEditedSystemPrompt(promptService.generatePrimaryPrompt(naturalLanguageInput, settings));
                      }
                      if (!editedUserPrompt) {
                        setEditedUserPrompt(naturalLanguageInput);
                      }
                      setIsEditingPrompts(true);
                    }
                  }}
                  className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded transition"
                >
                  {isEditingPrompts ? 'Done Editing' : 'Edit Prompts'}
                </button>
                {(editedSystemPrompt || editedUserPrompt) && (
                  <button
                    onClick={() => {
                      setEditedSystemPrompt(null);
                      setEditedUserPrompt(null);
                      setIsEditingPrompts(false);
                    }}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition"
                  >
                    Reset to Default
                  </button>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
                  <span>System Prompt</span>
                  <span className="text-gray-600">(Assembled)</span>
                  {editedSystemPrompt && <span className="text-yellow-500">(Modified)</span>}
                </div>
                {isEditingPrompts ? (
                  <textarea
                    value={editedSystemPrompt || promptService.generatePrimaryPrompt(naturalLanguageInput, settings)}
                    onChange={e => setEditedSystemPrompt(e.target.value)}
                    className="w-full bg-gray-800 rounded border border-gray-700 p-3 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-auto min-h-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="bg-gray-800 rounded border border-gray-700 p-3 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-64">
                    {editedSystemPrompt || promptService.generatePrimaryPrompt(naturalLanguageInput, settings)}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
                  <span>User Input</span>
                  {editedUserPrompt && <span className="text-yellow-500">(Modified)</span>}
                </div>
                {isEditingPrompts ? (
                  <textarea
                    value={editedUserPrompt || naturalLanguageInput}
                    onChange={e => setEditedUserPrompt(e.target.value)}
                    className="w-full bg-gray-800 rounded border border-gray-700 p-3 text-xs text-white min-h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="bg-gray-800 rounded border border-gray-700 p-3 text-xs text-white">
                    {editedUserPrompt || naturalLanguageInput}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 italic">
                {isEditingPrompts
                  ? 'Edit the prompts above and click "Done Editing" to use these for generation. Changes only apply to this generation.'
                  : 'This is what will be sent to the API. Click "Edit Prompts" to modify before sending, or edit system prompts in Settings &gt; System Prompts to change defaults.'
                }
              </div>
            </div>
          )}
        </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

/**
 * CompactSlider component
 *
 * A compact range slider component with labels.
 *
 * @param label - The main label for the slider.
 * @param leftLabel - Label for the minimum end.
 * @param rightLabel - Label for the maximum end.
 * @param value - The current value of the slider.
 * @param onChange - Callback when the value changes.
 * @returns The rendered CompactSlider component.
 */
const CompactSlider: React.FC<{
  label: string,
  leftLabel: string,
  rightLabel: string,
  value: number,
  onChange: (value: number) => void
}> = ({ label, leftLabel, rightLabel, value, onChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <span className="text-xs font-bold text-amber-400 bg-gray-800 px-2 py-0.5 rounded">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

/**
 * CharacterCount component
 *
 * Displays the character count and validates against model limits.
 *
 * @param content - The text content to count.
 * @param model - The target model to check limits against ('sora2', 'veo3', or 'generic').
 * @returns The rendered CharacterCount component.
 */
const CharacterCount: React.FC<{
  content: string;
  model: 'sora2' | 'veo3' | 'generic';
}> = ({ content, model }) => {
  const charCount = content.length;

  const MODEL_LIMITS = {
    sora2: 2500,
    veo3: 3000,
    generic: Infinity,
  };

  const maxChars = MODEL_LIMITS[model];
  const percentage = maxChars === Infinity ? 0 : (charCount / maxChars) * 100;

  const getColor = () => {
    if (maxChars === Infinity) return 'text-gray-400';
    if (percentage > 100) return 'text-red-400';
    if (percentage > 80) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getIcon = () => {
    if (maxChars === Infinity) return '';
    if (percentage > 100) return '✗';
    if (percentage > 80) return '⚠';
    return '✓';
  };

  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-gray-800/90 px-2 py-1 rounded text-xs">
      <span className={`font-mono font-semibold ${getColor()}`}>
        {charCount.toLocaleString()}
        {maxChars !== Infinity && ` / ${maxChars.toLocaleString()}`}
        {' chars '}
        {getIcon()}
      </span>
      {percentage > 100 && (
        <span className="text-red-400 text-xs">
          Exceeds limit
        </span>
      )}
    </div>
  );
};

/**
 * CopyButton component
 *
 * A button to copy text content to the clipboard with feedback.
 *
 * @param content - The text to copy.
 * @param format - The format label for the button text.
 * @returns The rendered CopyButton component.
 */
const CopyButton: React.FC<{
  content: string;
  format: 'sora2' | 'veo3' | 'generic';
}> = ({ content, format }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLabel = {
    sora2: 'Sora 2',
    veo3: 'Veo 3',
    generic: 'Generic',
  }[format];

  return (
    <button
      onClick={handleCopy}
      className={`flex-1 flex items-center justify-center gap-2 font-medium px-4 py-2 rounded-lg text-sm transition-all ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-blue-600 hover:bg-blue-500 text-white'
      }`}
      aria-label={`Copy ${formatLabel} formatted prompt to clipboard`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied {formatLabel} Prompt!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy {formatLabel} Prompt</span>
        </>
      )}
    </button>
  );
};

export default CenterPanel;

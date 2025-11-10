import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePrompts } from '../context/PromptContext';
import { useProviders } from '../context/ProviderContext';
import { useGeneration } from '../context/GenerationContext';
import { SparklesIcon, WandIcon, EditIcon } from './icons';
import { ConversationThread } from './ConversationThread';
import { ModelInfoDisplay } from './ModelInfoDisplay';
import * as configService from '../services/configService';
import * as promptService from '../services/promptService';
import { taskRouter } from '../services/taskRouter';
import { TASK_IDS } from '../types/providers';
import { transformToModel } from '../services/transformers';
import { useMediaBlobUrls } from '../hooks/useMediaBlobUrls';
import { MediaReference, MixOption, Prompt } from '../types';
import { BUILT_IN_MIX_OPTIONS } from '../constants';

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

  // Load blob URLs for media references
  const mediaBlobUrls = useMediaBlobUrls(mediaReferences);

  const [newKey, setNewKey] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showAddCustomMixOption, setShowAddCustomMixOption] = useState(false);
  const [customMixOptionName, setCustomMixOptionName] = useState('');
  const [customMixOptionInstruction, setCustomMixOptionInstruction] = useState('');
  const [editingMixOptionId, setEditingMixOptionId] = useState<string | null>(null);
  const [viewingMixOptionId, setViewingMixOptionId] = useState<string | null>(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [editedSystemPrompt, setEditedSystemPrompt] = useState<string | null>(null);
  const [editedUserPrompt, setEditedUserPrompt] = useState<string | null>(null);
  const [isEditingPrompts, setIsEditingPrompts] = useState(false);
  const [templateOverride, setTemplateOverride] = useState<'auto' | 'generic'>('auto');
  const configFileInputRef = useRef<HTMLInputElement>(null);

  // Collapsible sections state
  const [showMixOptions, setShowMixOptions] = useState(true);
  const [showSchemaDesigner, setShowSchemaDesigner] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Detect which template will be used based on schema keys
  const detectTemplateModel = (): 'sora2' | 'veo3' | 'generic' => {
    if (templateOverride === 'generic') return 'generic';

    const keySet = new Set(settings.schemaKeys.map(k => k.toLowerCase()));

    // Veo 3 indicators (audio-first model)
    const veo3Keys = ['audio_elements', 'dialogue', 'voiceover_script', 'ambient_audio', 'subject', 'veo3_specs'];
    const veo3Score = veo3Keys.filter(k => keySet.has(k)).length;

    // Sora 2 indicators (visual-first with temporal progression)
    const sora2Keys = ['temporal_progression', 'cinematography', 'visual_description', 'technical_specs'];
    const sora2Score = sora2Keys.filter(k => keySet.has(k)).length;

    // Decision: Use highest score, prefer Veo 3 on tie (audio is distinctive)
    if (veo3Score > sora2Score || (veo3Score === sora2Score && veo3Score > 0)) {
      return "veo3";
    }
    if (sora2Score > 0) {
      return "sora2";
    }

    return "generic";
  };

  const detectedTemplate = detectTemplateModel();


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

  const handleAddKey = () => {
    if (newKey && !settings.schemaKeys.includes(newKey)) {
        setSettings(prev => ({...prev, schemaKeys: [...prev.schemaKeys, newKey]}));
        setNewKey('');
    }
  };

  const handleRemoveKey = (keyToRemove: string) => {
    setSettings(prev => ({...prev, schemaKeys: prev.schemaKeys.filter(k => k !== keyToRemove)}));
  };

  const handleRenameKey = (oldKey: string, newKey: string) => {
    if (newKey && !settings.schemaKeys.includes(newKey)) {
        setSettings(prev => ({...prev, schemaKeys: prev.schemaKeys.map(k => k === oldKey ? newKey : k)}));
    }
  };

  const applyPreset = (preset: string[]) => {
    setSettings(prev => ({...prev, schemaKeys: preset}));
  };

  // Mix Options handlers
  const toggleMixOption = (optionId: string) => {
    setSettings(prev => ({
      ...prev,
      mixOptions: prev.mixOptions.map(opt =>
        opt.id === optionId ? { ...opt, isEnabled: !opt.isEnabled } : opt
      )
    }));
  };

  const addCustomMixOption = () => {
    if (customMixOptionName && customMixOptionInstruction) {
      const newOption: MixOption = {
        id: `custom-${Date.now()}`,
        name: customMixOptionName,
        instruction: customMixOptionInstruction,
        isBuiltIn: false,
        isEnabled: true,
      };
      setSettings(prev => ({
        ...prev,
        mixOptions: [...prev.mixOptions, newOption]
      }));
      setCustomMixOptionName('');
      setCustomMixOptionInstruction('');
      setShowAddCustomMixOption(false);
    }
  };

  const removeCustomMixOption = (optionId: string) => {
    setSettings(prev => ({
      ...prev,
      mixOptions: prev.mixOptions.filter(opt => opt.id !== optionId)
    }));
  };

  const startEditingMixOption = (option: MixOption) => {
    setEditingMixOptionId(option.id);
    setCustomMixOptionName(option.name);
    setCustomMixOptionInstruction(option.instruction);
    setShowAddCustomMixOption(false);
  };

  const updateMixOption = () => {
    if (editingMixOptionId && customMixOptionName && customMixOptionInstruction) {
      setSettings(prev => ({
        ...prev,
        mixOptions: prev.mixOptions.map(opt =>
          opt.id === editingMixOptionId
            ? { ...opt, name: customMixOptionName, instruction: customMixOptionInstruction }
            : opt
        )
      }));
      setEditingMixOptionId(null);
      setCustomMixOptionName('');
      setCustomMixOptionInstruction('');
    }
  };

  const cancelEditingMixOption = () => {
    setEditingMixOptionId(null);
    setCustomMixOptionName('');
    setCustomMixOptionInstruction('');
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

  const PRESETS = [
    // Generic presets (model-agnostic)
    { name: 'Video Scene', keys: ['scene', 'sound_effects', 'speech'] },
    { name: 'Music', keys: ['composition', 'instruments', 'mood', 'tempo'] },
    { name: 'Art Direction', keys: ['visual_style', 'color_palette', 'composition', 'mood'] },

    // Sora 2 presets (video+audio, comprehensive detail)
    // Based on CANONICAL_SCHEMA_KEYS.sora2 from constants.ts
    // Note: technical_specs removed (UI-controlled: fixed 10s, 1920x1080, aspect ratio toggle)
    { name: 'Sora 2: Cinematic', keys: ['temporal_progression', 'visual_description', 'camera_movement', 'cinematography', 'lighting', 'audio_design', 'style'] },
    { name: 'Sora 2: Social Media', keys: ['temporal_progression', 'visual_description', 'camera_movement', 'audio_design', 'style'] },
    { name: 'Sora 2: Product Demo', keys: ['visual_description', 'camera_movement', 'cinematography', 'lighting', 'audio_design', 'style'] },

    // Veo 3 presets (audio-first, 9-element framework)
    // Based on CANONICAL_SCHEMA_KEYS.veo3 from constants.ts
    // Note: veo3_specs removed (UI-controlled: fixed 8s, resolution/framerate settings)
    { name: 'Veo 3: Narrative Scene', keys: ['subject', 'context', 'action', 'audio_elements', 'camera_motion', 'lighting_mood', 'composition'] },
    { name: 'Veo 3: Cinematic Landscape', keys: ['subject', 'context', 'style', 'camera_motion', 'audio_elements', 'lighting_mood', 'background_setting'] },
    { name: 'Veo 3: Product Demo', keys: ['subject', 'action', 'audio_elements', 'camera_motion', 'lighting_mood', 'composition'] },
  ];

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

        {/* Template Selection - Prominent Section */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Prompt Template System
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Active Template:</span>
                  <span className={`text-sm font-bold ${
                    detectedTemplate === 'sora2' ? 'text-blue-400' :
                    detectedTemplate === 'veo3' ? 'text-purple-400' :
                    'text-gray-400'
                  }`}>
                    {detectedTemplate === 'sora2' && '🎬 Sora 2 (Video+Audio, 10s clips, 300-500 words)'}
                    {detectedTemplate === 'veo3' && '🎵 Veo 3 (Audio-first, 8s clips, 200-400 words)'}
                    {detectedTemplate === 'generic' && '📝 Generic (Model-agnostic, 8-10s clips)'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {detectedTemplate === 'sora2' && 'Using research-backed Sora 2 template with spacetime coherence, temporal progression, comprehensive visual detail. Native video+audio generation (audio descriptions optional).'}
                  {detectedTemplate === 'veo3' && 'Using research-backed Veo 3 template with 9-element framework, native audio generation (V2A), character consistency, cinematic language.'}
                  {detectedTemplate === 'generic' && 'Using generic template. For best results, use model-specific presets or schema keys.'}
                </p>
                {templateOverride === 'auto' && detectedTemplate !== 'generic' && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Auto-detected from your schema keys
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={templateOverride === 'generic'}
                  onChange={(e) => setTemplateOverride(e.target.checked ? 'generic' : 'auto')}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                />
                <span>Use Generic Template</span>
              </label>
              <p className="text-xs text-gray-500 italic">
                {templateOverride === 'auto' ? 'Auto-detection enabled' : 'Manual override active'}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Mix Options - Collapsible */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowMixOptions(!showMixOptions)}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Mix Options</h3>
                <span className="text-xs text-gray-500">(Transform output)</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${showMixOptions ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showMixOptions && (
              <div className="p-3 sm:p-4 pt-0 border-t border-gray-800">
            <div className="space-y-2">
              {settings.mixOptions?.map(option => (
                <div key={option.id}>
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.isEnabled}
                        onChange={() => toggleMixOption(option.id)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
                      />
                      <span className="text-sm text-white">{option.name}</span>
                      {option.isBuiltIn && (
                        <span className="text-xs text-gray-500">(built-in)</span>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingMixOptionId(viewingMixOptionId === option.id ? null : option.id)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                        title="View instruction"
                      >
                        {viewingMixOptionId === option.id ? 'Hide' : 'View'}
                      </button>
                      {!option.isBuiltIn && (
                        <>
                          <button
                            onClick={() => startEditingMixOption(option)}
                            className="text-xs text-yellow-400 hover:text-yellow-300"
                            title="Edit option"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeCustomMixOption(option.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                            title="Delete option"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {viewingMixOptionId === option.id && (
                    <div className="mt-2 ml-6 p-2 bg-gray-800/50 rounded border border-gray-700">
                      <p className="text-xs text-gray-300">{option.instruction}</p>
                    </div>
                  )}
                </div>
              ))}
              {editingMixOptionId ? (
                <div className="mt-3 p-3 bg-gray-800/50 rounded border border-yellow-600 space-y-2">
                  <div className="text-xs text-yellow-400 font-medium mb-2">Editing Mix Option</div>
                  <input
                    type="text"
                    value={customMixOptionName}
                    onChange={e => setCustomMixOptionName(e.target.value)}
                    placeholder="Option name"
                    className="w-full bg-gray-800 text-white text-xs border border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <textarea
                    value={customMixOptionInstruction}
                    onChange={e => setCustomMixOptionInstruction(e.target.value)}
                    placeholder="Instruction to LLM"
                    rows={3}
                    className="w-full bg-gray-800 text-white text-xs border border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={updateMixOption}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-xs font-medium px-3 py-1.5 rounded transition"
                    >
                      Update
                    </button>
                    <button
                      onClick={cancelEditingMixOption}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : showAddCustomMixOption ? (
                <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 space-y-2">
                  <div className="text-xs text-gray-400 font-medium mb-2">Add Custom Mix Option</div>
                  <input
                    type="text"
                    value={customMixOptionName}
                    onChange={e => setCustomMixOptionName(e.target.value)}
                    placeholder="Option name (e.g., 'Poetic')"
                    className="w-full bg-gray-800 text-white text-xs border border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <textarea
                    value={customMixOptionInstruction}
                    onChange={e => setCustomMixOptionInstruction(e.target.value)}
                    placeholder="Instruction to LLM (e.g., 'Use poetic and metaphorical language')"
                    rows={3}
                    className="w-full bg-gray-800 text-white text-xs border border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addCustomMixOption}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-xs font-medium px-3 py-1.5 rounded transition"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCustomMixOption(false);
                        setCustomMixOptionName('');
                        setCustomMixOptionInstruction('');
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCustomMixOption(true)}
                  className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded border border-gray-700 transition"
                >
                  + Add Custom Option
                </button>
              )}
            </div>
              </div>
            )}
          </div>

          {/* Model & Sampler Info - Read-only display */}
          <ModelInfoDisplay />
        </div>

        {/* Schema Designer - Collapsible */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden flex-shrink-0">
          <button
            onClick={() => setShowSchemaDesigner(!showSchemaDesigner)}
            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Structure Fields</h3>
                <span className="text-xs text-gray-500 hidden sm:inline">(Define output sections)</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 sm:hidden">Define output sections</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showSchemaDesigner ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showSchemaDesigner && (
            <div className="p-3 sm:p-4 pt-0 border-t border-gray-800 max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => inferSchema('additional')}
                disabled={isLoading || !naturalLanguageInput}
                title="AI suggests additional fields based on your idea"
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium px-2 py-1 rounded hover:bg-gray-800"
              >
                <WandIcon className="w-3 h-3" />
                Suggest
              </button>
              <button
                onClick={() => inferSchema('full')}
                disabled={isLoading || !naturalLanguageInput}
                title="AI generates a complete new structure from scratch"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded hover:bg-gray-800"
              >
                <WandIcon className="w-3 h-3" />
                Regenerate
              </button>
            </div>
          </div>

          {/* Presets - Wrap on mobile */}
          <div className="mb-3">
            <span className="text-xs text-gray-400 block mb-2">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.keys)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sora 2 Tip */}
          {settings.schemaKeys.includes('technical_specs') && (
            <div className="mb-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded text-xs text-blue-200">
              <strong className="text-blue-100">Sora 2 Tip:</strong> Describe how your scene evolves over time (start → middle → end). Include camera movements with specific speeds/distances. Aim for 300-500 words of comprehensive detail for best results.
            </div>
          )}

          {/* Veo 3 Tip */}
          {settings.schemaKeys.includes('veo3_specs') && (
            <div className="mb-3 p-2 bg-green-900/20 border border-green-700/50 rounded text-xs text-green-200">
              <strong className="text-green-100">Veo 3 Tip:</strong> ALWAYS include audio elements (dialogue, ambient sounds, music) - Veo 3 generates native audio! Use the 9 elements framework (subject, context, action, audio, camera motion, etc.). Include detailed character descriptions for consistency. Professional cinematic terminology works great. Aim for 200-400 words with narrative structure.
            </div>
          )}

          {/* Schema Keys */}
          <div className="flex flex-wrap gap-2 items-center">
            {settings.schemaKeys.map(key => (
              <SchemaKey key={key} initialKey={key} onRename={handleRenameKey} onRemove={handleRemoveKey} />
            ))}
            <form onSubmit={(e) => { e.preventDefault(); handleAddKey(); }} className="flex gap-1">
              <input
                type="text"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="custom_field"
                className="bg-gray-800 w-32 text-xs border border-gray-700 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-200 placeholder:text-gray-600"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors font-bold"
              >
                +
              </button>
            </form>
          </div>

          {/* Example Preview */}
          {settings.schemaKeys.length > 0 && (
            <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-400 font-mono">
              <span className="text-gray-500">Example:</span> {settings.schemaKeys[0]}: <span className="text-gray-300">"Your content here..."</span>
            </div>
          )}
            </div>
          )}
        </div>
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

const SchemaKey: React.FC<{initialKey: string, onRename: (oldKey: string, newKey: string) => void, onRemove: (key: string) => void}> = ({ initialKey, onRename, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [key, setKey] = useState(initialKey);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (key.trim()) {
      onRename(initialKey, key.trim());
    } else {
      setKey(initialKey);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setKey(initialKey);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={key}
        onChange={e => setKey(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="bg-gray-800 text-xs border border-green-500 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 w-32 text-white"
      />
    );
  }

  return (
    <span className="bg-gray-700/80 text-gray-200 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2 group hover:bg-gray-700 transition-colors">
      {key}
      <button
        onClick={() => setIsEditing(true)}
        className="text-gray-500 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
        title="Rename"
      >
        <EditIcon className="h-3 w-3" />
      </button>
      <button
        onClick={() => onRemove(key)}
        className="text-gray-500 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100 font-bold"
        title="Remove"
      >
        ×
      </button>
    </span>
  );
}

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

// Phase 2.1: Character Count Component
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

// Phase 2.1: Copy Button Component
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

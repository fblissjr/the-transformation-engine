import React, { useState, useEffect, useRef } from 'react';
import { usePrompts } from '../context/PromptContext';
import { useApiKey } from '../context/ApiKeyContext';
import { useGeneration } from '../context/GenerationContext';
import { SparklesIcon, WandIcon, EditIcon } from './icons';
import IntermediateEditor from './intermediate/IntermediateEditor';
import * as geminiService from '../services/geminiService';
import * as configService from '../services/configService';
import * as promptService from '../services/promptService';
import { transformToModel } from '../services/transformers';
import { useMediaBlobUrls } from '../hooks/useMediaBlobUrls';
import { MediaReference, MixOption, Prompt } from '../types';
import { GEMINI_MODEL_NAME, BUILT_IN_MIX_OPTIONS, DEFAULT_MODEL_SETTINGS } from '../constants';

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
  const { apiKey } = useApiKey();
  const {
    useIntermediateMode,
    setUseIntermediateMode,
    generatedIntermediate,
    selectedExportModel,
    setSelectedExportModel,
  } = useGeneration();

  // Load blob URLs for media references
  const mediaBlobUrls = useMediaBlobUrls(mediaReferences);

  const [newKey, setNewKey] = useState('');
  const [availableModels, setAvailableModels] = useState<geminiService.GeminiModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showAddCustomMixOption, setShowAddCustomMixOption] = useState(false);
  const [customMixOptionName, setCustomMixOptionName] = useState('');
  const [customMixOptionInstruction, setCustomMixOptionInstruction] = useState('');
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [editedSystemPrompt, setEditedSystemPrompt] = useState<string | null>(null);
  const [editedUserPrompt, setEditedUserPrompt] = useState<string | null>(null);
  const [isEditingPrompts, setIsEditingPrompts] = useState(false);
  const [templateOverride, setTemplateOverride] = useState<'auto' | 'generic'>('auto');
  const [showIntermediateEditor, setShowIntermediateEditor] = useState(false);
  const configFileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch available models when API key is available (with caching)
  useEffect(() => {
    if (apiKey && availableModels.length === 0) {
      // Check cache first
      const cachedData = localStorage.getItem('gemini_models_cache');
      if (cachedData) {
        try {
          const { models, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

          if (cacheAge < CACHE_TTL) {
            setAvailableModels(models);
            return;
          }
        } catch (err) {
          console.error('Failed to parse cached models:', err);
        }
      }

      // Fetch from API if no valid cache
      setIsLoadingModels(true);
      geminiService.listAvailableModels(apiKey)
        .then(models => {
          setAvailableModels(models);
          // Store in cache
          localStorage.setItem('gemini_models_cache', JSON.stringify({
            models,
            timestamp: Date.now()
          }));
        })
        .catch(err => console.error('Failed to load models:', err))
        .finally(() => setIsLoadingModels(false));
    }
  }, [apiKey, availableModels.length]);

  // Initialize mixOptions with built-in options if not set
  useEffect(() => {
    if (!settings.mixOptions || settings.mixOptions.length === 0) {
      setSettings(s => ({
        ...s,
        mixOptions: BUILT_IN_MIX_OPTIONS.map(opt => ({ ...opt })),
        // Set default model if not set
        modelName: s.modelName || GEMINI_MODEL_NAME,
      }));
    } else if (!settings.modelName) {
      // Ensure modelName is set
      setSettings(s => ({
        ...s,
        modelName: GEMINI_MODEL_NAME,
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

  // Export/Import handlers
  const handleExportConfig = () => {
    try {
      const configJson = configService.exportConfig(
        settings,
        DEFAULT_MODEL_SETTINGS, // Using default for now, could fetch from app settings
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
    // If there are no edited prompts, use the regular generate function
    if (!editedSystemPrompt && !editedUserPrompt) {
      await generate();
      return;
    }

    // Custom generation with edited prompts
    if (!apiKey) {
      alert('Please set your Gemini API key to generate prompts.');
      return;
    }

    const userInput = editedUserPrompt || naturalLanguageInput;
    const systemPrompt = editedSystemPrompt || promptService.generatePrimaryPrompt(naturalLanguageInput, settings);

    try {
      // Call API with custom prompts - combine system + user
      const combinedPrompt = `${systemPrompt}\n\n**User Input:**\n${userInput}`;
      const modelSettings = settings.modelName ? { modelName: settings.modelName } : undefined;
      const result = await geminiService.generateContent(apiKey, combinedPrompt, modelSettings);

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
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Main Prompt Input */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
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

        {/* Primary Action Buttons - Prominent Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          {/* Phase 9.4: Intermediate Mode Toggle */}
          <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useIntermediateMode}
                onChange={(e) => setUseIntermediateMode(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-900"
              />
              <span className="text-sm font-medium text-gray-200">
                Generate as Intermediate (recommended)
              </span>
            </label>
            {useIntermediateMode && (
              <p className="text-xs text-gray-400 mt-2">
                Creates model-agnostic representation. Transform to any format instantly without regenerating.
              </p>
            )}
          </div>

          {/* Phase 9.4: Model Selector (shown after generation in intermediate mode) */}
          {useIntermediateMode && generatedIntermediate && (
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Export Format:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedExportModel}
                  onChange={(e) => {
                    const newModel = e.target.value as 'sora2' | 'veo3' | 'generic';
                    setSelectedExportModel(newModel);
                    // Re-transform intermediate to new format
                    const transformed = transformToModel(generatedIntermediate, newModel);
                    setStructuredOutput(transformed);
                  }}
                  className="flex-1 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="sora2">Sora 2 (OpenAI)</option>
                  <option value="veo3">Veo 3 (Google)</option>
                  <option value="generic">Generic</option>
                </select>
                <button
                  onClick={async () => {
                    // Save intermediate as prompt with current format
                    const newPromptData: Omit<Prompt, 'id' | 'createdAt'> = {
                      title: generatedIntermediate.title,
                      naturalLanguageInput: generatedIntermediate.sources.text || '',
                      structuredOutput: structuredOutput,
                      normalizedOutput: '',
                      settingsSnapshot: JSON.stringify(settings),
                      tags: '[]',
                      isFavorite: false,
                    };
                    const savedPrompt = await addPrompt(newPromptData);
                    selectPrompt(savedPrompt);
                    alert('Saved to library!');
                  }}
                  className="bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  Save to Library
                </button>
              </div>
            </div>
          )}

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

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !naturalLanguageInput}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-amber-500 hover:to-orange-500 hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  <span>Generate Prompt</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowIntermediateEditor(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <EditIcon className="w-4 h-4" />
              <span>Create from Intermediate</span>
            </button>
          </div>
        </div>

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

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Format Selector - Only shown in legacy mode */}
          {!useIntermediateMode && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Final Output Format
              </h3>
              <div className="space-y-2">
                <select
                  value={settings.format}
                  onChange={e => setSettings(s => ({...s, format: e.target.value}))}
                  className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Standard YAML">YAML</option>
                  <option value="Markdown">Markdown</option>
                  <option value="Natural Language">Natural Language</option>
                  <option value="Standard XML">XML</option>
                  <option value="JSON">JSON</option>
                  <option value="Reversed YAML-like in XML">Reversed YAML/XML</option>
                  <option value="Emoji Script">Emoji Script</option>
                </select>
              </div>
            </div>
          )}

          {/* Mix Options */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Mix Options
            </h3>
            <p className="text-xs text-gray-500 mb-3">Apply transformations to the output</p>
            <div className="space-y-2">
              {settings.mixOptions?.map(option => (
                <div key={option.id} className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.isEnabled}
                      onChange={() => toggleMixOption(option.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-white">{option.name}</span>
                  </label>
                  {!option.isBuiltIn && (
                    <button
                      onClick={() => removeCustomMixOption(option.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {showAddCustomMixOption ? (
                <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 space-y-2">
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
                    rows={2}
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

          {/* Model Selector */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              AI Model
            </h3>
            <select
              value={settings.modelName || GEMINI_MODEL_NAME}
              onChange={e => setSettings(s => ({...s, modelName: e.target.value}))}
              disabled={isLoadingModels}
              className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoadingModels ? (
                <option>Loading models...</option>
              ) : availableModels.length > 0 ? (
                availableModels.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.displayName}
                  </option>
                ))
              ) : (
                <option value={GEMINI_MODEL_NAME}>gemini-2.5-pro (default)</option>
              )}
            </select>
          </div>
        </div>

        {/* Schema Designer */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Structure Fields
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Define what sections the output should contain</p>
            </div>
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

          {/* Presets */}
          <div className="flex gap-2 mb-3">
            <span className="text-xs text-gray-400 self-center">Quick:</span>
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
      </div>

      {/* Bottom Bar with Generate */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm flex items-center gap-3 shrink-0">
        {/* Export/Import Config */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportConfig}
            title="Export configuration"
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors text-sm"
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
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium py-2 px-3 rounded-md hover:bg-gray-800 transition-colors text-sm"
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
              <span className="text-xs text-gray-500">(Full transparency)</span>
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

      {/* Intermediate Editor Modal */}
      {showIntermediateEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[90vh] bg-gray-950 rounded-lg shadow-2xl overflow-hidden">
            <IntermediateEditor
              onSave={() => setShowIntermediateEditor(false)}
              onCancel={() => setShowIntermediateEditor(false)}
            />
          </div>
        </div>
      )}
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

export default CenterPanel;

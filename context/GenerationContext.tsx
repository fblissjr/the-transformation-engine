/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Prompt, GenerationMetadata } from '../types';
import { STRINGS } from '../constants';
import * as geminiService from '../services/geminiService';
import {
  generatePrimaryPromptV2,
  generateNormalizePromptV2,
  generateMixPromptV2,
  generateSchemaInferencePromptV2,
  generateIntermediate,
  detectTargetModelFromIntermediate,
  fragmentLoader
} from '../services/promptService';
import * as intermediateService from '../services/db/intermediateService';
import { transformToModel } from '../services/transformers';
import * as versionService from '../services/versionService';
import * as dbService from '../services/dbService';
import { useApiKey } from './ApiKeyContext';
import { useActivePrompt } from './ActivePromptContext';
import { useMedia } from './MediaContext';
import { usePromptLibrary } from './PromptLibraryContext';

interface GenerationContextType {
  isLoading: boolean;
  isNormalizing: boolean;
  error: string | null;
  progress: number;
  loadingMessage: string;
  generate: () => Promise<void>;
  normalize: (transformInstruction?: string) => Promise<void>;
  mixPrompts: () => Promise<void>;
  inferSchema: (mode: 'additional' | 'full') => Promise<void>;
  // Phase 9.4: Intermediate mode
  useIntermediateMode: boolean;
  setUseIntermediateMode: (value: boolean) => void;
  generatedIntermediate: any | null;
  selectedExportModel: 'sora2' | 'veo3' | 'generic';
  setSelectedExportModel: (model: 'sora2' | 'veo3' | 'generic') => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { apiKey, openModal } = useApiKey();
  const {
    naturalLanguageInput,
    settings,
    structuredOutput,
    setStructuredOutput,
    setNormalizedOutput,
    setSettings,
    selectPrompt,
    activePrompt,
    setActivePrompt,
    newPrompt: clearActivePrompt,
    setNaturalLanguageInput,
  } = useActivePrompt();
  const { mediaReferences } = useMedia();
  const { addPrompt, prompts, selectedPromptIds, clearSelection } = usePromptLibrary();

  const [isLoading, setIsLoading] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Phase 9.4: Intermediate mode state
  const [useIntermediateMode, setUseIntermediateMode] = useState(true); // Default to intermediate mode
  const [generatedIntermediate, setGeneratedIntermediate] = useState<any | null>(null);
  const [selectedExportModel, setSelectedExportModel] = useState<'sora2' | 'veo3' | 'generic'>('sora2');

  const generate = async () => {
    if (!naturalLanguageInput.trim()) {
      setError("Please enter a creative idea.");
      return;
    }
    if (!apiKey) {
      setError("Please set your Gemini API key to generate prompts.");
      openModal();
      return;
    }
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setStructuredOutput('');
    setNormalizedOutput('');

    try {
      if (useIntermediateMode) {
        // NEW: Phase 9.4 - Intermediate-first generation
        setLoadingMessage('Generating semantic intermediate...');
        setProgress(20);

        const modelSettings = settings.modelName ? { modelName: settings.modelName } : undefined;
        const apiStartTime = Date.now();

        // Generate intermediate structure
        const intermediate = await generateIntermediate(
          naturalLanguageInput,
          apiKey,
          {
            modelName: modelSettings?.modelName,
            temperature: 0.7,
          }
        );
        const apiLatencyMs = Date.now() - apiStartTime;

        setLoadingMessage('Saving intermediate to library...');
        setProgress(50);

        // Save to intermediates store
        await intermediateService.createIntermediate(intermediate);
        setGeneratedIntermediate(intermediate);

        setLoadingMessage('Detecting best model format...');
        setProgress(70);

        // Auto-detect target model
        const targetModel = detectTargetModelFromIntermediate(intermediate);
        setSelectedExportModel(targetModel);

        setLoadingMessage('Transforming to model format...');
        setProgress(85);

        // Transform to model-specific YAML
        const transformed = transformToModel(intermediate, targetModel);
        setStructuredOutput(transformed);

        setLoadingMessage('Complete!');
        setProgress(100);
        setTimeout(() => setLoadingMessage(''), 500);
      } else {
        // LEGACY: Original YAML generation flow
        setLoadingMessage('Composing prompt template...');
        setProgress(20);
        const generationFullPrompt = await generatePrimaryPromptV2(naturalLanguageInput, settings);

        // Capture which fragments were used in this generation
        const fragmentsUsed = fragmentLoader.getLoadedFragments();

        setLoadingMessage('Sending request to Gemini AI...');
        setProgress(40);
        const modelSettings = settings.modelName ? { modelName: settings.modelName } : undefined;
        const apiStartTime = Date.now();
        const structuredRes = await geminiService.generateContent(apiKey, generationFullPrompt, modelSettings);
        const apiLatencyMs = Date.now() - apiStartTime;

        setLoadingMessage('Saving prompt to library...');
        setProgress(80);
        setStructuredOutput(structuredRes);

        const newPromptData: Omit<Prompt, 'id' | 'createdAt'> = {
          title: naturalLanguageInput.substring(0, 40) + '...',
          naturalLanguageInput,
          mediaReferences: mediaReferences.length > 0 ? mediaReferences : undefined,
          structuredOutput: structuredRes,
          normalizedOutput: '',
          settingsSnapshot: JSON.stringify(settings),
          tags: '[]',
          isFavorite: false,
        };
        const savedPrompt = await addPrompt(newPromptData);

        // Create metadata for version tracking
        const metadata: GenerationMetadata = {
          naturalLanguageInput,
          mediaReferences: mediaReferences.length > 0 ? mediaReferences : undefined,
          format: settings.format,
          schemaKeys: settings.schemaKeys,
          mixOptions: settings.mixOptions,
          modelName: settings.modelName || 'gemini-2.5-pro',
          systemPrompt: generationFullPrompt,
          userPrompt: naturalLanguageInput,
          operationType: 'generate',
          apiLatencyMs,
          fragmentsUsed,
          branchName: 'main', // Default branch
        };

        // Add initial version with metadata
        await versionService.addVersion(savedPrompt, metadata, undefined, 'main');

        selectPrompt(savedPrompt);

        setLoadingMessage('Complete!');
        setProgress(100);
        setTimeout(() => setLoadingMessage(''), 500);
      }
    } catch (e: any) {
      setError(`An error occurred during generation: ${e.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const normalize = async (transformInstruction?: string) => {
    if (!structuredOutput) {
      setError("No structured output to transform.");
      return;
    }
    if (!apiKey) {
      setError("Please set your Gemini API key to transform prompts.");
      openModal();
      return;
    }

    setIsNormalizing(true);
    setError(null);
    setLoadingMessage('Preparing transformation...');

    try {
      let transformPrompt: string;

      if (transformInstruction) {
        // Custom transformation
        setLoadingMessage('Building custom transformation prompt...');
        transformPrompt = `Transform the following structured prompt according to these instructions:\n\n**Instructions:** ${transformInstruction}\n\n**Structured Prompt:**\n\`\`\`\n${structuredOutput}\n\`\`\`\n\nProvide the transformed output.`;
      } else {
        // Default: normalize to plain English
        setLoadingMessage('Composing normalization prompt...');
        transformPrompt = await generateNormalizePromptV2(structuredOutput, 'English');
      }

      setLoadingMessage('Sending transformation request to Gemini AI...');
      const modelSettings = settings.modelName ? { modelName: settings.modelName } : undefined;
      const result = await geminiService.generateContent(apiKey, transformPrompt, modelSettings);

      setLoadingMessage('Updating prompt...');
      setNormalizedOutput(result);

      // Update the saved prompt if we have an active one
      if (activePrompt) {
        const updatedPrompt: Prompt = {
          ...activePrompt,
          normalizedOutput: result,
        };
        await updatePromptInDb(updatedPrompt);
      }

      setLoadingMessage('Complete!');
      setTimeout(() => setLoadingMessage(''), 500);
    } catch (e: any) {
      setError(`An error occurred during transformation: ${e.message}`);
    } finally {
      setIsNormalizing(false);
    }
  };

  const mixPrompts = async () => {
    if (selectedPromptIds.length < 2) {
      setError("Please select at least two prompts to mix.");
      return;
    }
    if (!apiKey) {
      setError("Please set your Gemini API key to mix prompts.");
      openModal();
      return;
    }
    const guidance = prompt(STRINGS.MIX_PROMPTS_GUIDANCE_PROMPT, STRINGS.MIX_PROMPTS_GUIDANCE_DEFAULT);
    if (guidance === null) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setStructuredOutput('');
    setNormalizedOutput('');
    setNaturalLanguageInput('');
    clearActivePrompt();

    try {
      setLoadingMessage(`Analyzing ${selectedPromptIds.length} prompts...`);
      setProgress(20);
      const sourcePrompts = prompts.filter(p => selectedPromptIds.includes(p.id));

      setLoadingMessage('Composing synesthetic mix prompt...');
      setProgress(40);
      const mixFullPrompt = await generateMixPromptV2(sourcePrompts, settings, guidance);

      // Capture fragments used in mix
      const fragmentsUsed = fragmentLoader.getLoadedFragments();

      setLoadingMessage('Sending mix request to Gemini AI...');
      setProgress(60);
      const modelSettings = settings.modelName ? { modelName: settings.modelName } : undefined;
      const apiStartTime = Date.now();
      const structuredRes = await geminiService.generateContent(apiKey, mixFullPrompt, modelSettings);
      const apiLatencyMs = Date.now() - apiStartTime;

      setLoadingMessage('Saving mixed prompt...');
      setProgress(85);
      setStructuredOutput(structuredRes);

      const title = `Mix of ${sourcePrompts.map(p => p.title.substring(0,10)).join(', ')}...`;
      const mixInput = `Mixed from ${sourcePrompts.length} prompts. Guidance: ${guidance}`;
      const newPromptData: Omit<Prompt, 'id' | 'createdAt'> = {
        title,
        naturalLanguageInput: mixInput,
        structuredOutput: structuredRes,
        normalizedOutput: '',
        settingsSnapshot: JSON.stringify(settings),
        tags: '[]',
        isFavorite: false,
      };
      const savedPrompt = await addPrompt(newPromptData);

      // Create metadata for mix operation
      const metadata: GenerationMetadata = {
        naturalLanguageInput: mixInput,
        format: settings.format,
        schemaKeys: settings.schemaKeys,
        mixOptions: settings.mixOptions,
        modelName: settings.modelName || 'gemini-2.5-pro',
        systemPrompt: mixFullPrompt,
        userPrompt: guidance,
        operationType: 'mix',
        mixSourcePromptIds: selectedPromptIds,
        apiLatencyMs,
        fragmentsUsed,
        branchName: 'main',
      };

      // Add initial version with metadata
      await versionService.addVersion(savedPrompt, metadata, undefined, 'main');

      selectPrompt(savedPrompt);
      clearSelection();

      setLoadingMessage('Complete!');
      setProgress(100);
      setTimeout(() => setLoadingMessage(''), 500);
    } catch (e: any) {
      setError(`An error occurred during mixing: ${e.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const inferSchema = async (mode: 'additional' | 'full') => {
    if (!naturalLanguageInput.trim()) {
      setError("Please enter a creative idea before inferring a schema.");
      return;
    }
    if (!apiKey) {
      setError("Please set your Gemini API key to infer a schema.");
      openModal();
      return;
    }
    setIsLoading(true);
    setError(null);
    setProgress(0);
    try {
      setLoadingMessage('Analyzing input for schema suggestions...');
      setProgress(25);
      const inferencePrompt = await generateSchemaInferencePromptV2(naturalLanguageInput, settings.schemaKeys, mode);

      setLoadingMessage('Requesting AI schema inference...');
      setProgress(50);
      const jsonResponse = await geminiService.generateJsonContent(apiKey, inferencePrompt);

      setLoadingMessage('Processing schema keys...');
      setProgress(75);
      if (!jsonResponse || !Array.isArray(jsonResponse.newSchemaKeys) || typeof jsonResponse.reasoning !== 'string') {
        throw new Error("Received an invalid response structure from the AI.");
      }
      const { newSchemaKeys, reasoning } = jsonResponse;
      setSettings(prev => {
        const updatedKeys = mode === 'additional' ? [...new Set([...prev.schemaKeys, ...newSchemaKeys])] : newSchemaKeys;
        return { ...prev, schemaKeys: updatedKeys };
      });

      setLoadingMessage('Schema updated!');
      setProgress(100);
      setTimeout(() => setLoadingMessage(''), 500);
      alert(`Schema Updated!\n\nReasoning from AI:\n${reasoning}`);
    } catch (e: any) {
      setError(`An error occurred during schema inference: ${e.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Helper function to update prompt in DB and state
  const updatePromptInDb = async (updatedPrompt: Prompt) => {
    await dbService.updatePrompt(updatedPrompt);
    setActivePrompt(updatedPrompt);
  };

  const value = {
    isLoading,
    isNormalizing,
    error,
    progress,
    loadingMessage,
    generate,
    normalize,
    mixPrompts,
    inferSchema,
    // Phase 9.4: Intermediate mode
    useIntermediateMode,
    setUseIntermediateMode,
    generatedIntermediate,
    selectedExportModel,
    setSelectedExportModel,
  };

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
};

export const useGeneration = (): GenerationContextType => {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};

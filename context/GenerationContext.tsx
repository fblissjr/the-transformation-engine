/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Prompt } from '../types';
import { STRINGS } from '../constants';
import * as geminiService from '../services/geminiService';
import { generatePrimaryPrompt, generateNormalizePrompt, generateMixPrompt, generateSchemaInferencePrompt } from '../services/promptService';
import { useApiKey } from './ApiKeyContext';
import { useActivePrompt } from './ActivePromptContext';
import { useMedia } from './MediaContext';
import { usePromptLibrary } from './PromptLibraryContext';

interface GenerationContextType {
  isLoading: boolean;
  isNormalizing: boolean;
  error: string | null;
  progress: number;
  generate: () => Promise<void>;
  normalize: (transformInstruction?: string) => Promise<void>;
  mixPrompts: () => Promise<void>;
  inferSchema: (mode: 'additional' | 'full') => Promise<void>;
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
      setProgress(30);
      const generationFullPrompt = generatePrimaryPrompt(naturalLanguageInput, settings);
      setProgress(50);
      const modelSettings = settings.modelName ? { modelName: settings.modelName } : undefined;
      const structuredRes = await geminiService.generateContent(apiKey, generationFullPrompt, modelSettings);
      setStructuredOutput(structuredRes);
      setProgress(90);

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
      selectPrompt(savedPrompt);
      setProgress(100);
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

    try {
      let transformPrompt: string;

      if (transformInstruction) {
        // Custom transformation
        transformPrompt = `Transform the following structured prompt according to these instructions:\n\n**Instructions:** ${transformInstruction}\n\n**Structured Prompt:**\n\`\`\`\n${structuredOutput}\n\`\`\`\n\nProvide the transformed output.`;
      } else {
        // Default: normalize to plain English
        transformPrompt = generateNormalizePrompt(structuredOutput, 'English');
      }

      const modelSettings = settings.modelName ? { modelName: settings.modelName } : undefined;
      const result = await geminiService.generateContent(apiKey, transformPrompt, modelSettings);
      setNormalizedOutput(result);

      // Update the saved prompt if we have an active one
      if (activePrompt) {
        const updatedPrompt: Prompt = {
          ...activePrompt,
          normalizedOutput: result,
        };
        await updatePromptInDb(updatedPrompt);
      }
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
      setProgress(30);
      const sourcePrompts = prompts.filter(p => selectedPromptIds.includes(p.id));
      const mixFullPrompt = generateMixPrompt(sourcePrompts, settings, guidance);
      setProgress(50);
      const modelSettings = settings.modelName ? { modelName: settings.modelName } : undefined;
      const structuredRes = await geminiService.generateContent(apiKey, mixFullPrompt, modelSettings);
      setStructuredOutput(structuredRes);
      setProgress(90);

      const title = `Mix of ${sourcePrompts.map(p => p.title.substring(0,10)).join(', ')}...`;
      const newPromptData: Omit<Prompt, 'id' | 'createdAt'> = {
        title,
        naturalLanguageInput: `Mixed from ${sourcePrompts.length} prompts. Guidance: ${guidance}`,
        structuredOutput: structuredRes,
        normalizedOutput: '',
        settingsSnapshot: JSON.stringify(settings),
        tags: '[]',
        isFavorite: false,
      };
      const savedPrompt = await addPrompt(newPromptData);
      selectPrompt(savedPrompt);
      clearSelection();
      setProgress(100);
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
    setProgress(30);
    try {
      const inferencePrompt = generateSchemaInferencePrompt(naturalLanguageInput, settings.schemaKeys, mode);
      setProgress(50);
      const jsonResponse = await geminiService.generateJsonContent(apiKey, inferencePrompt);
      setProgress(80);
      if (!jsonResponse || !Array.isArray(jsonResponse.newSchemaKeys) || typeof jsonResponse.reasoning !== 'string') {
        throw new Error("Received an invalid response structure from the AI.");
      }
      const { newSchemaKeys, reasoning } = jsonResponse;
      setSettings(prev => {
        const updatedKeys = mode === 'additional' ? [...new Set([...prev.schemaKeys, ...newSchemaKeys])] : newSchemaKeys;
        return { ...prev, schemaKeys: updatedKeys };
      });
      setProgress(100);
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
    const dbService = await import('../services/dbService');
    await dbService.updatePrompt(updatedPrompt);
    setActivePrompt(updatedPrompt);
  };

  const value = {
    isLoading,
    isNormalizing,
    error,
    progress,
    generate,
    normalize,
    mixPrompts,
    inferSchema,
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

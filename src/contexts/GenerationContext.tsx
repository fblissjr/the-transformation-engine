/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { Prompt, GenerationMetadata } from '../../types';
import { STRINGS } from '../../constants';
import {
  generateNormalizePrompt,
  generateMixPrompt,
  generateSchemaInferencePrompt,
  generateIntermediate,
  detectTargetModelFromIntermediate,
  fragmentLoader
} from '../services/promptService';
import * as intermediateService from '../services/db/intermediateService';
import { transformToModel } from '../services/transformers';
import * as versionService from '../services/versionService';
import * as dbService from '../services/dbService';
import { useProviders } from './ProviderContext';
import { useActivePrompt } from './ActivePromptContext';
import { useMedia } from './MediaContext';
import { usePromptLibrary } from './PromptLibraryContext';
import { taskRouter } from '../services/taskRouter';
import { TASK_IDS } from '../../types/providers';
import { formatAnswersForPrompt } from '../services/revisionRequestParser';

export interface StreamingState {
  accumulatedContent: string;
  currentTokenCount: number;
  tokensPerSecond: number;
  startTime: number;
}

export interface RevisionRequest {
  questions: string[];
  originalInput: string;
  rawResponse: string;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface GenerationContextType {
  isLoading: boolean;
  isNormalizing: boolean;
  error: string | null;
  progress: number;
  loadingMessage: string;
  generate: () => Promise<void>;
  cancelGeneration: () => void;
  normalize: (transformInstruction?: string) => Promise<void>;
  mixPrompts: () => Promise<void>;
  inferSchema: (mode: 'additional' | 'full') => Promise<void>;
  // Intermediate mode (always enabled)
  generatedIntermediate: any | null;
  selectedExportModel: 'sora2' | 'veo3' | 'generic';
  setSelectedExportModel: (model: 'sora2' | 'veo3' | 'generic') => void;
  // Phase 2.1: UX Redesign - Final Output State
  finalOutput: string; // Currently displayed output (plain text, no code fences)
  genericFinalOutput: string; // Always available generic output
  systemSpecificFinalOutput: string; // Sora 2/Veo 3 output (if selected)
  structuredViewData: any | null; // Intermediate JSON for Structured View tab
  handleExportFormatChange: (newFormat: 'sora2' | 'veo3' | 'generic') => void;
  // Multi-provider features
  streamingState: StreamingState | null;
  // Phase 11.3: Revision request flow (Veo 3.1 scene-type detection)
  revisionRequest: RevisionRequest | null;
  conversationHistory: ConversationTurn[];
  answerRevisionRequest: (answers: string) => Promise<void>;
  clearRevisionRequest: () => void;
  enableStreaming: boolean;
  setEnableStreaming: (value: boolean) => void;
  currentConversation: any[] | null;
  refineLastOutput: (refinementInstruction: string) => Promise<void>;
  sessionTokens: { input: number; output: number; total: number };
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

/**
 * GenerationProvider
 *
 * Provides generation capabilities and state management.
 * Handles the orchestration of prompt generation, normalization, mixing, and schema inference.
 * Manages intermediate representations, export formats, and multi-provider interactions.
 *
 * @param children - Child components to wrap.
 * @returns The context provider.
 */
export const GenerationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { providers } = useProviders();
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
  const { mediaReferences, mediaDescription } = useMedia();
  const { addPrompt, prompts, selectedPromptIds, clearSelection } = usePromptLibrary();

  const [isLoading, setIsLoading] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Intermediate mode state (always enabled)
  const [generatedIntermediate, setGeneratedIntermediate] = useState<any | null>(null);
  const [selectedExportModel, setSelectedExportModel] = useState<'sora2' | 'veo3' | 'generic'>('generic');

  // Phase 2.1: UX Redesign - Final Output State
  const [finalOutput, setFinalOutput] = useState<string>('');
  const [genericFinalOutput, setGenericFinalOutput] = useState<string>('');
  const [systemSpecificFinalOutput, setSystemSpecificFinalOutput] = useState<string>('');
  const [structuredViewData, setStructuredViewData] = useState<any | null>(null);

  // Multi-provider features (Phase 10+)
  const [streamingState, setStreamingState] = useState<StreamingState | null>(null);
  const [enableStreaming, setEnableStreaming] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<any[] | null>(null);
  const [sessionTokens, setSessionTokens] = useState({ input: 0, output: 0, total: 0 });
  // Phase 11.3: Revision request flow (Veo 3.1 scene-type detection)
  const [revisionRequest, setRevisionRequest] = useState<RevisionRequest | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  // Cancellation support
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const generate = async () => {
    if (!naturalLanguageInput.trim()) {
      setError("Please enter a creative idea.");
      return;
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setStructuredOutput('');
    setNormalizedOutput('');

    try {
      // Intermediate-first generation (previously Phase 9.4)
      setLoadingMessage('Generating semantic intermediate...');
      setProgress(20);

      const apiStartTime = Date.now();

      // Generate intermediate structure (with media context if available)
      const intermediate = await generateIntermediate(
        naturalLanguageInput,
        settings,
        mediaDescription // Pass media description for auto-integration
      );
      const apiLatencyMs = Date.now() - apiStartTime;

      setLoadingMessage('Saving intermediate to library...');
      setProgress(50);

      // Save to intermediates store
      await intermediateService.createIntermediate(intermediate);
      setGeneratedIntermediate(intermediate);
      setStructuredViewData(intermediate); // Phase 2.1: Save for Structured View tab

      setLoadingMessage('Generating outputs...');
      setProgress(70);

      // Phase 2.1: ALWAYS generate Generic final output (plain text, no code fences)
      const genericOutput = transformToModel(intermediate, 'generic');
      const cleanGenericOutput = genericOutput.replace(/```yaml\n?|```$/g, '').trim();
      setGenericFinalOutput(cleanGenericOutput);

      // If user selected Sora 2 or Veo 3, also generate system-specific output
      let systemSpecificOutput = '';
      if (selectedExportModel === 'sora2') {
        systemSpecificOutput = transformToModel(intermediate, 'sora2');
      } else if (selectedExportModel === 'veo3') {
        systemSpecificOutput = transformToModel(intermediate, 'veo3');
      }

      // Remove code fences from system-specific output too
      const cleanSystemSpecificOutput = systemSpecificOutput
        ? systemSpecificOutput.replace(/```yaml\n?|```$/g, '').trim()
        : '';
      if (cleanSystemSpecificOutput) {
        setSystemSpecificFinalOutput(cleanSystemSpecificOutput);
      }

      // Display the selected format output (or generic if format is generic)
      const displayOutput = selectedExportModel === 'generic'
        ? cleanGenericOutput
        : (cleanSystemSpecificOutput || cleanGenericOutput);
      setFinalOutput(displayOutput);

      // Keep structuredOutput for backward compatibility
      setStructuredOutput(displayOutput);

      setLoadingMessage('Complete!');
      setProgress(100);
      setTimeout(() => setLoadingMessage(''), 500);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError('Request cancelled');
      } else {
        setError(`An error occurred during generation: ${e.message}`);
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
      setAbortController(null);
    }
  };

  const cancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setLoadingMessage('');
      setProgress(0);
    }
  };

  const normalize = async (transformInstruction?: string) => {
    if (!structuredOutput) {
      setError("No structured output to transform.");
      return;
    }

    setIsNormalizing(true);
    setError(null);
    setLoadingMessage('Preparing transformation...');

    try {
      let systemPrompt: string;
      let userPrompt: string;

      if (transformInstruction) {
        // Custom transformation - use inline system prompt
        setLoadingMessage('Building custom transformation prompt...');
        systemPrompt = `You are a helpful assistant that transforms structured prompts according to user instructions.`;
        userPrompt = `Transform the following structured prompt according to these instructions:\n\n**Instructions:** ${transformInstruction}\n\n**Structured Prompt:**\n\`\`\`\n${structuredOutput}\n\`\`\`\n\nProvide the transformed output.`;
      } else {
        // Default: normalize to plain English using fragment-composed system prompt
        setLoadingMessage('Composing normalization prompt...');
        systemPrompt = await generateNormalizePrompt(structuredOutput, 'English');
        userPrompt = `Normalize this structured prompt to plain English prose:\n\n${structuredOutput}`;
      }

      setLoadingMessage('Sending transformation request to AI provider...');

      // Use taskRouter for multi-provider support
      const turn = await taskRouter.executeTask(
        TASK_IDS.NORMALIZE,
        userPrompt,
        systemPrompt,
        {
          enableStreaming,
          onProgress: enableStreaming ? (state) => {
            setStreamingState(state);
          } : undefined,
        }
      );

      const result = turn.response;

      // Update session token tracking
      setSessionTokens(prev => ({
        input: prev.input + turn.usage.promptTokens,
        output: prev.output + turn.usage.completionTokens,
        total: prev.total + turn.usage.totalTokens,
      }));

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
      const mixFullPrompt = await generateMixPrompt(sourcePrompts, settings, guidance);

      // Capture fragments used in mix
      const fragmentsUsed = fragmentLoader.getLoadedFragments();

      setLoadingMessage('Sending mix request to AI provider...');
      setProgress(60);

      // Use taskRouter for multi-provider support
      const turn = await taskRouter.executeTask(
        TASK_IDS.MIX_PROMPTS,
        guidance,
        mixFullPrompt,
        {
          enableStreaming,
          onProgress: enableStreaming ? (state) => {
            setStreamingState(state);
          } : undefined,
        }
      );

      const structuredRes = turn.response;
      const apiLatencyMs = turn.latencyMs;

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

      // Update session token tracking
      setSessionTokens(prev => ({
        input: prev.input + turn.usage.promptTokens,
        output: prev.output + turn.usage.completionTokens,
        total: prev.total + turn.usage.totalTokens,
      }));

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
    setIsLoading(true);
    setError(null);
    setProgress(0);
    try {
      setLoadingMessage('Analyzing input for schema suggestions...');
      setProgress(25);
      const inferencePrompt = await generateSchemaInferencePrompt(naturalLanguageInput, settings.schemaKeys, mode);

      setLoadingMessage('Requesting AI schema inference...');
      setProgress(50);

      // Use taskRouter with JSON mode
      const jsonResponse = await taskRouter.executeTaskJson(
        TASK_IDS.SCHEMA_INFERENCE,
        naturalLanguageInput,
        inferencePrompt
      );

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

  // Multi-provider: Refine last output
  const refineLastOutput = async (refinementInstruction: string) => {
    if (!currentConversation || currentConversation.length === 0) {
      setError('No conversation to refine. Please generate a prompt first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const lastTurn = currentConversation[currentConversation.length - 1];

      setLoadingMessage('Refining previous output...');
      setProgress(50);

      // Use taskRouter to refine
      const refinedTurn = await taskRouter.refineTurn(
        lastTurn.id,
        refinementInstruction,
        {
          enableStreaming,
          onProgress: enableStreaming ? (state) => {
            setStreamingState(state);
          } : undefined,
        }
      );

      // Update conversation state
      setCurrentConversation([...currentConversation, refinedTurn]);

      // Update structured output
      setStructuredOutput(refinedTurn.response);

      // Update session token tracking
      setSessionTokens(prev => ({
        input: prev.input + refinedTurn.usage.promptTokens,
        output: prev.output + refinedTurn.usage.completionTokens,
        total: prev.total + refinedTurn.usage.totalTokens,
      }));

      setLoadingMessage('Complete!');
      setProgress(100);
      setTimeout(() => setLoadingMessage(''), 500);
    } catch (e: any) {
      setError(`An error occurred during refinement: ${e.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // Phase 11.3: Answer revision request (Veo 3.1 scene-type detection)
  const answerRevisionRequest = async (answers: string) => {
    if (!revisionRequest) {
      setError('No revision request to answer.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      setLoadingMessage('Processing your answers...');
      setProgress(20);

      // Format user's answers with context
      const answersBlock = formatAnswersForPrompt(revisionRequest.questions, answers);
      const enhancedInput = `${revisionRequest.originalInput}\n\n${answersBlock}`;

      // Add user's answers to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: answers, timestamp: Date.now() },
      ]);

      setLoadingMessage('Generating semantic intermediate...');
      setProgress(40);

      // Regenerate with enhanced context using intermediate-first approach
      const intermediate = await generateIntermediate(
        enhancedInput,
        settings
      );

      // Save to intermediates store
      await intermediateService.createIntermediate(intermediate);

      setLoadingMessage('Transforming to model format...');
      setProgress(60);

      // Auto-detect target model and transform
      const targetModel = detectTargetModelFromIntermediate(intermediate);
      const structuredRes = transformToModel(intermediate, targetModel);

      // Add assistant's final response to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant', content: structuredRes, timestamp: Date.now() },
      ]);

      // Clear revision request (we got the answer)
      setRevisionRequest(null);

      setLoadingMessage('Saving prompt to library...');
      setProgress(80);
      setStructuredOutput(structuredRes);

      // Save to library
      const newPromptData: Omit<Prompt, 'id' | 'createdAt'> = {
        title: revisionRequest.originalInput.substring(0, 40) + '...',
        naturalLanguageInput: enhancedInput,
        structuredOutput: structuredRes,
        normalizedOutput: '',
        settingsSnapshot: JSON.stringify(settings),
        tags: '[]',
        isFavorite: false,
      };
      await addPrompt(newPromptData);

      setLoadingMessage('Complete!');
      setProgress(100);
      setTimeout(() => setLoadingMessage(''), 500);
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const clearRevisionRequest = () => {
    setRevisionRequest(null);
    setConversationHistory([]);
  };

  // Phase 2.1: Handle export format changes
  const handleExportFormatChange = (newFormat: 'sora2' | 'veo3' | 'generic') => {
    setSelectedExportModel(newFormat);

    // If we already have an intermediate, switch to appropriate output
    if (generatedIntermediate) {
      if (newFormat === 'generic') {
        // Switch to generic output (always available)
        setFinalOutput(genericFinalOutput);
        setStructuredOutput(genericFinalOutput); // Backward compatibility
      } else if (newFormat === 'sora2') {
        // Check if we already have Sora 2 output cached
        if (systemSpecificFinalOutput && selectedExportModel === 'sora2') {
          setFinalOutput(systemSpecificFinalOutput);
          setStructuredOutput(systemSpecificFinalOutput);
        } else {
          // Generate Sora 2 output on demand
          const sora2Output = transformToModel(generatedIntermediate, 'sora2');
          const cleanOutput = sora2Output.replace(/```yaml\n?|```$/g, '').trim();
          setSystemSpecificFinalOutput(cleanOutput);
          setFinalOutput(cleanOutput);
          setStructuredOutput(cleanOutput);
        }
      } else if (newFormat === 'veo3') {
        // Check if we already have Veo 3 output cached
        if (systemSpecificFinalOutput && selectedExportModel === 'veo3') {
          setFinalOutput(systemSpecificFinalOutput);
          setStructuredOutput(systemSpecificFinalOutput);
        } else {
          // Generate Veo 3 output on demand
          const veo3Output = transformToModel(generatedIntermediate, 'veo3');
          const cleanOutput = veo3Output.replace(/```yaml\n?|```$/g, '').trim();
          setSystemSpecificFinalOutput(cleanOutput);
          setFinalOutput(cleanOutput);
          setStructuredOutput(cleanOutput);
        }
      }
    }
  };

  const value = {
    isLoading,
    isNormalizing,
    error,
    progress,
    loadingMessage,
    generate,
    cancelGeneration,
    normalize,
    mixPrompts,
    inferSchema,
    // Intermediate mode (always enabled)
    generatedIntermediate,
    selectedExportModel,
    setSelectedExportModel,
    // Phase 2.1: UX Redesign - Final Output State
    finalOutput,
    genericFinalOutput,
    systemSpecificFinalOutput,
    structuredViewData,
    handleExportFormatChange,
    // Multi-provider features
    streamingState,
    enableStreaming,
    setEnableStreaming,
    currentConversation,
    refineLastOutput,
    sessionTokens,
    // Phase 11.3: Revision request flow
    revisionRequest,
    conversationHistory,
    answerRevisionRequest,
    clearRevisionRequest,
  };

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
};

/**
 * useGeneration hook
 *
 * Custom hook to access the GenerationContext.
 *
 * @returns The context value containing generation state and functions.
 * @throws Error if used outside of a GenerationProvider.
 */
export const useGeneration = (): GenerationContextType => {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};

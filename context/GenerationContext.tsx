/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Prompt, GenerationMetadata } from '../types';
import { STRINGS } from '../constants';
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
import { taskRouter } from '../services/taskRouter';
import { TASK_IDS } from '../types/providers';
import { parseRevisionRequest, formatAnswersForPrompt } from '../services/revisionRequestParser';

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
  normalize: (transformInstruction?: string) => Promise<void>;
  mixPrompts: () => Promise<void>;
  inferSchema: (mode: 'additional' | 'full') => Promise<void>;
  // Phase 9.4: Intermediate mode
  useIntermediateMode: boolean;
  setUseIntermediateMode: (value: boolean) => void;
  generatedIntermediate: any | null;
  selectedExportModel: 'sora2' | 'veo3' | 'generic';
  setSelectedExportModel: (model: 'sora2' | 'veo3' | 'generic') => void;
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

export const GenerationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { apiKey } = useApiKey();
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

  // Multi-provider features (Phase 10+)
  const [streamingState, setStreamingState] = useState<StreamingState | null>(null);
  const [enableStreaming, setEnableStreaming] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<any[] | null>(null);
  const [sessionTokens, setSessionTokens] = useState({ input: 0, output: 0, total: 0 });
  // Phase 11.3: Revision request flow (Veo 3.1 scene-type detection)
  const [revisionRequest, setRevisionRequest] = useState<RevisionRequest | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);

  const generate = async () => {
    if (!naturalLanguageInput.trim()) {
      setError("Please enter a creative idea.");
      return;
    }
    if (!apiKey) {
      setError("No provider configured. Please configure a provider in Settings → Providers tab.");
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

        setLoadingMessage('Sending request to AI provider...');
        setProgress(40);

        // Use taskRouter for multi-provider support
        const turn = await taskRouter.executeTask(
          TASK_IDS.PRIMARY_GENERATION,
          naturalLanguageInput,
          generationFullPrompt,
          {
            enableStreaming,
            onToken: enableStreaming ? (token) => {
              // Update streaming state
            } : undefined,
            onProgress: enableStreaming ? (state) => {
              setStreamingState(state);
            } : undefined,
          }
        );

        const structuredRes = turn.response;
        const apiLatencyMs = turn.latencyMs;

        // Phase 11.3: Check for REVISION_REQUEST (Veo 3.1 scene-type detection)
        const revisionCheck = parseRevisionRequest(structuredRes);
        if (revisionCheck.isRevisionRequest) {
          setLoadingMessage('Clarification needed...');
          setProgress(100);
          setRevisionRequest({
            questions: revisionCheck.questions,
            originalInput: naturalLanguageInput,
            rawResponse: revisionCheck.rawResponse,
          });
          // Add assistant's question to conversation history
          setConversationHistory([
            { role: 'user', content: naturalLanguageInput, timestamp: Date.now() },
            { role: 'assistant', content: structuredRes, timestamp: Date.now() },
          ]);
          setIsLoading(false);
          setLoadingMessage('');
          return; // Stop generation, wait for user's answers
        }

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

        // Update session token tracking
        setSessionTokens(prev => ({
          input: prev.input + turn.usage.promptTokens,
          output: prev.output + turn.usage.completionTokens,
          total: prev.total + turn.usage.totalTokens,
        }));

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
      setError("No provider configured. Please configure a provider in Settings → Providers tab.");
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

      setLoadingMessage('Sending transformation request to AI provider...');

      // Use taskRouter for multi-provider support
      const turn = await taskRouter.executeTask(
        TASK_IDS.NORMALIZE,
        transformPrompt,
        '', // No system prompt needed for normalization
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
    if (!apiKey) {
      setError("No provider configured. Please configure a provider in Settings → Providers tab.");
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
    if (!apiKey) {
      setError("No provider configured. Please configure a provider in Settings → Providers tab.");
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

    if (!apiKey) {
      setError('No provider configured. Please configure a provider in Settings → Providers tab.');
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

    if (!apiKey) {
      setError('No provider configured. Please configure a provider in Settings → Providers tab.');
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

      setLoadingMessage('Composing prompt template...');
      setProgress(40);

      // Regenerate with enhanced context
      const generationFullPrompt = await generatePrimaryPromptV2(enhancedInput, settings);

      setLoadingMessage('Sending request to AI provider...');
      setProgress(60);

      // Use taskRouter for multi-provider support
      const turn = await taskRouter.executeTask(
        TASK_IDS.PRIMARY_GENERATION,
        enhancedInput,
        generationFullPrompt,
        {
          enableStreaming,
          onProgress: enableStreaming ? (state) => {
            setStreamingState(state);
          } : undefined,
        }
      );

      const structuredRes = turn.response;

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

export const useGeneration = (): GenerationContextType => {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};

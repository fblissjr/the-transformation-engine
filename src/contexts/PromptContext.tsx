/* eslint-disable react-refresh/only-export-components */
import React, { useContext, ReactNode, useMemo } from 'react';
import { PromptLibraryProvider, usePromptLibrary } from './PromptLibraryContext';
import { ActivePromptProvider, useActivePrompt } from './ActivePromptContext';
import { GenerationProvider, useGeneration } from './GenerationContext';
import { MediaProvider, useMedia } from './MediaContext';

/**
 * PromptProvider component
 *
 * A composite provider that wraps the application with all necessary context providers:
 * - PromptLibraryContext: Manages the list of prompts.
 * - ActivePromptContext: Manages the state of the currently active prompt.
 * - MediaContext: Manages media references and analysis.
 * - GenerationContext: Manages LLM generation processes.
 *
 * This ensures that all components have access to the required state and functions.
 *
 * @param children - Child components to wrap.
 * @returns The composite context provider.
 */
export const PromptProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <PromptLibraryProvider>
      <ActivePromptProvider>
        <MediaProvider>
          <GenerationProvider>
            {children}
          </GenerationProvider>
        </MediaProvider>
      </ActivePromptProvider>
    </PromptLibraryProvider>
  );
};

/**
 * usePrompts hook
 *
 * A comprehensive hook that aggregates state and functions from all prompt-related contexts.
 * This allows components to access all prompt functionality through a single hook, maintaining backward compatibility.
 *
 * @returns An object containing properties and methods from PromptLibraryContext, ActivePromptContext, GenerationContext, and MediaContext.
 */
export const usePrompts = () => {
  const library = usePromptLibrary();
  const active = useActivePrompt();
  const generation = useGeneration();
  const media = useMedia();

  // Wrapper for backward compatibility: combines media description with input update
  const describeMediaWrapper = useMemo(() => async () => {
    try {
      const description = await media.describeMedia();
      if (description) {
        // Append or replace the natural language input
        if (active.naturalLanguageInput.trim()) {
          const newValue = `${active.naturalLanguageInput}\n\n[AI-generated description]:\n${description}`;
          active.setNaturalLanguageInput(newValue);
        } else {
          active.setNaturalLanguageInput(description);
        }
      }
    } catch (e: any) {
      // Error will be caught by GenerationContext or shown to user
      console.error(e.message);
    }
  }, [media, active]);

  return useMemo(() => ({
    // From PromptLibraryContext
    prompts: library.prompts,
    selectedPromptIds: library.selectedPromptIds,
    hasMore: library.hasMore,
    total: library.total,
    isLoadingMore: library.isLoadingMore,
    loadPrompts: library.loadPrompts,
    loadMore: library.loadMore,
    searchPrompts: library.searchPrompts,
    addPrompt: library.addPrompt,
    deletePrompt: library.deletePrompt,
    deletePrompts: library.deletePrompts,
    duplicatePrompts: library.duplicatePrompts,
    toggleFavorite: library.toggleFavorite,
    toggleSelectPrompt: library.toggleSelectPrompt,
    clearSelection: library.clearSelection,

    // From ActivePromptContext
    activePrompt: active.activePrompt,
    naturalLanguageInput: active.naturalLanguageInput,
    settings: active.settings,
    structuredOutput: active.structuredOutput,
    normalizedOutput: active.normalizedOutput,
    promptVersions: active.promptVersions,
    setNaturalLanguageInput: active.setNaturalLanguageInput,
    setSettings: active.setSettings,
    setStructuredOutput: active.setStructuredOutput,
    setNormalizedOutput: active.setNormalizedOutput,
    selectPrompt: active.selectPrompt,
    newPrompt: active.newPrompt,
    updatePrompt: active.updatePrompt,
    restoreVersion: active.restoreVersion,

    // From GenerationContext
    isLoading: generation.isLoading,
    isNormalizing: generation.isNormalizing,
    error: generation.error,
    progress: generation.progress,
    loadingMessage: generation.loadingMessage,
    generate: generation.generate,
    normalize: generation.normalize,
    mixPrompts: generation.mixPrompts,
    inferSchema: generation.inferSchema,

    // From MediaContext
    mediaReferences: media.mediaReferences,
    isDescribing: media.isDescribing,
    describingMessage: media.describingMessage,
    setMediaReferences: media.setMediaReferences,
    addMediaReference: media.addMediaReference,
    removeMediaReference: media.removeMediaReference,
    describeMedia: describeMediaWrapper,
  }), [
    library.prompts,
    library.selectedPromptIds,
    library.hasMore,
    library.total,
    library.isLoadingMore,
    library.loadPrompts,
    library.loadMore,
    library.searchPrompts,
    library.addPrompt,
    library.deletePrompt,
    library.deletePrompts,
    library.duplicatePrompts,
    library.toggleFavorite,
    library.toggleSelectPrompt,
    library.clearSelection,
    active.activePrompt,
    active.naturalLanguageInput,
    active.settings,
    active.structuredOutput,
    active.normalizedOutput,
    active.promptVersions,
    active.setNaturalLanguageInput,
    active.setSettings,
    active.setStructuredOutput,
    active.setNormalizedOutput,
    active.selectPrompt,
    active.newPrompt,
    active.updatePrompt,
    active.restoreVersion,
    generation.isLoading,
    generation.isNormalizing,
    generation.error,
    generation.progress,
    generation.loadingMessage,
    generation.generate,
    generation.normalize,
    generation.mixPrompts,
    generation.inferSchema,
    media.mediaReferences,
    media.isDescribing,
    media.describingMessage,
    media.setMediaReferences,
    media.addMediaReference,
    media.removeMediaReference,
    describeMediaWrapper,
  ]);
};

// Export individual hooks for granular usage
export { usePromptLibrary, useActivePrompt, useGeneration, useMedia };

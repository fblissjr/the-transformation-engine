/* eslint-disable react-refresh/only-export-components */
import React, { useContext, ReactNode } from 'react';
import { PromptLibraryProvider, usePromptLibrary } from './PromptLibraryContext';
import { ActivePromptProvider, useActivePrompt } from './ActivePromptContext';
import { GenerationProvider, useGeneration } from './GenerationContext';
import { MediaProvider, useMedia } from './MediaContext';

/**
 * Composite Provider that wraps all context providers
 *
 * Context hierarchy:
 * 1. PromptLibraryContext - Prompt list, search, CRUD (independent)
 * 2. ActivePromptContext - Current prompt, settings, versions (independent)
 * 3. MediaContext - Media uploads, vision API (depends on ActivePromptContext)
 * 4. GenerationContext - LLM API calls, loading states (depends on 1, 2, 3)
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
 * Backward-compatible hook that combines all contexts
 * This allows existing components to continue working without changes
 *
 * Components can gradually migrate to use specific hooks:
 * - usePromptLibrary() - for LeftPanel
 * - useActivePrompt() - for CenterPanel, RightPanel
 * - useGeneration() - for CenterPanel, RightPanel
 * - useMedia() - for CenterPanel
 */
export const usePrompts = () => {
  const library = usePromptLibrary();
  const active = useActivePrompt();
  const generation = useGeneration();
  const media = useMedia();

  // Wrapper for backward compatibility: combines media description with input update
  const describeMediaWrapper = async () => {
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
  };

  return {
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
  };
};

// Export individual hooks for granular usage
export { usePromptLibrary, useActivePrompt, useGeneration, useMedia };

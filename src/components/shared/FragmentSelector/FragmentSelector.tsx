/**
 * FragmentSelector - Unified Fragment Browser Component
 *
 * Supports both panel (Video workspace) and modal (Image Studio) modes.
 * Uses data source adapters for flexible fragment sources.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FragmentSelectorProps,
  UnifiedFragment,
  FragmentStats,
  FragmentCategory,
  ComposedPrompt,
} from './types';
import {
  FragmentSelectorHeader,
  FragmentSearch,
  CategoryFilter,
  FragmentList,
  TabNavigation,
  CompositionPanel,
} from './components';
import { fragmentComposer } from '../../../services/fragmentComposer';

/**
 * Unified FragmentSelector component
 */
export const FragmentSelector: React.FC<FragmentSelectorProps> = ({
  mode,
  dataSource,
  onSelectFragment,
  onClose,
  isOpen = true,
  enableComposition = false,
  onComposePrompt,
  categoryDisplayMode,
  fragmentDisplayMode,
  categories: providedCategories,
  initialCategory = '',
  className = '',
}) => {
  // UI State
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'compose'>('browse');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [fragments, setFragments] = useState<UnifiedFragment[]>([]);
  const [searchResults, setSearchResults] = useState<UnifiedFragment[]>([]);
  const [stats, setStats] = useState<FragmentStats | null>(null);
  const [categories, setCategories] = useState<FragmentCategory[]>([]);

  // Composition State (only if enableComposition)
  const [compositionFragments, setCompositionFragments] = useState<UnifiedFragment[]>([]);
  const [suggestedConstraints, setSuggestedConstraints] = useState<UnifiedFragment[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [composedResult, setComposedResult] = useState<ComposedPrompt | null>(null);
  const [compositionError, setCompositionError] = useState<string | null>(null);

  // Infer display modes from mode if not provided
  const effectiveCategoryDisplayMode = categoryDisplayMode || (mode === 'panel' ? 'sidebar' : 'tabs');
  const effectiveFragmentDisplayMode = fragmentDisplayMode || (mode === 'panel' ? 'list' : 'grid');

  // Load categories and stats on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [statsData, categoriesData] = await Promise.all([
          dataSource.getStats(),
          dataSource.getCategories(),
        ]);
        setStats(statsData);
        setCategories(providedCategories || categoriesData);
      } catch (err) {
        console.error('Failed to load fragment data:', err);
      }
    };

    if (mode === 'modal' ? isOpen : true) {
      loadInitialData();
    }
  }, [dataSource, providedCategories, mode, isOpen]);

  // Load fragments when category changes
  useEffect(() => {
    const loadFragments = async () => {
      if (activeTab !== 'browse') return;

      setIsLoading(true);
      try {
        const frags = selectedCategory
          ? await dataSource.getFragmentsByCategory(selectedCategory, 50)
          : await dataSource.getAllFragments(undefined, 50);
        setFragments(frags);
      } catch (err) {
        console.error('Failed to load fragments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (mode === 'modal' ? isOpen : true) {
      loadFragments();
    }
  }, [selectedCategory, activeTab, dataSource, mode, isOpen]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await dataSource.searchFragments(query, undefined, 30);
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search fragments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dataSource]);

  // Handle fragment selection
  const handleSelectFragment = useCallback((fragment: UnifiedFragment) => {
    onSelectFragment(fragment);
    if (mode === 'modal') {
      onClose?.();
    }
  }, [onSelectFragment, mode, onClose]);

  // Handle adding fragment to composition
  const handleAddToComposition = useCallback(async (fragment: UnifiedFragment) => {
    if (!enableComposition) return;

    setCompositionFragments(prev => {
      if (prev.some(f => f.id === fragment.id)) return prev;
      return [...prev, fragment];
    });

    // Get suggested constraints if available
    if (fragment.category === 'action' && dataSource.getSuggestedConstraints) {
      try {
        const suggestions = await dataSource.getSuggestedConstraints(fragment.id);
        setSuggestedConstraints(suggestions.slice(0, 5));
      } catch (err) {
        console.error('Failed to get suggestions:', err);
      }
    }

    setActiveTab('compose');
  }, [enableComposition, dataSource]);

  // Handle compose - compose selected fragments into a prompt
  const handleCompose = useCallback(async () => {
    if (compositionFragments.length === 0) return;

    setIsComposing(true);
    setCompositionError(null);
    try {
      const syntax = compositionFragments.map(f => f.id).join(' | ');
      const result = await fragmentComposer.compose(syntax, {
        autoConstraints: false,
      });
      setComposedResult(result);

      if (onComposePrompt) {
        onComposePrompt(result);
      }
    } catch (err) {
      console.error('Failed to compose fragments:', err);
      setCompositionError(err instanceof Error ? err.message : 'Failed to compose prompt');
    } finally {
      setIsComposing(false);
    }
  }, [compositionFragments, onComposePrompt]);

  // Handle clear composition
  const handleClearComposition = useCallback(() => {
    setCompositionFragments([]);
    setComposedResult(null);
    setSuggestedConstraints([]);
    setCompositionError(null);
  }, []);

  // Handle keyboard events (Escape to close modal)
  useEffect(() => {
    if (mode !== 'modal' || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isOpen, onClose]);

  // Don't render modal if not open
  if (mode === 'modal' && !isOpen) return null;

  // Determine which fragments to display
  const displayFragments = activeTab === 'search' ? searchResults : fragments;

  // Content to render
  const content = (
    <div
      className={`
        ${mode === 'modal'
          ? 'bg-zinc-900 border border-zinc-700 rounded-lg max-w-6xl w-full max-h-[85vh]'
          : 'bg-zinc-900 h-full'
        }
        flex flex-col text-white
        ${className}
      `}
    >
      {/* Header */}
      <FragmentSelectorHeader
        mode={mode}
        stats={stats || undefined}
        onClose={mode === 'modal' ? onClose : undefined}
      />

      {/* Tab Navigation (panel mode with composition) */}
      {mode === 'panel' && enableComposition && (
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          enableComposition={enableComposition}
        />
      )}

      {/* Search (modal or search tab) */}
      {(mode === 'modal' || activeTab === 'search') && (
        <FragmentSearch
          value={searchQuery}
          onChange={handleSearch}
          autoFocus={mode === 'modal'}
        />
      )}

      {/* Category Filter (modal mode always, panel browse tab) */}
      {mode === 'modal' && (
        <CategoryFilter
          mode={effectiveCategoryDisplayMode}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Category Sidebar (panel browse tab) */}
        {mode === 'panel' && activeTab === 'browse' && (
          <CategoryFilter
            mode={effectiveCategoryDisplayMode}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {/* Fragment List */}
        {(activeTab === 'browse' || activeTab === 'search') && (
          <FragmentList
            fragments={displayFragments}
            isLoading={isLoading}
            displayMode={effectiveFragmentDisplayMode}
            onSelectFragment={handleSelectFragment}
            onAddFragment={enableComposition ? handleAddToComposition : undefined}
            searchQuery={activeTab === 'search' ? searchQuery : undefined}
            emptyMessage={
              activeTab === 'search' && searchQuery.length < 2
                ? 'Type at least 2 characters to search'
                : 'No fragments found'
            }
          />
        )}

        {/* Composition Panel */}
        {enableComposition && activeTab === 'compose' && (
          <CompositionPanel
            selectedFragments={compositionFragments}
            onRemoveFragment={(id) => {
              setCompositionFragments(prev => prev.filter(f => f.id !== id));
              setComposedResult(null);
              setCompositionError(null);
            }}
            onClearAll={handleClearComposition}
            suggestedConstraints={suggestedConstraints}
            onAddSuggestion={handleAddToComposition}
            onCompose={handleCompose}
            isComposing={isComposing}
            composedResult={composedResult}
            compositionError={compositionError}
          />
        )}
      </div>

      {/* Footer (modal only) */}
      {mode === 'modal' && (
        <div className="p-4 border-t border-zinc-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );

  // Wrap in modal overlay if modal mode
  if (mode === 'modal') {
    return (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default FragmentSelector;

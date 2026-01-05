/**
 * FragmentSelector - Unified Fragment Browser Component
 *
 * Supports both panel (Video workspace) and modal (Image Studio) modes.
 * Uses data source adapters for flexible fragment sources.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from './components';

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
            }}
            onClearAll={() => {
              setCompositionFragments([]);
              setSuggestedConstraints([]);
            }}
            suggestedConstraints={suggestedConstraints}
            onAddSuggestion={handleAddToComposition}
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

/**
 * Simplified Composition Panel for panel mode
 */
interface CompositionPanelProps {
  selectedFragments: UnifiedFragment[];
  onRemoveFragment: (id: string) => void;
  onClearAll: () => void;
  suggestedConstraints: UnifiedFragment[];
  onAddSuggestion: (fragment: UnifiedFragment) => void;
}

const CompositionPanel: React.FC<CompositionPanelProps> = ({
  selectedFragments,
  onRemoveFragment,
  onClearAll,
  suggestedConstraints,
  onAddSuggestion,
}) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {/* Selected Fragments */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-zinc-300">Selected Fragments</h3>
          {selectedFragments.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {selectedFragments.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No fragments selected. Browse or search to add fragments.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedFragments.map((fragment, index) => (
              <div
                key={fragment.id}
                className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{index + 1}.</span>
                  <span className="text-sm text-white">{fragment.name}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-700 px-1.5 py-0.5 rounded">
                    {fragment.category}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveFragment(fragment.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Constraints */}
      {suggestedConstraints.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Suggested Constraints</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedConstraints.map(suggestion => (
              <button
                key={suggestion.id}
                onClick={() => onAddSuggestion(suggestion)}
                className="px-2 py-1 text-xs bg-purple-600/30 text-purple-300 rounded hover:bg-purple-600/50 transition-colors"
              >
                + {suggestion.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composition Preview */}
      {selectedFragments.length > 0 && (
        <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Composition</h3>
          <code className="text-xs text-purple-300 font-mono">
            {selectedFragments.map(f => f.id).join(' | ')}
          </code>
        </div>
      )}
    </div>
  );
};

export default FragmentSelector;

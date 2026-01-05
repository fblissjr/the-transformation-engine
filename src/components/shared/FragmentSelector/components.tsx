/**
 * FragmentSelector Sub-Components
 *
 * Shared UI components used by the unified FragmentSelector.
 */

import React, { useRef, useEffect } from 'react';
import {
  FragmentSelectorHeaderProps,
  FragmentSearchProps,
  CategoryFilterProps,
  FragmentCardProps,
  FragmentListProps,
  FragmentSelectorMode,
  UnifiedFragment,
  CompositionPanelProps,
} from './types';

/**
 * Header with title, stats, and close button
 */
export const FragmentSelectorHeader: React.FC<FragmentSelectorHeaderProps> = ({
  mode,
  stats,
  onClose,
}) => {
  return (
    <div className="p-4 border-b border-zinc-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Fragment Browser</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {mode === 'panel'
              ? 'Browse and compose reusable prompt fragments'
              : 'Click a fragment to insert into your prompt'}
          </p>
          {stats && (
            <div className="mt-2 flex gap-2">
              <span className="text-xs text-zinc-500">
                {stats.totalFragments} fragments
              </span>
            </div>
          )}
        </div>
        {mode === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Search input with auto-focus support
 */
export const FragmentSearch: React.FC<FragmentSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search fragments...',
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  return (
    <div className="p-3 border-b border-zinc-700">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-10 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Category filter (tabs or sidebar)
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  mode,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  if (mode === 'tabs') {
    return (
      <div className="flex border-b border-zinc-700 overflow-x-auto">
        <button
          onClick={() => onSelectCategory('')}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === ''
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>{cat.name}</span>
            {cat.count !== undefined && (
              <span className="ml-1 text-xs opacity-70">({cat.count})</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Sidebar mode
  return (
    <div className="w-40 border-r border-zinc-700 overflow-y-auto flex-shrink-0">
      <button
        onClick={() => onSelectCategory('')}
        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
          selectedCategory === ''
            ? 'bg-purple-600/30 text-purple-300 border-l-2 border-purple-500'
            : 'text-zinc-400 hover:bg-zinc-800'
        }`}
      >
        <div className="font-medium">All</div>
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
            selectedCategory === cat.id
              ? 'bg-purple-600/30 text-purple-300 border-l-2 border-purple-500'
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <div className="font-medium">{cat.name}</div>
          {cat.count !== undefined && (
            <div className="text-xs text-zinc-500">{cat.count} fragments</div>
          )}
        </button>
      ))}
    </div>
  );
};

/**
 * Highlight text with search query
 */
const highlightText = (text: string, query?: string): React.ReactNode => {
  if (!query || query.length < 2) return text;

  try {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-600/50 text-white rounded px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
};

/**
 * Individual fragment card
 */
export const FragmentCard: React.FC<FragmentCardProps> = ({
  fragment,
  onSelect,
  onAdd,
  highlightQuery,
  displayMode = 'list',
}) => {
  if (displayMode === 'grid') {
    // Grid layout (Image Studio modal)
    return (
      <button
        onClick={() => onSelect(fragment)}
        className="bg-zinc-800 border border-zinc-700 hover:border-purple-500 rounded-lg p-4 text-left transition-colors group"
      >
        <h3 className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
          {highlightText(fragment.name, highlightQuery)}
        </h3>
        {fragment.description && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
            {highlightText(fragment.description, highlightQuery)}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
            {fragment.category}
          </span>
        </div>
      </button>
    );
  }

  // List layout (Video workspace panel)
  return (
    <div
      onClick={() => onSelect(fragment)}
      className="p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800 last:border-b-0 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">
              {highlightText(fragment.name, highlightQuery)}
            </span>
            {fragment.sourceCount !== undefined && fragment.sourceCount > 0 && (
              <span className="text-xs text-zinc-500 flex-shrink-0">
                {fragment.sourceCount} uses
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {highlightText(fragment.content.substring(0, 100), highlightQuery)}
          </p>
          {fragment.tags && fragment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {fragment.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-1 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(fragment);
            }}
            className="px-2 py-1 text-xs bg-purple-600/30 text-purple-300 rounded hover:bg-purple-600/50 transition-colors flex-shrink-0"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Scrollable list of fragments
 */
export const FragmentList: React.FC<FragmentListProps> = ({
  fragments,
  isLoading,
  displayMode,
  onSelectFragment,
  onAddFragment,
  searchQuery,
  emptyMessage = 'No fragments found',
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Loading fragments...</p>
        </div>
      </div>
    );
  }

  if (fragments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <svg
            className="w-12 h-12 text-zinc-600 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm text-zinc-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const containerClass =
    displayMode === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4'
      : 'divide-y divide-zinc-800';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={containerClass}>
        {fragments.map(fragment => (
          <FragmentCard
            key={fragment.id}
            fragment={fragment}
            onSelect={onSelectFragment}
            onAdd={onAddFragment}
            highlightQuery={searchQuery}
            displayMode={displayMode}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Tab navigation for panel mode
 */
interface TabNavigationProps {
  activeTab: 'browse' | 'search' | 'compose';
  onTabChange: (tab: 'browse' | 'search' | 'compose') => void;
  enableComposition?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  enableComposition = false,
}) => {
  const tabs = [
    { id: 'browse' as const, label: 'Browse' },
    { id: 'search' as const, label: 'Search' },
    ...(enableComposition ? [{ id: 'compose' as const, label: 'Compose' }] : []),
  ];

  return (
    <div className="flex border-b border-zinc-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-purple-500 text-purple-400'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Composition Panel for panel mode
 * Allows users to build composite prompts from selected fragments
 */
export const CompositionPanel: React.FC<CompositionPanelProps> = ({
  selectedFragments,
  onRemoveFragment,
  onClearAll,
  suggestedConstraints,
  onAddSuggestion,
  onCompose,
  isComposing = false,
  composedResult,
  compositionError,
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
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Composition Syntax</h3>
          <code className="text-xs text-purple-300 font-mono">
            {selectedFragments.map(f => f.id).join(' | ')}
          </code>
        </div>
      )}

      {/* Compose Button */}
      {selectedFragments.length > 0 && onCompose && (
        <button
          onClick={onCompose}
          disabled={isComposing}
          className="mt-4 w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg font-medium transition-colors"
        >
          {isComposing ? 'Composing...' : 'Compose Prompt'}
        </button>
      )}

      {/* Composition Error */}
      {compositionError && (
        <div className="mt-4 bg-red-900/30 border border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-400">{compositionError}</p>
        </div>
      )}

      {/* Composed Result */}
      {composedResult && (
        <div className="mt-4 bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">
            Composed Prompt
          </h3>
          <p className="text-white whitespace-pre-wrap text-sm">
            {composedResult.text}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <span>{composedResult.fragmentsUsed.length} fragments</span>
            {composedResult.suggestionsApplied.length > 0 && (
              <span>
                + {composedResult.suggestionsApplied.length} auto-suggested
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

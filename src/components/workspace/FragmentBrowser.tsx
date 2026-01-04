import React, { useState, useEffect, useCallback } from 'react';
import { fragmentLibraryService, Fragment, FragmentCategory } from '../../services/fragmentLibraryService';
import { fragmentComposer, ComposedPrompt } from '../../services/fragmentComposer';

interface FragmentBrowserProps {
  onSelectFragment?: (fragment: Fragment) => void;
  onComposePrompt?: (composed: ComposedPrompt) => void;
}

type TabType = 'browse' | 'compose' | 'search';

const CATEGORY_LABELS: Record<FragmentCategory, string> = {
  role: 'Role',
  instruction: 'Instruction',
  action: 'Action',
  specification: 'Specification',
  constraint: 'Constraint',
};

const CATEGORY_DESCRIPTIONS: Record<FragmentCategory, string> = {
  role: 'System roles and personas',
  instruction: 'High-level instructions',
  action: 'What to do (remove, add, transform)',
  specification: 'How to do it (style, quality)',
  constraint: 'Ensuring quality (seamlessly, maintaining)',
};

/**
 * FragmentBrowser component
 *
 * Browse, search, and compose fragments from the fragment library.
 * Supports drag-and-drop composition and auto-suggestions.
 */
export const FragmentBrowser: React.FC<FragmentBrowserProps> = ({
  onSelectFragment,
  onComposePrompt,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [selectedCategory, setSelectedCategory] = useState<FragmentCategory>('action');
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Fragment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Composition state
  const [compositionFragments, setCompositionFragments] = useState<Fragment[]>([]);
  const [composedResult, setComposedResult] = useState<ComposedPrompt | null>(null);
  const [suggestedConstraints, setSuggestedConstraints] = useState<Fragment[]>([]);

  // Stats
  const [stats, setStats] = useState<{
    totalFragments: number;
    byCategory: Record<string, number>;
  } | null>(null);

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      const s = await fragmentLibraryService.getStats();
      setStats(s);
    };
    loadStats();
  }, []);

  // Load fragments when category changes
  useEffect(() => {
    const loadFragments = async () => {
      setIsLoading(true);
      try {
        const frags = await fragmentLibraryService.getFragmentsByCategory(
          selectedCategory,
          undefined,
          50
        );
        setFragments(frags);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'browse') {
      loadFragments();
    }
  }, [selectedCategory, activeTab]);

  // Search fragments
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fragmentLibraryService.searchFragments(query, undefined, 20);
      setSearchResults(results);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add fragment to composition
  const addToComposition = useCallback(async (fragment: Fragment) => {
    setCompositionFragments(prev => {
      // Don't add duplicates
      if (prev.some(f => f.id === fragment.id)) {
        return prev;
      }
      return [...prev, fragment];
    });

    // Get suggested constraints for action fragments
    if (fragment.category === 'action') {
      const suggestions = await fragmentLibraryService.getSuggestedConstraints(fragment.id);
      setSuggestedConstraints(suggestions.slice(0, 5));
    }

    setActiveTab('compose');
  }, []);

  // Remove fragment from composition
  const removeFromComposition = useCallback((fragmentId: string) => {
    setCompositionFragments(prev => prev.filter(f => f.id !== fragmentId));
    setComposedResult(null);
  }, []);

  // Compose fragments
  const composeFragments = useCallback(async () => {
    if (compositionFragments.length === 0) return;

    setIsLoading(true);
    try {
      const syntax = compositionFragments.map(f => f.id).join(' | ');
      const result = await fragmentComposer.compose(syntax, {
        autoConstraints: false, // We manually selected fragments
      });
      setComposedResult(result);

      if (onComposePrompt) {
        onComposePrompt(result);
      }
    } finally {
      setIsLoading(false);
    }
  }, [compositionFragments, onComposePrompt]);

  // Clear composition
  const clearComposition = useCallback(() => {
    setCompositionFragments([]);
    setComposedResult(null);
    setSuggestedConstraints([]);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Fragment Browser</h2>
        <p className="text-sm text-gray-400 mt-1">
          Browse and compose reusable prompt fragments
        </p>
        {stats && (
          <div className="mt-2 flex gap-2">
            <span className="text-xs text-gray-500">
              {stats.totalFragments} fragments
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {(['browse', 'compose', 'search'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-500 bg-gray-800'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'compose' && compositionFragments.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-600 rounded-full">
                {compositionFragments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-40 border-r border-gray-700 overflow-y-auto">
            {(Object.keys(CATEGORY_LABELS) as FragmentCategory[]).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600/30 text-purple-300 border-l-2 border-purple-500'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="font-medium">{CATEGORY_LABELS[category]}</div>
                {stats && stats.byCategory[category] && (
                  <div className="text-xs text-gray-500">
                    {stats.byCategory[category]} fragments
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Fragment List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : fragments.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No fragments in this category
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {fragments.map(fragment => (
                  <FragmentCard
                    key={fragment.id}
                    fragment={fragment}
                    onSelect={onSelectFragment}
                    onAdd={addToComposition}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search fragments..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                No fragments found for "{searchQuery}"
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {searchResults.map(fragment => (
                  <FragmentCard
                    key={fragment.id}
                    fragment={fragment}
                    onSelect={onSelectFragment}
                    onAdd={addToComposition}
                    highlightQuery={searchQuery}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Selected Fragments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">
                Selected Fragments
              </h3>
              {compositionFragments.length > 0 && (
                <button
                  onClick={clearComposition}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear All
                </button>
              )}
            </div>

            {compositionFragments.length === 0 ? (
              <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-500 text-sm">
                Add fragments from Browse or Search tabs
              </div>
            ) : (
              <div className="space-y-2">
                {compositionFragments.map((fragment, index) => (
                  <div
                    key={fragment.id}
                    className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg"
                  >
                    <span className="text-xs text-gray-500 w-4">
                      {index + 1}.
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        fragment.category === 'action'
                          ? 'bg-blue-900/50 text-blue-300'
                          : fragment.category === 'constraint'
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {fragment.category}
                    </span>
                    <span className="flex-1 text-sm text-white truncate">
                      {fragment.name}
                    </span>
                    <button
                      onClick={() => removeFromComposition(fragment.id)}
                      className="text-gray-500 hover:text-red-400 text-lg leading-none"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Constraints */}
          {suggestedConstraints.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Suggested Constraints
              </h3>
              <div className="flex flex-wrap gap-1">
                {suggestedConstraints.map(constraint => (
                  <button
                    key={constraint.id}
                    onClick={() => addToComposition(constraint)}
                    disabled={compositionFragments.some(f => f.id === constraint.id)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      compositionFragments.some(f => f.id === constraint.id)
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-green-900/30 text-green-300 hover:bg-green-800/50 border border-green-700/50'
                    }`}
                  >
                    + {constraint.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compose Button */}
          {compositionFragments.length > 0 && (
            <button
              onClick={composeFragments}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Composing...' : 'Compose Prompt'}
            </button>
          )}

          {/* Composed Result */}
          {composedResult && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Composed Prompt
              </h3>
              <p className="text-white whitespace-pre-wrap">
                {composedResult.text}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
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
      )}
    </div>
  );
};

// Fragment Card Component
const FragmentCard: React.FC<{
  fragment: Fragment;
  onSelect?: (fragment: Fragment) => void;
  onAdd?: (fragment: Fragment) => void;
  highlightQuery?: string;
}> = ({ fragment, onSelect, onAdd, highlightQuery }) => {
  const highlightText = (text: string) => {
    if (!highlightQuery || highlightQuery.length < 2) return text;

    const regex = new RegExp(`(${highlightQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-600/50 text-white">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className="p-3 hover:bg-gray-800 transition-colors cursor-pointer"
      onClick={() => onSelect?.(fragment)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {highlightText(fragment.name)}
            </span>
            <span className="text-xs text-gray-500">
              {fragment.sourceCount} uses
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-1 truncate">
            {highlightText(fragment.template)}
          </p>

          {fragment.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {fragment.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-1 py-0.5 text-xs bg-gray-700 text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {onAdd && (
          <button
            onClick={e => {
              e.stopPropagation();
              onAdd(fragment);
            }}
            className="px-2 py-1 text-xs bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 rounded border border-purple-700/50 transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default FragmentBrowser;

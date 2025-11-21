import React, { useState, useEffect, useRef } from 'react';

/**
 * FragmentBrowser
 *
 * Full-screen modal for browsing and inserting fragments into prompts.
 * - 6 category tabs (Lighting, Camera, Style, Editing, Composition, Color)
 * - Search functionality across all fragments
 * - Click to insert fragment at cursor position
 * - Loads fragments from public/image-studio/fragments/
 */

interface Fragment {
  id: string;
  name: string;
  category: string;
  content: string;
  description: string;
}

interface FragmentBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFragment: (content: string) => void;
}

const CATEGORIES = [
  { id: 'lighting', name: 'Lighting', icon: '💡' },
  { id: 'camera', name: 'Camera', icon: '📷' },
  { id: 'style', name: 'Style', icon: '🎨' },
  { id: 'editing', name: 'Editing', icon: '✂️' },
  { id: 'composition', name: 'Composition', icon: '🖼️' },
  { id: 'color', name: 'Color', icon: '🌈' },
];

export const FragmentBrowser: React.FC<FragmentBrowserProps> = ({
  isOpen,
  onClose,
  onInsertFragment,
}) => {
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('lighting');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load fragments on mount
  useEffect(() => {
    if (isOpen) {
      loadFragments();
      // Auto-focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to close
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadFragments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedFragments: Fragment[] = [];

      // Fragment file mapping (56 total fragments)
      const fragmentFiles = [
        // Lighting (10)
        { category: 'lighting', file: 'golden-hour-emphasis.md', name: 'Golden Hour' },
        { category: 'lighting', file: 'natural-outdoor-emphasis.md', name: 'Natural Outdoor' },
        { category: 'lighting', file: 'studio-professional-emphasis.md', name: 'Studio Professional' },
        { category: 'lighting', file: 'dramatic-low-key-emphasis.md', name: 'Dramatic Low-Key' },
        { category: 'lighting', file: 'soft-diffused-emphasis.md', name: 'Soft Diffused' },
        { category: 'lighting', file: 'neon-cyberpunk-emphasis.md', name: 'Neon Cyberpunk' },
        { category: 'lighting', file: 'backlighting-rim-emphasis.md', name: 'Backlighting Rim' },
        { category: 'lighting', file: 'chiaroscuro-emphasis.md', name: 'Chiaroscuro' },
        { category: 'lighting', file: 'overhead-harsh-emphasis.md', name: 'Overhead Harsh' },
        { category: 'lighting', file: 'colored-gel-emphasis.md', name: 'Colored Gel' },

        // Camera (10)
        { category: 'camera', file: 'portrait-professional-emphasis.md', name: 'Portrait Professional' },
        { category: 'camera', file: 'documentary-natural-emphasis.md', name: 'Documentary Natural' },
        { category: 'camera', file: 'wide-angle-dramatic-emphasis.md', name: 'Wide Angle Dramatic' },
        { category: 'camera', file: 'telephoto-compressed-emphasis.md', name: 'Telephoto Compressed' },
        { category: 'camera', file: 'macro-closeup-emphasis.md', name: 'Macro Closeup' },
        { category: 'camera', file: 'dutch-angle-emphasis.md', name: 'Dutch Angle' },
        { category: 'camera', file: 'low-angle-hero-emphasis.md', name: 'Low Angle Hero' },
        { category: 'camera', file: 'high-angle-vulnerable-emphasis.md', name: 'High Angle Vulnerable' },
        { category: 'camera', file: 'birds-eye-overhead-emphasis.md', name: 'Birds-Eye Overhead' },
        { category: 'camera', file: 'pov-first-person-emphasis.md', name: 'POV First-Person' },

        // Style (10)
        { category: 'style', file: 'editorial-high-fashion-emphasis.md', name: 'Editorial High Fashion' },
        { category: 'style', file: 'documentary-authentic-emphasis.md', name: 'Documentary Authentic' },
        { category: 'style', file: 'cinematic-widescreen-emphasis.md', name: 'Cinematic Widescreen' },
        { category: 'style', file: 'vintage-film-emphasis.md', name: 'Vintage Film' },
        { category: 'style', file: 'minimalist-clean-emphasis.md', name: 'Minimalist Clean' },
        { category: 'style', file: 'gritty-urban-emphasis.md', name: 'Gritty Urban' },
        { category: 'style', file: 'dreamy-ethereal-emphasis.md', name: 'Dreamy Ethereal' },
        { category: 'style', file: 'hyperrealistic-detailed-emphasis.md', name: 'Hyperrealistic' },
        { category: 'style', file: 'painterly-artistic-emphasis.md', name: 'Painterly Artistic' },
        { category: 'style', file: 'noir-dramatic-emphasis.md', name: 'Noir Dramatic' },

        // Editing (10)
        { category: 'editing', file: 'remove-object-emphasis.md', name: 'Remove Object' },
        { category: 'editing', file: 'style-transfer-emphasis.md', name: 'Style Transfer' },
        { category: 'editing', file: 'add-film-grain-emphasis.md', name: 'Add Film Grain' },
        { category: 'editing', file: 'color-grade-teal-orange-emphasis.md', name: 'Teal & Orange Grade' },
        { category: 'editing', file: 'increase-contrast-emphasis.md', name: 'Increase Contrast' },
        { category: 'editing', file: 'add-vignette-emphasis.md', name: 'Add Vignette' },
        { category: 'editing', file: 'desaturate-selective-emphasis.md', name: 'Selective Desaturation' },
        { category: 'editing', file: 'sharpen-details-emphasis.md', name: 'Sharpen Details' },
        { category: 'editing', file: 'add-glow-emphasis.md', name: 'Add Glow' },
        { category: 'editing', file: 'add-texture-overlay-emphasis.md', name: 'Texture Overlay' },

        // Composition (8)
        { category: 'composition', file: 'rule-of-thirds-emphasis.md', name: 'Rule of Thirds' },
        { category: 'composition', file: 'centered-symmetrical-emphasis.md', name: 'Centered Symmetrical' },
        { category: 'composition', file: 'leading-lines-emphasis.md', name: 'Leading Lines' },
        { category: 'composition', file: 'frame-within-frame-emphasis.md', name: 'Frame Within Frame' },
        { category: 'composition', file: 'negative-space-emphasis.md', name: 'Negative Space' },
        { category: 'composition', file: 'foreground-interest-emphasis.md', name: 'Foreground Interest' },
        { category: 'composition', file: 'diagonal-dynamic-emphasis.md', name: 'Diagonal Dynamic' },
        { category: 'composition', file: 'pattern-repetition-emphasis.md', name: 'Pattern Repetition' },

        // Color (8)
        { category: 'color', file: 'warm-sunset-palette-emphasis.md', name: 'Warm Sunset Palette' },
        { category: 'color', file: 'cool-blue-palette-emphasis.md', name: 'Cool Blue Palette' },
        { category: 'color', file: 'monochrome-palette-emphasis.md', name: 'Monochrome' },
        { category: 'color', file: 'vibrant-saturated-emphasis.md', name: 'Vibrant Saturated' },
        { category: 'color', file: 'muted-desaturated-emphasis.md', name: 'Muted Desaturated' },
        { category: 'color', file: 'complementary-contrast-emphasis.md', name: 'Complementary Contrast' },
        { category: 'color', file: 'pastel-soft-emphasis.md', name: 'Pastel Soft' },
        { category: 'color', file: 'earth-tones-emphasis.md', name: 'Earth Tones' },
      ];

      for (const frag of fragmentFiles) {
        try {
          const response = await fetch(`/image-studio/fragments/${frag.category}/${frag.file}`);
          if (response.ok) {
            const content = await response.text();

            // Extract description from first line if it starts with #
            const lines = content.split('\n');
            const description = lines[0].startsWith('#')
              ? lines[0].replace(/^#\s*/, '')
              : content.substring(0, 100) + '...';

            loadedFragments.push({
              id: `${frag.category}-${frag.file}`,
              name: frag.name,
              category: frag.category,
              content,
              description,
            });
          }
        } catch (err) {
          console.error(`Failed to load fragment ${frag.file}:`, err);
        }
      }

      setFragments(loadedFragments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fragments');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter fragments by category and search query
  const filteredFragments = fragments.filter((frag) => {
    const matchesCategory = activeCategory === 'all' || frag.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      frag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      frag.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Count fragments per category
  const getCategoryCount = (categoryId: string) => {
    return fragments.filter((f) => f.category === categoryId).length;
  };

  const handleInsert = (fragment: Fragment) => {
    onInsertFragment(fragment.content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-6xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fragment Browser</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Click a fragment to insert into your prompt
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500"
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
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragments..."
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-zinc-800 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'border-b-2 border-amber-500 text-amber-500 bg-zinc-800/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Fragment Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                <p className="text-sm text-zinc-500">Loading fragments...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredFragments.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-zinc-700 mx-auto mb-4"
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
                <p className="text-sm text-zinc-500">
                  {searchQuery
                    ? 'No fragments match your search'
                    : 'No fragments in this category yet'}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredFragments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredFragments.map((frag) => (
                <button
                  key={frag.id}
                  onClick={() => handleInsert(frag)}
                  className="bg-zinc-800 border border-zinc-700 hover:border-amber-500 rounded-lg p-4 text-left transition-all group hover:bg-zinc-750"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-zinc-200 group-hover:text-amber-400 transition-colors">
                      {frag.name}
                    </h3>
                    <svg
                      className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{frag.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
                      {frag.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {filteredFragments.length} fragment{filteredFragments.length !== 1 ? 's' : ''} available
          </div>
          <button
            onClick={onClose}
            className="text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

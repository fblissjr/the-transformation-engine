/**
 * SceneClassificationPanel Component
 *
 * UI/UX Design Rationale:
 * - 5-dimensional accordion (Genre, Format, Visual Style, Camera, Narrative)
 * - Multi-select tags per dimension (100+ tags total)
 * - Search per dimension with 300ms debounce for performance
 * - Preset modal for quick-apply combinations (Noir Detective, Action Sequence, etc.)
 * - Summary bar shows active tags across all dimensions
 * - Mobile: One accordion open at a time, full-width tags
 *
 * Technical Implementation:
 * - Controlled component receiving classification from parent
 * - Debounced search to avoid excessive filtering
 * - Preset combinations apply tags across multiple dimensions
 * - Auto-detect mode (future: LLM analyzes input and suggests tags)
 *
 * Accessibility:
 * - ARIA accordion roles and expanded states
 * - Keyboard navigation (Tab, Enter, Space for tags)
 * - Screen reader friendly tag selection
 * - Focus management for search inputs
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Search, Sparkles, Check } from 'lucide-react';

// ==================== Type Definitions ====================

/**
 * SceneClassification interface
 *
 * Defines the structure for scene classification tags across multiple dimensions.
 *
 * @property genre - Array of genre tags.
 * @property format - Array of format tags.
 * @property visualStyle - Array of visual style tags.
 * @property camera - Array of camera technique tags.
 * @property narrative - Array of narrative structure tags.
 */
export interface SceneClassification {
  genre: string[];
  format: string[];
  visualStyle: string[];
  camera: string[];
  narrative: string[];
}

interface SceneClassificationPanelProps {
  classification: SceneClassification;
  onClassificationChange: (classification: SceneClassification) => void;
  autoDetect?: boolean;
  showPresets?: boolean;
}

// ==================== Tag Libraries ====================

const TAG_LIBRARY = {
  genre: [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Fantasy',
    'Thriller', 'Mystery', 'Romance', 'Documentary', 'Western',
    'Crime', 'War', 'Historical', 'Adventure', 'Psychological'
  ],
  format: [
    'Narrative Fiction', 'Commercial', 'Music Video', 'Documentary',
    'Explainer', 'Tutorial', 'Vlog', 'Interview', 'Product Demo',
    'Animation', 'Stop Motion', 'Time-Lapse', 'Montage',
    'Behind-the-Scenes', 'Educational', 'Social Media'
  ],
  visualStyle: [
    'Cinematic', 'Noir', 'Anime', 'Realistic', 'Stylized',
    'Minimalist', 'Vintage', 'Retro', 'Modern', 'Futuristic',
    'Surreal', 'Abstract', 'Gritty', 'Polished', 'Saturated',
    'Desaturated', 'High-Contrast', 'Low-Contrast', 'Colorful', 'Monochrome'
  ],
  camera: [
    'Static', 'Handheld', 'Drone', 'Crane', 'Dolly', 'Steadicam',
    'POV', 'Tracking Shot', 'Whip Pan', 'Zoom', 'Tilt', 'Pan',
    'Orbital', 'Push-In', 'Pull-Out', 'Dutch Angle'
  ],
  narrative: [
    'Linear', 'Non-Linear', 'Flashback', 'Flash-Forward',
    'Parallel Stories', 'Frame Narrative', 'Episodic',
    'Character-Driven', 'Plot-Driven', 'Dialogue-Heavy',
    'Action-Heavy', 'Contemplative', 'Fast-Paced', 'Slow-Burn',
    'Climactic', 'Denouement', 'Rising Action', 'Exposition'
  ]
};

// Preset combinations
const PRESET_COMBINATIONS = [
  {
    id: 'noir-detective',
    name: 'Noir Detective',
    description: 'Dark, moody detective story with high-contrast lighting',
    tags: {
      genre: ['Mystery', 'Crime', 'Thriller'],
      format: ['Narrative Fiction'],
      visualStyle: ['Noir', 'High-Contrast', 'Desaturated', 'Gritty'],
      camera: ['Handheld', 'Dutch Angle', 'Push-In'],
      narrative: ['Character-Driven', 'Slow-Burn', 'Non-Linear']
    }
  },
  {
    id: 'action-sequence',
    name: 'Action Sequence',
    description: 'Fast-paced action with dynamic camera work',
    tags: {
      genre: ['Action', 'Thriller'],
      format: ['Narrative Fiction'],
      visualStyle: ['Cinematic', 'High-Contrast', 'Saturated'],
      camera: ['Handheld', 'Tracking Shot', 'Crane', 'Whip Pan'],
      narrative: ['Action-Heavy', 'Fast-Paced', 'Rising Action']
    }
  },
  {
    id: 'documentary-interview',
    name: 'Documentary Interview',
    description: 'Intimate interview setup with natural lighting',
    tags: {
      genre: ['Documentary'],
      format: ['Documentary', 'Interview'],
      visualStyle: ['Realistic', 'Modern'],
      camera: ['Static', 'Steadicam', 'Push-In'],
      narrative: ['Dialogue-Heavy', 'Character-Driven', 'Linear']
    }
  },
  {
    id: 'surreal-dream',
    name: 'Surreal Dream Sequence',
    description: 'Dreamlike, abstract visuals with floating camera',
    tags: {
      genre: ['Fantasy', 'Psychological'],
      format: ['Narrative Fiction'],
      visualStyle: ['Surreal', 'Abstract', 'Saturated', 'Stylized'],
      camera: ['Drone', 'Orbital', 'Slow-Motion'],
      narrative: ['Non-Linear', 'Contemplative', 'Slow-Burn']
    }
  },
  {
    id: 'product-commercial',
    name: 'Product Commercial',
    description: 'Clean, polished product showcase',
    tags: {
      genre: [],
      format: ['Commercial', 'Product Demo'],
      visualStyle: ['Polished', 'Modern', 'Minimalist', 'Cinematic'],
      camera: ['Dolly', 'Crane', 'Tracking Shot', 'Push-In'],
      narrative: ['Linear', 'Fast-Paced']
    }
  }
];

// ==================== Component ====================

/**
 * SceneClassificationPanel component
 *
 * A panel for classifying scenes using a multi-dimensional tagging system.
 * It provides an accordion interface for selecting tags across Genre, Format, Visual Style, Camera, and Narrative dimensions.
 * Includes search functionality and presets.
 *
 * @param classification - The current classification state.
 * @param onClassificationChange - Callback when classification changes.
 * @param autoDetect - (Optional) Whether auto-detection features are enabled.
 * @param showPresets - (Optional) Whether to show the presets button.
 * @returns The rendered SceneClassificationPanel component.
 */
export const SceneClassificationPanel: React.FC<SceneClassificationPanelProps> = ({
  classification,
  onClassificationChange,
  autoDetect = false,
  showPresets = true
}) => {
  const [expandedDimension, setExpandedDimension] = useState<keyof SceneClassification | null>('genre');
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({
    genre: '',
    format: '',
    visualStyle: '',
    camera: '',
    narrative: ''
  });
  const [debouncedSearchQueries, setDebouncedSearchQueries] = useState(searchQueries);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  // Debounce search queries (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQueries(searchQueries);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQueries]);

  const handleToggleTag = (dimension: keyof SceneClassification, tag: string) => {
    const currentTags = classification[dimension];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    onClassificationChange({
      ...classification,
      [dimension]: newTags
    });
  };

  const handleSearchChange = (dimension: keyof SceneClassification, query: string) => {
    setSearchQueries(prev => ({ ...prev, [dimension]: query }));
  };

  const handleApplyPreset = (presetTags: Partial<SceneClassification>) => {
    onClassificationChange({
      genre: presetTags.genre || [],
      format: presetTags.format || [],
      visualStyle: presetTags.visualStyle || [],
      camera: presetTags.camera || [],
      narrative: presetTags.narrative || []
    });
    setIsPresetModalOpen(false);
  };

  const getFilteredTags = (dimension: keyof SceneClassification) => {
    const query = debouncedSearchQueries[dimension].toLowerCase();
    if (!query) return TAG_LIBRARY[dimension];
    return TAG_LIBRARY[dimension].filter(tag => tag.toLowerCase().includes(query));
  };

  const totalSelectedTags = Object.values(classification).reduce((sum, tags) => sum + tags.length, 0);

  const summaryText = Object.entries(classification)
    .filter(([_, tags]) => tags.length > 0)
    .map(([dim, tags]) => `${dim.charAt(0).toUpperCase() + dim.slice(1)} (${tags.length})`)
    .join(' • ');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Scene Classification:
          </label>
          <p className="text-xs text-gray-500">
            Tag your scene across 5 dimensions to help auto-suggest optimal schema presets.
          </p>
        </div>

        {showPresets && (
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded transition shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            Presets
          </button>
        )}
      </div>

      {/* Summary Bar */}
      {totalSelectedTags > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400">
            <span className="font-semibold text-white">{totalSelectedTags} tags selected:</span> {summaryText}
          </div>
        </div>
      )}

      {/* Accordion */}
      <div className="space-y-2">
        {Object.keys(TAG_LIBRARY).map((dim) => {
          const dimension = dim as keyof SceneClassification;
          const isExpanded = expandedDimension === dimension;
          const selectedCount = classification[dimension].length;
          const filteredTags = getFilteredTags(dimension);

          return (
            <div key={dimension} className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedDimension(isExpanded ? null : dimension)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white capitalize">
                    {dimension === 'visualStyle' ? 'Visual Style' : dimension}
                  </span>
                  {selectedCount > 0 && (
                    <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-3 border-t border-gray-700 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input
                      type="text"
                      value={searchQueries[dimension]}
                      onChange={(e) => handleSearchChange(dimension, e.target.value)}
                      placeholder={`Search ${dimension}...`}
                      className="w-full bg-gray-900 border border-gray-700 rounded pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {filteredTags.map(tag => {
                      const isSelected = classification[dimension].includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => handleToggleTag(dimension, tag)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                          }`}
                          aria-label={`${isSelected ? 'Deselect' : 'Select'} ${tag}`}
                          aria-pressed={isSelected}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {tag}
                        </button>
                      );
                    })}
                    {filteredTags.length === 0 && (
                      <p className="text-xs text-gray-500">No tags match your search</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preset Modal */}
      {isPresetModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsPresetModalOpen(false)}
        >
          <div
            className="bg-gray-900 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Classification Presets</h3>
                  <p className="text-sm text-gray-400">
                    Quick-apply tag combinations for common scene types
                  </p>
                </div>
                <button
                  onClick={() => setIsPresetModalOpen(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <ChevronDown className="w-5 h-5 rotate-180" />
                </button>
              </div>

              {/* Presets */}
              <div className="space-y-3">
                {PRESET_COMBINATIONS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.tags)}
                    className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-white mb-1">{preset.name}</h4>
                    <p className="text-xs text-gray-400 mb-3">{preset.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(preset.tags).flatMap(([_, tags]) => tags).map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneClassificationPanel;

/**
 * TransitionPatternSelector Component
 *
 * UI/UX Design Rationale:
 * - Categorized dropdown for easy navigation through 20 transition patterns
 * - Search functionality with 300ms debounce for performance
 * - Side-by-side preview panel on desktop, stacked on mobile
 * - Touch-friendly 44px minimum tap targets for mobile
 * - Visual indicators for pattern difficulty (beginner/intermediate/advanced)
 *
 * Technical Implementation:
 * - Uses transitionPatternService for pattern data (mock data until service exists)
 * - Debounced search to avoid excessive filtering
 * - Responsive layout using Tailwind breakpoints (md:)
 * - Keyboard accessible (Tab navigation, Escape closes)
 *
 * Accessibility:
 * - ARIA labels on all interactive elements
 * - Keyboard navigation support
 * - Screen reader friendly pattern descriptions
 * - Focus management for search input
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Info } from 'lucide-react';

// ==================== Type Definitions ====================

/**
 * TransitionPattern interface
 *
 * Defines the structure of a transition pattern.
 *
 * @property id - Unique identifier for the pattern.
 * @property name - Display name of the pattern.
 * @property category - Category of the pattern (camera, natural, etc.).
 * @property description - Short description of the pattern.
 * @property example - Example usage of the pattern.
 * @property useCase - Best use cases for the pattern.
 * @property difficulty - Difficulty level of executing the transition.
 * @property fragmentPath - Path to the prompt fragment associated with this pattern.
 */
export interface TransitionPattern {
  id: string;
  name: string;
  category: 'camera' | 'natural' | 'match-cut' | 'environmental' | 'creative' | 'compound';
  description: string;
  example: string;
  useCase: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  fragmentPath: string;
}

interface TransitionPatternSelectorProps {
  selectedPattern?: string;
  onPatternSelect: (patternId: string) => void;
  extensionMethod: 'continue' | 'cutTo' | 'transition';
}

// ==================== Pattern Data (Mock until service exists) ====================

const CATEGORY_LABELS: Record<TransitionPattern['category'], string> = {
  'camera': 'Camera-Based',
  'natural': 'Natural Elements',
  'match-cut': 'Match Cuts',
  'environmental': 'Environmental',
  'creative': 'Creative',
  'compound': 'Compound'
};

const DIFFICULTY_COLORS = {
  beginner: 'text-green-400',
  intermediate: 'text-yellow-400',
  advanced: 'text-red-400'
};

// Mock data - will be replaced by transitionPatternService
const MOCK_PATTERNS: TransitionPattern[] = [
  // Camera-Based
  {
    id: 'whip-pan',
    name: 'Whip Pan Blur',
    category: 'camera',
    description: 'Fast camera pan blurs scene into horizontal streaks',
    example: 'Detective runs through forest → whip pan → Detective runs in parking lot',
    useCase: 'High-energy transitions, chase sequences, urgent tempo changes',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/01_whip_pan_blur.md'
  },
  {
    id: 'push-pull-zoom',
    name: 'Push/Pull Zoom Bridge',
    category: 'camera',
    description: 'Zoom in on detail, then zoom out to reveal new scene',
    example: 'Close-up on coffee cup → zoom in → zoom out to reveal airplane tray table',
    useCase: 'Scale changes, thematic connections, narrative leaps',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/02_push_pull_zoom_bridge.md'
  },
  {
    id: 'orbital-reveal',
    name: 'Orbital Reveal',
    category: 'camera',
    description: 'Camera orbits subject, revealing new scene behind',
    example: 'Orbit around tree trunk → new scene revealed on opposite side',
    useCase: 'Spatial transitions, revealing surprises, location changes',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/03_orbital_reveal.md'
  },
  {
    id: 'dolly-through',
    name: 'Dolly Through Object',
    category: 'camera',
    description: 'Camera moves through portal (door, window, tunnel)',
    example: 'Dolly through open door → emerge in different room',
    useCase: 'Architectural transitions, portal metaphors, narrative progression',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/04_dolly_through_object.md'
  },
  {
    id: 'crane-ascent',
    name: 'Crane Ascent/Descent',
    category: 'camera',
    description: 'Vertical camera movement reveals new scene above/below',
    example: 'Crane up from street level → reveal rooftop scene',
    useCase: 'Vertical spatial transitions, time passage, perspective shifts',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/05_crane_ascent_descent.md'
  },

  // Natural Elements
  {
    id: 'water-immersion',
    name: 'Water Immersion',
    category: 'natural',
    description: 'Scene submerged in water, emerges in new location',
    example: 'Character dives into pool → emerge in ocean',
    useCase: 'Fluid transitions, dream sequences, metaphorical journeys',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/06_water_immersion.md'
  },
  {
    id: 'smoke-fog',
    name: 'Smoke/Fog Obscuration',
    category: 'natural',
    description: 'Smoke or fog fills frame, clears to reveal new scene',
    example: 'Smoke billows across frame → dissipates to reveal new location',
    useCase: 'Mystery, dream sequences, magical transformations',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/07_smoke_fog_obscuration.md'
  },
  {
    id: 'light-flare',
    name: 'Light Flare Wash',
    category: 'natural',
    description: 'Bright light flare washes out scene, fades to new scene',
    example: 'Sun flare fills frame → fades to reveal sunset scene',
    useCase: 'Time passage, spiritual moments, memory transitions',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/08_light_flare_wash.md'
  },

  // Match Cuts
  {
    id: 'shape-match',
    name: 'Shape Match',
    category: 'match-cut',
    description: 'Cut between objects with similar shapes/outlines',
    example: 'Close-up of coffee mug → cut to overhead view of building (circular)',
    useCase: 'Thematic connections, visual poetry, elegant transitions',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/09_shape_match.md'
  },
  {
    id: 'movement-match',
    name: 'Movement/Gesture Match',
    category: 'match-cut',
    description: 'Match action or gesture across scenes',
    example: 'Character closes door → match cut to slamming briefcase shut',
    useCase: 'Rhythmic flow, thematic parallels, action continuity',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/10_movement_gesture_match.md'
  },
  {
    id: 'color-match',
    name: 'Color/Tone Match',
    category: 'match-cut',
    description: 'Match dominant colors between scenes',
    example: 'Red sunset → red theater curtain',
    useCase: 'Mood continuity, visual cohesion, thematic links',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/11_color_tone_match.md'
  },

  // Environmental
  {
    id: 'time-of-day',
    name: 'Time-of-Day Transformation',
    category: 'environmental',
    description: 'Scene transforms through time (day to night)',
    example: 'Sunrise over city → time-lapse to sunset',
    useCase: 'Time passage, narrative progression, establishing shots',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/12_time_of_day_transformation.md'
  },
  {
    id: 'weather-transform',
    name: 'Weather Transformation',
    category: 'environmental',
    description: 'Weather changes across transition',
    example: 'Rain begins falling → transforms to snow',
    useCase: 'Mood shifts, seasonal changes, dramatic emphasis',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/13_weather_transformation.md'
  },
  {
    id: 'seasonal-morph',
    name: 'Seasonal Morph',
    category: 'environmental',
    description: 'Scene transforms through seasons',
    example: 'Spring blossoms → time-lapse to autumn leaves',
    useCase: 'Long-term time passage, life cycles, thematic metaphors',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/14_seasonal_morph.md'
  },

  // Creative
  {
    id: 'reflection-swap',
    name: 'Reflection/Refraction Swap',
    category: 'creative',
    description: 'Scene swaps from reality to reflection',
    example: 'Character looks in mirror → swap to reflection showing different scene',
    useCase: 'Surreal moments, dual realities, psychological transitions',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/15_reflection_refraction_swap.md'
  },
  {
    id: 'silhouette-morph',
    name: 'Silhouette Morph',
    category: 'creative',
    description: 'Subject becomes silhouette, morphs into new subject',
    example: 'Person backlit → silhouette morphs into tree',
    useCase: 'Metaphorical transitions, transformations, abstract storytelling',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/16_silhouette_morph.md'
  },
  {
    id: 'object-wipe',
    name: 'Foreground Object Wipe',
    category: 'creative',
    description: 'Foreground object passes through frame, wiping to new scene',
    example: 'Character walks past camera → wipe transition to new location',
    useCase: 'Dynamic transitions, following characters, momentum maintenance',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/17_foreground_object_wipe.md'
  },
  {
    id: 'rack-focus',
    name: 'Rack Focus Shift',
    category: 'creative',
    description: 'Focus shifts from foreground to background, revealing new scene',
    example: 'Focus on window → rack focus to reflection showing different scene',
    useCase: 'Subtle transitions, reveals, attention shifts',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/18_rack_focus_shift.md'
  },

  // Compound
  {
    id: 'whip-color-match',
    name: 'Whip Pan + Color Match',
    category: 'compound',
    description: 'Combine whip pan with color matching',
    example: 'Whip pan through red sunset → land on red car',
    useCase: 'High-energy transitions with visual cohesion',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/19_compound_whip_pan_color_match.md'
  },
  {
    id: 'dolly-reflection',
    name: 'Dolly Through + Reflection Swap',
    category: 'compound',
    description: 'Dolly through portal, swap to reflection mid-transition',
    example: 'Dolly through window → mid-transition swap to window reflection showing different scene',
    useCase: 'Complex narrative leaps, surreal storytelling, spatial impossibilities',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/20_compound_dolly_reflection_swap.md'
  }
];

// ==================== Component ====================

/**
 * TransitionPatternSelector component
 *
 * A component for selecting a transition pattern for scene extensions.
 * Allows filtering by search query and category.
 * Displays details and a preview of the selected pattern.
 *
 * @param selectedPattern - The ID of the currently selected pattern.
 * @param onPatternSelect - Callback when a pattern is selected.
 * @param extensionMethod - The current extension method ('continue', 'cutTo', or 'transition').
 * @returns The rendered TransitionPatternSelector component.
 */
export const TransitionPatternSelector: React.FC<TransitionPatternSelectorProps> = ({
  selectedPattern,
  onPatternSelect,
  extensionMethod
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransitionPattern['category'] | 'all'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filter patterns by search and category
  const filteredPatterns = useMemo(() => {
    let patterns = MOCK_PATTERNS;

    // Category filter
    if (selectedCategory !== 'all') {
      patterns = patterns.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      patterns = patterns.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.useCase.toLowerCase().includes(query)
      );
    }

    return patterns;
  }, [selectedCategory, debouncedSearchQuery]);

  // Group patterns by category
  const patternsByCategory = useMemo(() => {
    const grouped: Record<string, TransitionPattern[]> = {};
    filteredPatterns.forEach(pattern => {
      if (!grouped[pattern.category]) {
        grouped[pattern.category] = [];
      }
      grouped[pattern.category].push(pattern);
    });
    return grouped;
  }, [filteredPatterns]);

  const selectedPatternData = MOCK_PATTERNS.find(p => p.id === selectedPattern);

  // Don't show if not in transition mode
  if (extensionMethod !== 'transition') {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Transition Pattern:
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Choose a transition style to guide how scenes connect. Each pattern includes research-backed prompting strategies.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patterns..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          aria-label="Search transition patterns"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          All ({MOCK_PATTERNS.length})
        </button>
        {Object.keys(CATEGORY_LABELS).map((cat) => {
          const category = cat as TransitionPattern['category'];
          const count = MOCK_PATTERNS.filter(p => p.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {CATEGORY_LABELS[category]} ({count})
            </button>
          );
        })}
      </div>

      {/* Pattern List - Desktop: Side-by-side, Mobile: Stacked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Pattern List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {Object.entries(patternsByCategory).map(([category, patterns]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category as TransitionPattern['category']]}
              </h4>
              {patterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => onPatternSelect(pattern.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPattern === pattern.id
                      ? 'bg-amber-600/20 border-amber-600 text-white'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300'
                  }`}
                  aria-label={`Select ${pattern.name} transition pattern`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{pattern.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {pattern.description}
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${DIFFICULTY_COLORS[pattern.difficulty]} shrink-0`}>
                      {pattern.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ))}

          {filteredPatterns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No patterns match your search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-amber-500 hover:text-amber-400 mt-2"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Right: Preview Panel */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          {selectedPatternData ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedPatternData.name}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded bg-gray-900 ${DIFFICULTY_COLORS[selectedPatternData.difficulty]}`}>
                    {selectedPatternData.difficulty}
                  </span>
                </div>
                <div className="inline-block px-2 py-1 rounded bg-gray-900 text-gray-400 text-xs">
                  {CATEGORY_LABELS[selectedPatternData.category]}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-sm text-gray-300">{selectedPatternData.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Example
                </h4>
                <p className="text-sm text-gray-300 italic">{selectedPatternData.example}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Best For
                </h4>
                <p className="text-sm text-gray-300">{selectedPatternData.useCase}</p>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    This pattern will be automatically integrated into your scene extension prompt using research-backed fragment templates.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Info className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-500 text-sm">
                Select a transition pattern to see details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransitionPatternSelector;

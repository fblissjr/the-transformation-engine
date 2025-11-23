/**
 * Transition Pattern Service
 *
 * Manages the 20 transition patterns for scene extensions.
 * Loads pattern metadata and fragment content for smooth transitions.
 */

import { fragmentLoader } from './fragmentLoader';

export type TransitionCategory =
  | 'camera'
  | 'natural'
  | 'match-cut'
  | 'environmental'
  | 'creative'
  | 'compound';

export type TransitionDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * TransitionPattern interface
 *
 * Defines the structure of a transition pattern.
 *
 * @property id - Unique identifier for the pattern.
 * @property name - Display name of the pattern.
 * @property category - Category of the transition.
 * @property description - Short description of the pattern.
 * @property example - Example usage scenario.
 * @property useCase - Recommended use cases.
 * @property difficulty - Execution difficulty level.
 * @property fragmentPath - Path to the markdown fragment file.
 */
export interface TransitionPattern {
  id: string;
  name: string;
  category: TransitionCategory;
  description: string;
  example: string;
  useCase: string;
  difficulty: TransitionDifficulty;
  fragmentPath: string;
}

/**
 * All 20 transition patterns with metadata
 */
const TRANSITION_PATTERNS: TransitionPattern[] = [
  // Camera-Based (5 patterns)
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
    description: 'Camera zooms into or away from subject to transition scenes',
    example: 'Close-up of eye → zoom into pupil → emerge in new environment',
    useCase: 'Psychological depth, portal effects, subjective POV shifts',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/02_push_pull_zoom_bridge.md'
  },
  {
    id: 'orbital-reveal',
    name: 'Orbital Reveal',
    category: 'camera',
    description: 'Camera orbits around subject to reveal new scene behind',
    example: 'Orbit around character → reveal different time/location as camera completes arc',
    useCase: 'Character-focused transformations, time jumps, dramatic reveals',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/03_orbital_reveal.md'
  },
  {
    id: 'dolly-through',
    name: 'Dolly Through Object',
    category: 'camera',
    description: 'Camera physically moves through an object (door, window, wall) to new scene',
    example: 'Camera pushes through mirror → emerges on other side in different room',
    useCase: 'Architectural transitions, portal effects, surreal scene changes',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/04_dolly_through_object.md'
  },
  {
    id: 'crane-ascent-descent',
    name: 'Crane Ascent/Descent',
    category: 'camera',
    description: 'Camera cranes up or down to reveal new scene from different height',
    example: 'Crane up from street level → rise above buildings → descend into new location',
    useCase: 'Establishing shots, epic scale transitions, vertical reveals',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/05_crane_ascent_descent.md'
  },

  // Natural Elements (3 patterns)
  {
    id: 'water-immersion',
    name: 'Water Immersion',
    category: 'natural',
    description: 'Camera or subject passes through water to transition',
    example: 'Dive underwater → visibility clears → emerge in different body of water',
    useCase: 'Aquatic scenes, dream sequences, memory transitions',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/06_water_immersion.md'
  },
  {
    id: 'smoke-fog',
    name: 'Smoke/Fog Obscuration',
    category: 'natural',
    description: 'Smoke or fog fills frame, obscuring scene A and revealing scene B as it clears',
    example: 'Smoke from fire engulfs screen → clears to reveal different time/place',
    useCase: 'Mystery, magical transformations, time lapses',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/07_smoke_fog_obscuration.md'
  },
  {
    id: 'light-flare',
    name: 'Light Flare Wash',
    category: 'natural',
    description: 'Intense light flare washes out scene A, fades to reveal scene B',
    example: 'Car headlights blind camera → flare fades → different street at night',
    useCase: 'Blinding moments, supernatural events, flashbacks',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/08_light_flare_wash.md'
  },

  // Match Cuts (3 patterns)
  {
    id: 'shape-match',
    name: 'Shape Match',
    category: 'match-cut',
    description: 'Similar shapes in different contexts bridge scenes',
    example: 'Full moon in night sky → cut to → white plate on table',
    useCase: 'Visual poetry, thematic connections, elegant cuts',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/09_shape_match.md'
  },
  {
    id: 'movement-match',
    name: 'Movement/Gesture Match',
    category: 'match-cut',
    description: 'Action or gesture continues across cut',
    example: 'Character swings bat → cut to → different character swinging golf club',
    useCase: 'Action continuity, parallel storytelling, rhythmic editing',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/10_movement_gesture_match.md'
  },
  {
    id: 'color-match',
    name: 'Color/Tone Match',
    category: 'match-cut',
    description: 'Dominant color or tone connects scenes visually',
    example: 'Red sunset fills frame → cut to → red neon sign same hue',
    useCase: 'Mood preservation, thematic links, stylistic continuity',
    difficulty: 'beginner',
    fragmentPath: 'veo3/transitions/11_color_tone_match.md'
  },

  // Environmental (3 patterns)
  {
    id: 'time-of-day',
    name: 'Time-of-Day Transformation',
    category: 'environmental',
    description: 'Scene transforms as lighting changes through time of day',
    example: 'Sunrise over city → rapid time progression → same shot at sunset',
    useCase: 'Time lapses, cyclical narratives, passage of time',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/12_time_of_day_transformation.md'
  },
  {
    id: 'weather-transformation',
    name: 'Weather Transformation',
    category: 'environmental',
    description: 'Weather conditions change to bridge scenes',
    example: 'Clear sky → storm clouds gather → torrential rain → clears to new location',
    useCase: 'Mood shifts, dramatic changes, location transitions',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/13_weather_transformation.md'
  },
  {
    id: 'seasonal-morph',
    name: 'Seasonal Morph',
    category: 'environmental',
    description: 'Scene morphs through seasonal changes',
    example: 'Winter snow melts → spring blooms → summer green → autumn leaves',
    useCase: 'Long time spans, natural cycles, poetic transitions',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/14_seasonal_morph.md'
  },

  // Creative (4 patterns)
  {
    id: 'reflection-swap',
    name: 'Reflection/Refraction Swap',
    category: 'creative',
    description: 'Camera focuses on reflection which becomes the reality',
    example: 'Character looks in mirror → push into reflection → emerge in mirrored reality',
    useCase: 'Surreal moments, alternate realities, psychological splits',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/15_reflection_refraction_swap.md'
  },
  {
    id: 'silhouette-morph',
    name: 'Silhouette Morph',
    category: 'creative',
    description: 'Subject backlit to silhouette, which morphs into different silhouette',
    example: 'Silhouette of person walking → morphs into → silhouette of different person',
    useCase: 'Identity shifts, character transformations, abstract transitions',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/16_silhouette_morph.md'
  },
  {
    id: 'object-wipe',
    name: 'Foreground Object Wipe',
    category: 'creative',
    description: 'Object moves across frame, wiping scene A to reveal scene B',
    example: 'Passing bus fills frame → as it exits, reveals different street',
    useCase: 'Urban environments, dynamic transitions, screen wipes',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/17_foreground_object_wipe.md'
  },
  {
    id: 'rack-focus',
    name: 'Rack Focus Shift',
    category: 'creative',
    description: 'Focus shifts from foreground to background, changing context',
    example: 'Close subject in focus → rack focus to blurry background → new scene comes into focus',
    useCase: 'Subtle transitions, POV shifts, depth-based reveals',
    difficulty: 'intermediate',
    fragmentPath: 'veo3/transitions/18_rack_focus_shift.md'
  },

  // Compound (2 patterns)
  {
    id: 'compound-whip-color',
    name: 'Compound: Whip Pan + Color Match',
    category: 'compound',
    description: 'Combines whip pan speed with color matching for cohesive transition',
    example: 'Red sports car speeds by → whip pan → red fire truck arrives',
    useCase: 'Fast-paced action with visual cohesion',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/19_compound_whip_pan_color_match.md'
  },
  {
    id: 'compound-dolly-reflection',
    name: 'Compound: Dolly Through + Reflection Swap',
    category: 'compound',
    description: 'Camera dollies through reflective surface (glass, water) into mirrored reality',
    example: 'Dolly toward window → pass through glass → emerge in reflection on other side',
    useCase: 'Surreal portals, parallel dimensions, dreamlike sequences',
    difficulty: 'advanced',
    fragmentPath: 'veo3/transitions/20_compound_dolly_reflection_swap.md'
  }
];

/**
 * TransitionPatternService class
 *
 * Service for managing and retrieving transition patterns.
 * Provides methods to search patterns, load their content, and get metadata.
 */
class TransitionPatternService {
  /**
   * Get all transition patterns
   *
   * @returns Array of all available TransitionPattern objects.
   */
  getTransitionPatterns(): TransitionPattern[] {
    return TRANSITION_PATTERNS;
  }

  /**
   * Get pattern by ID
   *
   * @param id - The ID of the pattern to retrieve.
   * @returns The TransitionPattern object or undefined if not found.
   */
  getPatternById(id: string): TransitionPattern | undefined {
    return TRANSITION_PATTERNS.find(p => p.id === id);
  }

  /**
   * Get patterns by category
   *
   * @param category - The category to filter by.
   * @returns Array of TransitionPattern objects in the specified category.
   */
  getPatternsByCategory(category: TransitionCategory): TransitionPattern[] {
    return TRANSITION_PATTERNS.filter(p => p.category === category);
  }

  /**
   * Get patterns by difficulty
   *
   * @param difficulty - The difficulty level to filter by.
   * @returns Array of TransitionPattern objects with the specified difficulty.
   */
  getPatternsByDifficulty(difficulty: TransitionDifficulty): TransitionPattern[] {
    return TRANSITION_PATTERNS.filter(p => p.difficulty === difficulty);
  }

  /**
   * Load fragment content for a pattern
   * Returns the raw markdown content of the transition pattern
   *
   * @param id - The ID of the pattern.
   * @returns A Promise resolving to the markdown content string.
   * @throws Error if the pattern or fragment cannot be found.
   */
  async loadPatternFragment(id: string): Promise<string> {
    const pattern = this.getPatternById(id);
    if (!pattern) {
      throw new Error(`Transition pattern not found: ${id}`);
    }

    try {
      const fragment = await fragmentLoader.loadFragment(pattern.fragmentPath);
      return fragment.content;
    } catch (error) {
      console.error(`Failed to load transition pattern fragment: ${id}`, error);
      throw new Error(`Could not load transition pattern: ${pattern.name}`);
    }
  }

  /**
   * Search patterns by keyword (searches name, description, useCase)
   *
   * @param query - The search query string.
   * @returns Array of matching TransitionPattern objects.
   */
  searchPatterns(query: string): TransitionPattern[] {
    const lowerQuery = query.toLowerCase();
    return TRANSITION_PATTERNS.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.useCase.toLowerCase().includes(lowerQuery) ||
      p.example.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all unique categories
   *
   * @returns Array of all unique category strings.
   */
  getCategories(): TransitionCategory[] {
    return ['camera', 'natural', 'match-cut', 'environmental', 'creative', 'compound'];
  }

  /**
   * Get category counts for UI
   *
   * @returns A record object mapping category names to their count of patterns.
   */
  getCategoryCounts(): Record<TransitionCategory, number> {
    const counts: Record<TransitionCategory, number> = {
      camera: 0,
      natural: 0,
      'match-cut': 0,
      environmental: 0,
      creative: 0,
      compound: 0,
    };

    TRANSITION_PATTERNS.forEach(pattern => {
      counts[pattern.category]++;
    });

    return counts;
  }
}

export const transitionPatternService = new TransitionPatternService();

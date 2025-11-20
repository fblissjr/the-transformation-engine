/**
 * Component Types for Intermediate v3.0
 * Explicit component boundaries for structured scene representation
 */

// ==================== Component Base Types ====================

/**
 * Base type for components that can be text or object references
 */
export type ComponentBase<T> = TextComponent | ObjectReferenceComponent<T>;

export interface TextComponent {
  type: 'text';
  text: string;
}

export interface ObjectReferenceComponent<T> {
  type: 'object_reference';
  objectId: string; // ID in object library
  objectType: string; // 'character', 'location', 'camera', etc.
  overrides?: Partial<T>; // Scene-specific modifications
  resolvedData?: T; // Cached resolved object (not persisted)
}

// ==================== Scene Components ====================

/**
 * Core components of a scene, aligned with Veo 3.1's 5-component formula
 * Each component can be text-based or reference an object from the library
 */
export interface SceneComponents {
  cinematography: CinematographyComponent;
  subject: SubjectComponent;
  action: ActionComponent;
  context: ContextComponent;
  style: StyleComponent;
}

// ==================== Cinematography Component ====================

/**
 * Camera and cinematography details
 * Can be text description or reference to CameraObject
 */
export type CinematographyComponent =
  | TextComponent
  | ObjectReferenceComponent<CameraObjectData>;

/**
 * Structured camera data (when using object references)
 */
export interface CameraObjectData {
  shotType: ShotType;
  angle: CameraAngle;
  movement: CameraMovement;
  lens?: LensSettings;
  style?: string; // 'cinematic', 'documentary', 'handheld', etc.
  cinematicTechniques?: CinematicTechnique[]; // Advanced editing/camera techniques
}

export type ShotType =
  | 'extreme-wide'
  | 'wide'
  | 'full'
  | 'medium'
  | 'medium-close-up'
  | 'close-up'
  | 'extreme-close-up';

export type CameraAngle =
  | 'eye-level'          // Neutral, human height perspective
  | 'high-angle'         // Above subject looking down
  | 'low-angle'          // Below subject looking up
  | 'dutch'              // Tilted horizon (canted angle)
  | 'overhead'           // High angle, not quite bird's-eye
  | 'ground-level'       // At ground level
  | 'birds-eye'          // Directly from above (top-down)
  | 'worms-eye'          // From ground looking straight up
  | 'over-the-shoulder'  // OTS shot, common in dialogue
  | 'point-of-view';     // POV shot from character's eyes

export interface CameraMovement {
  type:
    | 'static'
    | 'pan'
    | 'tilt'
    | 'dolly'
    | 'track'
    | 'crane'
    | 'zoom'
    | 'handheld'
    | 'steadicam';
  speed?: 'slow' | 'medium' | 'fast';
  direction?: string; // 'left-to-right', 'forward', 'circular', etc.
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface LensSettings {
  type?: LensType;                         // Lens type taxonomy
  focalLength?: string;                    // '35mm', '50mm', '85mm', etc.
  aperture?: string;                       // 'f/1.4', 'f/2.8', 'f/5.6', etc.
  depthOfField?: 'shallow' | 'medium' | 'deep';
  opticalEffects?: OpticalEffect[];       // Special optical effects
}

/**
 * Lens type taxonomy from Google Cloud Veo 3.1 guide
 */
export type LensType =
  | 'standard'       // Normal perspective (35-50mm equivalent)
  | 'wide-angle'     // Broader field of view, exaggerated perspective
  | 'telephoto'      // Narrow field of view, compressed perspective
  | 'fisheye'        // Ultra-wide with extreme barrel distortion
  | 'macro';         // Extreme close-up, small subjects

/**
 * Optical effects achievable through lens and camera techniques
 */
export type OpticalEffect =
  | 'lens-flare'     // Light source creates streaks/starbursts
  | 'rack-focus'     // Focus shift from one subject to another
  | 'vertigo-effect' // Dolly zoom (background perspective changes)
  | 'bokeh';         // Aesthetic quality of out-of-focus areas

/**
 * Cinematic editing and camera techniques
 * From Google Cloud Veo 3.1 guide "Cinematic Terms" section
 */
export type CinematicTechnique =
  | 'match-cut'      // Cut between similar compositions/actions
  | 'jump-cut'       // Cut showing time passage in same location
  | 'split-diopter'  // Two focus planes in same shot
  | 'whip-pan'       // Extremely fast pan (transition effect)
  | 'crash-zoom'     // Sudden rapid zoom in/out
  | 'freeze-frame'   // Pause on single frame
  | 'long-take';     // Extended unbroken shot

// ==================== Subject Component ====================

/**
 * Primary subject(s) of the scene
 * Can be text description or reference to CharacterObject/PropObject
 */
export type SubjectComponent =
  | TextComponent
  | ObjectReferenceComponent<CharacterObjectData>
  | ObjectReferenceComponent<PropObjectData>
  | MultiSubjectComponent;

/**
 * For scenes with multiple subjects
 */
export interface MultiSubjectComponent {
  type: 'multi_subject';
  subjects: Array<
    | TextComponent
    | ObjectReferenceComponent<CharacterObjectData>
    | ObjectReferenceComponent<PropObjectData>
  >;
  relationship?: string; // How subjects relate: 'together', 'opposite sides', etc.
}

/**
 * Structured character data (when using object references)
 */
export interface CharacterObjectData {
  name: string;
  appearance: {
    head: {
      age?: string;
      features?: string;
      hair?: string;
      expression?: string;
    };
    body: {
      build?: string;
      height?: string;
      clothing?: string[];
      accessories?: string[];
      augmentations?: string[]; // For sci-fi/fantasy
    };
  };
  personality?: {
    traits: string[];
    motivations?: string[];
    emotional_state?: string;
  };
  equipment?: string[];
  relationships?: Record<string, string>; // Other character IDs
}

/**
 * Structured prop data (when using object references)
 */
export interface PropObjectData {
  name: string;
  appearance: {
    material: string;
    color: string;
    size: string;
    condition?: string;
  };
  function?: string;
  symbolism?: string;
}

// ==================== Action Component ====================

/**
 * Temporal pacing and time manipulation effects
 * From Google Cloud Veo 3.1 guide "Temporal Elements" section
 */
export interface TemporalPacing {
  speed: TemporalSpeed;
  intensity?: 'subtle' | 'moderate' | 'extreme';
  description?: string; // What's being shown in altered time
}

export type TemporalSpeed =
  | 'slow-motion'    // Slower than real-time (emphasize details, drama)
  | 'normal'         // Real-time
  | 'fast-motion'    // Faster than real-time (compress time)
  | 'time-lapse';    // Extreme time compression (hours → seconds)

/**
 * What's happening in the scene
 * Always structured (not object references, as actions are scene-specific)
 */
export interface ActionComponent {
  type: 'action';

  // Primary action
  verb: string; // 'walks', 'investigates', 'fights', etc.
  target?: ActionTarget;
  manner?: string; // 'slowly', 'cautiously', 'aggressively', etc.

  // Temporal info
  duration?: string; // 'over 3 seconds', 'gradually', 'suddenly'
  timing?: string; // 'at the start', 'halfway through', 'at the end'
  temporalPacing?: TemporalPacing; // Time manipulation effects (slow-motion, time-lapse, etc.)

  // Secondary actions (optional)
  secondaryActions?: Array<{
    verb: string;
    target?: ActionTarget;
    timing?: string;
  }>;
}

export type ActionTarget =
  | string // Simple text: 'the door', 'camera'
  | ObjectReference; // Reference to object: character ID, prop ID, etc.

export interface ObjectReference {
  type: 'object_reference';
  objectId: string;
  objectType: string;
}

// ==================== Context Component ====================

/**
 * Setting, environment, and context
 * Location can be text or reference to LocationObject
 */
export interface ContextComponent {
  type: 'context';

  // Location
  location?: LocationComponent;

  // Temporal context
  timeOfDay?: string; // 'dawn', 'midday', 'dusk', 'night', etc.
  season?: string;
  era?: string; // 'modern', '1940s', 'far future', etc.

  // Environmental
  weather?: WeatherConditions;
  atmosphere?: string; // 'tense', 'peaceful', 'chaotic', etc.

  // Additional context
  culturalContext?: string;
  historicalContext?: string;
}

export type LocationComponent =
  | TextComponent
  | ObjectReferenceComponent<LocationObjectData>;

/**
 * Lighting quality taxonomy from Google Cloud Veo 3.1 guide
 * Combines natural, artificial, and cinematic lighting types
 */
export type LightingQuality =
  // Natural lighting
  | 'natural-daylight'
  | 'golden-hour'      // Soft warm light before sunset/after sunrise
  | 'blue-hour'        // Cool twilight tones
  | 'overcast'
  | 'moonlight'

  // Artificial lighting
  | 'harsh'            // Strong directional light, hard shadows
  | 'soft'             // Diffused, even illumination
  | 'fluorescent'      // Cool artificial office/industrial lighting
  | 'neon'             // Colorful artificial light
  | 'firelight'        // Warm flickering light

  // Cinematic lighting
  | 'rembrandt'        // Classic portrait lighting with triangle on cheek
  | 'film-noir'        // High contrast, dramatic shadows
  | 'volumetric'       // Visible light rays/beams
  | 'high-key'         // Bright, minimal shadows
  | 'low-key'          // Dark, heavy shadows
  | 'backlit'          // Light from behind subject
  | 'silhouette';      // Subject in shadow against bright background

export interface LocationObjectData {
  name: string;
  setting: {
    geography: string; // 'urban', 'forest', 'desert', 'underwater', etc.
    architecture?: string; // 'modern', 'gothic', 'brutalist', etc.
    scale: string; // 'intimate', 'vast', 'claustrophobic', etc.
  };
  lighting: {
    quality: LightingQuality; // Now typed with 17 lighting options
    sources: string[]; // 'sunlight', 'neon signs', 'firelight', etc.
    colorTemperature?: string; // 'warm', 'cool', 'neutral'
  };
  details: string[]; // Notable features
  ambientSounds?: string[]; // For audio context
}

export interface WeatherConditions {
  condition: string; // 'clear', 'rainy', 'stormy', 'snowy', 'foggy'
  intensity?: 'light' | 'moderate' | 'heavy';
  visibility?: 'clear' | 'reduced' | 'obscured';
  progression?: WeatherProgression; // For changing weather
}

export interface WeatherProgression {
  from: string;
  to: string;
  duration: string;
}

// ==================== Style Component ====================

/**
 * Mood and tone taxonomy from Google Cloud Veo 3.1 guide + veo31_director
 * Enhanced from 20 to 27 types based on reference implementation
 */
export type MoodTone =
  // Positive moods (9)
  | 'happy'
  | 'joyful'
  | 'uplifting'
  | 'whimsical'
  | 'peaceful'
  | 'serene'
  | 'romantic'
  | 'euphoric'
  | 'dreamy'

  // Negative moods (9)
  | 'sad'
  | 'melancholy'
  | 'somber'
  | 'tense'
  | 'suspenseful'
  | 'eerie'
  | 'unsettling'
  | 'gritty'
  | 'raw'

  // Intense moods (5)
  | 'epic'
  | 'grandiose'
  | 'dramatic'
  | 'thrilling'
  | 'chaotic'

  // Creative/Surreal (2)
  | 'psychedelic'
  | 'surreal'

  // Other (4)
  | 'mysterious'
  | 'nostalgic'
  | 'dystopian'
  | 'utopian'
  | 'minimalist';

/**
 * Visual and aesthetic style
 * Always structured (not object references, as style is scene-specific)
 */
export interface StyleComponent {
  type: 'style';

  // Visual style tags (fragment-based, composable)
  visualStyle?: string[]; // 'cinematic', 'noir', 'saturated', 'desaturated'

  // Mood/emotion (now typed with 27 options)
  mood?: MoodTone[];

  // Color palette
  colorPalette?: string[]; // 'deep blues', 'warm oranges', 'monochrome'

  // References/influences (not literal copying)
  styleReferences?: string[]; // 'film noir aesthetic', 'Blade Runner atmosphere'

  // Technical style
  technique?: string[]; // 'shallow depth of field', 'high contrast', 'soft focus'

  // Wildcard patterns (gemimg-inspired)
  wildcards?: Record<string, string[]>; // { 'lighting': ['neon', 'natural', 'dramatic'] }
}

// ==================== Transition Types ====================

/**
 * Transition type taxonomy to complement fragment system
 * Matches the 20 transition patterns in /public/veo3/transitions/ + 'none'
 * From Google Cloud Veo 3.1 guide transition techniques
 */
export type TransitionType =
  | 'none'                  // No transition / continuous scene
  // Camera-based transitions
  | 'whip-pan-blur'         // Fast pan blurs Scene A, stops to reveal Scene B
  | 'zoom-bridge'           // Push-in/pull-out zoom resets scene
  | 'orbital-reveal'        // Camera circles subject, background morphs
  | 'dolly-through'         // Move through doorway/portal into new world
  | 'crane-transition'      // Crane ascent/descent between scenes
  // Natural transitions
  | 'water-immersion'       // Submerge in A, emerge in B
  | 'smoke-fog'             // Obscures frame, clears to new scene
  | 'light-flare'           // Overexposure hides cut
  // Match-cut transitions
  | 'shape-match'           // Object in A morphs to similar shape in B
  | 'movement-match'        // Action in A continues as action in B
  | 'color-match'           // Screen fills with color, pulls back to new scene
  // Environmental transitions
  | 'time-lapse'            // Time-of-day shift (dawn → night)
  | 'weather-shift'         // Weather transformation
  | 'seasonal-morph'        // Landscape shifts seasons
  // Creative transitions
  | 'reflection-swap'       // Pass through mirror/reflection
  | 'silhouette-morph'      // Backlit figure changes shape
  | 'object-wipe'           // Foreground object wipes to new scene
  // Compound transitions
  | 'rack-focus'            // Focus shifts from foreground A to background B
  | 'crash-zoom-transition' // Sudden zoom creates scene change
  | 'freeze-blend';         // Freeze frame blends into new scene

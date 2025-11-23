/**
 * Component Types for Intermediate v3.0
 * Explicit component boundaries for structured scene representation
 */

// ==================== Component Base Types ====================

/**
 * Base type for components that can be text or object references
 */
export type ComponentBase<T> = TextComponent | ObjectReferenceComponent<T>;

/**
 * Component represented by simple text.
 */
export interface TextComponent {
  /** Discriminator for component type */
  type: 'text';
  /** The text content */
  text: string;
}

/**
 * Component represented by a reference to an object in the library.
 */
export interface ObjectReferenceComponent<T> {
  /** Discriminator for component type */
  type: 'object_reference';
  /** ID of the object in the object library */
  objectId: string;
  /** Type of object (e.g., 'character', 'location', 'camera') */
  objectType: string;
  /** Optional overrides for object properties specific to this usage */
  overrides?: Partial<T>;
  /** Cached resolved object data (not persisted to DB) */
  resolvedData?: T;
}

// ==================== Scene Components ====================

/**
 * Core components of a scene, aligned with Veo 3.1's 5-component formula
 * Each component can be text-based or reference an object from the library
 */
export interface SceneComponents {
  /** Camera and visual style settings */
  cinematography: CinematographyComponent;
  /** Primary subject(s) of the scene */
  subject: SubjectComponent;
  /** Actions and movements occurring in the scene */
  action: ActionComponent;
  /** Setting, environment, and temporal context */
  context: ContextComponent;
  /** Mood, tone, and artistic style */
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
  /** Type of shot framing */
  shotType: ShotType;
  /** Angle of the camera relative to the subject */
  angle: CameraAngle;
  /** Camera movement definition */
  movement: CameraMovement;
  /** Lens settings and characteristics */
  lens?: LensSettings;
  /** Stylistic description of the camera work */
  style?: string; // 'cinematic', 'documentary', 'handheld', etc.
  /** Advanced cinematic techniques employed */
  cinematicTechniques?: CinematicTechnique[];
}

/** Types of shot framing */
export type ShotType =
  | 'extreme-wide'
  | 'wide'
  | 'full'
  | 'medium'
  | 'medium-close-up'
  | 'close-up'
  | 'extreme-close-up';

/** Camera angles */
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

/** Camera movement definition */
export interface CameraMovement {
  /** Type of movement */
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
  /** Speed of the movement */
  speed?: 'slow' | 'medium' | 'fast';
  /** Direction of the movement */
  direction?: string; // 'left-to-right', 'forward', 'circular', etc.
  /** Easing function for the movement */
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/** Lens configuration */
export interface LensSettings {
  /** Type of lens */
  type?: LensType;
  /** Focal length (e.g., '35mm', '50mm') */
  focalLength?: string;
  /** Aperture setting (e.g., 'f/1.4', 'f/2.8') */
  aperture?: string;
  /** Depth of field description */
  depthOfField?: 'shallow' | 'medium' | 'deep';
  /** Special optical effects */
  opticalEffects?: OpticalEffect[];
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
  /** Discriminator for multi-subject type */
  type: 'multi_subject';
  /** List of subjects */
  subjects: Array<
    | TextComponent
    | ObjectReferenceComponent<CharacterObjectData>
    | ObjectReferenceComponent<PropObjectData>
  >;
  /** Description of relationship between subjects */
  relationship?: string; // How subjects relate: 'together', 'opposite sides', etc.
}

/**
 * Structured character data (when using object references)
 */
export interface CharacterObjectData {
  /** Character name */
  name: string;
  /** Appearance details */
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
  /** Personality traits and state */
  personality?: {
    traits: string[];
    motivations?: string[];
    emotional_state?: string;
  };
  /** Equipment or held items */
  equipment?: string[];
  /** Relationships with other characters (ID mapping) */
  relationships?: Record<string, string>;
}

/**
 * Structured prop data (when using object references)
 */
export interface PropObjectData {
  /** Prop name */
  name: string;
  /** Appearance details */
  appearance: {
    material: string;
    color: string;
    size: string;
    condition?: string;
  };
  /** Prop function or usage */
  function?: string;
  /** Symbolic meaning */
  symbolism?: string;
}

// ==================== Action Component ====================

/**
 * Temporal pacing and time manipulation effects
 * From Google Cloud Veo 3.1 guide "Temporal Elements" section
 */
export interface TemporalPacing {
  /** Speed of action relative to real-time */
  speed: TemporalSpeed;
  /** Intensity of the effect */
  intensity?: 'subtle' | 'moderate' | 'extreme';
  /** Description of what is being shown in altered time */
  description?: string;
}

/** Speed of temporal pacing */
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
  /** Discriminator for action component */
  type: 'action';

  // Primary action
  /** Main verb describing the action */
  verb: string;
  /** Target of the action */
  target?: ActionTarget;
  /** Manner in which action is performed */
  manner?: string;

  // Temporal info
  /** Duration of the action */
  duration?: string;
  /** Timing within the scene */
  timing?: string;
  /** Temporal pacing settings */
  temporalPacing?: TemporalPacing;

  // Secondary actions (optional)
  /** Additional concurrent or sequential actions */
  secondaryActions?: Array<{
    verb: string;
    target?: ActionTarget;
    timing?: string;
  }>;
}

/** Target of an action */
export type ActionTarget =
  | string // Simple text: 'the door', 'camera'
  | ObjectReference; // Reference to object: character ID, prop ID, etc.

/** Reference to an object as an action target */
export interface ObjectReference {
  /** Discriminator for object reference */
  type: 'object_reference';
  /** ID of the referenced object */
  objectId: string;
  /** Type of the referenced object */
  objectType: string;
}

// ==================== Context Component ====================

/**
 * Setting, environment, and context
 * Location can be text or reference to LocationObject
 */
export interface ContextComponent {
  /** Discriminator for context component */
  type: 'context';

  // Location
  /** Location details */
  location?: LocationComponent;

  // Temporal context
  /** Time of day description */
  timeOfDay?: string;
  /** Season description */
  season?: string;
  /** Historical era description */
  era?: string;

  // Environmental
  /** Weather conditions */
  weather?: WeatherConditions;
  /** Atmospheric description */
  atmosphere?: string;

  // Additional context
  /** Cultural context notes */
  culturalContext?: string;
  /** Historical context notes */
  historicalContext?: string;
}

/** Location component definition */
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

/** Structured location data */
export interface LocationObjectData {
  /** Location name */
  name: string;
  /** Setting details */
  setting: {
    geography: string; // 'urban', 'forest', 'desert', 'underwater', etc.
    architecture?: string; // 'modern', 'gothic', 'brutalist', etc.
    scale: string; // 'intimate', 'vast', 'claustrophobic', etc.
  };
  /** Lighting conditions */
  lighting: {
    quality: LightingQuality; // Now typed with 17 lighting options
    sources: string[]; // 'sunlight', 'neon signs', 'firelight', etc.
    colorTemperature?: string; // 'warm', 'cool', 'neutral'
  };
  /** Notable details */
  details: string[];
  /** Ambient sounds */
  ambientSounds?: string[];
}

/** Weather condition details */
export interface WeatherConditions {
  /** Main condition (e.g., 'rainy') */
  condition: string;
  /** Intensity of the weather */
  intensity?: 'light' | 'moderate' | 'heavy';
  /** Visibility conditions */
  visibility?: 'clear' | 'reduced' | 'obscured';
  /** Progression of weather over time */
  progression?: WeatherProgression;
}

/** Weather progression over time */
export interface WeatherProgression {
  /** Starting condition */
  from: string;
  /** Ending condition */
  to: string;
  /** Duration of change */
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
  /** Discriminator for style component */
  type: 'style';

  // Visual style tags (fragment-based, composable)
  /** List of visual style tags */
  visualStyle?: string[];

  // Mood/emotion (now typed with 27 options)
  /** List of moods or tones */
  mood?: MoodTone[];

  // Color palette
  /** Color palette description */
  colorPalette?: string[];

  // References/influences (not literal copying)
  /** Stylistic references */
  styleReferences?: string[];

  // Technical style
  /** Technical style descriptions */
  technique?: string[];

  // Wildcard patterns (gemimg-inspired)
  /** Wildcard pattern configurations */
  wildcards?: Record<string, string[]>;
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

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
  | 'eye-level'
  | 'high-angle'
  | 'low-angle'
  | 'dutch'
  | 'overhead'
  | 'ground-level';

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
  focalLength?: string; // '35mm', '50mm', '85mm', etc.
  aperture?: string; // 'f/1.4', 'f/2.8', 'f/5.6', etc.
  depthOfField?: 'shallow' | 'medium' | 'deep';
}

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

export interface LocationObjectData {
  name: string;
  setting: {
    geography: string; // 'urban', 'forest', 'desert', 'underwater', etc.
    architecture?: string; // 'modern', 'gothic', 'brutalist', etc.
    scale: string; // 'intimate', 'vast', 'claustrophobic', etc.
  };
  lighting: {
    quality: string; // 'harsh', 'soft', 'diffused', 'dramatic'
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
 * Visual and aesthetic style
 * Always structured (not object references, as style is scene-specific)
 */
export interface StyleComponent {
  type: 'style';

  // Visual style tags (fragment-based, composable)
  visualStyle?: string[]; // 'cinematic', 'noir', 'saturated', 'desaturated'

  // Mood/emotion
  mood?: string[]; // 'tense', 'melancholic', 'joyful', 'eerie'

  // Color palette
  colorPalette?: string[]; // 'deep blues', 'warm oranges', 'monochrome'

  // References/influences (not literal copying)
  styleReferences?: string[]; // 'film noir aesthetic', 'Blade Runner atmosphere'

  // Technical style
  technique?: string[]; // 'shallow depth of field', 'high contrast', 'soft focus'

  // Wildcard patterns (gemimg-inspired)
  wildcards?: Record<string, string[]>; // { 'lighting': ['neon', 'natural', 'dramatic'] }
}

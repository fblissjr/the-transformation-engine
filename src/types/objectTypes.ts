/**
 * Object Library Types
 *
 * Type definitions for the Universal Object Library system.
 * These types support characters, locations, cameras, props, audio, concepts, and custom objects.
 *
 * @see internal/living-docs/INTERMEDIATE_V3_INTERFACES.md
 * @see internal/living-docs/OBJECT_SYSTEM_SCHEMA.md
 */

// =============================================================================
// DATABASE RECORD TYPES
// =============================================================================

/**
 * Base record type for all objects stored in IndexedDB
 */
export interface ObjectStoreRecord<T = Record<string, any>> {
  id: string;
  type: string; // 'character', 'location', 'camera', 'prop', 'audio', 'concept', or custom
  version: number;
  data: T;
  linkedScenes: string[];
  linkedObjects: string[];
  name: string;
  description?: string;
  tags?: string[];
  created: Date;
  modified: Date;
  derivedFrom?: {
    sourceType: 'user_input' | 'llm_generation' | 'imported' | 'duplicated';
    sourceId?: string;
    timestamp: Date;
  };
}

/**
 * Version snapshot record for object history
 */
export interface ObjectVersionRecord<T = Record<string, any>> {
  versionId: string;
  objectId: string;
  objectType: string;
  version: number;
  data: T;
  created: Date;
}

/**
 * Changelog record for tracking object changes
 */
export interface ObjectChangelogRecord {
  changelogId: string;
  objectId: string;
  objectType: string;
  fromVersion: number;
  toVersion: number;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
  editInstructions?: string;
  preserveRules?: string[];
  llmReasoning?: string;
  created: Date;
}

/**
 * Relationship record linking two objects
 */
export interface ObjectRelationshipRecord {
  relationshipId: string;
  fromObjectId: string;
  fromObjectType: string;
  toObjectId: string;
  toObjectType: string;
  relationType: string; // 'owns', 'uses', 'appears_with', 'belongs_to', etc.
  strength?: number; // 0-1, how strong the relationship is
  context?: string; // Description of the relationship
  created: Date;
  modified: Date;
}

// =============================================================================
// UNIVERSAL OBJECT BASE
// =============================================================================

/**
 * Base structure for all objects in the object library
 * Specific object types extend this with their own data schemas
 */
export interface UniversalObject<T = any> {
  id: string;
  type: string; // 'character', 'location', 'camera', 'prop', 'audio', 'concept', or LLM-derived
  version: number;
  data: T;
  linkedScenes: string[];
  linkedObjects?: string[];
  name: string;
  description?: string;
  tags?: string[];
  created: Date;
  modified: Date;
  parentVersion?: string;
  derivedFrom?: {
    sourceType: 'user_input' | 'llm_generation' | 'imported' | 'duplicated';
    sourceId?: string;
    timestamp?: Date;
  };
}

// =============================================================================
// LINKED OBJECTS (for IntermediateV3)
// =============================================================================

/**
 * References to reusable objects in the object library
 * Objects can be shared across multiple scenes for consistency
 */
export interface LinkedObjects {
  characters?: string[];
  locations?: string[];
  cameras?: string[];
  props?: string[];
  audio?: string[];
  concepts?: string[];
  custom?: string[];
}

// =============================================================================
// CHARACTER OBJECT
// =============================================================================

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
      augmentations?: string[];
    };
  };
  personality?: {
    traits: string[];
    motivations?: string[];
    emotional_state?: string;
  };
  equipment?: string[];
  relationships?: Record<string, string>;
}

export type CharacterObject = UniversalObject<CharacterObjectData>;

// =============================================================================
// LOCATION OBJECT
// =============================================================================

export interface LocationObjectData {
  name: string;
  setting: {
    geography: string;
    architecture?: string;
    scale: string;
  };
  lighting: {
    quality: string;
    sources: string[];
    colorTemperature?: string;
  };
  details: string[];
  ambientSounds?: string[];
}

export type LocationObject = UniversalObject<LocationObjectData>;

// =============================================================================
// CAMERA OBJECT
// =============================================================================

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
  | 'ground-level'
  | 'birds-eye'
  | 'worms-eye'
  | 'over-the-shoulder'
  | 'point-of-view';

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
  direction?: string;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface LensSettings {
  focalLength?: string;
  aperture?: string;
  depthOfField?: 'shallow' | 'medium' | 'deep';
  type?: 'wide-angle' | 'standard' | 'telephoto' | 'macro' | 'anamorphic';
  opticalEffects?: Array<'lens-flare' | 'chromatic-aberration' | 'vignette' | 'bokeh'>;
}

export interface CameraObjectData {
  shotType: ShotType;
  angle: CameraAngle;
  movement: CameraMovement;
  lens?: LensSettings;
  style?: string;
  cinematicTechniques?: string[];
}

export type CameraObject = UniversalObject<CameraObjectData>;

// =============================================================================
// PROP OBJECT
// =============================================================================

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

export type PropObject = UniversalObject<PropObjectData>;

// =============================================================================
// AUDIO OBJECT
// =============================================================================

export type AudioCategory = 'dialogue' | 'sfx' | 'ambient' | 'music';

export interface AudioObjectData {
  category: AudioCategory;
  content: string;
  delivery?: string;
  duration?: string;
  mood?: string[];
}

export type AudioObject = UniversalObject<AudioObjectData>;

// =============================================================================
// CONCEPT OBJECT
// =============================================================================

export type ConceptCategory = 'mood' | 'theme' | 'pacing' | 'tone' | 'symbolism';

export interface ConceptObjectData {
  category: ConceptCategory;
  description: string;
  manifestations: string[];
  intensity: number; // 1-10
}

export type ConceptObject = UniversalObject<ConceptObjectData>;

// =============================================================================
// OBJECT TYPE HELPERS
// =============================================================================

export type ObjectType =
  | 'character'
  | 'location'
  | 'camera'
  | 'prop'
  | 'audio'
  | 'concept'
  | 'custom';

export type AnyObjectData =
  | CharacterObjectData
  | LocationObjectData
  | CameraObjectData
  | PropObjectData
  | AudioObjectData
  | ConceptObjectData
  | Record<string, any>;

export type AnyObject =
  | CharacterObject
  | LocationObject
  | CameraObject
  | PropObject
  | AudioObject
  | ConceptObject
  | UniversalObject;

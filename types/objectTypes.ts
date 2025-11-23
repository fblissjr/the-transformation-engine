/**
 * Object Library Types for Universal Object System
 * Supports ANY object type: characters, locations, cameras, props, audio, concepts, custom
 */

import type {
  CharacterObjectData,
  CameraObjectData,
  PropObjectData,
  LocationObjectData,
} from './componentTypes';
import type { AudioObjectData } from './audioTypes';

// ==================== Universal Object Base ====================

/**
 * Base structure for all objects in the object library
 * Specific object types extend this with their own data schemas
 */
export interface UniversalObject<T = any> {
  // Core metadata
  /** Unique ID of the object */
  id: string;
  /** Type of object (e.g., 'character', 'location', etc.) */
  type: string;
  /** Version number of the object */
  version: number;

  // Object data (schema varies by type)
  /** The actual object data payload */
  data: T;

  // Relationships
  /** IDs of scenes using this object */
  linkedScenes: string[];
  /** IDs of other objects this object relates to */
  linkedObjects?: string[];

  // Metadata
  /** Object name */
  name: string;
  /** Object description */
  description?: string;
  /** Object tags */
  tags?: string[];

  // Versioning
  /** Creation timestamp */
  created: Date;
  /** Last modification timestamp */
  modified: Date;
  /** ID of the previous version */
  parentVersion?: string;

  // Source tracking (optional)
  /** Information about the source of this object */
  derivedFrom?: {
    sourceType: 'user_input' | 'llm_generation' | 'imported' | 'duplicated';
    sourceId?: string;
    timestamp: Date;
  };
}

// ==================== Specific Object Types ====================

/** Character object type */
export type CharacterObject = UniversalObject<CharacterObjectData>;
/** Location object type */
export type LocationObject = UniversalObject<LocationObjectData>;
/** Camera object type */
export type CameraObject = UniversalObject<CameraObjectData>;
/** Prop object type */
export type PropObject = UniversalObject<PropObjectData>;
/** Audio object type */
export type AudioObject = UniversalObject<AudioObjectData>;
/** Concept object type */
export type ConceptObject = UniversalObject<ConceptObjectData>;

/**
 * Concept object data (abstract concepts like mood, theme, pacing)
 */
export interface ConceptObjectData {
  /** Category of the concept */
  category: 'mood' | 'theme' | 'pacing' | 'tone' | 'symbolism';
  /** Description of the concept */
  description: string;
  /** How this concept manifests visually/aurally */
  manifestations: string[];
  /** Intensity level (1-10) */
  intensity: number;
}

// ==================== Object Store Records ====================

/**
 * Object store record (all object types follow this structure)
 * This is the raw format stored in IndexedDB.
 */
export interface ObjectStoreRecord {
  // Core metadata
  /** Unique ID */
  id: string;
  /** Object type */
  type: string;
  /** Current version number */
  version: number;

  // Object data (schema varies by type)
  /** Object data payload */
  data: Record<string, any>;

  // Relationships
  /** Linked scene IDs */
  linkedScenes: string[];
  /** Linked object IDs */
  linkedObjects: string[];

  // Metadata
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Tags */
  tags?: string[];

  // Versioning
  /** Creation date */
  created: Date;
  /** Modification date */
  modified: Date;
  /** Parent version ID */
  parentVersion?: string;

  // Source tracking
  /** Source information */
  derivedFrom?: {
    sourceType: 'user_input' | 'llm_generation' | 'imported' | 'duplicated';
    sourceId?: string;
    timestamp: Date;
  };
}

/**
 * Version history record
 * Represents a snapshot of an object at a specific version.
 */
export interface ObjectVersionRecord {
  /** Unique version ID */
  versionId: string;
  /** ID of the object */
  objectId: string;
  /** Type of the object */
  objectType: string;
  /** Version number */
  version: number;

  // Snapshot of object data at this version
  /** Object data snapshot */
  data: Record<string, any>;

  // Metadata
  /** Creation timestamp */
  created: Date;
  /** ID of the user who created this version */
  createdBy?: string;
}

/**
 * Changelog record
 * Tracks changes between object versions.
 */
export interface ObjectChangelogRecord {
  /** Unique changelog ID */
  changelogId: string;
  /** ID of the object */
  objectId: string;
  /** Type of the object */
  objectType: string;

  // Version transition
  /** Previous version number */
  fromVersion: number;
  /** New version number */
  toVersion: number;

  // Changes made
  /** List of changes */
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;

  // Edit context
  /** Instructions that led to this change */
  editInstructions?: string;
  /** Fields that were preserved */
  preserveRules?: string[];
  /** Reasoning provided by the LLM */
  llmReasoning?: string;

  // Metadata
  /** Creation timestamp */
  created: Date;
}

/**
 * Relationship record (for complex object relationships)
 * Tracks directed relationships between objects.
 */
export interface ObjectRelationshipRecord {
  /** Unique relationship ID */
  relationshipId: string;
  /** Source object ID */
  fromObjectId: string;
  /** Source object type */
  fromObjectType: string;
  /** Target object ID */
  toObjectId: string;
  /** Target object type */
  toObjectType: string;

  // Relationship metadata
  /** Type of relationship */
  relationType: string;
  /** Strength of the relationship (0-1) */
  strength?: number;
  /** Contextual description */
  context?: string;

  // Lifecycle
  /** Creation timestamp */
  created: Date;
  /** Modification timestamp */
  modified: Date;
}

// ==================== Linked Objects ====================

/**
 * References to reusable objects in the object library
 * Objects can be shared across multiple scenes for consistency
 */
export interface LinkedObjects {
  /** List of character object IDs */
  characters?: string[];
  /** List of location object IDs */
  locations?: string[];
  /** List of camera object IDs */
  cameras?: string[];
  /** List of prop object IDs */
  props?: string[];
  /** List of audio object IDs */
  audio?: string[];
  /** List of concept object IDs */
  concepts?: string[];
  /** List of custom object IDs */
  custom?: string[];
}

// ==================== Relationship Types ====================

/**
 * Standard relationship types (extensible)
 */
export type RelationType =
  // Character ↔ Character
  | 'allies_with'
  | 'opposes'
  | 'interacts_with'
  | 'related_to' // Family relationship
  | 'mentor_of'
  | 'student_of'

  // Character ↔ Prop
  | 'uses'
  | 'owns'
  | 'seeks'

  // Character ↔ Location
  | 'resides_in'
  | 'works_at'
  | 'frequents'

  // Location ↔ Location
  | 'adjacent_to'
  | 'within'
  | 'connected_to'

  // Prop ↔ Prop
  | 'component_of'
  | 'paired_with'

  // Generic
  | 'custom';

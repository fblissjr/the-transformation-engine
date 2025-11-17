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
  id: string;
  type: string; // 'character', 'location', 'camera', 'prop', 'audio', 'concept', or LLM-derived
  version: number;

  // Object data (schema varies by type)
  data: T;

  // Relationships
  linkedScenes: string[]; // Scenes using this object
  linkedObjects?: string[]; // Other objects this relates to

  // Metadata
  name: string;
  description?: string;
  tags?: string[];

  // Versioning
  created: Date;
  modified: Date;
  parentVersion?: string; // Previous version ID (for versioning)

  // Source tracking (optional)
  derivedFrom?: {
    sourceType: 'user_input' | 'llm_generation' | 'imported' | 'duplicated';
    sourceId?: string;
    timestamp: Date;
  };
}

// ==================== Specific Object Types ====================

export type CharacterObject = UniversalObject<CharacterObjectData>;
export type LocationObject = UniversalObject<LocationObjectData>;
export type CameraObject = UniversalObject<CameraObjectData>;
export type PropObject = UniversalObject<PropObjectData>;
export type AudioObject = UniversalObject<AudioObjectData>;
export type ConceptObject = UniversalObject<ConceptObjectData>;

/**
 * Concept object data (abstract concepts like mood, theme, pacing)
 */
export interface ConceptObjectData {
  category: 'mood' | 'theme' | 'pacing' | 'tone' | 'symbolism';
  description: string;
  manifestations: string[]; // How this appears visually/aurally
  intensity: number; // 1-10
}

// ==================== Object Store Records ====================

/**
 * Object store record (all object types follow this structure)
 */
export interface ObjectStoreRecord {
  // Core metadata
  id: string; // 'char_001', 'loc_005', 'camera_012', etc.
  type: string; // 'character', 'location', 'camera', 'prop', 'audio', 'concept', or custom
  version: number; // Current version (increments with each edit)

  // Object data (schema varies by type)
  data: Record<string, any>;

  // Relationships
  linkedScenes: string[]; // Scene IDs using this object
  linkedObjects: string[]; // Other object IDs this relates to

  // Metadata
  name: string; // Display name
  description?: string; // Optional description
  tags?: string[]; // User-defined tags for categorization

  // Versioning
  created: Date;
  modified: Date;
  parentVersion?: string; // Previous version's record ID (for versioning)

  // Source tracking
  derivedFrom?: {
    sourceType: 'user_input' | 'llm_generation' | 'imported' | 'duplicated';
    sourceId?: string; // ID of source (e.g., prompt ID, imported file ID)
    timestamp: Date;
  };
}

/**
 * Version history record
 */
export interface ObjectVersionRecord {
  versionId: string; // 'ver_char001_v2_20251117'
  objectId: string; // 'char_001'
  objectType: string; // 'character'
  version: number; // 2, 3, 4, etc.

  // Snapshot of object data at this version
  data: Record<string, any>;

  // Metadata
  created: Date;
  createdBy?: string; // User ID (if multi-user in future)
}

/**
 * Changelog record
 */
export interface ObjectChangelogRecord {
  changelogId: string; // 'log_char001_v1to2_20251117'
  objectId: string; // 'char_001'
  objectType: string; // 'character'

  // Version transition
  fromVersion: number;
  toVersion: number;

  // Changes made
  changes: Array<{
    field: string; // 'appearance.head.features'
    oldValue: any;
    newValue: any;
    reason: string; // LLM explanation
  }>;

  // Edit context
  editInstructions?: string; // Original user instructions
  preserveRules?: string[]; // Fields that were preserved
  llmReasoning?: string; // LLM's explanation of edits

  // Metadata
  created: Date;
}

/**
 * Relationship record (for complex object relationships)
 */
export interface ObjectRelationshipRecord {
  relationshipId: string; // 'rel_char001_uses_prop005'
  fromObjectId: string; // 'char_001'
  fromObjectType: string; // 'character'
  toObjectId: string; // 'prop_005'
  toObjectType: string; // 'prop'

  // Relationship metadata
  relationType: string; // 'uses', 'located_at', 'interacts_with', 'opposes', etc.
  strength?: number; // 0-1 (how strong is this relationship?)
  context?: string; // Optional context: "in combat scenes", "when investigating"

  // Lifecycle
  created: Date;
  modified: Date;
}

// ==================== Linked Objects ====================

/**
 * References to reusable objects in the object library
 * Objects can be shared across multiple scenes for consistency
 */
export interface LinkedObjects {
  characters?: string[]; // Character object IDs
  locations?: string[]; // Location object IDs
  cameras?: string[]; // Camera object IDs
  props?: string[]; // Prop object IDs
  audio?: string[]; // Audio object IDs
  concepts?: string[]; // Abstract concept object IDs
  custom?: string[]; // LLM-derived custom object IDs
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

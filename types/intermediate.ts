// ==================== Intermediate Representation Types v2.0 ====================
// Model-agnostic prompt storage for multi-model portability
// Supports transformation to Sora 2, Veo 3, and future models on-demand

// ==================== Scene Types ====================
/**
 * Classification of scene types for organizational purposes.
 */
export type SceneType =
  | 'dialogue'        // Conversation-focused scenes
  | 'cinematic'       // Narrative-driven scenes with camera work
  | 'animation'       // Animated or motion-graphics scenes
  | 'music-video'     // Music-driven scenes with rhythm
  | 'action'          // High-energy scenes with movement
  | 'establishing'    // Setting/location establishment
  | 'product'         // Product showcase/commercial
  | 'abstract';       // Non-narrative, experimental

// ==================== Core Intermediate Structure ====================

/**
 * IntermediateStructure v2.0
 * The source of truth for all prompt content (Layer C)
 * Always structured JSON, never Markdown
 */
export interface IntermediateStructure {
  /** Discriminator for structured format */
  format: 'structured';
  /** Schema version */
  version: '2.0.0';
  /** Classification of the scene type */
  sceneType: SceneType;

  /** Content sections of the intermediate representation */
  sections: {
    /** REQUIRED - visual elements */
    visual: VisualSection;
    /** OPTIONAL - time progression */
    temporal?: TemporalSection[];
    /** OPTIONAL - sound elements */
    audio?: AudioSection;
    /** OPTIONAL - cinematic details */
    camera?: CameraSection;
  };

  /** Transformation metadata */
  metadata?: IntermediateMetadata;
}

// ==================== Section Definitions ====================

/**
 * VisualSection (REQUIRED)
 * Foundation of every scene - visual elements
 */
export interface VisualSection {
  /** Who or what is in the scene */
  subject: string[];
  /** Where the scene takes place */
  setting: string;
  /** Environmental details */
  environment: string;
  /** Dominant color palette */
  colors: string;
  /** Lighting characteristics */
  lighting: string;
  /** Framing and arrangement */
  composition: string;
  /** Visual aesthetic */
  style: string;
}

/**
 * TemporalSection (OPTIONAL)
 * For scenes with time progression
 */
export interface TemporalSection {
  /** Time range, e.g., "0-3s", "3-7s" */
  time: string;
  /** What happens during this segment */
  description: string;
  /** Camera behavior during segment */
  camera?: string;
  /** Visual changes during segment */
  visual?: string;
  /** Audio changes during segment */
  audio?: string;
}

/**
 * AudioSection (OPTIONAL)
 * For scenes with notable sound elements
 */
export interface AudioSection {
  /** Quoted speech */
  dialogue?: string[];
  /** Background environmental sounds */
  ambient?: string[];
  /** Specific sound effects (foley) */
  soundEffects?: string[];
  /** Musical elements description */
  music?: string;
}

/**
 * CameraSection (OPTIONAL)
 * For cinematic camera work
 */
export interface CameraSection {
  /** Camera motion */
  movement?: string;
  /** Specific camera angles/shots */
  angles?: string[];
  /** Cinematic techniques */
  techniques?: string;
  /** Lens, focal length, aperture */
  lensDetails?: string;
}

// ==================== Legacy Support (for migration) ====================

/**
 * @deprecated Use IntermediateStructure v2.0 instead
 * Kept for backward compatibility during migration
 */
export interface MarkdownFormat {
  format: 'markdown';
  content: string;
}

/**
 * @deprecated Use IntermediateStructure v2.0 instead
 * Legacy v1.0 structure
 */
export interface StructuredFormatV1 {
  temporal?: TemporalStructureV1;
  visual?: VisualStructureV1;
  audio?: AudioStructureV1;
  camera?: CameraStructureV1;
  narrative?: NarrativeStructure;
}

/**
 * @deprecated Legacy type union
 */
export type IntermediateStructureV1 = StructuredFormatV1 | MarkdownFormat;

// Legacy v1.0 interfaces (deprecated but kept for migration)
export interface TemporalStructureV1 {
  totalDuration?: number;
  segments: TemporalSegmentV1[];
}

export interface TemporalSegmentV1 {
  startTime: number;
  endTime: number;
  description: string;
  camera?: string;
  visual?: string;
  audio?: string;
}

export interface VisualStructureV1 {
  setting?: string;
  subjects?: string[];
  environment?: string;
  colors?: string;
  lighting?: string;
  composition?: string;
  style?: string;
}

export interface AudioStructureV1 {
  dialogue?: string;
  ambient?: string;
  soundEffects?: string;
  music?: string;
}

export interface CameraStructureV1 {
  movement?: string;
  angles?: string;
  techniques?: string;
}

export interface NarrativeStructure {
  beginning?: string;
  middle?: string;
  end?: string;
  arc?: string;
}

// ==================== Schema Key Preset Types ====================

/**
 * SceneClassification
 * 5-dimensional scene taxonomy for auto-suggestion and categorization
 */
export interface SceneClassification {
  genre: string[];          // Action, Drama, Horror, Comedy, etc.
  format: string[];         // Live-Action, Animation, Documentary, etc.
  visualStyle: string[];    // Cinematic, Handheld, Stylized, etc.
  camera: string[];         // Static, Slow-Motion, Aerial, etc.
  narrative: string[];      // Dialogue-Heavy, Action-Driven, Exposition, etc.
}

/**
 * SchemaKeyPreset
 * Defines optimal prompt structure for specific model families and scene types
 */
export interface SchemaKeyPreset {
  /** Unique ID, e.g., "veo31-standard" */
  id: string;
  /** Display name */
  name: string;
  /** Usage guidance */
  description: string;
  /** Model family compatibility */
  modelFamily: 'veo3' | 'sora2' | 'generic';
  /** Compatible model IDs */
  modelVersions: string[];
  /** Prompting strategy type */
  promptingStrategy: 'continuous' | 'timestamp' | 'scene_type_specific' | 'transition' | 'physics_based' | 'versatile';
  /** Optional scene type association */
  sceneType?: SceneType;
  /** Word count guidance */
  optimalLength?: string;
  /** Duration guidance */
  duration?: string;
  /** Segment duration guidance */
  segmentDuration?: string;
  /** Segment count guidance */
  segmentCount?: number;
  /** Array of schema keys included */
  schemaKeys: SchemaKey[];
  /** Searchable tags */
  tags: string[];
  /** Recommended use cases */
  recommendedFor: string[];
  /** Additional guidance notes */
  notes?: string;
  /** Global preset vs custom */
  isGlobal: boolean;
  /** Default preset for model family */
  isDefault?: boolean;
}

/**
 * SchemaKey
 * Individual key in a schema preset
 */
export interface SchemaKey {
  /** Key identifier */
  key: string;
  /** What this key represents */
  description: string;
  /** Is this key required? */
  required: boolean;
  /** Categorization of the key */
  category: 'core' | 'enhancement' | 'per_segment';
  /** Data structure hint */
  structure?: 'array' | 'object';
  /** Format specification */
  format?: string;
  /** Allowed values */
  enum?: string[];
}

/**
 * IntermediateMetadata (extended)
 * Metadata for intermediates including scene classification and schema selection
 */
export interface IntermediateMetadata {
  /** Generation timestamp (ISO) */
  generatedAt?: string;
  /** Type of transformation applied */
  transformationType?: string;
  /** Parameters used for transformation */
  transformationParams?: Record<string, any>;
  /** ID of parent intermediate */
  parentId?: string;
  /** Scene classification tags */
  sceneClassification?: SceneClassification;
  /** Selected preset ID */
  selectedSchemaPreset?: string;
  /** Selected prompting strategy */
  promptingStrategy?: 'timestamp' | 'continuous';
}

// ==================== Scene Extension Types ====================

/**
 * PreservationOptions
 * Controls what elements to preserve when extending a scene
 */
export interface PreservationOptions {
  /** Keep character identity, appearance, clothing */
  characters: boolean;
  /** Keep location, setting, weather */
  environment: boolean;
  /** Keep colors, lighting, aesthetic */
  visualStyle: boolean;
  /** Continue music, ambient sounds */
  audio: boolean;
}

/**
 * ParentSceneSummary
 * Cached summary of parent scene for extension context
 */
export interface ParentSceneSummary {
  /** List of characters present */
  characters: string[];
  /** Location description */
  location: string;
  /** Description of the last moment */
  lastMoment: string;
  /** Visual style description */
  visualStyle: string;
  /** Audio state description */
  audioState: string;
}

/**
 * ExtensionMetadata
 * Metadata for scenes created via extension
 */
export interface ExtensionMetadata {
  /** ID of parent intermediate */
  parentSceneId: string;
  /** Extension method used */
  method: 'continue' | 'cutTo' | 'transition';
  /** User's "what happens next" input */
  userDescription?: string;
  /** What elements were preserved */
  preservation: PreservationOptions;
  /** Assigned scene number */
  sceneNumber?: number;
  /** Cached parent summary */
  parentSummary?: ParentSceneSummary;
}

/**
 * OrphanMetadata
 * Metadata for scenes whose parent was deleted
 */
export interface OrphanMetadata {
  /** Is this scene orphaned? */
  isOrphaned: boolean;
  /** ID of the original parent */
  originalParentId: string;
  /** Title of the original parent */
  originalParentTitle: string;
  /** Timestamp of orphaning (ISO) */
  orphanedAt: string;
}

// ==================== Container Types ====================

/**
 * IntermediatePrompt
 * Container for intermediate with metadata
 */
export interface IntermediatePrompt {
  // Metadata (required)
  /** Unique ID */
  id: string;
  /** Semantic versioning: "2.0.0" */
  version: string;
  /** Creation timestamp */
  created: Date;
  /** Modification timestamp */
  modified: Date;
  /** Prompt title */
  title: string;
  /** Prompt description */
  description?: string;
  /** Prompt tags */
  tags: string[];

  // Sources (what created this intermediate)
  /** Source inputs that created this intermediate */
  sources: PromptSources;

  // Structure (the actual content - model-agnostic)
  /** The actual intermediate content structure */
  structure: IntermediateStructure | IntermediateStructureV1;

  // Relationships (for version control / branching)
  /** Relationships to other intermediates */
  relationships?: IntermediateRelationships;

  // Scene Extension (Phase 1 MVP)
  /** Metadata for scene extensions */
  extensionMetadata?: ExtensionMetadata;
  /** Metadata for orphaned scenes */
  orphanMetadata?: OrphanMetadata;
}

/**
 * PromptSources
 * Tracks what inputs created this intermediate
 */
export interface PromptSources {
  /** Natural language input */
  text?: string;
  /** Image source URLs */
  images?: string[];
  /** Video source URLs */
  videos?: string[];
  /** IDs of base prompts used for mixing */
  basePrompts?: string[];
  /** Template ID used */
  template?: string;
}

/**
 * IntermediateRelationships
 * Version control and branching
 */
export interface IntermediateRelationships {
  /** ID of the parent prompt */
  parentId?: string;
  /** IDs of child prompts (variations) */
  childIds?: string[];
  /** IDs of prompts this was mixed from */
  mixedFrom?: string[];
  /** Branch identifier name */
  branchName?: string;
}

// ==================== Validation ====================

/**
 * ValidationResult
 * Result of validating an intermediate structure
 */
export interface ValidationResult {
  /** Whether the structure is valid */
  valid: boolean;
  /** List of validation errors */
  errors: ValidationError[];
  /** List of validation warnings */
  warnings: ValidationWarning[];
}

/** Validation error detail */
export interface ValidationError {
  /** Field causing the error */
  field: string;
  /** Error message */
  message: string;
}

/** Validation warning detail */
export interface ValidationWarning {
  /** Field causing the warning */
  field: string;
  /** Warning message */
  message: string;
}

// ==================== Type Guards ====================

/**
 * Check if structure is v2.0 format
 * @param structure - The structure to check.
 * @returns True if the structure is v2.0 format.
 */
export function isIntermediateStructureV2(
  structure: IntermediateStructure | IntermediateStructureV1
): structure is IntermediateStructure {
  return 'format' in structure && structure.format === 'structured' && 'version' in structure;
}

/**
 * Check if structure is legacy markdown format
 * @param structure - The structure to check.
 * @returns True if the structure is markdown format.
 */
export function isMarkdownFormat(
  structure: IntermediateStructure | IntermediateStructureV1
): structure is MarkdownFormat {
  return 'format' in structure && structure.format === 'markdown';
}

// ==================== Intermediate v3.0 Types ====================

import type { SceneComponents } from './componentTypes';
import type { AudioSegment, TimestampSegment } from './audioTypes';
import type { LinkedObjects } from './objectTypes';
import type { PromptingStrategy } from './promptingTypes';

/**
 * IntermediateV3 - Structured scene representation with explicit
 * component boundaries and object references
 *
 * Supports all 6 Veo 3.1 prompting methods:
 * 1. Continuous narrative
 * 2. 5-Component formula (cinematography/subject/action/context/style)
 * 3. Timestamp-segmented
 * 4. Attribute-value pairs
 * 5. Structured JSON/YAML
 * 6. Audio-specific syntax
 */
export interface IntermediateV3 {
  // Metadata
  /** Unique ID */
  id: string;
  /** Links to original user prompt */
  promptId: string;
  /** Schema version (3) */
  version: 3;

  // Structured components with explicit boundaries
  /** Core scene components */
  components: SceneComponents;

  // Object library references (optional, for reusable objects)
  /** References to objects in the library */
  linkedObjects?: LinkedObjects;

  // Audio with preserved Veo 3.1 syntax
  /** Audio segments with Veo syntax */
  audio?: AudioSegment[];

  // Timestamp-based prompting (optional, for time-segmented scenes)
  /** Segments for timestamp-based prompting */
  timestamps?: TimestampSegment[];

  // Prompting strategy metadata
  /** Strategy used for prompting */
  promptingStrategy?: PromptingStrategy;

  // Scene metadata
  /** Scene title */
  title: string;
  /** Creation timestamp */
  created: Date;
  /** Modification timestamp */
  modified: Date;

  // Scene relationships (for scene extension/composition)
  /** ID of the parent scene */
  parentSceneId?: string;
  /** IDs of child scenes */
  childSceneIds?: string[];
}

/**
 * Check if intermediate is v3.0 format
 * @param intermediate - The object to check.
 * @returns True if the object is an IntermediateV3.
 */
export function isIntermediateV3(
  intermediate: any
): intermediate is IntermediateV3 {
  return intermediate && typeof intermediate.version === 'number' && intermediate.version === 3;
}

// ==================== Intermediate Representation Types v2.0 ====================
// Model-agnostic prompt storage for multi-model portability
// Supports transformation to Sora 2, Veo 3, and future models on-demand

// ==================== Scene Types ====================
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
  format: 'structured';              // Always "structured" in v2.0 (not "markdown")
  version: '2.0.0';                  // Intermediate format version
  sceneType: SceneType;              // Scene classification

  sections: {
    visual: VisualSection;           // REQUIRED - visual elements
    temporal?: TemporalSection[];    // OPTIONAL - time progression
    audio?: AudioSection;            // OPTIONAL - sound elements
    camera?: CameraSection;          // OPTIONAL - cinematic details
  };

  // Transformation metadata (now uses shared IntermediateMetadata interface)
  metadata?: IntermediateMetadata;
}

// ==================== Section Definitions ====================

/**
 * VisualSection (REQUIRED)
 * Foundation of every scene - visual elements
 */
export interface VisualSection {
  subject: string[];                 // Who or what is in the scene
  setting: string;                   // Where the scene takes place
  environment: string;               // Environmental details
  colors: string;                    // Dominant color palette
  lighting: string;                  // Lighting characteristics
  composition: string;               // Framing and arrangement
  style: string;                     // Visual aesthetic
}

/**
 * TemporalSection (OPTIONAL)
 * For scenes with time progression
 */
export interface TemporalSection {
  time: string;                      // Time range, e.g., "0-3s", "3-7s"
  description: string;               // What happens during this segment
  camera?: string;                   // Camera behavior during segment
  visual?: string;                   // Visual changes during segment
  audio?: string;                    // Audio changes during segment
}

/**
 * AudioSection (OPTIONAL)
 * For scenes with notable sound elements
 */
export interface AudioSection {
  dialogue?: string[];               // Quoted speech
  ambient?: string[];                // Background environmental sounds
  soundEffects?: string[];           // Specific sound effects (foley)
  music?: string;                    // Musical elements description
}

/**
 * CameraSection (OPTIONAL)
 * For cinematic camera work
 */
export interface CameraSection {
  movement?: string;                 // Camera motion
  angles?: string[];                 // Specific camera angles/shots
  techniques?: string;               // Cinematic techniques
  lensDetails?: string;              // Lens, focal length, aperture
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
  id: string;                               // e.g., "veo31-standard"
  name: string;                             // Display name
  description: string;                      // Usage guidance
  modelFamily: 'veo3' | 'sora2' | 'generic';
  modelVersions: string[];                  // Compatible model IDs
  promptingStrategy: 'continuous' | 'timestamp' | 'scene_type_specific' | 'transition' | 'physics_based' | 'versatile';
  sceneType?: SceneType;                    // Optional scene type association
  optimalLength?: string;                   // Word count guidance
  duration?: string;                        // For timestamp prompts
  segmentDuration?: string;                 // For timestamp prompts
  segmentCount?: number;                    // For timestamp prompts
  schemaKeys: SchemaKey[];                  // Array of schema keys
  tags: string[];                           // Searchable tags
  recommendedFor: string[];                 // Use cases
  notes?: string;                           // Additional guidance
  isGlobal: boolean;                        // Global preset vs custom
  isDefault?: boolean;                      // Default for model family
}

/**
 * SchemaKey
 * Individual key in a schema preset
 */
export interface SchemaKey {
  key: string;                              // Key identifier
  description: string;                      // What this key represents
  required: boolean;                        // Is this key required?
  category: 'core' | 'enhancement' | 'per_segment';
  structure?: 'array' | 'object';           // Data structure hint
  format?: string;                          // Format specification
  enum?: string[];                          // Allowed values
}

/**
 * IntermediateMetadata (extended)
 * Metadata for intermediates including scene classification and schema selection
 */
export interface IntermediateMetadata {
  generatedAt?: string;                     // ISO timestamp
  transformationType?: string;              // e.g., "mix", "extend", "reverse"
  transformationParams?: Record<string, any>;
  parentId?: string;                        // Parent intermediate ID
  sceneClassification?: SceneClassification;  // NEW: Scene classification tags
  selectedSchemaPreset?: string;            // NEW: Selected preset ID
  promptingStrategy?: 'timestamp' | 'continuous';  // NEW: Prompting strategy
}

// ==================== Scene Extension Types ====================

/**
 * PreservationOptions
 * Controls what elements to preserve when extending a scene
 */
export interface PreservationOptions {
  characters: boolean;        // Keep character identity, appearance, clothing
  environment: boolean;       // Keep location, setting, weather
  visualStyle: boolean;       // Keep colors, lighting, aesthetic
  audio: boolean;            // Continue music, ambient sounds
}

/**
 * ParentSceneSummary
 * Cached summary of parent scene for extension context
 */
export interface ParentSceneSummary {
  characters: string[];      // ["Detective Harris", "Suspect"]
  location: string;          // "Dark interrogation room"
  lastMoment: string;        // "Detective leans forward..."
  visualStyle: string;       // "High-contrast noir lighting"
  audioState: string;        // "Fluorescent buzz, no music"
}

/**
 * ExtensionMetadata
 * Metadata for scenes created via extension
 */
export interface ExtensionMetadata {
  parentSceneId: string;                           // ID of parent intermediate
  method: 'continue' | 'cutTo' | 'transition';     // Extension method used
  userDescription?: string;                        // User's "what happens next" input
  preservation: PreservationOptions;               // What was preserved
  sceneNumber?: number;                            // Assigned scene number (S1, S2, etc.)
  parentSummary?: ParentSceneSummary;             // Cached parent summary
}

/**
 * OrphanMetadata
 * Metadata for scenes whose parent was deleted
 */
export interface OrphanMetadata {
  isOrphaned: boolean;
  originalParentId: string;
  originalParentTitle: string;
  orphanedAt: string;  // ISO timestamp
}

// ==================== Container Types ====================

/**
 * IntermediatePrompt
 * Container for intermediate with metadata
 */
export interface IntermediatePrompt {
  // Metadata (required)
  id: string;
  version: string;                   // Semantic versioning: "2.0.0"
  created: Date;
  modified: Date;
  title: string;
  description?: string;
  tags: string[];

  // Sources (what created this intermediate)
  sources: PromptSources;

  // Structure (the actual content - model-agnostic)
  structure: IntermediateStructure | IntermediateStructureV1;  // Support both during migration

  // Relationships (for version control / branching)
  relationships?: IntermediateRelationships;

  // Scene Extension (Phase 1 MVP)
  extensionMetadata?: ExtensionMetadata;
  orphanMetadata?: OrphanMetadata;
}

/**
 * PromptSources
 * Tracks what inputs created this intermediate
 */
export interface PromptSources {
  text?: string;                     // Natural language input
  images?: string[];                 // Blob URLs or external URLs
  videos?: string[];                 // Blob URLs or external URLs
  basePrompts?: string[];            // IDs of prompts to mix
  template?: string;                 // Template ID
}

/**
 * IntermediateRelationships
 * Version control and branching
 */
export interface IntermediateRelationships {
  parentId?: string;                 // Forked from this intermediate
  childIds?: string[];               // Variations of this intermediate
  mixedFrom?: string[];              // Blended from these intermediates
  branchName?: string;               // Branch identifier
}

// ==================== Validation ====================

/**
 * ValidationResult
 * Result of validating an intermediate structure
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

// ==================== Type Guards ====================

/**
 * Check if structure is v2.0 format
 */
export function isIntermediateStructureV2(
  structure: IntermediateStructure | IntermediateStructureV1
): structure is IntermediateStructure {
  return 'format' in structure && structure.format === 'structured' && 'version' in structure;
}

/**
 * Check if structure is legacy markdown format
 */
export function isMarkdownFormat(
  structure: IntermediateStructure | IntermediateStructureV1
): structure is MarkdownFormat {
  return 'format' in structure && structure.format === 'markdown';
}

// ==================== Intermediate Representation Types ====================
// Model-agnostic prompt storage for multi-model portability
// Supports transformation to Sora 2, Veo 3, and future models on-demand

// Core intermediate prompt structure
export interface IntermediatePrompt {
  // Metadata (required)
  id: string;
  version: string;              // Semantic versioning: "1.0.0"
  created: Date;
  modified: Date;
  title: string;
  description?: string;
  tags: string[];

  // Sources (what created this intermediate)
  sources: PromptSources;

  // Structure (the actual content - model-agnostic)
  structure: IntermediateStructure;

  // Relationships (for version control / branching)
  relationships?: IntermediateRelationships;
}

// What inputs were used to create this
export interface PromptSources {
  text?: string;                // Natural language input
  images?: string[];            // Blob URLs or external URLs
  videos?: string[];            // Blob URLs or external URLs
  basePrompts?: string[];       // IDs of prompts to mix
  template?: string;            // Template ID
}

// The semantic content (model-agnostic)
// Can be either structured JSON (legacy) or Markdown string (current)
export type IntermediateStructure = StructuredFormat | MarkdownFormat;

export interface StructuredFormat {
  temporal?: TemporalStructure;
  visual?: VisualStructure;
  audio?: AudioStructure;
  camera?: CameraStructure;
  narrative?: NarrativeStructure;
}

export interface MarkdownFormat {
  format: 'markdown';
  content: string;
}

export interface TemporalStructure {
  totalDuration?: number;       // Seconds (for display only)
  segments: TemporalSegment[];
}

export interface TemporalSegment {
  startTime: number;            // Seconds
  endTime: number;              // Seconds
  description: string;          // What happens
  camera?: string;              // Camera behavior
  visual?: string;              // Visual changes
  audio?: string;               // Audio changes
}

export interface VisualStructure {
  setting?: string;             // Where scene takes place
  subjects?: string[];          // Who/what is in scene
  environment?: string;         // Environment details
  colors?: string;              // Color palette
  lighting?: string;            // Lighting description
  composition?: string;         // Framing/composition
  style?: string;               // Visual aesthetic
}

export interface AudioStructure {
  dialogue?: string;            // Spoken words (quoted)
  ambient?: string;             // Background sounds
  soundEffects?: string;        // Foley/SFX
  music?: string;               // Musical elements
}

export interface CameraStructure {
  movement?: string;            // Camera motion
  angles?: string;              // Camera angles
  techniques?: string;          // Cinematic techniques (lens, aperture, etc.)
}

export interface NarrativeStructure {
  beginning?: string;           // Story start
  middle?: string;              // Story middle
  end?: string;                 // Story end
  arc?: string;                 // Overall narrative arc
}

export interface IntermediateRelationships {
  parentId?: string;            // Forked from this intermediate
  childIds?: string[];          // Variations of this intermediate
  mixedFrom?: string[];         // Blended from these intermediates
  branchName?: string;          // Branch identifier
}

// Validation result
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

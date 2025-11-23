// ==================== Zod Validation Schemas ====================
// Runtime validation for intermediate structures v2.0

import { z } from 'zod';

// ==================== Schema Key Preset Schemas ====================

/**
 * SceneClassification Schema
 * 5-dimensional scene taxonomy validation
 */
export const SceneClassificationSchema = z.object({
  genre: z.array(z.string()),
  format: z.array(z.string()),
  visualStyle: z.array(z.string()),
  camera: z.array(z.string()),
  narrative: z.array(z.string()),
});

/**
 * SchemaKey Schema
 * Individual key in a schema preset
 */
export const SchemaKeySchema = z.object({
  key: z.string(),
  description: z.string(),
  required: z.boolean(),
  category: z.enum(['core', 'enhancement', 'per_segment']),
  structure: z.enum(['array', 'object']).optional(),
  format: z.string().optional(),
  enum: z.array(z.string()).optional(),
});

/**
 * SchemaKeyPreset Schema
 * Validates schema key preset structure
 */
export const SchemaKeyPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  modelFamily: z.enum(['veo3', 'sora2', 'generic']),
  modelVersions: z.array(z.string()),
  promptingStrategy: z.enum(['continuous', 'timestamp', 'scene_type_specific', 'transition', 'physics_based', 'versatile']),
  sceneType: z.string().optional(), // References SceneType
  optimalLength: z.string().optional(),
  duration: z.string().optional(),
  segmentDuration: z.string().optional(),
  segmentCount: z.number().optional(),
  schemaKeys: z.array(SchemaKeySchema),
  tags: z.array(z.string()),
  recommendedFor: z.array(z.string()),
  notes: z.string().optional(),
  isGlobal: z.boolean(),
  isDefault: z.boolean().optional(),
});

/**
 * IntermediateMetadata Schema (extended)
 * Validates metadata including scene classification
 */
export const IntermediateMetadataSchema = z.object({
  generatedAt: z.string().optional(),
  transformationType: z.string().optional(),
  transformationParams: z.record(z.string(), z.any()).optional(),
  parentId: z.string().optional(),
  sceneClassification: SceneClassificationSchema.optional(),
  selectedSchemaPreset: z.string().optional(),
  promptingStrategy: z.enum(['timestamp', 'continuous']).optional(),
});

// ==================== Scene Types ====================

export const SceneTypeSchema = z.enum([
  'dialogue',
  'cinematic',
  'animation',
  'music-video',
  'action',
  'establishing',
  'product',
  'abstract',
]);

// ==================== Section Schemas ====================

/**
 * VisualSection Schema (REQUIRED)
 * Validates all visual elements of a scene
 */
export const VisualSectionSchema = z.object({
  subject: z.array(z.string().min(1)).min(1, 'At least one subject required'),
  setting: z.string().min(1, 'Setting is required'),
  environment: z.string().min(1, 'Environment description is required'),
  colors: z.string().min(1, 'Color palette is required'),
  lighting: z.string().min(1, 'Lighting description is required'),
  composition: z.string().min(1, 'Composition is required'),
  style: z.string().min(1, 'Style is required'),
});

/**
 * TemporalSection Schema (OPTIONAL)
 * Validates time-based progression
 */
export const TemporalSectionSchema = z.object({
  time: z.string().regex(/^\d+-\d+s$/, 'Time must be in format "0-3s"'),
  description: z.string().min(1, 'Temporal description is required'),
  camera: z.string().optional(),
  visual: z.string().optional(),
  audio: z.string().optional(),
});

/**
 * AudioSection Schema (OPTIONAL)
 * Validates audio elements
 */
export const AudioSectionSchema = z.object({
  dialogue: z.array(z.string()).optional(),
  ambient: z.array(z.string()).optional(),
  soundEffects: z.array(z.string()).optional(),
  music: z.string().optional(),
});

/**
 * CameraSection Schema (OPTIONAL)
 * Validates camera work details
 */
export const CameraSectionSchema = z.object({
  movement: z.string().optional(),
  angles: z.array(z.string()).optional(),
  techniques: z.string().optional(),
  lensDetails: z.string().optional(),
});

// ==================== Core Intermediate Structure Schema ====================

/**
 * IntermediateStructure Schema v2.0
 * Validates the complete intermediate structure
 */
export const IntermediateStructureSchema = z.object({
  format: z.literal('structured'),
  version: z.literal('2.0.0'),
  sceneType: SceneTypeSchema,
  sections: z.object({
    visual: VisualSectionSchema,
    temporal: z.array(TemporalSectionSchema).optional(),
    audio: AudioSectionSchema.optional(),
    camera: CameraSectionSchema.optional(),
  }),
  metadata: IntermediateMetadataSchema.optional(),
});

// ==================== Scene Extension Schemas ====================

/**
 * PreservationOptions Schema
 * Validates preservation settings for scene extension
 */
export const PreservationOptionsSchema = z.object({
  characters: z.boolean(),
  environment: z.boolean(),
  visualStyle: z.boolean(),
  audio: z.boolean(),
});

/**
 * ParentSceneSummary Schema
 * Validates cached parent scene summary
 */
export const ParentSceneSummarySchema = z.object({
  characters: z.array(z.string()),
  location: z.string(),
  lastMoment: z.string(),
  visualStyle: z.string(),
  audioState: z.string(),
});

/**
 * ExtensionMetadata Schema
 * Validates scene extension metadata
 */
export const ExtensionMetadataSchema = z.object({
  parentSceneId: z.string(),
  method: z.enum(['continue', 'cutTo', 'transition']),
  userDescription: z.string().optional(),
  preservation: PreservationOptionsSchema,
  sceneNumber: z.number().optional(),
  parentSummary: ParentSceneSummarySchema.optional(),
});

/**
 * OrphanMetadata Schema
 * Validates orphaned scene metadata
 */
export const OrphanMetadataSchema = z.object({
  isOrphaned: z.boolean(),
  originalParentId: z.string(),
  originalParentTitle: z.string(),
  orphanedAt: z.string(),
});

// ==================== Container Schemas ====================

/**
 * PromptSources Schema
 * Validates source tracking
 */
export const PromptSourcesSchema = z.object({
  text: z.string().optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  basePrompts: z.array(z.string()).optional(),
  template: z.string().optional(),
});

/**
 * IntermediateRelationships Schema
 * Validates version control relationships
 */
export const IntermediateRelationshipsSchema = z.object({
  parentId: z.string().optional(),
  childIds: z.array(z.string()).optional(),
  mixedFrom: z.array(z.string()).optional(),
  branchName: z.string().optional(),
});

/**
 * IntermediatePrompt Schema
 * Validates the complete intermediate prompt container
 */
export const IntermediatePromptSchema = z.object({
  id: z.string(),
  version: z.string(),
  created: z.date(),
  modified: z.date(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(z.string()),
  sources: PromptSourcesSchema,
  structure: IntermediateStructureSchema, // v2.0 only (strict validation)
  relationships: IntermediateRelationshipsSchema.optional(),
  extensionMetadata: ExtensionMetadataSchema.optional(),
  orphanMetadata: OrphanMetadataSchema.optional(),
});

// ==================== Legacy Format Schemas (for migration) ====================

/**
 * @deprecated Legacy Markdown format validation
 */
export const MarkdownFormatSchema = z.object({
  format: z.literal('markdown'),
  content: z.string(),
});

/**
 * @deprecated Legacy v1.0 validation (permissive for migration)
 */
export const IntermediateStructureV1Schema = z.union([
  z.object({
    temporal: z.any().optional(),
    visual: z.any().optional(),
    audio: z.any().optional(),
    camera: z.any().optional(),
    narrative: z.any().optional(),
  }),
  MarkdownFormatSchema,
]);

// ==================== Validation Helper Functions ====================

/**
 * Validate an intermediate structure and return typed result
 * @param data - The data to validate.
 * @returns A ZodSafeParseReturnType containing the validation result.
 */
export function validateIntermediateStructure(data: unknown) {
  return IntermediateStructureSchema.safeParse(data);
}

/**
 * Validate a complete intermediate prompt
 * @param data - The data to validate.
 * @returns A ZodSafeParseReturnType containing the validation result.
 */
export function validateIntermediatePrompt(data: unknown) {
  return IntermediatePromptSchema.safeParse(data);
}

/**
 * Validate with detailed error messages
 * @param data - The data to validate.
 * @param schema - The Zod schema to validate against.
 * @returns An object containing validity status and detailed errors/warnings.
 */
export function validateWithDetails(data: unknown, schema: z.ZodSchema) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return {
      valid: false,
      errors,
      warnings: [],
    };
  }

  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}

// ==================== Type Inference ====================

// Export inferred TypeScript types from Zod schemas
/** Validated intermediate structure type */
export type ValidatedIntermediateStructure = z.infer<typeof IntermediateStructureSchema>;
/** Validated intermediate prompt type */
export type ValidatedIntermediatePrompt = z.infer<typeof IntermediatePromptSchema>;
/** Validated visual section type */
export type ValidatedVisualSection = z.infer<typeof VisualSectionSchema>;
/** Validated temporal section type */
export type ValidatedTemporalSection = z.infer<typeof TemporalSectionSchema>;
/** Validated audio section type */
export type ValidatedAudioSection = z.infer<typeof AudioSectionSchema>;
/** Validated camera section type */
export type ValidatedCameraSection = z.infer<typeof CameraSectionSchema>;

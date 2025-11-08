// ==================== Zod Validation Schemas ====================
// Runtime validation for intermediate structures v2.0

import { z } from 'zod';

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
  metadata: z.object({
    generatedAt: z.string().optional(),
    transformationType: z.string().optional(),
    transformationParams: z.record(z.any()).optional(),
    parentId: z.string().optional(),
  }).optional(),
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
 */
export function validateIntermediateStructure(data: unknown) {
  return IntermediateStructureSchema.safeParse(data);
}

/**
 * Validate a complete intermediate prompt
 */
export function validateIntermediatePrompt(data: unknown) {
  return IntermediatePromptSchema.safeParse(data);
}

/**
 * Validate with detailed error messages
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
export type ValidatedIntermediateStructure = z.infer<typeof IntermediateStructureSchema>;
export type ValidatedIntermediatePrompt = z.infer<typeof IntermediatePromptSchema>;
export type ValidatedVisualSection = z.infer<typeof VisualSectionSchema>;
export type ValidatedTemporalSection = z.infer<typeof TemporalSectionSchema>;
export type ValidatedAudioSection = z.infer<typeof AudioSectionSchema>;
export type ValidatedCameraSection = z.infer<typeof CameraSectionSchema>;

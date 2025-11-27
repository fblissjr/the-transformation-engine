import type { Transformer } from './types';
import { sora2Transformer } from './sora2Transformer';
import { veo3Transformer } from './veo3Transformer';
import { genericTransformerV2 } from './genericTransformerV2';
import type { IntermediatePrompt, StructuredFormat } from '../../types/intermediate';
import { parseMarkdownIntermediate } from './markdownParser';

// Transformer registry
const transformers = new Map<string, Transformer>();

// Register built-in transformers
export function registerTransformer(transformer: Transformer): void {
  transformers.set(transformer.modelId, transformer);
}

// Get transformer by model ID
export function getTransformer(modelId: string): Transformer {
  return transformers.get(modelId) || genericTransformerV2;
}

// Get all available transformers
export function getAllTransformers(): Transformer[] {
  return Array.from(transformers.values());
}

// Transform intermediate to specific model format
export function transformToModel(
  intermediate: IntermediatePrompt,
  modelId: string
): string {
  const transformer = getTransformer(modelId);
  return transformer.transform(intermediate);
}

// Validate intermediate for specific model
export function validateForModel(
  intermediate: IntermediatePrompt,
  modelId: string
) {
  const transformer = getTransformer(modelId);
  if (transformer.validate) {
    return transformer.validate(intermediate);
  }
  return { valid: true, errors: [], warnings: [] };
}

// Auto-detect best transformer based on intermediate content
export function detectBestTransformer(
  intermediate: IntermediatePrompt
): Transformer {
  // Parse structure if markdown
  const structure = 'format' in intermediate.structure && intermediate.structure.format === 'markdown'
    ? parseMarkdownIntermediate(intermediate.structure.content)
    : intermediate.structure as StructuredFormat;

  // Check for Veo 3 indicators (audio-first)
  if (structure.audio?.dialogue ||
      (structure.audio?.ambient && structure.audio?.soundEffects)) {
    return veo3Transformer;
  }

  // Check for Sora 2 indicators (temporal progression heavy)
  if (structure.temporal?.segments &&
      structure.temporal.segments.length >= 3) {
    return sora2Transformer;
  }

  // Default to generic
  return genericTransformerV2;
}

// Initialize transformers on module load
registerTransformer(sora2Transformer);
registerTransformer(veo3Transformer);
registerTransformer(genericTransformerV2);

// Export transformers
export { sora2Transformer, veo3Transformer, genericTransformerV2 };
// V3 transformers (async, for IntermediateV3 format)
export { genericTransformer } from './genericTransformer';
export * from './types';

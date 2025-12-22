import type { Transformer } from './types';
import { sora2Transformer } from './sora2Transformer';
import { veo3Transformer } from './veo3Transformer';
import { genericTransformerV2 } from './genericTransformerV2';
import type { IntermediatePrompt } from '../../types/intermediate';

// Transformer registry
const transformers = new Map<string, Transformer>([
  ['sora2', sora2Transformer],
  ['veo3', veo3Transformer],
  ['generic', genericTransformerV2],
]);

// Get transformer by model ID
function getTransformer(modelId: string): Transformer {
  return transformers.get(modelId) || genericTransformerV2;
}

// Transform intermediate to specific model format
export function transformToModel(
  intermediate: IntermediatePrompt,
  modelId: string
): string {
  const transformer = getTransformer(modelId);
  return transformer.transform(intermediate);
}

// Export transformers for direct access if needed
export { sora2Transformer, veo3Transformer, genericTransformerV2 };
export * from './types';

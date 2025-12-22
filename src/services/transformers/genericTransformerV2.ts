/**
 * Generic Transformer (V2 Format)
 * Model-agnostic fallback transformer for IntermediatePrompt format
 */

import type { IntermediatePrompt } from '../../types/intermediate';
import type { Transformer } from './types';
import { normalizeStructure, getData, countWords } from './shared';

export const genericTransformerV2: Transformer = {
  name: 'Generic Transformer',
  modelId: 'generic',
  description: 'Model-agnostic transformer for any video generation model',

  transform(intermediate: IntermediatePrompt): string {
    const structure = normalizeStructure(intermediate);
    const data = getData(structure);

    const parts: string[] = [];

    // Visual elements
    if (data.visual) {
      if (data.visual.subjects) {
        const subjects = Array.isArray(data.visual.subjects)
          ? data.visual.subjects.join(', ')
          : data.visual.subjects;
        parts.push(subjects);
      }
      if (data.visual.setting) {
        parts.push(`in ${data.visual.setting}`);
      }
      if (data.visual.lighting) {
        parts.push(`with ${data.visual.lighting} lighting`);
      }
      if (data.visual.style) {
        parts.push(`${data.visual.style} style`);
      }
    }

    // Temporal/action elements
    if (data.temporal) {
      if (data.temporal.duration) {
        parts.push(`(${data.temporal.duration})`);
      }
      if (data.temporal.pacing) {
        parts.push(`${data.temporal.pacing} pacing`);
      }
    }

    // Camera elements
    if (data.camera) {
      if (data.camera.movement) {
        parts.push(`Camera: ${data.camera.movement}`);
      }
      if (data.camera.angles) {
        const angles = Array.isArray(data.camera.angles)
          ? data.camera.angles.join(', ')
          : data.camera.angles;
        parts.push(`Shot: ${angles}`);
      }
    }

    // Audio elements (optional)
    if (data.audio) {
      const audioElements: string[] = [];
      if (data.audio.music) {
        audioElements.push(`Music: ${data.audio.music}`);
      }
      if (data.audio.soundEffects) {
        const sfx = Array.isArray(data.audio.soundEffects)
          ? data.audio.soundEffects.join(', ')
          : data.audio.soundEffects;
        audioElements.push(`SFX: ${sfx}`);
      }
      if (audioElements.length > 0) {
        parts.push(audioElements.join('; '));
      }
    }

    return parts.filter(p => p && p.trim()).join('. ') + '.';
  },

  validate(intermediate: IntermediatePrompt) {
    const structure = normalizeStructure(intermediate);

    const errors: any[] = [];
    const warnings: any[] = [];

    // Basic validation - visual content recommended
    if (!structure.visual?.subjects && !structure.visual?.setting) {
      warnings.push({
        field: 'visual',
        message: 'Consider adding visual subjects or setting',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  estimateLength(intermediate: IntermediatePrompt): number {
    const structure = normalizeStructure(intermediate);
    let words = 0;

    if (structure.visual) {
      words += countWords(structure.visual.setting);
      words += countWords(structure.visual.style);
      words += countWords(structure.visual.subjects as string);
    }

    return words;
  },
};

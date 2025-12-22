/**
 * Shared transformer utilities
 * Common preprocessing and helper functions for all transformers
 */

import type { IntermediatePrompt, IntermediateStructure } from '../../types/intermediate';

/**
 * Internal representation for transformer data access
 * Flattens sections for easier access
 */
export interface TransformerData {
  visual?: {
    subject?: string[];
    setting?: string;
    environment?: string;
    colors?: string;
    lighting?: string;
    composition?: string;
    style?: string;
    subjects?: string | string[]; // Can be string or array
  };
  temporal?: Array<{
    time: string;
    description: string;
    camera?: string;
    visual?: string;
    audio?: string;
  }> | {
    duration?: string;
    pacing?: string;
    segments?: Array<{
      startTime: number;
      endTime: number;
      description: string;
      camera?: string;
      visual?: string;
      audio?: string;
    }>;
  };
  audio?: {
    dialogue?: string | string[];
    ambient?: string | string[];
    soundEffects?: string | string[];
    music?: string;
  };
  camera?: {
    movement?: string;
    angles?: string | string[];
    techniques?: string;
    lensDetails?: string;
  };
  narrative?: {
    beginning?: string;
    middle?: string;
    end?: string;
    arc?: string;
  };
}

/**
 * Normalize intermediate structure for transformer consumption
 * Handles both v2.0 structured format (with sections wrapper) and flat format
 */
export function normalizeStructure(intermediate: IntermediatePrompt): TransformerData {
  const structure = intermediate.structure;

  // Check if this is v2.0 format with sections wrapper
  if ('format' in structure && structure.format === 'structured' && 'sections' in structure) {
    const v2Structure = structure as IntermediateStructure;
    const data: TransformerData = {};

    if (v2Structure.sections?.visual) {
      data.visual = {
        ...v2Structure.sections.visual,
        subjects: v2Structure.sections.visual.subject, // alias
      };
    }
    if (v2Structure.sections?.temporal) {
      data.temporal = v2Structure.sections.temporal;
    }
    if (v2Structure.sections?.audio) {
      data.audio = v2Structure.sections.audio;
    }
    if (v2Structure.sections?.camera) {
      data.camera = v2Structure.sections.camera;
    }

    return data;
  }

  // Flat format (legacy/test data) - return as-is
  return structure as unknown as TransformerData;
}

/**
 * Get data from structure
 * For backward compatibility, returns the structure itself
 */
export function getData(structure: TransformerData): TransformerData {
  return structure;
}

/**
 * Count words in a string
 */
export function countWords(text?: string): number {
  return text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
}

/**
 * Format seconds to MM:SS timestamp
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Join non-empty strings with a separator
 */
export function joinNonEmpty(parts: (string | undefined)[], separator: string = '. '): string {
  return parts.filter(p => p && p.trim()).join(separator);
}

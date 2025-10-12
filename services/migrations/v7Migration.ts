// ==================== v7 Migration: Prompts to Intermediates ====================
// Migrates existing Prompt format to IntermediatePrompt format
// Preserves all data while adding structured representation

import type { Prompt } from '../../types';
import type { IntermediatePrompt, TemporalSegment } from '../../types/intermediate';

/**
 * Convert old Prompt format to IntermediatePrompt format
 * This preserves all existing data while adding new structure
 */
export function migratePromptToIntermediate(oldPrompt: Prompt): IntermediatePrompt {
  // Extract temporal segments from structured output (if it exists)
  const temporalSegments = extractTemporalSegments(oldPrompt.structuredOutput);

  // Parse visual details from structured output
  const visualDetails = extractVisualDetails(oldPrompt.structuredOutput);

  // Parse audio details
  const audioDetails = extractAudioDetails(oldPrompt.structuredOutput);

  // Parse camera details
  const cameraDetails = extractCameraDetails(oldPrompt.structuredOutput);

  return {
    id: `migrated_${oldPrompt.id}`,
    version: '1.0.0',
    created: new Date(oldPrompt.createdAt),
    modified: new Date(oldPrompt.createdAt), // Use createdAt since we don't have updatedAt
    title: oldPrompt.title,
    description: `Migrated from prompt: ${oldPrompt.title}`,
    tags: oldPrompt.tags ? JSON.parse(oldPrompt.tags) : [],

    sources: {
      text: oldPrompt.naturalLanguageInput,
      images: oldPrompt.mediaReferences?.filter(ref => ref.type === 'image').map(ref => ref.blobId || ref.dataUrl || ''),
      videos: oldPrompt.mediaReferences?.filter(ref => ref.type === 'video').map(ref => ref.blobId || ref.dataUrl || ''),
      basePrompts: [],
    },

    structure: {
      temporal: temporalSegments.length > 0 ? {
        totalDuration: 10, // Default duration
        segments: temporalSegments,
      } : undefined,
      visual: Object.keys(visualDetails).length > 0 ? visualDetails : undefined,
      audio: Object.keys(audioDetails).length > 0 ? audioDetails : undefined,
      camera: Object.keys(cameraDetails).length > 0 ? cameraDetails : undefined,
    },

    relationships: {
      // Note: old prompts don't have relationships
      parentId: undefined,
      childIds: [],
      mixedFrom: [],
    },
  };
}

// Helper: Extract temporal segments from YAML
function extractTemporalSegments(yaml: string): TemporalSegment[] {
  if (!yaml) return [];

  // Look for temporal_progression key
  const match = yaml.match(/temporal_progression:\s*\|\s*([\s\S]*?)(?=\n\w+:|$)/);
  if (!match) return [];

  const content = match[1];
  const segments: TemporalSegment[] = [];

  // Parse [00:00-00:03] style timestamps
  const timeRegex = /\[(\d+):(\d+)-(\d+):(\d+)\]\s*([^\[]+)/g;
  let m;
  while ((m = timeRegex.exec(content)) !== null) {
    const startMin = parseInt(m[1]);
    const startSec = parseInt(m[2]);
    const endMin = parseInt(m[3]);
    const endSec = parseInt(m[4]);
    const description = m[5].trim();

    segments.push({
      startTime: startMin * 60 + startSec,
      endTime: endMin * 60 + endSec,
      description,
    });
  }

  return segments;
}

// Helper: Extract visual details from YAML
function extractVisualDetails(yaml: string) {
  if (!yaml) return {};

  const visual: any = {};

  // Extract common keys
  const extractKey = (key: string): string | undefined => {
    // Match both simple values and multiline (|) values
    const simpleMatch = yaml.match(new RegExp(`${key}:\\s*["']?([^"'\\n|]+)["']?`));
    if (simpleMatch) return simpleMatch[1].trim();

    // Match multiline block (|)
    const multilineMatch = yaml.match(new RegExp(`${key}:\\s*\\|\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`));
    if (multilineMatch) return multilineMatch[1].trim();

    return undefined;
  };

  // Map YAML keys to visual structure
  visual.setting = extractKey('scene_setting') || extractKey('context') || extractKey('background_setting');

  const subjects = extractKey('subjects_and_actions') || extractKey('subject');
  visual.subjects = subjects ? subjects.split(',').map(s => s.trim()) : undefined;

  visual.environment = extractKey('visual_description') || extractKey('environment');
  visual.colors = extractKey('colors') || extractKey('color_palette');
  visual.lighting = extractKey('lighting') || extractKey('lighting_mood');
  visual.composition = extractKey('composition');
  visual.style = extractKey('style');

  // Remove undefined values
  Object.keys(visual).forEach(key => {
    if (visual[key] === undefined) delete visual[key];
  });

  return visual;
}

// Helper: Extract audio details from YAML
function extractAudioDetails(yaml: string) {
  if (!yaml) return {};

  const audio: any = {};

  const extractKey = (key: string): string | undefined => {
    // Match both simple values and multiline (|) values
    const simpleMatch = yaml.match(new RegExp(`${key}:\\s*["']?([^"'\\n|]+)["']?`));
    if (simpleMatch) return simpleMatch[1].trim();

    const multilineMatch = yaml.match(new RegExp(`${key}:\\s*\\|\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`));
    if (multilineMatch) return multilineMatch[1].trim();

    return undefined;
  };

  audio.dialogue = extractKey('dialogue');
  audio.ambient = extractKey('ambient') || extractKey('ambient_sounds');
  audio.soundEffects = extractKey('sound_effects') || extractKey('audio_design') || extractKey('audio_elements');
  audio.music = extractKey('music');

  // Remove undefined values
  Object.keys(audio).forEach(key => {
    if (audio[key] === undefined) delete audio[key];
  });

  return audio;
}

// Helper: Extract camera details from YAML
function extractCameraDetails(yaml: string) {
  if (!yaml) return {};

  const camera: any = {};

  const extractKey = (key: string): string | undefined => {
    // Match both simple values and multiline (|) values
    const simpleMatch = yaml.match(new RegExp(`${key}:\\s*["']?([^"'\\n|]+)["']?`));
    if (simpleMatch) return simpleMatch[1].trim();

    const multilineMatch = yaml.match(new RegExp(`${key}:\\s*\\|\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`));
    if (multilineMatch) return multilineMatch[1].trim();

    return undefined;
  };

  camera.movement = extractKey('camera_movement') || extractKey('camera_motion');
  camera.angles = extractKey('camera_angle') || extractKey('camera_angles');
  camera.techniques = extractKey('cinematography');

  // Remove undefined values
  Object.keys(camera).forEach(key => {
    if (camera[key] === undefined) delete camera[key];
  });

  return camera;
}

/**
 * Migrate all existing prompts to intermediates
 * Called once during DB upgrade from v6 to v7
 */
export async function migrateAllPromptsToIntermediates() {
  console.log('[v7 Migration] Starting migration of prompts to intermediates...');

  try {
    // Dynamic imports to avoid circular dependencies
    const dbService = await import('../dbService');
    const intermediateService = await import('../db/intermediateService');

    const prompts = await dbService.getPrompts();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    console.log(`[v7 Migration] Found ${prompts.length} prompts to migrate`);

    for (const prompt of prompts) {
      try {
        const intermediate = migratePromptToIntermediate(prompt);
        await intermediateService.createIntermediate(intermediate);
        results.success++;
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to migrate ${prompt.id}: ${error}`;
        results.errors.push(errorMsg);
        console.error(`[v7 Migration] ${errorMsg}`);
      }
    }

    console.log(`[v7 Migration] Complete: ${results.success} succeeded, ${results.failed} failed`);

    if (results.errors.length > 0) {
      console.error('[v7 Migration] Errors encountered:', results.errors);
    }

    return results;
  } catch (error) {
    console.error('[v7 Migration] Fatal error during migration:', error);
    throw error;
  }
}

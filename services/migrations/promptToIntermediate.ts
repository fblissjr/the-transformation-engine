// ==================== Prompt to Intermediate Migration ====================
// Reverse migration: Parse existing YAML/JSON prompts back to intermediate format
// Used when editing existing prompts as intermediates

import type { Prompt } from '../../types';
import type {
  IntermediatePrompt,
  TemporalSegment,
  VisualStructure,
  AudioStructure,
  CameraStructure,
} from '../../types/intermediate';

// Parse YAML or JSON string to object
function parseStructuredOutput(output: string): Record<string, any> {
  if (!output || !output.trim()) return {};

  try {
    // Try JSON first
    return JSON.parse(output);
  } catch {
    // If not JSON, do simple YAML parsing (key: value format)
    const result: Record<string, any> = {};
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        result[key] = value;
      }
    }

    return result;
  }
}

// Extract temporal segments from structured output
function extractTemporalSegments(parsed: Record<string, any>): TemporalSegment[] {
  const segments: TemporalSegment[] = [];

  // Look for temporal_progression key (Sora 2 style)
  if (parsed.temporal_progression) {
    const progression = parsed.temporal_progression;
    if (typeof progression === 'string') {
      // Parse string format: "[00:00-00:03] description..."
      const segmentMatches = progression.matchAll(/\[(\d{2}):(\d{2})-(\d{2}):(\d{2})\]\s*([^\[]+)/g);
      for (const match of segmentMatches) {
        const startMins = parseInt(match[1]);
        const startSecs = parseInt(match[2]);
        const endMins = parseInt(match[3]);
        const endSecs = parseInt(match[4]);
        const description = match[5].trim();

        segments.push({
          startTime: startMins * 60 + startSecs,
          endTime: endMins * 60 + endSecs,
          description,
          camera: '',
          visual: '',
          audio: '',
        });
      }
    }
  }

  // If no temporal segments found, create a single segment from duration
  if (segments.length === 0 && parsed.visual_description) {
    segments.push({
      startTime: 0,
      endTime: 10, // Default 10 seconds
      description: parsed.visual_description,
      camera: parsed.camera_movement || '',
      visual: '',
      audio: parsed.audio_design || '',
    });
  }

  return segments;
}

// Extract visual structure
function extractVisualStructure(parsed: Record<string, any>): VisualStructure | undefined {
  const visual: VisualStructure = {};

  // Sora 2 style
  if (parsed.visual_description) {
    visual.setting = parsed.visual_description;
  }
  if (parsed.cinematography) {
    visual.style = parsed.cinematography;
  }
  if (parsed.lighting) {
    visual.lighting = parsed.lighting;
  }
  if (parsed.style) {
    visual.style = parsed.style;
  }

  // Veo 3 style
  if (parsed.subject) {
    visual.subjects = [parsed.subject];
  }
  if (parsed.context) {
    visual.environment = parsed.context;
  }
  if (parsed.background_setting) {
    visual.environment = parsed.background_setting;
  }
  if (parsed.lighting_mood) {
    visual.lighting = parsed.lighting_mood;
  }
  if (parsed.composition) {
    visual.composition = parsed.composition;
  }

  return Object.keys(visual).length > 0 ? visual : undefined;
}

// Extract audio structure
function extractAudioStructure(parsed: Record<string, any>): AudioStructure | undefined {
  const audio: AudioStructure = {};

  // Sora 2 style
  if (parsed.audio_design) {
    audio.ambient = parsed.audio_design;
  }

  // Veo 3 style
  if (parsed.audio_elements) {
    // Try to split audio_elements into dialogue and ambient
    const audioText = parsed.audio_elements;
    if (typeof audioText === 'string') {
      // Look for quoted dialogue
      const dialogueMatch = audioText.match(/"([^"]+)"/);
      if (dialogueMatch) {
        audio.dialogue = dialogueMatch[0];
        audio.ambient = audioText.replace(dialogueMatch[0], '').trim();
      } else {
        audio.ambient = audioText;
      }
    }
  }

  return Object.keys(audio).length > 0 ? audio : undefined;
}

// Extract camera structure
function extractCameraStructure(parsed: Record<string, any>): CameraStructure | undefined {
  const camera: CameraStructure = {};

  // Sora 2 style
  if (parsed.camera_movement) {
    camera.movement = parsed.camera_movement;
  }
  if (parsed.cinematography) {
    camera.techniques = parsed.cinematography;
  }

  // Veo 3 style
  if (parsed.camera_motion) {
    camera.movement = parsed.camera_motion;
  }

  return Object.keys(camera).length > 0 ? camera : undefined;
}

// Main function: Convert Prompt to IntermediatePrompt
export function parsePromptToIntermediate(prompt: Prompt): IntermediatePrompt {
  const parsed = parseStructuredOutput(prompt.structuredOutput);

  const temporalSegments = extractTemporalSegments(parsed);
  const visual = extractVisualStructure(parsed);
  const audio = extractAudioStructure(parsed);
  const camera = extractCameraStructure(parsed);

  // Parse tags from JSON string
  let parsedTags: string[] = [];
  try {
    parsedTags = typeof prompt.tags === 'string' ? JSON.parse(prompt.tags) : [];
  } catch {
    parsedTags = [];
  }

  return {
    id: `parsed_${prompt.id}`,
    version: '1.0.0',
    created: new Date(),
    modified: new Date(),
    title: prompt.title,
    description: `Parsed from existing prompt: ${prompt.title}`,
    tags: parsedTags,

    sources: {
      text: prompt.naturalLanguageInput,
    },

    structure: {
      temporal: temporalSegments.length > 0 ? { segments: temporalSegments } : undefined,
      visual,
      audio,
      camera,
      narrative: undefined,
    },

    relationships: undefined,
  };
}

// Helper: Detect which model the prompt was generated for
export function detectPromptModel(prompt: Prompt): 'sora2' | 'veo3' | 'generic' {
  const parsed = parseStructuredOutput(prompt.structuredOutput);

  // Veo 3 indicators
  if (parsed.audio_elements || parsed.veo3_specs || parsed.subject) {
    return 'veo3';
  }

  // Sora 2 indicators
  if (parsed.temporal_progression || parsed.technical_specs) {
    return 'sora2';
  }

  return 'generic';
}

import type { IntermediatePrompt, StructuredFormat } from '../../types/intermediate';
import type { Transformer } from './types';
import { parseMarkdownIntermediate, type ParsedIntermediate } from './markdownParser';

export const genericTransformer: Transformer = {
  name: 'Generic Transformer',
  modelId: 'generic',
  description: 'Generic YAML format suitable for any model',

  transform(intermediate: IntermediatePrompt): string {
    // Parse markdown content if present (type guard)
    const structure: StructuredFormat | ParsedIntermediate = 'format' in intermediate.structure && intermediate.structure.format === 'markdown'
      ? parseMarkdownIntermediate(intermediate.structure.content)
      : intermediate.structure as StructuredFormat;

    let output = '```yaml\n';

    // Simple key-value structure covering all sections

    // Scene overview
    if (intermediate.sources.text) {
      output += `scene: "${intermediate.sources.text}"\n\n`;
    }

    // Visuals (combined)
    if (structure.visual) {
      const v = structure.visual;
      const visual_parts: string[] = [];

      if (v.setting) visual_parts.push(`Setting: ${v.setting}`);
      if (v.subjects) {
        const subjectsStr = Array.isArray(v.subjects) ? v.subjects.join(', ') : v.subjects;
        visual_parts.push(`Subjects: ${subjectsStr}`);
      }
      if (v.environment) visual_parts.push(v.environment);
      if (v.colors) visual_parts.push(`Colors: ${v.colors}`);
      if (v.lighting) visual_parts.push(`Lighting: ${v.lighting}`);
      if (v.composition) visual_parts.push(`Composition: ${v.composition}`);
      if (v.style) visual_parts.push(`Style: ${v.style}`);

      if (visual_parts.length > 0) {
        output += `visuals: "${visual_parts.join('. ')}"\n\n`;
      }
    }

    // Audio (combined)
    if (structure.audio) {
      const a = structure.audio;
      const audio_parts: string[] = [];

      if (a.dialogue) audio_parts.push(`Dialogue: ${a.dialogue}`);
      if (a.ambient) audio_parts.push(`Ambient: ${a.ambient}`);
      if (a.soundEffects) audio_parts.push(`SFX: ${a.soundEffects}`);
      if (a.music) audio_parts.push(`Music: ${a.music}`);

      if (audio_parts.length > 0) {
        output += `audio: "${audio_parts.join('; ')}"\n\n`;
      }
    }

    // Camera (combined)
    if (structure.camera) {
      const c = structure.camera;
      const camera_parts: string[] = [];

      if (c.movement) camera_parts.push(c.movement);
      if (c.angles) camera_parts.push(`Angles: ${c.angles}`);
      if (c.techniques) camera_parts.push(c.techniques);

      if (camera_parts.length > 0) {
        output += `camera: "${camera_parts.join('. ')}"\n\n`;
      }
    }

    // Temporal (if present)
    if (structure.temporal?.segments) {
      output += 'timeline: |\n';
      for (const seg of structure.temporal.segments) {
        output += `  ${seg.startTime}s-${seg.endTime}s: ${seg.description}\n`;
      }
      output += '\n';
    }

    output += '```';
    return output;
  },

  validate(intermediate: IntermediatePrompt) {
    // Generic transformer is very permissive
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  },
};

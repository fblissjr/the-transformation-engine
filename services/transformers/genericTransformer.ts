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

    // Handle 'sections' wrapper (Phase 2 format)
    const data = (structure as any).sections || structure;

    let output = '';

    // Visual Elements (attribute-value style)
    if (data.visual) {
      const v = data.visual;

      if (v.subjects) {
        const subjectsStr = Array.isArray(v.subjects) ? v.subjects.join(', ') : v.subjects;
        output += `Subject: ${subjectsStr}\n\n`;
      }

      if (v.setting) {
        output += `Setting: ${v.setting}\n\n`;
      }

      if (v.environment) {
        output += `Environment: ${v.environment}\n\n`;
      }

      if (v.colors) {
        output += `Colors: ${v.colors}\n\n`;
      }

      if (v.lighting) {
        output += `Lighting: ${v.lighting}\n\n`;
      }

      if (v.composition) {
        output += `Composition: ${v.composition}\n\n`;
      }

      if (v.style) {
        output += `Style: ${v.style}\n\n`;
      }
    }

    // Temporal Progression (handle both array and segments format)
    const temporal = data.temporal;
    if (temporal) {
      if (Array.isArray(temporal)) {
        // Phase 2 format: array of time segments
        output += 'Timeline:\n';
        for (const seg of temporal) {
          output += `  ${seg.time}: ${seg.description}\n`;
        }
        output += '\n';
      } else if (temporal.segments) {
        // Phase 1 format: segments array
        output += 'Timeline:\n';
        for (const seg of temporal.segments) {
          output += `  ${seg.startTime}s-${seg.endTime}s: ${seg.description}\n`;
        }
        output += '\n';
      }
    }

    // Camera
    if (data.camera) {
      const c = data.camera;

      if (c.movement) {
        output += `Camera Movement: ${c.movement}\n\n`;
      }

      if (c.angles) {
        output += `Camera Angles: ${c.angles}\n\n`;
      }

      if (c.techniques) {
        output += `Camera Techniques: ${c.techniques}\n\n`;
      }
    }

    // Audio (optional)
    if (data.audio) {
      const a = data.audio;

      if (a.dialogue) {
        output += `Dialogue: ${a.dialogue}\n\n`;
      }

      if (a.ambient) {
        output += `Ambient Sound: ${a.ambient}\n\n`;
      }

      if (a.soundEffects) {
        output += `Sound Effects: ${a.soundEffects}\n\n`;
      }

      if (a.music) {
        output += `Music: ${a.music}\n\n`;
      }
    }

    return output.trim();
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

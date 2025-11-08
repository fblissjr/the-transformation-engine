import type { IntermediatePrompt, StructuredFormat } from '../../types/intermediate';
import type { Transformer } from './types';
import { parseMarkdownIntermediate, type ParsedIntermediate } from './markdownParser';

export const veo3Transformer: Transformer = {
  name: 'Veo 3 Transformer',
  modelId: 'veo3',
  description: 'Transforms intermediate to Veo 3 YAML format (8s clips, audio-first, 200-400 words)',

  transform(intermediate: IntermediatePrompt): string {
    // Parse markdown content if present (type guard)
    const structure: StructuredFormat | ParsedIntermediate = 'format' in intermediate.structure && intermediate.structure.format === 'markdown'
      ? parseMarkdownIntermediate(intermediate.structure.content)
      : intermediate.structure as StructuredFormat;

    let output = '```yaml\n';

    // 1. Subject (30-50 words for consistency)
    if (structure.visual?.subjects || structure.visual?.setting) {
      const subjects = Array.isArray(structure.visual.subjects)
        ? structure.visual.subjects.join(', ')
        : structure.visual.subjects || 'Scene';
      const setting = structure.visual.setting || '';

      output += `subject: "${subjects}`;
      if (setting) {
        output += ` in ${setting}`;
      }
      output += '"\n\n';
    }

    // 2. Context (where/when)
    if (structure.visual?.setting || structure.visual?.environment) {
      const parts: string[] = [];
      if (structure.visual.setting) parts.push(structure.visual.setting);
      if (structure.visual.environment) parts.push(structure.visual.environment);

      output += `context: "${parts.join('. ')}"\n\n`;
    }

    // 3. Action (narrative progression)
    if (structure.temporal?.segments || structure.narrative) {
      let actionText = '';

      // Prefer narrative structure if available
      if (structure.narrative) {
        const parts: string[] = [];
        if (structure.narrative.beginning) parts.push(structure.narrative.beginning);
        if (structure.narrative.middle) parts.push(structure.narrative.middle);
        if (structure.narrative.end) parts.push(structure.narrative.end);
        actionText = parts.join('. ');
      } else if (structure.temporal?.segments) {
        // Convert temporal segments to narrative
        actionText = structure.temporal.segments
          .map(seg => seg.description)
          .join('. ');
      }

      if (actionText) {
        output += `action: "${actionText}"\n\n`;
      }
    }

    // 4. Style (visual aesthetic)
    if (structure.visual?.style || structure.visual?.colors) {
      const parts: string[] = [];
      if (structure.visual.style) parts.push(structure.visual.style);
      if (structure.visual.colors) parts.push(`Color palette: ${structure.visual.colors}`);

      output += `style: "${parts.join('. ')}"\n\n`;
    }

    // 5. Camera Motion (movement and angles)
    if (structure.camera?.movement || structure.camera?.angles) {
      const parts: string[] = [];
      if (structure.camera.movement) parts.push(structure.camera.movement);
      if (structure.camera.angles) parts.push(structure.camera.angles);

      output += `camera_motion: "${parts.join('. ')}"\n\n`;
    }

    // 6. Audio Elements (CRITICAL for Veo 3 - audio-first model)
    if (structure.audio) {
      const audio = structure.audio;
      const elements: string[] = [];

      // Dialogue (with quotation marks per Veo 3 requirements)
      if (audio.dialogue) {
        elements.push(`Dialogue: "${audio.dialogue}"`);
      }

      // Ambient sounds
      if (audio.ambient) {
        elements.push(`Ambient: ${audio.ambient}`);
      }

      // Sound effects
      if (audio.soundEffects) {
        elements.push(`SFX: ${audio.soundEffects}`);
      }

      // Music
      if (audio.music) {
        elements.push(`Music: ${audio.music}`);
      }

      if (elements.length > 0) {
        output += `audio_elements: "${elements.join('; ')}"\n\n`;
      } else {
        // Audio is REQUIRED for Veo 3 - add placeholder warning
        output += `audio_elements: "WARNING: Audio required for Veo 3 - add dialogue, ambient sounds, or music"\n\n`;
      }
    } else {
      // No audio structure at all
      output += `audio_elements: "WARNING: Audio required for Veo 3 - add dialogue, ambient sounds, or music"\n\n`;
    }

    // 7. Lighting Mood (lighting + emotional tone)
    if (structure.visual?.lighting) {
      output += `lighting_mood: "${structure.visual.lighting}"\n\n`;
    }

    // 8. Background Setting (detailed environment)
    if (structure.visual?.environment) {
      output += `background_setting: "${structure.visual.environment}"\n\n`;
    }

    // 9. Composition (framing, visual hierarchy)
    if (structure.visual?.composition) {
      output += `composition: "${structure.visual.composition}"\n`;
    }

    output += '```';

    return output;
  },

  validate(intermediate: IntermediatePrompt) {
    const structure: StructuredFormat | ParsedIntermediate = 'format' in intermediate.structure && intermediate.structure.format === 'markdown'
      ? parseMarkdownIntermediate(intermediate.structure.content)
      : intermediate.structure as StructuredFormat;

    const errors: any[] = [];
    const warnings: any[] = [];

    // Audio is REQUIRED for Veo 3
    if (!structure.audio ||
        (!structure.audio.dialogue &&
         !structure.audio.ambient &&
         !structure.audio.soundEffects)) {
      errors.push({
        field: 'audio',
        message: 'Audio elements required for Veo 3 (dialogue, ambient sounds, or sound effects)',
        severity: 'error',
      });
    }

    // Subject should be 30-50 words for consistency
    if (structure.visual?.subjects) {
      const subjectText = Array.isArray(structure.visual.subjects)
        ? structure.visual.subjects.join(' ')
        : structure.visual.subjects;
      const wordCount = subjectText.split(/\s+/).length;

      if (wordCount < 30) {
        warnings.push({
          field: 'subject',
          message: `Subject description short (${wordCount} words) - recommend 30-50 words for character consistency`,
        });
      }
    }

    // Check narrative/action present
    if (!structure.temporal?.segments && !structure.narrative) {
      warnings.push({
        field: 'action',
        message: 'Missing action/narrative - Veo 3 works best with clear story progression',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  estimateLength(intermediate: IntermediatePrompt): number {
    const structure: StructuredFormat | ParsedIntermediate = 'format' in intermediate.structure && intermediate.structure.format === 'markdown'
      ? parseMarkdownIntermediate(intermediate.structure.content)
      : intermediate.structure as StructuredFormat;

    // Rough word count estimation (200-400 words optimal)
    let words = 0;

    // Each field contributes words
    const countWords = (text?: string) => text ? text.split(/\s+/).length : 0;

    if (structure.visual) {
      words += countWords(structure.visual.setting);
      words += countWords(structure.visual.environment);
      words += countWords(structure.visual.style);
    }

    if (structure.temporal?.segments) {
      words += structure.temporal.segments.reduce((sum, seg) => {
        return sum + countWords(seg.description);
      }, 0);
    }

    if (structure.audio) {
      words += countWords(structure.audio.dialogue);
      words += countWords(structure.audio.ambient);
      words += countWords(structure.audio.soundEffects);
    }

    return words;
  },
};

import type { IntermediatePrompt } from '../../types/intermediate';
import type { Transformer } from './types';
import { normalizeStructure, getData, countWords } from './shared';

export const veo3Transformer: Transformer = {
  name: 'Veo 3 Transformer',
  modelId: 'veo3',
  description: 'Transforms intermediate to Veo 3 YAML format (8s clips, audio-first, 200-400 words)',

  transform(intermediate: IntermediatePrompt): string {
    const structure = normalizeStructure(intermediate);
    const data = getData(structure);

    let output = '';

    // 1. Subject (30-50 words for consistency)
    if (data.visual?.subjects || data.visual?.setting) {
      const subjects = Array.isArray(data.visual.subjects)
        ? data.visual.subjects.join(', ')
        : data.visual.subjects || 'Scene';
      const setting = data.visual.setting || '';

      output += `subject: "${subjects}`;
      if (setting) {
        output += ` in ${setting}`;
      }
      output += '"\n\n';
    }

    // 2. Context (where/when)
    if (data.visual?.setting || data.visual?.environment) {
      const parts: string[] = [];
      if (data.visual.setting) parts.push(data.visual.setting);
      if (data.visual.environment) parts.push(data.visual.environment);

      output += `context: "${parts.join('. ')}"\n\n`;
    }

    // 3. Action (narrative progression)
    const temporal = data.temporal;
    if (temporal || data.narrative) {
      let actionText = '';

      // Prefer narrative structure if available
      if (data.narrative) {
        const parts: string[] = [];
        if (data.narrative.beginning) parts.push(data.narrative.beginning);
        if (data.narrative.middle) parts.push(data.narrative.middle);
        if (data.narrative.end) parts.push(data.narrative.end);
        actionText = parts.join('. ');
      } else if (temporal) {
        // Convert temporal segments to narrative
        if (Array.isArray(temporal)) {
          // Phase 2 format
          actionText = temporal.map(seg => seg.description).join('. ');
        } else if (temporal.segments) {
          // Phase 1 format
          actionText = temporal.segments.map(seg => seg.description).join('. ');
        }
      }

      if (actionText) {
        output += `action: "${actionText}"\n\n`;
      }
    }

    // 4. Style (visual aesthetic)
    if (data.visual?.style || data.visual?.colors) {
      const parts: string[] = [];
      if (data.visual.style) parts.push(data.visual.style);
      if (data.visual.colors) parts.push(`Color palette: ${data.visual.colors}`);

      output += `style: "${parts.join('. ')}"\n\n`;
    }

    // 5. Camera Motion (movement and angles)
    if (data.camera?.movement || data.camera?.angles) {
      const parts: string[] = [];
      if (data.camera.movement) parts.push(data.camera.movement);
      if (data.camera.angles) parts.push(data.camera.angles);

      output += `camera_motion: "${parts.join('. ')}"\n\n`;
    }

    // 6. Audio Elements (Optional - Veo 3 can infer if not specified)
    if (data.audio) {
      const audio = data.audio;
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

      // Only include audio_elements if we have actual content
      if (elements.length > 0) {
        output += `audio_elements: "${elements.join('; ')}"\n\n`;
      }
    }

    // 7. Lighting Mood (lighting + emotional tone)
    if (data.visual?.lighting) {
      output += `lighting_mood: "${data.visual.lighting}"\n\n`;
    }

    // 8. Background Setting (detailed environment)
    if (data.visual?.environment) {
      output += `background_setting: "${data.visual.environment}"\n\n`;
    }

    // 9. Composition (framing, visual hierarchy)
    if (data.visual?.composition) {
      output += `composition: "${data.visual.composition}"\n`;
    }

    return output;
  },

  validate(intermediate: IntermediatePrompt) {
    const structure = normalizeStructure(intermediate);

    const errors: any[] = [];
    const warnings: any[] = [];

    // Audio is OPTIONAL for Veo 3 (model can infer), but recommended
    if (!structure.audio ||
        (!structure.audio.dialogue &&
         !structure.audio.ambient &&
         !structure.audio.soundEffects)) {
      warnings.push({
        field: 'audio',
        message: 'Audio elements recommended for Veo 3 (dialogue, ambient sounds, or sound effects) - model will infer if not specified',
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
    const structure = normalizeStructure(intermediate);

    // Rough word count estimation (200-400 words optimal)
    let words = 0;

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

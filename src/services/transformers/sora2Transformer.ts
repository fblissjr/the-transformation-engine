import type { IntermediatePrompt, StructuredFormat } from '../../types/intermediate';
import type { Transformer } from './types';
import { parseMarkdownIntermediate, type ParsedIntermediate } from './markdownParser';

export const sora2Transformer: Transformer = {
  name: 'Sora 2 Transformer',
  modelId: 'sora2',
  description: 'Transforms intermediate to Sora 2 YAML format (10s clips, 2500 char limit)',

  transform(intermediate: IntermediatePrompt): string {
    // Parse markdown content if present (type guard)
    const structure: StructuredFormat | ParsedIntermediate = 'format' in intermediate.structure && intermediate.structure.format === 'markdown'
      ? parseMarkdownIntermediate(intermediate.structure.content)
      : intermediate.structure as StructuredFormat;

    // Handle 'sections' wrapper (Phase 2 format)
    const data = (structure as any).sections || structure;

    let output = '';

    // 1. Temporal Progression (CRITICAL - embedded timestamps)
    const temporal = data.temporal;
    if (temporal?.segments || Array.isArray(temporal)) {
      output += 'temporal_progression: |\n';

      const segments = Array.isArray(temporal) ? temporal : temporal.segments;
      for (const seg of segments) {
        // Handle both Phase 1 (startTime/endTime) and Phase 2 (time string) formats
        let start, end;
        if (seg.time) {
          // Phase 2 format: "0-3s"
          const match = seg.time.match(/(\d+)-(\d+)s/);
          if (match) {
            start = formatTime(parseInt(match[1]));
            end = formatTime(parseInt(match[2]));
          } else {
            start = seg.time;
            end = seg.time;
          }
        } else {
          // Phase 1 format
          start = formatTime(seg.startTime);
          end = formatTime(seg.endTime);
        }

        output += `  [${start}-${end}] ${seg.description}`;

        // Add camera info if present
        if (seg.camera) {
          output += ` Camera: ${seg.camera}`;
        }

        // Add visual changes if present
        if (seg.visual) {
          output += ` ${seg.visual}`;
        }

        output += '\n\n';
      }
    }

    // 2. Visual Description (comprehensive detail)
    if (data.visual) {
      const visual = data.visual;
      const parts: string[] = [];

      if (visual.setting) parts.push(visual.setting);
      if (visual.environment) parts.push(visual.environment);
      if (visual.colors) parts.push(visual.colors);

      if (parts.length > 0) {
        output += 'visual_description: |\n';
        output += `  ${parts.join('. ')}\n\n`;
      }
    }

    // 3. Camera Movement (specific techniques)
    if (data.camera?.movement) {
      output += `camera_movement: "${data.camera.movement}"\n\n`;
    }

    // 4. Cinematography (framing, composition)
    if (data.camera?.techniques || data.visual?.composition) {
      const parts: string[] = [];
      if (data.visual?.composition) parts.push(data.visual.composition);
      if (data.camera?.techniques) parts.push(data.camera.techniques);

      output += `cinematography: "${parts.join('. ')}"\n\n`;
    }

    // 5. Lighting (detailed lighting setup)
    if (data.visual?.lighting) {
      output += `lighting: "${data.visual.lighting}"\n\n`;
    }

    // 6. Audio Design (optional but recommended for Sora 2)
    if (data.audio) {
      const audio = data.audio;
      const parts: string[] = [];

      if (audio.ambient) parts.push(audio.ambient);
      if (audio.soundEffects) parts.push(audio.soundEffects);
      if (audio.music) parts.push(audio.music);

      if (parts.length > 0) {
        output += `audio_design: "${parts.join(', ')}"\n\n`;
      }
    }

    // 7. Style (visual aesthetic)
    if (data.visual?.style) {
      output += `style: "${data.visual.style}"\n`;
    }

    // Check character limit (2500 chars is HARD LIMIT for Sora 2)
    if (output.length > 2500) {
      console.warn(`WARNING: Sora 2 output exceeds 2500 char limit: ${output.length} chars`);
      // Truncate with warning
      output = output.substring(0, 2497) + '...';
    }

    return output;
  },

  validate(intermediate: IntermediatePrompt) {
    const structure: StructuredFormat | ParsedIntermediate = 'format' in intermediate.structure && intermediate.structure.format === 'markdown'
      ? parseMarkdownIntermediate(intermediate.structure.content)
      : intermediate.structure as StructuredFormat;

    const errors: any[] = [];
    const warnings: any[] = [];

    // Check for temporal progression (highly recommended)
    if (!structure.temporal?.segments?.length) {
      warnings.push({
        field: 'temporal',
        message: 'Missing temporal progression - Sora 2 works best with explicit timeline',
      });
    }

    // Check for visual details
    if (!structure.visual) {
      errors.push({
        field: 'visual',
        message: 'Missing visual details - required for Sora 2',
        severity: 'error',
      });
    }

    // Estimate length and warn if too long
    const estimatedLength = this.estimateLength!(intermediate);
    if (estimatedLength > 2500) {
      warnings.push({
        field: 'length',
        message: `Estimated output ${estimatedLength} chars exceeds Sora 2 limit (2500 chars)`,
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

    // Rough estimation
    let length = 100; // Base YAML structure

    // Temporal
    if (structure.temporal?.segments) {
      length += structure.temporal.segments.reduce((sum, seg) => {
        return sum + seg.description.length + (seg.camera?.length || 0) + (seg.visual?.length || 0) + 50;
      }, 0);
    }

    // Visual
    if (structure.visual) {
      const v = structure.visual;
      length += (v.setting?.length || 0) + (v.environment?.length || 0) + (v.colors?.length || 0);
      length += (v.lighting?.length || 0) + (v.composition?.length || 0) + (v.style?.length || 0);
    }

    // Audio
    if (structure.audio) {
      const a = structure.audio;
      length += (a.ambient?.length || 0) + (a.soundEffects?.length || 0) + (a.music?.length || 0);
    }

    // Camera
    if (structure.camera) {
      length += (structure.camera.movement?.length || 0);
      length += (structure.camera.techniques?.length || 0);
    }

    return length;
  },
};

// Helper: Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

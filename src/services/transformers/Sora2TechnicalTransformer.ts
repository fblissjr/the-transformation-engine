/**
 * Sora2TechnicalTransformer
 * Transforms IntermediateV3 → Sora 2 Technical Style format
 *
 * Emphasizes precise technical details and specifications
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import { TransformerUtils } from './TransformerUtils';

export class Sora2TechnicalTransformer {
  /**
   * Transform IntermediateV3 to Sora 2 technical style
   * More detailed and specific than narrative style
   */
  async transform(
    intermediate: IntermediateV3,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    try {
      const { components } = intermediate;

      // Resolve all components with technical emphasis
      let cinematography: string;
      if (components.cinematography.type === 'text') {
        cinematography = components.cinematography.text;
      } else {
        const cameraData = await TransformerUtils.resolveComponent(
          components.cinematography,
          objectLibrary
        );
        cinematography = TransformerUtils.formatCamera(cameraData);
      }

      let subject: string;
      if (components.subject.type === 'text') {
        subject = components.subject.text;
      } else {
        const characterData = await TransformerUtils.resolveComponent(
          components.subject,
          objectLibrary
        );
        subject = TransformerUtils.formatCharacter(characterData);
      }

      const action = TransformerUtils.formatAction(components.action);
      const context = await TransformerUtils.resolveContextComponent(
        components.context,
        objectLibrary
      );
      const style = TransformerUtils.formatStyle(components.style);

      // Construct technical specification format
      const lines: string[] = [];

      lines.push('SHOT SPECIFICATION:');
      lines.push(`Camera: ${cinematography}`);
      lines.push('');
      lines.push('SUBJECT:');
      lines.push(subject);
      lines.push('');
      lines.push('ACTION:');
      lines.push(action);
      lines.push('');
      lines.push('CONTEXT:');
      lines.push(context);

      if (style) {
        lines.push('');
        lines.push('VISUAL STYLE:');
        lines.push(style);
      }

      // Add audio specifications if present
      if (intermediate.audio && intermediate.audio.length > 0) {
        const audioText = TransformerUtils.formatAudio(intermediate.audio);
        if (audioText) {
          lines.push('');
          lines.push('AUDIO:');
          lines.push(audioText);
        }
      }

      return lines.join('\n');
    } catch (error) {
      console.error('[Sora2TechnicalTransformer] Error:', error);
      throw new Error(`Failed to transform to Sora 2 Technical format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const sora2TechnicalTransformer = new Sora2TechnicalTransformer();

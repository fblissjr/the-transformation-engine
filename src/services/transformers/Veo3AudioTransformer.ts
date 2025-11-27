/**
 * Veo3AudioTransformer
 * Transforms IntermediateV3 → Veo 3.1 Audio-Focused format
 *
 * Method #6: Audio-first prompting with preserved Veo 3.1 syntax
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import { TransformerUtils } from './TransformerUtils';

/**
 * Transformer class for converting IntermediateV3 objects into Veo 3.1 Audio-Focused format.
 * This method prioritizes audio elements while providing visual context.
 */
export class Veo3AudioTransformer {
  /**
   * Transform IntermediateV3 to Veo 3.1 audio-focused format
   * Emphasizes audio elements with visual context
   *
   * @param intermediate - The intermediate V3 prompt object.
   * @param objectLibrary - The object library service to resolve components.
   * @returns A Promise resolving to the transformed Veo 3.1 audio-focused string.
   * @throws Error if transformation fails.
   */
  async transform(
    intermediate: IntermediateV3,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    try {
      const { components } = intermediate;
      const lines: string[] = [];

      // AUDIO FIRST - if present (expanded for Veo 3.1 V2A)
      if (intermediate.audio && intermediate.audio.length > 0) {
        lines.push('AUDIO SPECIFICATION:');
        // Use expanded audio format for 45+ words target
        lines.push(TransformerUtils.formatAudioExpanded(intermediate.audio));
        lines.push('');
        lines.push('VISUAL CONTEXT:');
      }

      // Resolve visual components (handles text, object_reference, and multi_subject)
      const subject = await TransformerUtils.resolveSubjectComponent(
        components.subject,
        objectLibrary
      );

      const action = TransformerUtils.formatAction(components.action);
      const context = await TransformerUtils.resolveContextComponent(
        components.context,
        objectLibrary
      );

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

      const style = TransformerUtils.formatStyle(components.style);

      // Construct visual context
      lines.push(`${subject} ${action} ${context}. ${cinematography}. ${style}.`);

      return lines.join('\n');
    } catch (error) {
      console.error('[Veo3AudioTransformer] Error:', error);
      throw new Error(`Failed to transform to Veo 3.1 Audio format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const veo3AudioTransformer = new Veo3AudioTransformer();

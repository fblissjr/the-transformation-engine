/**
 * GenericTransformer
 * Transforms IntermediateV3 → Generic model-agnostic format
 *
 * Universal fallback for any video generation model
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import { TransformerUtils } from './TransformerUtils';

/**
 * Transformer class for converting IntermediateV3 objects into a generic model-agnostic format.
 * Acts as a universal fallback for any video generation model.
 */
export class GenericTransformer {
  /**
   * Transform IntermediateV3 to generic format (similar to continuous narrative)
   *
   * @param intermediate - The intermediate V3 prompt object.
   * @param objectLibrary - The object library service to resolve components.
   * @returns A Promise resolving to the transformed generic narrative string.
   * @throws Error if transformation fails.
   */
  async transform(
    intermediate: IntermediateV3,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    try {
      const { components } = intermediate;

      // Resolve all components
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

      // Construct generic narrative
      let narrative = `${subject} ${action} ${context}. ${cinematography}`;

      if (style) {
        narrative += `. ${style}`;
      }

      narrative += '.';

      // Add audio if present
      if (intermediate.audio && intermediate.audio.length > 0) {
        const audioText = TransformerUtils.formatAudio(intermediate.audio);
        if (audioText) {
          narrative += '\n\n' + audioText;
        }
      }

      return narrative;
    } catch (error) {
      console.error('[GenericTransformer] Error:', error);
      throw new Error(`Failed to transform to Generic format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const genericTransformer = new GenericTransformer();

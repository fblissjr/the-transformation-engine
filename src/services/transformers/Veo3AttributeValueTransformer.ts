/**
 * Veo3AttributeValueTransformer
 * Transforms IntermediateV3 → Veo 3.1 Attribute-Value format
 *
 * Method #2: Key-value pairs (attribute: value)
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import { TransformerUtils } from './TransformerUtils';

export class Veo3AttributeValueTransformer {
  /**
   * Transform IntermediateV3 to Veo 3.1 attribute-value format
   */
  async transform(
    intermediate: IntermediateV3,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    try {
      const { components } = intermediate;

      // STEP 1: Resolve cinematography component
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

      // STEP 2: Resolve subject component
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

      // STEP 3: Format action component
      const action = TransformerUtils.formatAction(components.action);

      // STEP 4: Resolve and format context component
      const context = await TransformerUtils.resolveContextComponent(
        components.context,
        objectLibrary
      );

      // STEP 5: Format style component
      const style = TransformerUtils.formatStyle(components.style);

      // STEP 6: Format as attribute:value pairs (Veo 3.1 preferred order)
      const lines: string[] = [];

      lines.push(`subject: ${subject}`);
      lines.push(`action: ${action}`);
      lines.push(`cinematography: ${cinematography}`);
      lines.push(`context: ${context}`);
      if (style) {
        lines.push(`style: ${style}`);
      }

      // STEP 7: Add audio (if present)
      if (intermediate.audio && intermediate.audio.length > 0) {
        const audioText = TransformerUtils.formatAudio(intermediate.audio);
        if (audioText) {
          lines.push(''); // Blank line before audio
          lines.push(audioText);
        }
      }

      return lines.join('\n');
    } catch (error) {
      console.error('[Veo3AttributeValueTransformer] Error:', error);
      throw new Error(`Failed to transform to Veo 3.1 Attribute-Value format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const veo3AttributeValueTransformer = new Veo3AttributeValueTransformer();

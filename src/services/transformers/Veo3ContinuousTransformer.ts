/**
 * Veo3ContinuousTransformer
 * Transforms IntermediateV3 → Veo 3.1 Continuous Narrative format
 *
 * Method #1: Natural language paragraph (300-500 words optimal)
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import { TransformerUtils } from './TransformerUtils';

/**
 * Transformer class for converting IntermediateV3 objects into Veo 3.1 Continuous Narrative format.
 * This method constructs a natural language paragraph, which is optimal for Veo 3.1 (300-500 words).
 */
export class Veo3ContinuousTransformer {
  /**
   * Transform IntermediateV3 to Veo 3.1 continuous narrative
   *
   * @param intermediate - The intermediate V3 prompt object.
   * @param objectLibrary - The object library service to resolve components.
   * @returns A Promise resolving to the transformed Veo 3.1 continuous narrative string.
   * @throws Error if transformation fails.
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

      // STEP 6: Construct continuous narrative
      // Format: [Subject] [Action] [Context]. [Cinematography]. [Style].
      let narrative = `${subject} ${action} ${context}. ${cinematography}`;

      // Add style if present
      if (style) {
        narrative += `. ${style}`;
      }

      narrative += '.';

      // STEP 7: Add audio (if present)
      if (intermediate.audio && intermediate.audio.length > 0) {
        const audioText = TransformerUtils.formatAudio(intermediate.audio);
        if (audioText) {
          narrative += '\n\n' + audioText;
        }
      }

      return narrative;
    } catch (error) {
      console.error('[Veo3ContinuousTransformer] Error:', error);
      throw new Error(`Failed to transform to Veo 3.1 Continuous format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const veo3ContinuousTransformer = new Veo3ContinuousTransformer();

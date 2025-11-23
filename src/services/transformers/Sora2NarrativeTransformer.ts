/**
 * Sora2NarrativeTransformer
 * Transforms IntermediateV3 → Sora 2 Narrative Style format
 *
 * Emphasizes temporal progression and storytelling
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import { TransformerUtils } from './TransformerUtils';

/**
 * Transformer class for converting IntermediateV3 objects into Sora 2 Narrative Style format.
 * This format emphasizes temporal progression and storytelling, optimizing for 300-500 words.
 */
export class Sora2NarrativeTransformer {
  /**
   * Transform IntermediateV3 to Sora 2 narrative style
   * 300-500 words optimal, emphasizing temporal flow
   *
   * @param intermediate - The intermediate V3 prompt object.
   * @param objectLibrary - The object library service to resolve components.
   * @returns A Promise resolving to the transformed Sora 2 narrative string.
   * @throws Error if transformation fails.
   */
  async transform(
    intermediate: IntermediateV3,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    try {
      const { components } = intermediate;

      // Resolve all components
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

      // Construct narrative with temporal emphasis
      // Sora 2 prefers beginning → middle → end structure
      const parts: string[] = [];

      parts.push(`The scene opens with ${subject} in ${context}.`);
      parts.push(`${subject} ${action}.`);
      parts.push(`The camera captures this with ${cinematography}.`);

      if (style) {
        parts.push(`Visual style: ${style}.`);
      }

      // Add audio description if present (Sora 2 auto-generates audio)
      if (intermediate.audio && intermediate.audio.length > 0) {
        const audioText = TransformerUtils.formatAudio(intermediate.audio);
        if (audioText) {
          parts.push(`\nAudio elements: ${audioText}`);
        }
      }

      return parts.join(' ');
    } catch (error) {
      console.error('[Sora2NarrativeTransformer] Error:', error);
      throw new Error(`Failed to transform to Sora 2 Narrative format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const sora2NarrativeTransformer = new Sora2NarrativeTransformer();

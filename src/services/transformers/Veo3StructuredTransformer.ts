/**
 * Veo3StructuredTransformer
 * Transforms IntermediateV3 → Veo 3.1 Structured JSON/YAML format
 *
 * Method #5: Full structured data output
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import { TransformerUtils } from './TransformerUtils';

/**
 * Transformer class for converting IntermediateV3 objects into Veo 3.1 Structured JSON format.
 * This method outputs a complete structured representation of the prompt.
 */
export class Veo3StructuredTransformer {
  /**
   * Transform IntermediateV3 to Veo 3.1 structured format (JSON)
   * Outputs complete structured representation
   *
   * @param intermediate - The intermediate V3 prompt object.
   * @param objectLibrary - The object library service to resolve components.
   * @returns A Promise resolving to the transformed Veo 3.1 structured JSON string.
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

      // Build structured output
      const structured: any = {
        scene: {
          subject,
          action,
          cinematography,
          context,
          style,
        },
      };

      // Add audio if present
      if (intermediate.audio && intermediate.audio.length > 0) {
        structured.audio = intermediate.audio.map(a => ({
          type: a.type,
          content: a.content,
          timing: a.timing,
          originalSyntax: a.originalSyntax,
        }));
      }

      // Add timestamps if present
      if (intermediate.timestamps && intermediate.timestamps.length > 0) {
        structured.timestamps = intermediate.timestamps.map(t => ({
          timeRange: t.timeRange,
          description: `${subject} ${action}`, // Simplified
        }));
      }

      // Add prompting strategy if present
      if (intermediate.promptingStrategy) {
        structured.promptingStrategy = intermediate.promptingStrategy;
      }

      // Return as formatted JSON
      return JSON.stringify(structured, null, 2);
    } catch (error) {
      console.error('[Veo3StructuredTransformer] Error:', error);
      throw new Error(`Failed to transform to Veo 3.1 Structured format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const veo3StructuredTransformer = new Veo3StructuredTransformer();

/**
 * Veo3TimestampTransformer
 * Transforms IntermediateV3 → Veo 3.1 Timestamp-Segmented format
 *
 * Method #3: Time-coded beats for precise temporal control
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import { TransformerUtils } from './TransformerUtils';

export class Veo3TimestampTransformer {
  /**
   * Transform IntermediateV3 to Veo 3.1 timestamp-segmented format
   * Uses timestamp segments if present, otherwise creates default segments
   */
  async transform(
    intermediate: IntermediateV3,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    try {
      const lines: string[] = [];

      // If intermediate has timestamps, use them
      if (intermediate.timestamps && intermediate.timestamps.length > 0) {
        for (const segment of intermediate.timestamps) {
          lines.push(`${segment.timeRange}:`);

          // Resolve and format each component in the segment
          if (segment.components.subject) {
            let subject: string;
            if (segment.components.subject.type === 'text') {
              subject = segment.components.subject.text;
            } else {
              const characterData = await TransformerUtils.resolveComponent(
                segment.components.subject,
                objectLibrary
              );
              subject = TransformerUtils.formatCharacter(characterData);
            }
            lines.push(`  Subject: ${subject}`);
          }

          if (segment.components.action) {
            const action = TransformerUtils.formatAction(segment.components.action);
            lines.push(`  Action: ${action}`);
          }

          if (segment.components.cinematography) {
            let cinematography: string;
            if (segment.components.cinematography.type === 'text') {
              cinematography = segment.components.cinematography.text;
            } else {
              const cameraData = await TransformerUtils.resolveComponent(
                segment.components.cinematography,
                objectLibrary
              );
              cinematography = TransformerUtils.formatCamera(cameraData);
            }
            lines.push(`  Camera: ${cinematography}`);
          }

          if (segment.audio && segment.audio.length > 0) {
            const audioText = TransformerUtils.formatAudio(segment.audio);
            if (audioText) {
              lines.push(`  Audio: ${audioText}`);
            }
          }

          lines.push(''); // Blank line between segments
        }
      } else {
        // No timestamps provided - create default single segment
        const { components } = intermediate;

        lines.push('(0s-8s):');

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

        lines.push(`  ${subject} ${action} ${context}. ${cinematography}. ${style}.`);

        if (intermediate.audio && intermediate.audio.length > 0) {
          const audioText = TransformerUtils.formatAudio(intermediate.audio);
          if (audioText) {
            lines.push(`  Audio: ${audioText}`);
          }
        }
      }

      return lines.join('\n');
    } catch (error) {
      console.error('[Veo3TimestampTransformer] Error:', error);
      throw new Error(`Failed to transform to Veo 3.1 Timestamp format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const veo3TimestampTransformer = new Veo3TimestampTransformer();

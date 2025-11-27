/**
 * Sora2NarrativeTransformer
 * Transforms IntermediateV3 → Sora 2 Narrative Style format
 *
 * Sora 2 Requirements:
 * - Character limit: 2000 characters
 * - Three-paragraph structure (setup, action, resolution)
 * - Timecode format: [0:00-0:03] (single digit minutes)
 * - Imperial measurements for camera movement (ft, ft/s)
 * - Motivated lighting with Kelvin temperatures
 * - Focus strategy with timing
 */

import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectLibraryService } from '../objectLibraryService';
import type { CameraObjectData, LocationObjectData } from '../../../types/componentTypes';
import { TransformerUtils } from './TransformerUtils';

/**
 * Transformer class for converting IntermediateV3 objects into Sora 2 Narrative Style format.
 * Optimized for Sora 2's requirements: 2000 char limit, three paragraphs, imperial units.
 */
export class Sora2NarrativeTransformer {
  private readonly MAX_CHARS = 2000;

  /**
   * Transform IntermediateV3 to Sora 2 narrative style
   * Target: 3 paragraphs, <2000 chars, with timecodes and imperial units
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

      // Resolve subject (handles text, object_reference, and multi_subject)
      const subject = await TransformerUtils.resolveSubjectComponent(
        components.subject,
        objectLibrary
      );

      const action = TransformerUtils.formatAction(components.action);
      const context = await TransformerUtils.resolveContextComponent(
        components.context,
        objectLibrary
      );

      // Resolve camera with imperial formatting
      let cinematography: string;
      let cameraData: CameraObjectData | null = null;
      if (components.cinematography.type === 'text') {
        cinematography = components.cinematography.text;
      } else {
        cameraData = await TransformerUtils.resolveComponent(
          components.cinematography,
          objectLibrary
        );
        cinematography = TransformerUtils.formatCameraImperial(cameraData);
      }

      // Resolve location for lighting
      let lightingDesc = '';
      if (components.context.location && components.context.location.type === 'object_reference') {
        const locationData = await TransformerUtils.resolveComponent<LocationObjectData>(
          components.context.location,
          objectLibrary
        );
        lightingDesc = TransformerUtils.formatLightingMotivated(locationData);
      }

      // Get focus strategy
      const focusStrategy = cameraData
        ? TransformerUtils.formatFocusStrategy(cameraData, intermediate.timestamps)
        : 'deep focus throughout';

      const style = TransformerUtils.formatStyle(components.style);

      // Build three-paragraph structure
      const paragraphs: string[] = [];

      // PARAGRAPH 1: Setup (context, subject, lighting)
      let para1 = `${subject} appears in ${context}.`;
      if (lightingDesc) {
        para1 += ` Lighting: ${lightingDesc}.`;
      }

      // PARAGRAPH 2: Action (with timecodes if timestamps exist)
      // Put cinematography and focus first to ensure they survive truncation
      let para2 = '';
      if (intermediate.timestamps && intermediate.timestamps.length > 0) {
        // Format with timecodes
        const segments: string[] = [];
        for (const ts of intermediate.timestamps) {
          const match = ts.timeRange.match(/\((\d+)s?-(\d+)s?\)/);
          if (match) {
            const start = parseInt(match[1], 10);
            const end = parseInt(match[2], 10);
            const timecode = `[0:${start.toString().padStart(2, '0')}-0:${end.toString().padStart(2, '0')}]`;
            const segmentAction = ts.components?.action
              ? TransformerUtils.formatAction(ts.components.action)
              : action;
            segments.push(`${timecode} ${segmentAction}`);
          }
        }
        // Include cinematography and focus at start of para2
        para2 = `${cinematography}. Focus: ${focusStrategy}. ${segments.join('. ')}.`;
      } else {
        para2 = `${cinematography}. Focus: ${focusStrategy}. ${subject} ${action}.`;
      }

      // PARAGRAPH 3: Style and resolution
      let para3 = `Visual style: ${style}.`;
      if (intermediate.audio && intermediate.audio.length > 0) {
        const audioText = TransformerUtils.formatAudio(intermediate.audio);
        if (audioText) {
          para3 += ` Audio: ${audioText.substring(0, 200)}`;
        }
      }

      paragraphs.push(para1);
      paragraphs.push(para2);
      paragraphs.push(para3);

      // Join with double newlines and enforce character limit
      let result = paragraphs.join('\n\n');

      // Truncate if over limit
      if (result.length > this.MAX_CHARS) {
        result = result.substring(0, this.MAX_CHARS - 3) + '...';
      }

      return result;
    } catch (error) {
      console.error('[Sora2NarrativeTransformer] Error:', error);
      throw new Error(`Failed to transform to Sora 2 Narrative format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const sora2NarrativeTransformer = new Sora2NarrativeTransformer();

/**
 * CharacterPromptTransformer
 * Transforms CharacterObjectData → Hybrid Markdown + JSON format
 *
 * Based on Nano Banana research showing 90%+ field adherence with hybrid format:
 * - Markdown directives with MUST/EXACTLY/NEVER emphasis for generation constraints
 * - Complete JSON character data for attribute specification
 * - Proven effective for Gemini 2.5 Flash-based image generation models
 *
 * Usage:
 * - Primary use: Character reference images for Image Studio
 * - Can be adapted for video generation if needed
 *
 * Pattern:
 * ```
 * [Markdown directives]
 * ---
 * [JSON character data]
 * ```
 *
 * Research: internal/NANO_BANANA_INTEGRATION_STRATEGY.md
 */

import type { CharacterObjectData } from '../../../types/componentTypes';

export interface CharacterPromptOptions {
  /**
   * Publication style quality anchor
   * Examples: "Vanity Fair profile", "Vogue editorial", "professional headshot"
   * Default: "professional portrait"
   */
  publicationStyle?: string;

  /**
   * Camera model for photorealism
   * Examples: "Canon EOS R5", "Sony A7R IV", "Nikon D850"
   * Default: "professional DSLR camera"
   */
  cameraModel?: string;

  /**
   * Lens specification
   * Examples: "85mm f/1.2", "50mm f/1.4", "portrait lens"
   * Default: "85mm f/1.2"
   */
  lens?: string;

  /**
   * Shot framing
   * Options: "full-body", "3/4-body", "headshot"
   * Default: "full-body"
   */
  framing?: 'full-body' | '3/4-body' | 'headshot';

  /**
   * Background style
   * Examples: "neutral gray", "studio white", "environmental context"
   * Default: "neutral background"
   */
  background?: string;

  /**
   * Enable emphasis hierarchy (MUST/EXACTLY/NEVER)
   * Default: true
   */
  useEmphasis?: boolean;
}

/**
 * Transformer class for generating hybrid Markdown + JSON prompts for character generation.
 * This format is optimized for models like Gemini 2.5 Flash to ensure high field adherence and consistency.
 */
export class CharacterPromptTransformer {
  /**
   * Transform CharacterObjectData to hybrid Markdown + JSON prompt
   *
   * Research shows this format achieves:
   * - 90%+ field adherence (9/10 attributes appear correctly)
   * - High consistency (CLIP similarity ≥0.8 across 10 generations)
   * - Stable at temperature=1.0
   *
   * @param character - Character data from object library
   * @param options - Optional generation parameters including style, camera settings, and framing.
   * @returns A Promise resolving to the hybrid Markdown + JSON prompt string.
   */
  async transform(
    character: CharacterObjectData,
    options?: CharacterPromptOptions
  ): Promise<string> {
    const {
      publicationStyle = 'professional portrait',
      cameraModel = 'professional DSLR camera',
      lens = '85mm f/1.2',
      framing = 'full-body',
      background = 'neutral background',
      useEmphasis = true,
    } = options || {};

    // Build Markdown directives section
    let prompt = '';

    // Opening directive with publication style
    prompt += `Generate a hyperrealistic image of the following character, suitable for ${publicationStyle}.\n\n`;

    // Cinematography section
    if (useEmphasis) {
      prompt += 'Cinematography that MUST be followed:\n';
    } else {
      prompt += 'Cinematography:\n';
    }

    prompt += this.buildCinematographyDirectives(framing, cameraModel, lens, background);
    prompt += '\n';

    // Lighting section (most critical for photorealism)
    if (useEmphasis) {
      prompt += 'Lighting that MUST be followed EXACTLY:\n';
    } else {
      prompt += 'Lighting:\n';
    }

    prompt += this.buildLightingDirectives();
    prompt += '\n';

    // Character attribute requirement
    if (useEmphasis) {
      prompt += 'The generated image MUST include ALL specified character attributes.\n\n';
    } else {
      prompt += 'Include all specified character attributes.\n\n';
    }

    // Prohibitions
    if (useEmphasis) {
      prompt += '- NEVER include text, logos, or watermarks.\n\n';
    } else {
      prompt += 'Do not include text, logos, or watermarks.\n\n';
    }

    // Separator between Markdown and JSON
    prompt += '---\n\n';

    // JSON character data section
    prompt += JSON.stringify(character, null, 2);

    return prompt;
  }

  /**
   * Build cinematography directives based on framing
   */
  private buildCinematographyDirectives(
    framing: string,
    cameraModel: string,
    lens: string,
    background: string
  ): string {
    let directives = '';

    // Framing-specific directives
    switch (framing) {
      case 'full-body':
        directives += '- Full body shot, entire body clearly visible from head to feet\n';
        break;
      case '3/4-body':
        directives += '- Three-quarter body shot, from head to mid-thigh\n';
        break;
      case 'headshot':
        directives += '- Headshot, from shoulders up\n';
        break;
    }

    // Camera angle
    directives += '- Eye-level camera angle\n';

    // Background
    directives += `- ${this.capitalize(background)}\n`;

    // Camera technical specs
    directives += `- Shot on ${cameraModel} with ${lens} lens\n`;

    // Depth of field (portrait aesthetic)
    directives += '- Shallow depth of field (f/1.2-f/2.8)\n';

    return directives;
  }

  /**
   * Build lighting directives for professional character photography
   */
  private buildLightingDirectives(): string {
    let directives = '';

    // Lighting setup
    directives += '- Professional studio lighting setup\n';
    directives += '- Soft diffused light from softboxes or umbrellas\n';
    directives += '- Neutral color temperature (5000K daylight balanced)\n';
    directives += '- Three-point lighting (key light, fill light, rim light)\n';
    directives += '- No harsh shadows on face or body\n';

    return directives;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export singleton instance
export const characterPromptTransformer = new CharacterPromptTransformer();

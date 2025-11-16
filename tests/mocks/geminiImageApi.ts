import { vi } from 'vitest';

/**
 * Mock Gemini Image API responses for testing
 * Generates deterministic fake images to avoid API costs
 */

/**
 * Creates a minimal valid PNG as base64 (1x1 pixel, deterministic color based on prompt hash)
 * This is sufficient for testing without incurring actual API costs
 */
export function createMockBase64Image(prompt: string): string {
  // Simple hash function to get consistent color from prompt
  const hash = prompt.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = (hash & 0x0000FF);

  // Minimal 1x1 PNG structure (base64 encoded)
  // This creates a valid PNG with a single pixel of the hashed color
  const png = [
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0xD7, 0x63, r, g, b, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82
  ];

  return Buffer.from(png).toString('base64');
}

/**
 * Mock successful image generation response
 */
export function mockGenerateImageResponse(prompt: string) {
  return {
    response: {
      candidates: [
        {
          content: {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: createMockBase64Image(prompt)
                }
              }
            ]
          }
        }
      ],
      usageMetadata: {
        promptTokenCount: prompt.split(' ').length + 10,
        candidatesTokenCount: 1290, // Fixed cost per Gemini image
        totalTokenCount: prompt.split(' ').length + 1300
      }
    }
  };
}

/**
 * Mock image analysis response (vision model analyzing an image)
 */
export function mockImageAnalysisResponse(imageDescription: string) {
  return {
    response: {
      text: () => JSON.stringify({
        scene_elements: ['subject', 'background'],
        dominant_colors: ['#FF5733', '#33FF57', '#3357FF'],
        lighting_type: 'soft diffuse',
        composition_type: 'rule of thirds',
        style_characteristics: 'photorealistic',
        suggested_edits: [
          'adjust_color_tone',
          'add_film_grain',
          'enhance_lighting'
        ]
      }),
      candidates: [
        {
          content: {
            parts: [
              {
                text: `Analysis of the image:

Scene Elements: ${imageDescription}
Dominant Colors: Warm tones (#FF5733), Cool greens (#33FF57), Deep blues (#3357FF)
Lighting: Soft diffuse lighting from upper left
Composition: Rule of thirds, subject in right third
Style: Photorealistic with high detail

Suggested Edits:
- Adjust color tone to enhance warmth
- Add subtle film grain for texture
- Enhance lighting contrast`
              }
            ]
          }
        }
      ],
      usageMetadata: {
        promptTokenCount: 150,
        candidatesTokenCount: 200,
        totalTokenCount: 350
      }
    }
  };
}

/**
 * Mock quality evaluation response (4D scoring)
 */
export function mockQualityEvaluationResponse(scores?: {
  promptAdherence?: number;
  technicalQuality?: number;
  aestheticAppeal?: number;
  composition?: number;
}) {
  const defaultScores = {
    promptAdherence: 8.5,
    technicalQuality: 9.0,
    aestheticAppeal: 8.0,
    composition: 8.7
  };

  const finalScores = { ...defaultScores, ...scores };

  return {
    response: {
      text: () => JSON.stringify(finalScores),
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify(finalScores, null, 2)
              }
            ]
          }
        }
      ],
      usageMetadata: {
        promptTokenCount: 100,
        candidatesTokenCount: 50,
        totalTokenCount: 150
      }
    }
  };
}

/**
 * Mock edit instruction generation response
 */
export function mockEditInstructionResponse(operation: string, wildcards: Record<string, string>) {
  const instruction = `Apply ${operation} with parameters: ${Object.entries(wildcards).map(([k, v]) => `${k}=${v}`).join(', ')}`;

  return {
    response: {
      text: () => instruction,
      candidates: [
        {
          content: {
            parts: [
              {
                text: instruction
              }
            ]
          }
        }
      ],
      usageMetadata: {
        promptTokenCount: 50,
        candidatesTokenCount: 30,
        totalTokenCount: 80
      }
    }
  };
}

/**
 * Mock error response (API failure)
 */
export function mockImageApiError(errorMessage: string) {
  return {
    response: null,
    error: {
      message: errorMessage,
      code: 500
    }
  };
}

/**
 * Mock for @google/generative-ai with image generation support
 */
export function createMockGeminiImageClient() {
  return {
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockImplementation(async (request: any) => {
        // Check if this is an image generation request
        if (typeof request === 'string') {
          return mockGenerateImageResponse(request);
        }

        // Check for vision/analysis request (has image parts)
        if (request.contents?.[0]?.parts?.some((p: any) => p.inlineData)) {
          return mockImageAnalysisResponse('test image');
        }

        // Default to image generation
        const prompt = request.contents?.[0]?.parts?.[0]?.text || 'default prompt';
        return mockGenerateImageResponse(prompt);
      }),

      generateContentStream: vi.fn().mockImplementation(async function* (request: any) {
        const response = await this.generateContent(request);
        yield response;
      })
    })
  };
}

/**
 * Helper to create blob from base64 image data
 */
export async function base64ToBlob(base64: string, mimeType: string = 'image/png'): Promise<Blob> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * Helper to create blob URL for testing
 */
export function createMockImageBlob(prompt: string): Blob {
  const base64 = createMockBase64Image(prompt);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'image/png' });
}

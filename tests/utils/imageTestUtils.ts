/**
 * Image Studio Test Utilities
 * Reusable helpers for testing image generation and editing features
 */

import { vi } from 'vitest';
import { createMockImageBlob, createMockBase64Image } from '../mocks/geminiImageApi';
import { getImageDB, IMAGE_DB_CONFIG } from '../mocks/imageDatabase';

/**
 * Convert blob to base64 for testing
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1]; // Remove data:image/png;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert base64 to blob for testing
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
 * Create a complete test image generation with all fields populated
 */
export function createFullImageGeneration(overrides: any = {}) {
  const id = overrides.id || `img_gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const prompt = overrides.prompt || 'Test image prompt';

  return {
    id,
    projectId: overrides.projectId || 'test_project_001',
    prompt,
    model: overrides.model || 'gemini-2.5-flash-image',
    providerId: overrides.providerId || 'google-gemini-001',
    imageData: overrides.imageData || createMockImageBlob(prompt),
    thumbnailData: overrides.thumbnailData || createMockImageBlob(`thumb-${prompt}`),
    structuredYaml: overrides.structuredYaml || generateMockYaml(prompt),
    qualityScores: overrides.qualityScores || {
      promptAdherence: 8.5,
      technicalQuality: 9.0,
      aestheticAppeal: 8.0,
      composition: 8.7
    },
    created: overrides.created || new Date(),
    modified: overrides.modified || new Date(),
    status: overrides.status || 'ready',
    linkedSceneIds: overrides.linkedSceneIds || [],
    ...overrides
  };
}

/**
 * Generate mock YAML for image metadata
 */
export function generateMockYaml(prompt: string): string {
  return `image_metadata:
  type: generated
  created_at: "${new Date().toISOString()}"

visual_properties:
  dominant_colors:
    - "#FF5733"
    - "#33FF57"
    - "#3357FF"
  lighting_type: soft diffuse
  composition_type: rule of thirds
  scene_elements:
    - ${prompt.split(' ')[0]}
    - background
  style_characteristics: photorealistic

technical_details:
  resolution: 1024x1024
  aspect_ratio: "1:1"`;
}

/**
 * Wait for database transaction to complete
 */
export async function waitForTransaction(timeout: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * Populate image database with test data
 */
export async function populateTestDatabase(options: {
  projects?: number;
  generationsPerProject?: number;
  editsPerGeneration?: number;
  linksPerGeneration?: number;
} = {}) {
  const {
    projects = 2,
    generationsPerProject = 3,
    editsPerGeneration = 1,
    linksPerGeneration = 0
  } = options;

  const db = await getImageDB();

  // Add projects
  const projectIds: string[] = [];
  for (let i = 0; i < projects; i++) {
    const projectId = `test_project_${i + 1}`;
    projectIds.push(projectId);

    const tx = db.transaction(IMAGE_DB_CONFIG.stores.imageProjects, 'readwrite');
    await tx.objectStore(IMAGE_DB_CONFIG.stores.imageProjects).add({
      id: projectId,
      title: `Test Project ${i + 1}`,
      description: `Test project description ${i + 1}`,
      created: new Date(),
      modified: new Date(),
      generationCount: generationsPerProject
    });
    await tx.done;
  }

  // Add generations
  const generationIds: string[] = [];
  for (const projectId of projectIds) {
    for (let i = 0; i < generationsPerProject; i++) {
      const generationId = `${projectId}_gen_${i + 1}`;
      generationIds.push(generationId);

      const tx = db.transaction(IMAGE_DB_CONFIG.stores.imageGenerations, 'readwrite');
      await tx.objectStore(IMAGE_DB_CONFIG.stores.imageGenerations).add(
        createFullImageGeneration({
          id: generationId,
          projectId,
          prompt: `Test prompt ${i + 1} for ${projectId}`
        })
      );
      await tx.done;
    }
  }

  // Add edits
  for (const generationId of generationIds) {
    for (let i = 0; i < editsPerGeneration; i++) {
      const editId = `${generationId}_edit_${i + 1}`;

      const tx = db.transaction(IMAGE_DB_CONFIG.stores.imageEdits, 'readwrite');
      await tx.objectStore(IMAGE_DB_CONFIG.stores.imageEdits).add({
        id: editId,
        generationId,
        parentEditId: i > 0 ? `${generationId}_edit_${i}` : null,
        operation: 'Test Edit Operation',
        prompt: `Test edit prompt ${i + 1}`,
        resultGenerationId: `${generationId}_result_${i + 1}`,
        created: new Date(),
        metadata: {
          template: 'test_template',
          wildcards: { test: 'value' }
        }
      });
      await tx.done;
    }
  }

  // Add links
  for (const generationId of generationIds) {
    for (let i = 0; i < linksPerGeneration; i++) {
      const linkId = `${generationId}_link_${i + 1}`;

      const tx = db.transaction(IMAGE_DB_CONFIG.stores.sceneLinks, 'readwrite');
      await tx.objectStore(IMAGE_DB_CONFIG.stores.sceneLinks).add({
        id: linkId,
        imageGenerationId: generationId,
        intermediateId: `scene_${generationId}_${i + 1}`,
        linkType: i === 0 ? 'first_frame' : 'ingredient',
        created: new Date(),
        metadata: {
          linkReason: 'Test link',
          autoGenerated: false
        }
      });
      await tx.done;
    }
  }

  db.close();

  return {
    projectIds,
    generationIds,
    totalProjects: projects,
    totalGenerations: projectIds.length * generationsPerProject,
    totalEdits: generationIds.length * editsPerGeneration,
    totalLinks: generationIds.length * linksPerGeneration
  };
}

/**
 * Get all records from a store (helper)
 */
export async function getAllRecordsFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getImageDB();
  const tx = db.transaction(storeName, 'readonly');
  const records = await tx.objectStore(storeName).getAll();
  await tx.done;
  db.close();
  return records as T[];
}

/**
 * Count records in a store (helper)
 */
export async function countRecordsInStore(storeName: string): Promise<number> {
  const db = await getImageDB();
  const tx = db.transaction(storeName, 'readonly');
  const count = await tx.objectStore(storeName).count();
  await tx.done;
  db.close();
  return count;
}

/**
 * Mock task router response for image generation
 */
export function mockImageGenerationResponse(prompt: string) {
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
        candidatesTokenCount: 1290,
        totalTokenCount: prompt.split(' ').length + 1300
      }
    }
  };
}

/**
 * Simulate image generation delay
 */
export async function simulateImageGenerationDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verify image blob is valid PNG
 */
export async function isValidPngBlob(blob: Blob): Promise<boolean> {
  if (blob.type !== 'image/png') {
    return false;
  }

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Check PNG signature (first 8 bytes)
  const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < pngSignature.length; i++) {
    if (bytes[i] !== pngSignature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Create spy for database operations
 */
export function createDatabaseSpy() {
  return {
    add: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  };
}

/**
 * Mock successful task assignment
 */
export function mockTaskAssignment(taskType: string) {
  return {
    taskType,
    providerId: 'google-gemini-001',
    modelId: 'gemini-2.5-flash-image',
    temperature: 0.9,
    topP: 0.95,
    maxTokens: 2048
  };
}

/**
 * Assert YAML is valid structure
 */
export function assertValidYaml(yaml: string): void {
  if (!yaml.includes('image_metadata')) {
    throw new Error('YAML missing image_metadata section');
  }
  if (!yaml.includes('visual_properties')) {
    throw new Error('YAML missing visual_properties section');
  }
  if (!yaml.includes('technical_details')) {
    throw new Error('YAML missing technical_details section');
  }
}

/**
 * Assert quality scores are within valid range
 */
export function assertValidQualityScores(scores: any): void {
  const dimensions = ['promptAdherence', 'technicalQuality', 'aestheticAppeal', 'composition'];

  for (const dim of dimensions) {
    if (!(dim in scores)) {
      throw new Error(`Quality scores missing dimension: ${dim}`);
    }
    if (scores[dim] < 0 || scores[dim] > 10) {
      throw new Error(`Quality score ${dim} out of range: ${scores[dim]}`);
    }
  }
}

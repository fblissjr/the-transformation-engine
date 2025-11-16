/**
 * Test fixtures for Image Studio
 * Provides sample data for image projects, generations, edits, and links
 */

import { createMockImageBlob } from '../mocks/geminiImageApi';

/**
 * Image Project fixture
 */
export const mockImageProject = {
  id: 'img_project_test_001',
  title: 'Test Project',
  description: 'A test image generation project',
  created: new Date('2025-11-15T10:00:00Z'),
  modified: new Date('2025-11-15T10:00:00Z'),
  generationCount: 0
};

export const mockImageProject2 = {
  id: 'img_project_test_002',
  title: 'Second Test Project',
  description: 'Another test project',
  created: new Date('2025-11-15T11:00:00Z'),
  modified: new Date('2025-11-15T11:00:00Z'),
  generationCount: 0
};

/**
 * Image Generation fixture
 */
export const mockImageGeneration = {
  id: 'img_gen_test_001',
  projectId: 'img_project_test_001',
  prompt: 'A serene mountain landscape at sunset',
  model: 'gemini-2.5-flash-image',
  providerId: 'google-gemini-001',
  imageData: createMockImageBlob('A serene mountain landscape at sunset'),
  thumbnailData: createMockImageBlob('thumbnail-mountain'),
  structuredYaml: `image_metadata:
  type: generated
  created_at: "2025-11-15T10:05:00Z"

visual_properties:
  dominant_colors:
    - "#FF5733"  # Warm orange (sunset)
    - "#33FF57"  # Mountain green
    - "#3357FF"  # Sky blue
  lighting_type: warm golden hour
  composition_type: rule of thirds
  scene_elements:
    - mountains
    - sunset
    - sky
  style_characteristics: photorealistic

technical_details:
  resolution: 1024x1024
  aspect_ratio: "1:1"`,
  qualityScores: {
    promptAdherence: 8.5,
    technicalQuality: 9.0,
    aestheticAppeal: 8.0,
    composition: 8.7
  },
  created: new Date('2025-11-15T10:05:00Z'),
  modified: new Date('2025-11-15T10:05:00Z'),
  status: 'ready' as const,
  linkedSceneIds: []
};

export const mockImageGeneration2 = {
  id: 'img_gen_test_002',
  projectId: 'img_project_test_001',
  prompt: 'Portrait of a young woman in natural lighting',
  model: 'gemini-2.5-flash-image',
  providerId: 'google-gemini-001',
  imageData: createMockImageBlob('Portrait of a young woman'),
  thumbnailData: createMockImageBlob('thumbnail-portrait'),
  structuredYaml: `image_metadata:
  type: generated
  created_at: "2025-11-15T10:10:00Z"

visual_properties:
  dominant_colors:
    - "#FFC0CB"  # Soft pink (skin tone)
    - "#8B4513"  # Brown (hair)
    - "#F5F5DC"  # Beige (background)
  lighting_type: soft diffuse natural
  composition_type: centered portrait
  scene_elements:
    - person
    - portrait
    - natural light
  style_characteristics: photorealistic

technical_details:
  resolution: 1024x1024
  aspect_ratio: "1:1"`,
  qualityScores: {
    promptAdherence: 9.0,
    technicalQuality: 8.8,
    aestheticAppeal: 9.2,
    composition: 9.0
  },
  created: new Date('2025-11-15T10:10:00Z'),
  modified: new Date('2025-11-15T10:10:00Z'),
  status: 'ready' as const,
  linkedSceneIds: []
};

export const mockImageGenerationWithLink = {
  ...mockImageGeneration2,
  id: 'img_gen_test_003',
  linkedSceneIds: ['scene_test_001']
};

export const mockGeneratingImage = {
  id: 'img_gen_test_004',
  projectId: 'img_project_test_001',
  prompt: 'A futuristic cityscape',
  model: 'gemini-2.5-flash-image',
  providerId: 'google-gemini-001',
  imageData: null as any, // No blob yet
  thumbnailData: null as any,
  structuredYaml: '',
  qualityScores: null as any,
  created: new Date('2025-11-15T10:15:00Z'),
  modified: new Date('2025-11-15T10:15:00Z'),
  status: 'generating' as const,
  linkedSceneIds: []
};

export const mockErrorImage = {
  id: 'img_gen_test_005',
  projectId: 'img_project_test_001',
  prompt: 'An impossible prompt that fails',
  model: 'gemini-2.5-flash-image',
  providerId: 'google-gemini-001',
  imageData: null as any,
  thumbnailData: null as any,
  structuredYaml: '',
  qualityScores: null as any,
  created: new Date('2025-11-15T10:20:00Z'),
  modified: new Date('2025-11-15T10:20:00Z'),
  status: 'error' as const,
  errorMessage: 'API request failed: Invalid prompt',
  linkedSceneIds: []
};

/**
 * Image Edit fixture
 */
export const mockImageEdit = {
  id: 'img_edit_test_001',
  generationId: 'img_gen_test_001',
  parentEditId: null,
  operation: 'Add Film Grain',
  prompt: 'Add moderate film grain and vintage sepia filter',
  resultGenerationId: 'img_gen_test_006',
  created: new Date('2025-11-15T10:25:00Z'),
  metadata: {
    template: 'film_grain_vintage',
    wildcards: {
      grain_intensity: 'moderate',
      vintage_style: 'sepia'
    }
  }
};

export const mockImageEdit2 = {
  id: 'img_edit_test_002',
  generationId: 'img_gen_test_006',
  parentEditId: 'img_edit_test_001',
  operation: 'Adjust Color Tone',
  prompt: 'Shift color tone to warmer palette',
  resultGenerationId: 'img_gen_test_007',
  created: new Date('2025-11-15T10:30:00Z'),
  metadata: {
    template: 'change_color_tone',
    wildcards: {
      direction: 'warm',
      intensity: 'moderate'
    }
  }
};

/**
 * Scene Link fixture (links image to video scene)
 */
export const mockSceneLink = {
  id: 'link_test_001',
  imageGenerationId: 'img_gen_test_001',  // Fixed: was img_gen_test_003, now matches mockImageGeneration
  intermediateId: 'scene_test_001',
  linkType: 'first_frame' as const,
  created: new Date('2025-11-15T10:35:00Z'),
  metadata: {
    linkReason: 'User selected as first frame for scene',
    autoGenerated: false
  }
};

export const mockSceneLink2 = {
  id: 'link_test_002',
  imageGenerationId: 'img_gen_test_002',
  intermediateId: 'scene_test_002',
  linkType: 'ingredient' as const,
  created: new Date('2025-11-15T10:40:00Z'),
  metadata: {
    linkReason: 'Used as ingredient for Veo 3.1 generation',
    autoGenerated: false,
    ingredientIndex: 0
  }
};

/**
 * Edit Template fixture
 */
export const mockEditTemplate = {
  id: 'film_grain_vintage',
  name: 'Add Film Grain or Vintage Filter',
  category: 'Pixel & Photometric',
  picoOperation: 'Add film grain or vintage filter',
  frequency: 15443,
  successRate: 0.90,
  templatePrompt: 'Add {grain_intensity} film grain and {vintage_style} vintage filter to the image. The effect MUST appear {coverage} while maintaining {preservation}.',
  wildcards: {
    grain_intensity: ['subtle', 'moderate', 'strong'],
    vintage_style: ['sepia', 'faded_color', 'aged_photo', 'retro'],
    coverage: ['uniformly', 'concentrated_in_shadows', 'edges_only'],
    preservation: ['original_colors', 'contrast', 'detail']
  },
  examples: [
    'Add moderate film grain and sepia vintage filter to the image. The effect MUST appear uniformly while maintaining contrast.',
    'Add strong film grain and aged_photo vintage filter. The effect MUST be concentrated_in_shadows while maintaining detail.'
  ]
};

export const mockEditTemplate2 = {
  id: 'artistic_style_transfer',
  name: 'Artistic Style Transfer',
  category: 'Stylistic',
  picoOperation: 'Strong artistic style transfer',
  frequency: 15284,
  successRate: 0.75,
  templatePrompt: 'Transform the {subject} into {style} art style. The {subject} MUST remain recognizable while adopting the characteristic {style_features} of {style}. Maintain {preservation_constraints}.',
  wildcards: {
    subject: ['portrait', 'landscape', 'object', 'scene'],
    style: ['van_gogh', 'impressionist', 'anime', 'watercolor', 'oil_painting'],
    style_features: ['brushstrokes', 'color_palette', 'line_work', 'texture'],
    preservation_constraints: ['facial_features', 'composition', 'lighting', 'identity']
  },
  examples: [
    'Transform the portrait into Van Gogh art style. The person MUST remain recognizable while adopting the characteristic bold brushstrokes and vibrant color palette of Van Gogh. Maintain facial features and expression.',
    'Transform the landscape into watercolor art style. The scene MUST remain recognizable while adopting the characteristic soft edges and color bleeding of watercolor. Maintain composition and depth.'
  ]
};

/**
 * Editing Session fixture
 */
export const mockEditingSession = {
  id: 'session_test_001',
  startImageId: 'img_gen_test_001',
  currentImageId: 'img_gen_test_007',
  history: [
    {
      editId: 'img_edit_test_001',
      timestamp: new Date('2025-11-15T10:25:00Z'),
      operation: 'Add Film Grain',
      resultImageId: 'img_gen_test_006'
    },
    {
      editId: 'img_edit_test_002',
      timestamp: new Date('2025-11-15T10:30:00Z'),
      operation: 'Adjust Color Tone',
      resultImageId: 'img_gen_test_007'
    }
  ],
  created: new Date('2025-11-15T10:00:00Z'),
  modified: new Date('2025-11-15T10:30:00Z')
};

/**
 * Helper to create a full set of related test data
 */
export function createCompleteTestDataSet() {
  return {
    projects: [mockImageProject, mockImageProject2],
    generations: [
      mockImageGeneration,
      mockImageGeneration2,
      mockImageGenerationWithLink,
      mockGeneratingImage,
      mockErrorImage
    ],
    edits: [mockImageEdit, mockImageEdit2],
    links: [mockSceneLink, mockSceneLink2],
    templates: [mockEditTemplate, mockEditTemplate2],
    sessions: [mockEditingSession]
  };
}

/**
 * Helper to create minimal valid image generation with unique ID
 */
export function createTestImageGeneration(overrides: Partial<typeof mockImageGeneration> = {}) {
  return {
    ...mockImageGeneration,
    id: `img_gen_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created: new Date(),
    modified: new Date(),
    ...overrides
  };
}

/**
 * Helper to create minimal valid image project with unique ID
 */
export function createTestImageProject(overrides: Partial<typeof mockImageProject> = {}) {
  return {
    ...mockImageProject,
    id: `img_project_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created: new Date(),
    modified: new Date(),
    ...overrides
  };
}

/**
 * Few-Shot Example Selection Service
 *
 * Dynamically selects relevant few-shot examples based on user input
 * to guide LLM in generating model-optimized prompts (Sora 2 and Veo 3).
 */

import { fragmentLoader } from './fragmentLoader';

export interface FewShotExample {
  id: string;
  sceneType: string;
  cameraMovement: string;
  subjectType: string;
  content: string;
}

// Map of available examples with their metadata
const SORA2_EXAMPLE_REGISTRY: Record<string, { path: string; metadata: any }> = {
  beach_walk: {
    path: 'examples/sora2_beach_walk.md',
    metadata: {
      sceneType: ['outdoor', 'nature', 'beach', 'coast', 'sunset'],
      cameraMovement: ['dolly', 'forward', 'moving'],
      subjectType: ['person', 'human', 'character', 'walking'],
      keywords: ['beach', 'ocean', 'sunset', 'walking', 'water', 'sand', 'golden hour'],
    },
  },
  camera_push: {
    path: 'examples/sora2_camera_push.md',
    metadata: {
      sceneType: ['urban', 'city', 'cityscape', 'futuristic', 'aerial'],
      cameraMovement: ['dolly', 'forward', 'fast', 'push', 'zoom', 'aerial'],
      subjectType: ['environment', 'architecture', 'building', 'cityscape'],
      keywords: ['city', 'urban', 'building', 'skyscraper', 'neon', 'futuristic', 'camera push', 'aerial'],
    },
  },
  interior_product: {
    path: 'examples/sora2_interior_product.md',
    metadata: {
      sceneType: ['indoor', 'studio', 'product', 'commercial'],
      cameraMovement: ['orbit', 'rotate', 'turntable', 'circular'],
      subjectType: ['object', 'product', 'item', 'showcase'],
      keywords: ['product', 'commercial', 'showcase', 'studio', 'rotating', 'orbit', 'headphones', 'gadget'],
    },
  },
};

const VEO3_EXAMPLE_REGISTRY: Record<string, { path: string; metadata: any }> = {
  coffee_shop: {
    path: 'examples/veo3_coffee_shop.md',
    metadata: {
      sceneType: ['narrative', 'dialogue', 'interior', 'character', 'conversation'],
      cameraMovement: ['dolly', 'slow', 'intimate'],
      subjectType: ['person', 'people', 'character', 'dialogue'],
      keywords: ['conversation', 'cafe', 'coffee', 'dialogue', 'intimate', 'relationship', 'talking', 'indoor'],
    },
  },
  product_reveal: {
    path: 'examples/veo3_product_reveal.md',
    metadata: {
      sceneType: ['product', 'commercial', 'motion_graphics', 'reveal', 'advertising'],
      cameraMovement: ['orbit', 'rotate', 'circular', 'smooth'],
      subjectType: ['object', 'product', 'tech', 'gadget'],
      keywords: ['product', 'commercial', 'tech', 'reveal', 'showcase', 'advertising', 'voiceover', 'studio'],
    },
  },
  nature_landscape: {
    path: 'examples/veo3_nature_landscape.md',
    metadata: {
      sceneType: ['landscape', 'nature', 'cinematic', 'establishing', 'epic'],
      cameraMovement: ['crane', 'vertical', 'rising', 'reveal'],
      subjectType: ['environment', 'landscape', 'mountain', 'nature'],
      keywords: ['nature', 'landscape', 'mountain', 'forest', 'epic', 'cinematic', 'vista', 'outdoor', 'wilderness'],
    },
  },
  urban_street: {
    path: 'examples/veo3_urban_street.md',
    metadata: {
      sceneType: ['urban', 'street', 'documentary', 'realistic', 'everyday'],
      cameraMovement: ['handheld', 'documentary', 'observational'],
      subjectType: ['person', 'character', 'urban', 'everyday'],
      keywords: ['city', 'urban', 'street', 'documentary', 'gritty', 'realistic', 'everyday', 'pedestrian'],
    },
  },
};

/**
 * Select relevant few-shot examples based on user input and model
 */
export async function selectFewShotExamples(
  userInput: string,
  maxExamples: number = 2,
  model: 'sora2' | 'veo3' = 'sora2'
): Promise<string> {
  const inputLower = userInput.toLowerCase();
  const scores: Array<{ id: string; score: number }> = [];

  // Select appropriate registry based on model
  const EXAMPLE_REGISTRY = model === 'veo3' ? VEO3_EXAMPLE_REGISTRY : SORA2_EXAMPLE_REGISTRY;

  // Score each example based on keyword overlap
  for (const [id, { metadata }] of Object.entries(EXAMPLE_REGISTRY)) {
    let score = 0;

    // Check scene type matches
    for (const keyword of metadata.sceneType) {
      if (inputLower.includes(keyword)) score += 3;
    }

    // Check camera movement matches
    for (const keyword of metadata.cameraMovement) {
      if (inputLower.includes(keyword)) score += 2;
    }

    // Check subject type matches
    for (const keyword of metadata.subjectType) {
      if (inputLower.includes(keyword)) score += 2;
    }

    // Check general keyword matches
    for (const keyword of metadata.keywords) {
      if (inputLower.includes(keyword)) score += 1;
    }

    if (score > 0) {
      scores.push({ id, score });
    }
  }

  // Sort by score and take top N
  scores.sort((a, b) => b.score - a.score);
  const selectedIds = scores.slice(0, maxExamples).map(s => s.id);

  // If no matches, use default examples based on model
  if (selectedIds.length === 0) {
    selectedIds.push(model === 'veo3' ? 'coffee_shop' : 'beach_walk');
  }

  // Load selected examples
  const examples: string[] = [];
  for (const id of selectedIds) {
    const example = EXAMPLE_REGISTRY[id];
    if (example) {
      try {
        const fragment = await fragmentLoader.loadFragment(example.path);
        examples.push(fragment.content);
      } catch (error) {
        console.warn(`Failed to load example: ${id}`, error);
      }
    }
  }

  return examples.join('\n\n---\n\n');
}

/**
 * Check if user input should trigger few-shot examples
 * Returns model type if few-shot should be used, null otherwise
 */
export function shouldUseFewShot(schemaKeys: string[]): 'sora2' | 'veo3' | null {
  // Check for Veo 3
  if (schemaKeys.includes('veo3_specs')) {
    return 'veo3';
  }

  // Check for Sora 2
  if (schemaKeys.includes('technical_specs') || schemaKeys.includes('temporal_progression')) {
    return 'sora2';
  }

  return null;
}

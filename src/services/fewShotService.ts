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
// 16 Sora 2 GPT-5 examples organized by category
const SORA2_EXAMPLE_REGISTRY: Record<string, { path: string; category: string; metadata: any }> = {
  // Product/Commercial (5 examples)
  interior_product_macro: {
    path: 'examples/sora2_interior_product_macro.md',
    category: 'product',
    metadata: {
      sceneType: ['indoor', 'studio', 'product', 'commercial', 'macro'],
      cameraMovement: ['push', 'slow', 'static', 'roll'],
      subjectType: ['object', 'product', 'item', 'bottle', 'perfume'],
      keywords: ['macro', 'product', 'studio', 'close-up', 'commercial', 'glass', 'refraction', 'bokeh', 'elegant'],
    },
  },
  product_demo_desktop: {
    path: 'examples/sora2_product_demo_desktop.md',
    category: 'product',
    metadata: {
      sceneType: ['indoor', 'studio', 'product', 'tech', 'demo'],
      cameraMovement: ['orbit', 'circular', 'smooth'],
      subjectType: ['object', 'product', 'tech', 'gadget', 'device'],
      keywords: ['product', 'tech', 'desktop', 'demo', 'commercial', 'showcase', 'gadget', 'device'],
    },
  },
  food_commercial_pancakes: {
    path: 'examples/sora2_food_commercial_pancakes.md',
    category: 'product',
    metadata: {
      sceneType: ['indoor', 'kitchen', 'food', 'commercial', 'cooking'],
      cameraMovement: ['overhead', 'vertical', 'crane', 'descending'],
      subjectType: ['food', 'cooking', 'kitchen', 'breakfast'],
      keywords: ['food', 'commercial', 'breakfast', 'kitchen', 'cooking', 'pancakes', 'overhead', 'ingredients'],
    },
  },
  automotive_exterior_hero: {
    path: 'examples/sora2_automotive_exterior_hero.md',
    category: 'product',
    metadata: {
      sceneType: ['outdoor', 'automotive', 'commercial', 'hero', 'vehicle'],
      cameraMovement: ['arc', 'orbit', 'circular', 'reveal'],
      subjectType: ['car', 'vehicle', 'automotive', 'transport'],
      keywords: ['car', 'automotive', 'exterior', 'vehicle', 'hero', 'commercial', 'reveal', 'sleek'],
    },
  },
  fashion_street_style: {
    path: 'examples/sora2_fashion_street_style.md',
    category: 'product',
    metadata: {
      sceneType: ['outdoor', 'urban', 'fashion', 'portrait', 'street'],
      cameraMovement: ['dolly', 'tracking', 'following'],
      subjectType: ['person', 'model', 'fashion', 'character'],
      keywords: ['fashion', 'street', 'portrait', 'urban', 'style', 'walking', 'model', 'outfit'],
    },
  },

  // Nature/Wildlife (3 examples)
  beach_walk: {
    path: 'examples/sora2_beach_walk.md',
    category: 'nature',
    metadata: {
      sceneType: ['outdoor', 'nature', 'beach', 'coast', 'sunset'],
      cameraMovement: ['dolly', 'forward', 'push', 'moving'],
      subjectType: ['person', 'human', 'character', 'walking'],
      keywords: ['beach', 'outdoor', 'sunset', 'nature', 'coastal', 'ocean', 'walking', 'water', 'sand', 'golden hour'],
    },
  },
  wildlife_meadow: {
    path: 'examples/sora2_wildlife_meadow.md',
    category: 'nature',
    metadata: {
      sceneType: ['outdoor', 'nature', 'wildlife', 'meadow', 'animals'],
      cameraMovement: ['handheld', 'documentary', 'tracking', 'slow'],
      subjectType: ['animal', 'wildlife', 'deer', 'nature'],
      keywords: ['wildlife', 'nature', 'animals', 'meadow', 'outdoor', 'deer', 'documentary', 'grass', 'forest'],
    },
  },
  underwater_reef: {
    path: 'examples/sora2_underwater_reef.md',
    category: 'nature',
    metadata: {
      sceneType: ['underwater', 'nature', 'ocean', 'marine', 'reef'],
      cameraMovement: ['floating', 'drift', 'smooth', 'slow'],
      subjectType: ['fish', 'coral', 'marine', 'ocean'],
      keywords: ['underwater', 'ocean', 'reef', 'marine', 'diving', 'coral', 'fish', 'blue', 'aquatic'],
    },
  },

  // Urban/Architecture (4 examples)
  night_city_broll: {
    path: 'examples/sora2_night_city_broll.md',
    category: 'urban',
    metadata: {
      sceneType: ['urban', 'city', 'night', 'street', 'cinematic'],
      cameraMovement: ['truck', 'arc', 'orbit', 'moving'],
      subjectType: ['environment', 'cityscape', 'architecture', 'street'],
      keywords: ['city', 'night', 'urban', 'neon', 'street', 'rain', 'reflections', 'cinematic', 'lights'],
    },
  },
  architecture_reveal: {
    path: 'examples/sora2_architecture_reveal.md',
    category: 'urban',
    metadata: {
      sceneType: ['outdoor', 'architecture', 'modern', 'geometric', 'building'],
      cameraMovement: ['crane', 'vertical', 'reveal', 'ascending'],
      subjectType: ['building', 'architecture', 'structure', 'design'],
      keywords: ['architecture', 'building', 'geometric', 'modern', 'reveal', 'glass', 'concrete', 'design'],
    },
  },
  scifi_corridor: {
    path: 'examples/sora2_scifi_corridor.md',
    category: 'urban',
    metadata: {
      sceneType: ['indoor', 'scifi', 'futuristic', 'corridor', 'interior'],
      cameraMovement: ['dolly', 'forward', 'floating', 'smooth'],
      subjectType: ['environment', 'corridor', 'interior', 'space'],
      keywords: ['scifi', 'futuristic', 'corridor', 'interior', 'space', 'technology', 'lights', 'metallic'],
    },
  },
  cozy_coffee_shop: {
    path: 'examples/sora2_cozy_coffee_shop.md',
    category: 'urban',
    metadata: {
      sceneType: ['indoor', 'cafe', 'interior', 'cozy', 'lifestyle'],
      cameraMovement: ['dolly', 'slow', 'intimate', 'tracking'],
      subjectType: ['environment', 'interior', 'cafe', 'lifestyle'],
      keywords: ['cafe', 'interior', 'cozy', 'warm', 'coffee', 'shop', 'lifestyle', 'intimate', 'atmosphere'],
    },
  },

  // Performance/Action (4 examples)
  sports_sprint: {
    path: 'examples/sora2_sports_sprint.md',
    category: 'action',
    metadata: {
      sceneType: ['outdoor', 'sports', 'athletic', 'dynamic', 'action'],
      cameraMovement: ['truck', 'tracking', 'fast', 'pedestal'],
      subjectType: ['person', 'athlete', 'runner', 'sports'],
      keywords: ['sports', 'running', 'track', 'athletic', 'dynamic', 'action', 'sprint', 'fast', 'movement'],
    },
  },
  dance_performance: {
    path: 'examples/sora2_dance_performance.md',
    category: 'action',
    metadata: {
      sceneType: ['indoor', 'performance', 'artistic', 'dance', 'stage'],
      cameraMovement: ['arc', 'orbit', 'circular', 'smooth'],
      subjectType: ['person', 'dancer', 'performer', 'character'],
      keywords: ['dance', 'performance', 'movement', 'artistic', 'choreography', 'stage', 'expression', 'graceful'],
    },
  },
  macro_insects: {
    path: 'examples/sora2_macro_insects.md',
    category: 'action',
    metadata: {
      sceneType: ['outdoor', 'nature', 'macro', 'wildlife', 'close-up'],
      cameraMovement: ['dolly', 'slow', 'tracking', 'handheld'],
      subjectType: ['insect', 'bug', 'nature', 'wildlife'],
      keywords: ['macro', 'nature', 'insects', 'close-up', 'wildlife', 'bug', 'detail', 'small'],
    },
  },
  fpv_parkour_chase: {
    path: 'examples/sora2_fpv_parkour_chase.md',
    category: 'action',
    metadata: {
      sceneType: ['outdoor', 'urban', 'action', 'dynamic', 'chase'],
      cameraMovement: ['fpv', 'fast', 'dynamic', 'chase', 'aggressive'],
      subjectType: ['person', 'athlete', 'parkour', 'action'],
      keywords: ['fpv', 'parkour', 'action', 'chase', 'urban', 'fast', 'dynamic', 'aggressive', 'movement'],
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
 *
 * @param userInput - The user's natural language input.
 * @param maxExamples - Maximum number of examples to return.
 * @param model - The target model ('sora2' or 'veo3').
 * @returns A formatted string of relevant examples.
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

  // Ensure category diversity when possible
  // Take highest scoring example, then prefer examples from different categories
  const selectedIds: string[] = [];
  const usedCategories = new Set<string>();

  for (const { id, score } of scores) {
    if (selectedIds.length >= maxExamples) break;

    const exampleData = EXAMPLE_REGISTRY[id];
    const category: string = 'category' in exampleData ? (exampleData.category as string) : 'unknown';

    // Always take first example (highest score)
    if (selectedIds.length === 0) {
      selectedIds.push(id);
      usedCategories.add(category);
    }
    // Prefer examples from new categories
    else if (!usedCategories.has(category)) {
      selectedIds.push(id);
      usedCategories.add(category);
    }
    // If all categories used, take by score
    else if (usedCategories.size >= maxExamples) {
      selectedIds.push(id);
    }
  }

  // If we still need more examples and have remaining scored items, fill from same categories
  if (selectedIds.length < maxExamples) {
    for (const { id } of scores) {
      if (selectedIds.length >= maxExamples) break;
      if (!selectedIds.includes(id)) {
        selectedIds.push(id);
      }
    }
  }

  // If no matches, use default examples based on model
  // For Sora 2, pick 2 examples from different categories for variety
  if (selectedIds.length === 0) {
    if (model === 'veo3') {
      selectedIds.push('coffee_shop');
    } else {
      // Default to one from each major category
      selectedIds.push('interior_product_macro', 'beach_walk');
    }
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
 *
 * @param schemaKeys - List of schema keys selected by the user or inferred.
 * @returns 'sora2', 'veo3', or null.
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

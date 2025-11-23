/**
 * Scene Extension Service
 *
 * Handles generation of scene extensions with parent context preservation.
 * Part of Scene Extension Phase 1 MVP.
 */

import {
  IntermediatePrompt,
  IntermediateStructure,
  PreservationOptions,
  ParentSceneSummary,
  ExtensionMetadata,
} from '../types/intermediate';
import { ParentSceneSummarySchema } from '../types/schemas';
import { taskRouter } from './taskRouter';
import { TASK_IDS } from '../types/providers';
import { getDB } from './db/indexedDbService';
import { transitionPatternService } from './transitionPatternService';

/**
 * Parameters for generating a scene extension
 */
export interface GenerateExtensionParams {
  parentId: string;
  method: 'continue' | 'cutTo' | 'transition';
  userDescription: string;
  preservation: PreservationOptions;
  outputFormat?: 'veo3' | 'sora2' | 'generic'; // null = inherit from parent
  transitionPatternId?: string; // Optional transition pattern ID (required if method is 'transition')
}

/**
 * Get or generate a cached parent scene summary
 *
 * @param parentIntermediate - The intermediate prompt of the parent scene.
 * @returns A Promise resolving to the ParentSceneSummary.
 */
export async function getParentSummary(
  parentIntermediate: IntermediatePrompt
): Promise<ParentSceneSummary> {
  // Check if summary is cached
  if (parentIntermediate.extensionMetadata?.parentSummary) {
    return parentIntermediate.extensionMetadata.parentSummary;
  }

  // Generate summary via LLM
  const systemPrompt = `Extract a concise summary of this scene for extension context.

Parent Scene Structure:
${JSON.stringify(parentIntermediate.structure, null, 2)}

Output JSON with these exact fields:
{
  "characters": ["name + brief description"],
  "location": "concise setting description",
  "lastMoment": "what's happening as scene ends",
  "visualStyle": "colors, lighting, aesthetic",
  "audioState": "music, ambient sounds, dialogue state"
}`;

  try {
    const summary = await taskRouter.executeTaskJson(
      TASK_IDS.TRANSFORM,
      'Extract parent scene summary for extension',
      systemPrompt
    ) as ParentSceneSummary;

    // Cache the summary in the parent intermediate
    const db = await getDB();
    const tx = db.transaction('intermediates', 'readwrite');
    const parentRecord = await tx.store.get(parentIntermediate.id);

    if (parentRecord) {
      parentRecord.extensionMetadata = parentRecord.extensionMetadata || {} as ExtensionMetadata;
      parentRecord.extensionMetadata.parentSummary = summary;
      await tx.store.put(parentRecord);
    }
    await tx.done;

    return summary;
  } catch (error) {
    console.error('Failed to generate parent summary:', error);
    throw new Error('Could not generate parent scene summary');
  }
}

/**
 * Build the system prompt for scene extension
 */
async function buildExtensionPrompt(
  params: GenerateExtensionParams,
  parentSummary: ParentSceneSummary
): Promise<string> {
  const methodInstructions = {
    continue: `
This is a CONTINUATION of the previous scene.
PRESERVE ALL elements from parent scene:
- Characters: ${parentSummary.characters.join(', ')}
- Location: ${parentSummary.location}
- Visual Style: ${parentSummary.visualStyle}
- Audio: ${parentSummary.audioState}

Progress the action naturally from the last moment:
${parentSummary.lastMoment}

Maintain visual continuity and temporal progression.
`,
    cutTo: `
This is a HARD CUT to a new scene.
${params.preservation.characters ? `KEEP characters: ${parentSummary.characters.join(', ')}` : 'Introduce new characters or continue with existing ones if specified.'}
${params.preservation.environment ? `KEEP location: ${parentSummary.location}` : 'Establish new location as described by user.'}
${params.preservation.visualStyle ? `MAINTAIN visual style: ${parentSummary.visualStyle}` : 'Create distinct visual style for new scene.'}
${params.preservation.audio ? `CONTINUE audio: ${parentSummary.audioState}` : 'Design fresh audio for new scene.'}
`,
    transition: `
This is a SMOOTH TRANSITION between scenes.
Camera movement or visual technique bridges the scenes.

Visual Style: ${parentSummary.visualStyle} (maintain as bridge)
Audio: ${parentSummary.audioState} (continue through transition)

Create gradual transformation, not instant cut.
Focus on camera movement that reveals or transforms the scene.
`
  };

  // Load transition pattern fragment if method is 'transition'
  let transitionPatternPrompt = '';
  if (params.method === 'transition' && params.transitionPatternId) {
    try {
      const pattern = transitionPatternService.getPatternById(params.transitionPatternId);
      if (!pattern) {
        throw new Error(`Transition pattern not found: ${params.transitionPatternId}`);
      }

      const fragmentContent = await transitionPatternService.loadPatternFragment(
        params.transitionPatternId
      );

      transitionPatternPrompt = `

TRANSITION PATTERN: ${pattern.name}
Category: ${pattern.category}
Description: ${pattern.description}

PATTERN GUIDANCE:
${fragmentContent}

Apply this transition pattern to smoothly bridge the parent scene to the new scene described by the user.
Substitute {{scene_a}} with parent scene summary and {{scene_b}} with user's new scene description.
`;
    } catch (error) {
      console.error('Failed to load transition pattern:', error);
      // Continue without pattern if loading fails
    }
  }

  return `
You are generating a scene extension for a video prompt sequence.

PARENT SCENE CONTEXT:
${JSON.stringify(parentSummary, null, 2)}

EXTENSION METHOD: ${params.method}
${methodInstructions[params.method]}
${transitionPatternPrompt}

USER DESCRIPTION:
${params.userDescription}

OUTPUT FORMAT:
Generate structured intermediate (IntermediateStructure v2.0) following the schema.
Ensure temporal progression, visual continuity per extension method, and coherent audio design.
Output ONLY valid JSON matching the IntermediateStructure schema.
  `.trim();
}

/**
 * Get next scene number for a sequence
 */
async function getNextSceneNumber(parentId: string): Promise<number> {
  const db = await getDB();

  // Get all scenes in this sequence (parent + all children)
  const parent = await db.get('intermediates', parentId);
  if (!parent) {
    throw new Error('Parent scene not found');
  }

  // Find all descendants
  const allIntermediates = await db.getAll('intermediates');
  const sequence = new Set<string>([parentId]);

  // Recursive function to find all descendants
  const findDescendants = (id: string) => {
    const children = allIntermediates.filter(
      i => i.extensionMetadata?.parentSceneId === id
    );
    children.forEach(child => {
      sequence.add(child.id);
      findDescendants(child.id);
    });
  };

  findDescendants(parentId);

  return sequence.size + 1; // Next scene number is size + 1
}

/**
 * Generate title for extended scene
 */
function generateExtensionTitle(
  method: 'continue' | 'cutTo' | 'transition',
  sceneNumber: number,
  userDescription: string
): string {
  const prefix = sceneNumber > 1 ? `S${sceneNumber}: ` : '';
  const truncated = userDescription.length > 50
    ? userDescription.substring(0, 47) + '...'
    : userDescription;

  return `${prefix}${truncated}`;
}

/**
 * Main function: Generate a scene extension
 *
 * @param params - Parameters for the scene extension.
 * @returns A Promise resolving to the new IntermediatePrompt.
 */
export async function generateSceneExtension(
  params: GenerateExtensionParams
): Promise<IntermediatePrompt> {
  const db = await getDB();

  // 1. Load parent intermediate
  const parent = await db.get('intermediates', params.parentId);
  if (!parent) {
    throw new Error('Parent scene not found');
  }

  // 2. Get or generate parent summary
  const summary = await getParentSummary(parent);

  // 3. Build extension prompt from template (now async to support transition patterns)
  const systemPrompt = await buildExtensionPrompt(params, summary);

  // 4. Generate new intermediate via task router
  const newStructure = await taskRouter.executeTaskJson(
    TASK_IDS.INTERMEDIATE_GENERATION,
    params.userDescription,
    systemPrompt
  ) as IntermediateStructure;

  // 5. Assign scene number
  const sceneNumber = await getNextSceneNumber(params.parentId);

  // 6. Create extension metadata
  const extensionMetadata: ExtensionMetadata = {
    parentSceneId: params.parentId,
    method: params.method,
    userDescription: params.userDescription,
    preservation: params.preservation,
    sceneNumber: sceneNumber,
    parentSummary: summary,
  };

  // 7. Create new intermediate prompt
  const newIntermediate: IntermediatePrompt = {
    id: crypto.randomUUID(),
    version: '2.0.0',
    created: new Date(),
    modified: new Date(),
    title: generateExtensionTitle(params.method, sceneNumber, params.userDescription),
    description: `Extended from: ${parent.title}`,
    tags: [...parent.tags], // Inherit tags from parent
    sources: {
      text: params.userDescription,
    },
    structure: newStructure,
    extensionMetadata,
  };

  // 8. Save to DB
  await db.add('intermediates', newIntermediate);

  return newIntermediate;
}

/**
 * Get all child scenes of a parent
 *
 * @param parentId - The ID of the parent scene.
 * @returns A Promise resolving to an array of child IntermediatePrompts.
 */
export async function getChildScenes(parentId: string): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  const tx = db.transaction('intermediates', 'readonly');
  const index = tx.store.index('extensionMetadata.parentSceneId');

  const children = await index.getAll(parentId);
  await tx.done;

  return children;
}

/**
 * Mark children as orphaned when parent is deleted
 *
 * @param parentId - The ID of the parent scene being deleted.
 * @param parentTitle - The title of the parent scene.
 */
export async function markChildrenAsOrphaned(
  parentId: string,
  parentTitle: string
): Promise<void> {
  const children = await getChildScenes(parentId);

  const db = await getDB();
  const tx = db.transaction('intermediates', 'readwrite');

  for (const child of children) {
    child.orphanMetadata = {
      isOrphaned: true,
      originalParentId: parentId,
      originalParentTitle: parentTitle,
      orphanedAt: new Date().toISOString(),
    };
    await tx.store.put(child);
  }

  await tx.done;
}

/**
 * Delete a scene and optionally cascade to children
 *
 * @param sceneId - The ID of the scene to delete.
 * @param cascadeDelete - Whether to recursively delete child scenes.
 */
export async function deleteSceneWithChildren(
  sceneId: string,
  cascadeDelete: boolean
): Promise<void> {
  const db = await getDB();
  const scene = await db.get('intermediates', sceneId);

  if (!scene) {
    throw new Error('Scene not found');
  }

  if (cascadeDelete) {
    // Recursively delete all children
    const children = await getChildScenes(sceneId);
    for (const child of children) {
      await deleteSceneWithChildren(child.id, true);
    }
  } else {
    // Mark children as orphaned
    await markChildrenAsOrphaned(sceneId, scene.title);
  }

  // Delete the scene itself
  await db.delete('intermediates', sceneId);
}

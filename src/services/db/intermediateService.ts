// ==================== Intermediate Service ====================
// CRUD operations for intermediate representation storage
// Model-agnostic prompt management for multi-model portability

import { initDB } from './indexedDbService';
import type { IntermediatePrompt } from '../../types/intermediate';

/**
 * Gets the shared IndexedDB database instance.
 * Initializes the database if it hasn't been initialized yet.
 * @returns A Promise resolving to the IDBPDatabase instance.
 */
async function getDB() {
  return initDB();
}

/**
 * Creates a new intermediate prompt in the database.
 * @param data - Partial intermediate prompt data.
 * @returns A Promise resolving to the newly created IntermediatePrompt.
 */
export async function createIntermediate(
  data: Partial<IntermediatePrompt>
): Promise<IntermediatePrompt> {
  const db = await getDB();

  const intermediate: IntermediatePrompt = {
    id: data.id || `intermediate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    version: data.version || '1.0.0',
    created: data.created || new Date(),
    modified: data.modified || new Date(),
    title: data.title || 'Untitled Prompt',
    description: data.description,
    tags: data.tags || [],
    sources: data.sources || {},
    structure: data.structure || {},
    relationships: data.relationships,
    extensionMetadata: data.extensionMetadata,
    orphanMetadata: data.orphanMetadata,
  };

  await db.put('intermediates', intermediate);
  return intermediate;
}

/**
 * Retrieves an intermediate prompt by its ID.
 * @param id - The unique identifier of the intermediate prompt.
 * @returns A Promise resolving to the IntermediatePrompt, or null if not found.
 */
export async function getIntermediate(id: string): Promise<IntermediatePrompt | null> {
  const db = await getDB();
  const intermediate = await db.get('intermediates', id);
  return intermediate || null;
}

/**
 * Retrieves all intermediate prompts from the database.
 * @returns A Promise resolving to an array of all IntermediatePrompt objects.
 */
export async function getAllIntermediates(): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  return await db.getAll('intermediates');
}

/**
 * Updates an existing intermediate prompt.
 * @param id - The ID of the intermediate prompt to update.
 * @param updates - Partial object containing fields to update.
 * @returns A Promise that resolves when the update is complete.
 * @throws Error if the intermediate prompt is not found.
 */
export async function updateIntermediate(
  id: string,
  updates: Partial<IntermediatePrompt>
): Promise<void> {
  const db = await getDB();
  const existing = await db.get('intermediates', id);

  if (!existing) {
    throw new Error(`Intermediate ${id} not found`);
  }

  const updated = {
    ...existing,
    ...updates,
    modified: new Date(),
  };

  await db.put('intermediates', updated);
}

/**
 * Deletes an intermediate prompt by its ID.
 * @param id - The ID of the intermediate prompt to delete.
 * @returns A Promise that resolves when the deletion is complete.
 */
export async function deleteIntermediate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('intermediates', id);
}

/**
 * Searches for intermediate prompts matching a query string.
 * Matches against title, description, and tags. Case-insensitive.
 * @param query - The search string.
 * @returns A Promise resolving to an array of matching IntermediatePrompt objects.
 */
export async function searchIntermediates(query: string): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  const all = await db.getAll('intermediates');

  const lowerQuery = query.toLowerCase();
  return all.filter(intermediate =>
    intermediate.title.toLowerCase().includes(lowerQuery) ||
    intermediate.description?.toLowerCase().includes(lowerQuery) ||
    intermediate.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Retrieves intermediate prompts associated with a specific tag.
 * @param tag - The tag to search for.
 * @returns A Promise resolving to an array of IntermediatePrompt objects.
 */
export async function getIntermediatesByTag(tag: string): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  return await db.getAllFromIndex('intermediates', 'tags', tag);
}

/**
 * Retrieves child intermediate prompts for a given parent ID.
 * Useful for finding branches or derived versions.
 * @param parentId - The ID of the parent intermediate prompt.
 * @returns A Promise resolving to an array of child IntermediatePrompt objects.
 */
export async function getIntermediateChildren(parentId: string): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  const all = await db.getAll('intermediates');
  return all.filter(i => i.relationships?.parentId === parentId);
}

/**
 * Retrieves the full tree of intermediate prompts starting from a root ID.
 * @param rootId - The ID of the root intermediate prompt.
 * @returns A Promise resolving to an array of IntermediatePrompt objects in the tree.
 */
export async function getIntermediateTree(rootId: string): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  const all = await db.getAll('intermediates');

  // Build tree starting from root
  const tree: IntermediatePrompt[] = [];
  const visited = new Set<string>();

  function addNode(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const node = all.find(i => i.id === id);
    if (!node) return;

    tree.push(node);

    // Add children
    node.relationships?.childIds?.forEach(childId => addNode(childId));
  }

  addNode(rootId);
  return tree;
}

/**
 * Retrieves all intermediate prompts sorted by creation date.
 * @param order - The sort order, 'asc' (ascending) or 'desc' (descending). Defaults to 'desc'.
 * @returns A Promise resolving to a sorted array of IntermediatePrompt objects.
 */
export async function getIntermediatesSortedByDate(
  order: 'asc' | 'desc' = 'desc'
): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('intermediates', 'created');

  if (order === 'desc') {
    return all.reverse();
  }
  return all;
}

/**
 * Retrieves all intermediate prompts sorted by modification date.
 * @param order - The sort order, 'asc' (ascending) or 'desc' (descending). Defaults to 'desc'.
 * @returns A Promise resolving to a sorted array of IntermediatePrompt objects.
 */
export async function getIntermediatesSortedByModified(
  order: 'asc' | 'desc' = 'desc'
): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('intermediates', 'modified');

  if (order === 'desc') {
    return all.reverse();
  }
  return all;
}

/**
 * Counts the total number of intermediate prompts in the database.
 * @returns A Promise resolving to the count.
 */
export async function countIntermediates(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll('intermediates');
  return all.length;
}

/**
 * Creates a new branch from an existing intermediate prompt.
 * Copies the source prompt and establishes a parent-child relationship.
 * @param sourceId - The ID of the source prompt to branch from.
 * @param branchName - The name of the new branch.
 * @returns A Promise resolving to the new branched IntermediatePrompt, or null if source not found.
 */
export async function createIntermediateBranch(
  sourceId: string,
  branchName: string
): Promise<IntermediatePrompt | null> {
  const source = await getIntermediate(sourceId);

  if (!source) {
    console.error(`Source intermediate ${sourceId} not found`);
    return null;
  }

  // Create a copy with new branch relationship
  const branched = await createIntermediate({
    ...source,
    id: undefined, // Generate new ID
    created: undefined, // Generate new timestamp
    modified: undefined,
    relationships: {
      ...source.relationships,
      parentId: sourceId,
      branchName,
      childIds: [],
    },
  });

  // Update parent to track the child
  const childIds = source.relationships?.childIds || [];
  await updateIntermediate(sourceId, {
    relationships: {
      ...source.relationships,
      childIds: [...childIds, branched.id],
    },
  });

  return branched;
}

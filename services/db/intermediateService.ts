// ==================== Intermediate Service ====================
// CRUD operations for intermediate representation storage
// Model-agnostic prompt management for multi-model portability

import { initDB } from './indexedDbService';
import type { IntermediatePrompt } from '../../types/intermediate';

// Initialize DB connection
async function getDB() {
  return initDB();
}

// Create new intermediate
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
  };

  await db.put('intermediates', intermediate);
  return intermediate;
}

// Get intermediate by ID
export async function getIntermediate(id: string): Promise<IntermediatePrompt | null> {
  const db = await getDB();
  const intermediate = await db.get('intermediates', id);
  return intermediate || null;
}

// Get all intermediates
export async function getAllIntermediates(): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  return await db.getAll('intermediates');
}

// Update intermediate
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

// Delete intermediate
export async function deleteIntermediate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('intermediates', id);
}

// Search intermediates by text
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

// Get intermediates by tag
export async function getIntermediatesByTag(tag: string): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  return await db.getAllFromIndex('intermediates', 'tags', tag);
}

// Get children of intermediate (for branching)
export async function getIntermediateChildren(parentId: string): Promise<IntermediatePrompt[]> {
  const db = await getDB();
  const all = await db.getAll('intermediates');
  return all.filter(i => i.relationships?.parentId === parentId);
}

// Get intermediate tree (for version control visualization)
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

// Get intermediates sorted by creation date
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

// Get intermediates sorted by modification date
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

// Count intermediates
export async function countIntermediates(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll('intermediates');
  return all.length;
}

// Create a branch from an existing intermediate
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

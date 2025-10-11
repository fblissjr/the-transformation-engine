import { Prompt, PromptVersion, GenerationMetadata } from '../types';
import * as dbService from './dbService';

export async function getVersions(promptId: string): Promise<PromptVersion[]> {
  try {
    return await dbService.getVersions(promptId);
  } catch (e) {
    console.error(`Failed to get versions for prompt ${promptId}`, e);
    return [];
  }
}

export async function addVersion(
  prompt: Prompt,
  metadata?: GenerationMetadata,
  parentVersionId?: string,
  branchName?: string
): Promise<void> {
  if (!prompt) return;

  try {
    // Merge metadata with parentVersionId and branchName
    const enrichedMetadata = metadata
      ? { ...metadata, parentVersionId, branchName }
      : undefined;

    const newVersion: PromptVersion = {
      promptId: prompt.id,
      versionId: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      structuredOutput: prompt.structuredOutput,
      normalizedOutput: prompt.normalizedOutput,
      metadata: enrichedMetadata,

      // Duplicate key fields for easier querying
      parentVersionId: enrichedMetadata?.parentVersionId,
      branchName: branchName || 'main', // Default to "main" branch
      fragmentsUsed: enrichedMetadata?.fragmentsUsed,
    };
    await dbService.addVersion(newVersion);
  } catch (e) {
    console.error(`Failed to add version for prompt ${prompt.id}`, e);
  }
}

export async function deleteVersions(promptId: string): Promise<void> {
    try {
        await dbService.deleteVersions(promptId);
    } catch (e) {
        console.error(`Failed to delete versions for prompt ${promptId}`, e);
    }
}

/**
 * Create a new branch from an existing version
 * This creates a new version with the same content but a new branch name
 */
export async function createBranch(
  promptId: string,
  sourceVersionId: string,
  newBranchName: string
): Promise<PromptVersion | null> {
  try {
    // Get all versions for this prompt
    const versions = await dbService.getVersions(promptId);
    const sourceVersion = versions.find(v => v.versionId === sourceVersionId);

    if (!sourceVersion) {
      console.error(`Source version ${sourceVersionId} not found`);
      return null;
    }

    // Create a new version with the same content but different branch
    const newVersion: PromptVersion = {
      promptId,
      versionId: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      structuredOutput: sourceVersion.structuredOutput,
      normalizedOutput: sourceVersion.normalizedOutput,
      metadata: sourceVersion.metadata
        ? {
            ...sourceVersion.metadata,
            parentVersionId: sourceVersionId,
            branchName: newBranchName,
          }
        : undefined,

      // Top-level fields
      parentVersionId: sourceVersionId,
      branchName: newBranchName,
      fragmentsUsed: sourceVersion.fragmentsUsed,
    };

    await dbService.addVersion(newVersion);
    return newVersion;
  } catch (e) {
    console.error(`Failed to create branch for prompt ${promptId}`, e);
    return null;
  }
}

/**
 * Get the version tree structure for a prompt
 * Returns versions organized by branch with parent-child relationships
 */
export async function getVersionTree(promptId: string): Promise<{
  branches: { [branchName: string]: PromptVersion[] };
  rootVersions: PromptVersion[];
}> {
  try {
    const versions = await dbService.getVersions(promptId);

    // Organize by branch
    const branches: { [branchName: string]: PromptVersion[] } = {};
    const rootVersions: PromptVersion[] = [];

    for (const version of versions) {
      const branch = version.branchName || 'main';

      if (!branches[branch]) {
        branches[branch] = [];
      }
      branches[branch].push(version);

      // Track root versions (no parent)
      if (!version.parentVersionId) {
        rootVersions.push(version);
      }
    }

    // Sort each branch by timestamp
    for (const branch in branches) {
      branches[branch].sort((a, b) =>
        new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
      );
    }

    return { branches, rootVersions };
  } catch (e) {
    console.error(`Failed to get version tree for prompt ${promptId}`, e);
    return { branches: {}, rootVersions: [] };
  }
}
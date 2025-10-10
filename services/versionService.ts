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
  parentVersionId?: string
): Promise<void> {
  if (!prompt) return;

  try {
    const newVersion: PromptVersion = {
      promptId: prompt.id,
      versionId: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      structuredOutput: prompt.structuredOutput,
      normalizedOutput: prompt.normalizedOutput,
      metadata: metadata ? { ...metadata, parentVersionId } : undefined,
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
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../../services/db/indexedDbService';
import { DB_CONFIG } from '../../config/database';
import type {
  ImageProject,
  ImageGeneration,
  ImageEdit,
  SceneLink,
  QualityScores,
  EditHistoryEntry,
} from '../types/imageTypes';

// Store names from consolidated Main DB v11
const IMAGE_STORES = {
  IMAGE_PROJECTS: DB_CONFIG.stores.imageProjects,
  IMAGE_GENERATIONS: DB_CONFIG.stores.imageGenerations,
  IMAGE_EDITS: DB_CONFIG.stores.imageEdits,
  SCENE_LINKS: DB_CONFIG.stores.sceneLinks,
} as const;

// ============================================================================
// IMAGE PROJECTS
// ============================================================================

export async function createImageProject(
  title: string,
  description?: string,
  tags?: string[]
): Promise<ImageProject> {
  const db = await getDB();
  const now = new Date();

  const project: ImageProject = {
    id: uuidv4(),
    title,
    description,
    tags,
    created: now,
    modified: now,
  };

  await db.add(IMAGE_STORES.IMAGE_PROJECTS, project);
  return project;
}

export async function getImageProject(id: string): Promise<ImageProject | undefined> {
  const db = await getDB();
  return await db.get(IMAGE_STORES.IMAGE_PROJECTS, id);
}

export async function getAllImageProjects(): Promise<ImageProject[]> {
  const db = await getDB();
  return await db.getAll(IMAGE_STORES.IMAGE_PROJECTS);
}

export async function updateImageProject(
  id: string,
  updates: Partial<Omit<ImageProject, 'id' | 'created'>>
): Promise<ImageProject> {
  const db = await getDB();
  const existing = await db.get(IMAGE_STORES.IMAGE_PROJECTS, id);

  if (!existing) {
    throw new Error(`Image project not found: ${id}`);
  }

  const updated: ImageProject = {
    ...existing,
    ...updates,
    id: existing.id,
    created: existing.created,
    modified: new Date(),
  };

  await db.put(IMAGE_STORES.IMAGE_PROJECTS, updated);
  return updated;
}

export async function deleteImageProject(id: string): Promise<void> {
  const db = await getDB();

  // Delete all associated generations
  const generations = await getImageGenerationsByProject(id);
  for (const gen of generations) {
    await deleteImageGeneration(gen.id);
  }

  // Delete all associated edits
  const edits = await getImageEditsByProject(id);
  for (const edit of edits) {
    await deleteImageEdit(edit.id);
  }

  await db.delete(IMAGE_STORES.IMAGE_PROJECTS, id);
}

// ============================================================================
// IMAGE GENERATIONS
// ============================================================================

export interface CreateImageGenerationParams {
  projectId: string;
  prompt: string;
  template?: string;
  model: string;
  providerId: string;
  structuredYaml: string;
  imageData?: Blob;
  thumbnailData?: Blob;
  qualityScores?: QualityScores;
  linkedSceneIds?: string[];
  parentImageId?: string;
  status?: 'generating' | 'ready' | 'error';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export async function createImageGeneration(
  params: CreateImageGenerationParams
): Promise<ImageGeneration> {
  const db = await getDB();
  const now = new Date();

  // Verify project exists
  const project = await db.get(IMAGE_STORES.IMAGE_PROJECTS, params.projectId);
  if (!project) {
    throw new Error(`Image project not found: ${params.projectId}`);
  }

  const generation: ImageGeneration = {
    id: uuidv4(),
    projectId: params.projectId,
    created: now,
    modified: now,
    imageData: params.imageData || new Blob(),
    thumbnailData: params.thumbnailData,
    prompt: params.prompt,
    template: params.template,
    model: params.model,
    providerId: params.providerId,
    structuredYaml: params.structuredYaml,
    qualityScores: params.qualityScores,
    linkedSceneIds: params.linkedSceneIds || [],
    parentImageId: params.parentImageId,
    editHistory: [],
    status: params.status || 'generating',
    errorMessage: params.errorMessage,
    metadata: params.metadata,
  };

  await db.add(IMAGE_STORES.IMAGE_GENERATIONS, generation);
  return generation;
}

export async function getImageGeneration(id: string): Promise<ImageGeneration | undefined> {
  const db = await getDB();
  return await db.get(IMAGE_STORES.IMAGE_GENERATIONS, id);
}

export async function getAllImageGenerations(): Promise<ImageGeneration[]> {
  const db = await getDB();
  return await db.getAll(IMAGE_STORES.IMAGE_GENERATIONS);
}

export async function getImageGenerationsByProject(projectId: string): Promise<ImageGeneration[]> {
  const db = await getDB();
  return await db.getAllFromIndex(IMAGE_STORES.IMAGE_GENERATIONS, 'projectId', projectId);
}

export async function getImageGenerationsByStatus(
  status: 'generating' | 'ready' | 'error'
): Promise<ImageGeneration[]> {
  const db = await getDB();
  return await db.getAllFromIndex(IMAGE_STORES.IMAGE_GENERATIONS, 'status', status);
}

export async function getChildImageGenerations(parentImageId: string): Promise<ImageGeneration[]> {
  const db = await getDB();
  return await db.getAllFromIndex(
    IMAGE_STORES.IMAGE_GENERATIONS,
    'parentImageId',
    parentImageId
  );
}

export async function updateImageGeneration(
  id: string,
  updates: Partial<Omit<ImageGeneration, 'id' | 'created' | 'projectId'>>
): Promise<ImageGeneration> {
  const db = await getDB();
  const existing = await db.get(IMAGE_STORES.IMAGE_GENERATIONS, id);

  if (!existing) {
    throw new Error(`Image generation not found: ${id}`);
  }

  const updated: ImageGeneration = {
    ...existing,
    ...updates,
    id: existing.id,
    projectId: existing.projectId,
    created: existing.created,
    modified: new Date(),
  };

  await db.put(IMAGE_STORES.IMAGE_GENERATIONS, updated);
  return updated;
}

export async function deleteImageGeneration(id: string): Promise<void> {
  const db = await getDB();

  // Delete all child generations
  const children = await getChildImageGenerations(id);
  for (const child of children) {
    await deleteImageGeneration(child.id);
  }

  // Delete all associated edits
  const edits = await getImageEditsByGeneration(id);
  for (const edit of edits) {
    await deleteImageEdit(edit.id);
  }

  // Delete all scene links
  const links = await getSceneLinksByImage(id);
  for (const link of links) {
    await deleteSceneLink(link.id);
  }

  await db.delete(IMAGE_STORES.IMAGE_GENERATIONS, id);
}

export async function addEditToHistory(
  imageId: string,
  operation: string,
  parameters: Record<string, unknown>,
  beforeImageId?: string
): Promise<ImageGeneration> {
  const db = await getDB();
  const existing = await db.get(IMAGE_STORES.IMAGE_GENERATIONS, imageId);

  if (!existing) {
    throw new Error(`Image generation not found: ${imageId}`);
  }

  const historyEntry: EditHistoryEntry = {
    timestamp: Date.now(),
    operation,
    parameters,
    beforeImageId,
  };

  const updated: ImageGeneration = {
    ...existing,
    editHistory: [...(existing.editHistory || []), historyEntry],
    modified: new Date(),
  };

  await db.put(IMAGE_STORES.IMAGE_GENERATIONS, updated);
  return updated;
}

export async function linkImageToScene(
  imageId: string,
  sceneId: string
): Promise<ImageGeneration> {
  const db = await getDB();
  const existing = await db.get(IMAGE_STORES.IMAGE_GENERATIONS, imageId);

  if (!existing) {
    throw new Error(`Image generation not found: ${imageId}`);
  }

  if (existing.linkedSceneIds.includes(sceneId)) {
    return existing; // Already linked
  }

  const updated: ImageGeneration = {
    ...existing,
    linkedSceneIds: [...existing.linkedSceneIds, sceneId],
    modified: new Date(),
  };

  await db.put(IMAGE_STORES.IMAGE_GENERATIONS, updated);
  return updated;
}

export async function unlinkImageFromScene(
  imageId: string,
  sceneId: string
): Promise<ImageGeneration> {
  const db = await getDB();
  const existing = await db.get(IMAGE_STORES.IMAGE_GENERATIONS, imageId);

  if (!existing) {
    throw new Error(`Image generation not found: ${imageId}`);
  }

  const updated: ImageGeneration = {
    ...existing,
    linkedSceneIds: existing.linkedSceneIds.filter((id) => id !== sceneId),
    modified: new Date(),
  };

  await db.put(IMAGE_STORES.IMAGE_GENERATIONS, updated);
  return updated;
}

// ============================================================================
// IMAGE EDITS
// ============================================================================

export interface CreateImageEditParams {
  generationId: string;  // Unified naming
  projectId: string;
  editType: string;
  instruction: string;
  parameters: Record<string, unknown>;
  resultImageId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export async function createImageEdit(params: CreateImageEditParams): Promise<ImageEdit> {
  const db = await getDB();

  // Verify image exists
  const image = await db.get(IMAGE_STORES.IMAGE_GENERATIONS, params.generationId);
  if (!image) {
    throw new Error(`Image generation not found: ${params.generationId}`);
  }

  const edit: ImageEdit = {
    id: uuidv4(),
    generationId: params.generationId,
    projectId: params.projectId,
    created: new Date(),
    editType: params.editType,
    instruction: params.instruction,
    parameters: params.parameters,
    resultImageId: params.resultImageId,
    status: params.status || 'pending',
    errorMessage: params.errorMessage,
  };

  await db.add(IMAGE_STORES.IMAGE_EDITS, edit);
  return edit;
}

export async function getImageEdit(id: string): Promise<ImageEdit | undefined> {
  const db = await getDB();
  return await db.get(IMAGE_STORES.IMAGE_EDITS, id);
}

export async function getAllImageEdits(): Promise<ImageEdit[]> {
  const db = await getDB();
  return await db.getAll(IMAGE_STORES.IMAGE_EDITS);
}

export async function getImageEditsByGeneration(generationId: string): Promise<ImageEdit[]> {
  const db = await getDB();
  return await db.getAllFromIndex(IMAGE_STORES.IMAGE_EDITS, 'generationId', generationId);
}

export async function getImageEditsByProject(projectId: string): Promise<ImageEdit[]> {
  const db = await getDB();
  return await db.getAllFromIndex(IMAGE_STORES.IMAGE_EDITS, 'projectId', projectId);
}

export async function getImageEditsByStatus(
  status: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<ImageEdit[]> {
  const db = await getDB();
  return await db.getAllFromIndex(IMAGE_STORES.IMAGE_EDITS, 'status', status);
}

export async function updateImageEdit(
  id: string,
  updates: Partial<Omit<ImageEdit, 'id' | 'created' | 'generationId' | 'projectId'>>
): Promise<ImageEdit> {
  const db = await getDB();
  const existing = await db.get(IMAGE_STORES.IMAGE_EDITS, id);

  if (!existing) {
    throw new Error(`Image edit not found: ${id}`);
  }

  const updated: ImageEdit = {
    ...existing,
    ...updates,
    id: existing.id,
    generationId: existing.generationId,
    projectId: existing.projectId,
    created: existing.created,
  };

  await db.put(IMAGE_STORES.IMAGE_EDITS, updated);
  return updated;
}

export async function deleteImageEdit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(IMAGE_STORES.IMAGE_EDITS, id);
}

// ============================================================================
// SCENE LINKS
// ============================================================================

export interface CreateSceneLinkParams {
  imageGenerationId: string;
  intermediateId: string;
  linkType: 'first_frame' | 'reference' | 'ingredient' | 'style_ref';
  metadata?: {
    linkReason?: string;
    autoGenerated?: boolean;
    [key: string]: unknown;
  };
}

export async function createSceneLink(params: CreateSceneLinkParams): Promise<SceneLink> {
  const db = await getDB();

  // Verify image exists
  const image = await db.get(IMAGE_STORES.IMAGE_GENERATIONS, params.imageGenerationId);
  if (!image) {
    throw new Error(`Image generation not found: ${params.imageGenerationId}`);
  }

  const link: SceneLink = {
    id: uuidv4(),
    imageGenerationId: params.imageGenerationId,
    intermediateId: params.intermediateId,
    linkType: params.linkType,
    created: new Date(),
    metadata: params.metadata,
  };

  await db.add(IMAGE_STORES.SCENE_LINKS, link);
  return link;
}

export async function getSceneLink(id: string): Promise<SceneLink | undefined> {
  const db = await getDB();
  return await db.get(IMAGE_STORES.SCENE_LINKS, id);
}

export async function getAllSceneLinks(): Promise<SceneLink[]> {
  const db = await getDB();
  return await db.getAll(IMAGE_STORES.SCENE_LINKS);
}

export async function getSceneLinksByImage(imageGenerationId: string): Promise<SceneLink[]> {
  const db = await getDB();
  return await db.getAllFromIndex(IMAGE_STORES.SCENE_LINKS, 'imageGenerationId', imageGenerationId);
}

export async function getSceneLinksByScene(intermediateId: string): Promise<SceneLink[]> {
  const db = await getDB();
  return await db.getAllFromIndex(IMAGE_STORES.SCENE_LINKS, 'intermediateId', intermediateId);
}

export async function deleteSceneLink(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(IMAGE_STORES.SCENE_LINKS, id);
}

export async function deleteSceneLinksByImage(imageGenerationId: string): Promise<void> {
  const links = await getSceneLinksByImage(imageGenerationId);
  for (const link of links) {
    await deleteSceneLink(link.id);
  }
}

export async function deleteSceneLinksByScene(intermediateId: string): Promise<void> {
  const links = await getSceneLinksByScene(intermediateId);
  for (const link of links) {
    await deleteSceneLink(link.id);
  }
}

// ============================================================================
// HIGH-LEVEL WRAPPER FUNCTIONS (for taskRouter integration)
// ============================================================================

/**
 * High-level wrapper for saving a newly generated image
 * Used by taskRouter.executeImageGeneration()
 */
export async function saveGeneratedImage(params: {
  projectId: string;
  title: string;
  imageData: string; // base64
  mimeType: string;
  prompt: string;
  structuredYaml: string;
  template?: string;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  // Convert base64 to Blob
  const base64Data = params.imageData.includes(',')
    ? params.imageData.split(',')[1]
    : params.imageData;
  const binaryData = atob(base64Data);
  const bytes = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    bytes[i] = binaryData.charCodeAt(i);
  }
  const imageBlob = new Blob([bytes], { type: params.mimeType });

  // Get provider/model from task assignment (will be added by taskRouter)
  const generation = await createImageGeneration({
    projectId: params.projectId,
    prompt: params.prompt,
    template: params.template,
    model: params.metadata?.model as string || 'gemini-2.5-flash-image',
    providerId: params.metadata?.providerId as string || 'gemini',
    structuredYaml: params.structuredYaml,
    imageData: imageBlob,
    status: 'ready',
    metadata: {
      ...params.metadata,
      title: params.title,
      mimeType: params.mimeType,
    },
  });

  return generation.id;
}

/**
 * High-level wrapper for retrieving an image
 * Used by taskRouter.executeImageEdit()
 */
export async function getImage(imageId: string): Promise<{
  imageData: string; // base64
  mimeType: string;
} | null> {
  const generation = await getImageGeneration(imageId);
  if (!generation) {
    return null;
  }

  // Convert Blob to base64
  const arrayBuffer = await generation.imageData.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    imageData: base64,
    mimeType: generation.metadata?.mimeType as string || 'image/png',
  };
}

/**
 * High-level wrapper for saving an edited image
 * Used by taskRouter.executeImageEdit()
 */
export async function saveEditedImage(params: {
  sourceImageId: string;
  projectId: string;
  title: string;
  imageData: string; // base64
  mimeType: string;
  editType: string;
  instruction: string;
  parameters: Record<string, unknown>;
}): Promise<string> {
  // Convert base64 to Blob
  const base64Data = params.imageData.includes(',')
    ? params.imageData.split(',')[1]
    : params.imageData;
  const binaryData = atob(base64Data);
  const bytes = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    bytes[i] = binaryData.charCodeAt(i);
  }
  const imageBlob = new Blob([bytes], { type: params.mimeType });

  // Get source image to extract model/provider info
  const sourceGeneration = await getImageGeneration(params.sourceImageId);
  if (!sourceGeneration) {
    throw new Error(`Source image ${params.sourceImageId} not found`);
  }

  // Create new generation for edited image
  const generation = await createImageGeneration({
    projectId: params.projectId,
    prompt: `Edit: ${params.instruction}`,
    template: sourceGeneration.template,
    model: params.parameters.model as string || sourceGeneration.model,
    providerId: params.parameters.providerId as string || sourceGeneration.providerId,
    structuredYaml: sourceGeneration.structuredYaml,
    imageData: imageBlob,
    parentImageId: params.sourceImageId,
    status: 'ready',
    metadata: {
      ...params.parameters,
      title: params.title,
      mimeType: params.mimeType,
      editType: params.editType,
      instruction: params.instruction,
    },
  });

  // Add edit history to source image
  await addEditToHistory(
    params.sourceImageId,
    params.editType,
    params.parameters,
    generation.id
  );

  // Also create an ImageEdit record
  await createImageEdit({
    generationId: params.sourceImageId,
    editType: params.editType,
    instruction: params.instruction,
    parameters: params.parameters,
    model: params.parameters.model as string || sourceGeneration.model,
    providerId: params.parameters.providerId as string || sourceGeneration.providerId,
    resultImageData: imageBlob,
  });

  return generation.id;
}

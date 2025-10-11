
import { openDB, IDBPDatabase } from 'idb';
import { Prompt, PromptVersion, SystemPromptConfig, AppSettings, MediaBlob } from '../../types';

const DB_NAME = 'TransformationEngineDB';
const PROMPTS_STORE_NAME = 'prompts';
const VERSIONS_STORE_NAME = 'versions';
const CONFIG_STORE_NAME = 'promptConfigs';
const SETTINGS_STORE_NAME = 'appSettings';
const MEDIA_STORE_NAME = 'media';
const DB_VERSION = 6;

let db: IDBPDatabase;

export async function initDB() {
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, tx) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(PROMPTS_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: false,
        });
        store.createIndex('createdAt', 'createdAt');
      }
      if (oldVersion < 2) {
        const store = db.createObjectStore(VERSIONS_STORE_NAME, {
            keyPath: 'versionId',
        });
        store.createIndex('promptId', 'promptId');
      }
      if (oldVersion < 3) {
        const promptStore = tx.objectStore(PROMPTS_STORE_NAME);
        promptStore.createIndex('title_lowercase', 'title_lowercase');
      }
      if (oldVersion < 4) {
        const configStore = db.createObjectStore(CONFIG_STORE_NAME, {
          keyPath: 'id',
        });
        configStore.createIndex('isDefault', 'isDefault');
        configStore.createIndex('createdAt', 'createdAt');
      }
      if (oldVersion < 5) {
        db.createObjectStore(SETTINGS_STORE_NAME, {
          keyPath: 'id',
        });
      }
      if (oldVersion < 6) {
        const mediaStore = db.createObjectStore(MEDIA_STORE_NAME, {
          keyPath: 'id',
        });
        mediaStore.createIndex('uploadedAt', 'uploadedAt');
      }
    },
  });
}

export async function addPrompt(promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt> {
  const newPrompt: Prompt = {
    ...promptData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    title_lowercase: promptData.title.toLowerCase(),
  };
  await db.put(PROMPTS_STORE_NAME, newPrompt);
  return newPrompt;
}

export async function getPrompts(): Promise<Prompt[]> {
  const prompts = await db.getAllFromIndex(PROMPTS_STORE_NAME, 'createdAt');
  return prompts.reverse();
}

export async function getPromptsPaginated(limit: number, offset: number): Promise<{
  prompts: Prompt[];
  hasMore: boolean;
  total: number;
}> {
  const allPrompts = await db.getAllFromIndex(PROMPTS_STORE_NAME, 'createdAt');
  const reversed = allPrompts.reverse();
  const total = reversed.length;
  const prompts = reversed.slice(offset, offset + limit);
  const hasMore = (offset + limit) < total;

  return { prompts, hasMore, total };
}

export async function searchPrompts(searchTerm: string): Promise<Prompt[]> {
    if (!db) await initDB();
    if (!searchTerm) {
        return getPrompts();
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const allPrompts = await db.getAll(PROMPTS_STORE_NAME);
    const results = allPrompts.filter(prompt =>
        (prompt.title_lowercase || prompt.title.toLowerCase()).includes(lowerCaseSearchTerm)
    );
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updatePrompt(prompt: Prompt): Promise<void> {
  const promptToUpdate = {
    ...prompt,
    title_lowercase: prompt.title.toLowerCase(),
  };
  await db.put(PROMPTS_STORE_NAME, promptToUpdate);
}

export async function deletePrompt(id: string): Promise<void> {
  await db.delete(PROMPTS_STORE_NAME, id);
}

export async function exportPrompts(): Promise<string> {
  const allPrompts = await getPrompts();
  return JSON.stringify(allPrompts, null, 2);
}

export async function importPrompts(jsonContent: string): Promise<void> {
    const promptsToImport: Prompt[] = JSON.parse(jsonContent);
    const tx = db.transaction(PROMPTS_STORE_NAME, 'readwrite');
    await Promise.all(promptsToImport.map(p => tx.store.put(p)));
    await tx.done;
}

// --- Version Functions ---

export async function addVersion(versionData: PromptVersion): Promise<void> {
    await db.put(VERSIONS_STORE_NAME, versionData);
}

export async function getVersions(promptId: string): Promise<PromptVersion[]> {
    const versions = await db.getAllFromIndex(VERSIONS_STORE_NAME, 'promptId', promptId);
    return versions.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export async function deleteVersions(promptId: string): Promise<void> {
    const tx = db.transaction(VERSIONS_STORE_NAME, 'readwrite');
    const index = tx.store.index('promptId');
    let cursor = await index.openCursor(promptId);
    while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
    }
    await tx.done;
}

// --- Prompt Config Functions ---

export async function addPromptConfig(config: Omit<SystemPromptConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<SystemPromptConfig> {
  const newConfig: SystemPromptConfig = {
    ...config,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.put(CONFIG_STORE_NAME, newConfig);
  return newConfig;
}

export async function getPromptConfigs(): Promise<SystemPromptConfig[]> {
  const configs = await db.getAllFromIndex(CONFIG_STORE_NAME, 'createdAt');
  return configs.reverse();
}

export async function getDefaultPromptConfig(): Promise<SystemPromptConfig | undefined> {
  const allConfigs = await db.getAll(CONFIG_STORE_NAME);
  return allConfigs.find(config => config.isDefault);
}

export async function updatePromptConfig(config: SystemPromptConfig): Promise<void> {
  const updatedConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };
  await db.put(CONFIG_STORE_NAME, updatedConfig);
}

export async function deletePromptConfig(id: string): Promise<void> {
  await db.delete(CONFIG_STORE_NAME, id);
}

export async function setDefaultPromptConfig(id: string): Promise<void> {
  const tx = db.transaction(CONFIG_STORE_NAME, 'readwrite');
  const allConfigs = await tx.store.getAll();

  for (const config of allConfigs) {
    config.isDefault = config.id === id;
    await tx.store.put(config);
  }

  await tx.done;
}

// --- App Settings Functions ---

export async function getAppSettings(): Promise<AppSettings | undefined> {
  const allSettings = await db.getAll(SETTINGS_STORE_NAME);
  return allSettings[0];
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const updatedSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  await db.put(SETTINGS_STORE_NAME, updatedSettings);
}

// ==================== Blob Storage Functions ====================

/**
 * Save a media blob to the database
 * @param blob The file blob to save
 * @param mimeType The MIME type of the file
 * @returns The ID of the saved blob
 */
export async function saveMediaBlob(blob: Blob, mimeType: string): Promise<string> {
  const id = crypto.randomUUID();
  const mediaBlob: MediaBlob = {
    id,
    blob,
    mimeType,
    uploadedAt: new Date().toISOString(),
  };
  await db.put(MEDIA_STORE_NAME, mediaBlob);
  return id;
}

/**
 * Get a media blob from the database
 * @param id The ID of the blob
 * @returns The blob or null if not found
 */
export async function getMediaBlob(id: string): Promise<Blob | null> {
  const mediaBlob = await db.get(MEDIA_STORE_NAME, id);
  return mediaBlob?.blob || null;
}

/**
 * Delete a media blob from the database
 * @param id The ID of the blob to delete
 */
export async function deleteMediaBlob(id: string): Promise<void> {
  await db.delete(MEDIA_STORE_NAME, id);
}

/**
 * Get a blob URL for displaying media
 * @param id The ID of the blob
 * @returns A blob URL or null if not found
 */
export async function getMediaBlobUrl(id: string): Promise<string | null> {
  const blob = await getMediaBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Clean up orphaned blobs (blobs not referenced by any prompt)
 * Should be called periodically or on app startup
 */
export async function cleanupOrphanedBlobs(): Promise<number> {
  const allPrompts = await getPrompts();
  const referencedBlobIds = new Set<string>();

  // Collect all referenced blob IDs
  allPrompts.forEach(prompt => {
    if (prompt.mediaReferences) {
      prompt.mediaReferences.forEach(ref => {
        if (ref.blobId) {
          referencedBlobIds.add(ref.blobId);
        }
      });
    }
  });

  // Get all blobs in the store
  const allBlobs = await db.getAll(MEDIA_STORE_NAME);
  let deletedCount = 0;

  // Delete orphaned blobs
  for (const mediaBlob of allBlobs) {
    if (!referencedBlobIds.has(mediaBlob.id)) {
      await deleteMediaBlob(mediaBlob.id);
      deletedCount++;
    }
  }

  return deletedCount;
}

/**
 * Generate a thumbnail from an image or video file
 * @param file The file to generate a thumbnail from
 * @param maxSize Maximum width/height (default 200px)
 * @returns Base64 encoded thumbnail
 */
export async function generateThumbnail(file: File, maxSize: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      // For video, create a thumbnail from the first frame
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        video.currentTime = 0;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions
        let width = video.videoWidth;
        let height = video.videoHeight;
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
}

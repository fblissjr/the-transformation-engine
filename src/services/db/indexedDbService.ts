
import { openDB, IDBPDatabase } from 'idb';
import { Prompt, PromptVersion, SystemPromptConfig, AppSettings, MediaBlob } from '../../types';
import { DB_NAME, DB_VERSION, STORE_NAMES } from '../../config/database';
import { createFreshSchema } from './schema';

const PROMPTS_STORE_NAME = STORE_NAMES.prompts;
const VERSIONS_STORE_NAME = STORE_NAMES.versions;
const CONFIG_STORE_NAME = STORE_NAMES.promptConfigs;
const SETTINGS_STORE_NAME = STORE_NAMES.appSettings;
const MEDIA_STORE_NAME = STORE_NAMES.media;

let db: IDBPDatabase;
let dbPromise: Promise<IDBPDatabase> | null = null;

// Export a function to get the shared DB instance
/**
 * Gets the shared IndexedDB database instance.
 * Initializes the database if it hasn't been initialized yet.
 * @returns A Promise resolving to the IDBPDatabase instance.
 */
export async function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
}

/**
 * Initializes the IndexedDB database.
 * Opens the database and handles schema upgrades.
 * @returns A Promise resolving to the opened IDBPDatabase instance.
 */
export async function initDB() {
  if (db) {
    return db;
  }
  console.log(`[IndexedDB] Opening ${DB_NAME} (schema v${DB_VERSION})...`);
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, tx) {
      // ONLY allow fresh database creation
      if (oldVersion !== 0) {
        throw new Error(
          `Database version mismatch. Found v${oldVersion}, expected fresh install.\n` +
          `Please export your data, delete the database, and import after fresh initialization.`
        );
      }

      // Create fresh schema (only runs on first install)
      createFreshSchema(db);
    },
  });
  console.log(`[IndexedDB] Database ready (v${db.version})`);
  return db;
}

/**
 * Adds a new prompt to the prompts store.
 * @param promptData - The prompt data without ID and creation timestamp.
 * @returns A Promise resolving to the newly created Prompt object.
 */
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

/**
 * Retrieves all prompts from the store, sorted by creation date (newest first).
 * @returns A Promise resolving to an array of Prompt objects.
 */
export async function getPrompts(): Promise<Prompt[]> {
  const prompts = await db.getAllFromIndex(PROMPTS_STORE_NAME, 'createdAt');
  return prompts.reverse();
}

/**
 * Retrieves a paginated list of prompts.
 * @param limit - The maximum number of prompts to return.
 * @param offset - The starting index for pagination.
 * @returns A Promise resolving to an object containing the prompts, a hasMore flag, and the total count.
 */
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

/**
 * Searches for prompts by title (case-insensitive).
 * @param searchTerm - The search term.
 * @returns A Promise resolving to an array of matching Prompt objects.
 */
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

/**
 * Updates an existing prompt in the store.
 * @param prompt - The updated Prompt object.
 * @returns A Promise that resolves when the update is complete.
 */
export async function updatePrompt(prompt: Prompt): Promise<void> {
  const promptToUpdate = {
    ...prompt,
    title_lowercase: prompt.title.toLowerCase(),
  };
  await db.put(PROMPTS_STORE_NAME, promptToUpdate);
}

/**
 * Deletes a prompt from the store by its ID.
 * @param id - The ID of the prompt to delete.
 * @returns A Promise that resolves when the deletion is complete.
 */
export async function deletePrompt(id: string): Promise<void> {
  await db.delete(PROMPTS_STORE_NAME, id);
}

/**
 * Exports all prompts as a JSON string.
 * @returns A Promise resolving to a JSON string representing all prompts.
 */
export async function exportPrompts(): Promise<string> {
  const allPrompts = await getPrompts();
  return JSON.stringify(allPrompts, null, 2);
}

/**
 * Imports prompts from a JSON string into the store.
 * @param jsonContent - The JSON string containing an array of Prompt objects.
 * @returns A Promise that resolves when the import is complete.
 */
export async function importPrompts(jsonContent: string): Promise<void> {
    const promptsToImport: Prompt[] = JSON.parse(jsonContent);
    const tx = db.transaction(PROMPTS_STORE_NAME, 'readwrite');
    await Promise.all(promptsToImport.map(p => tx.store.put(p)));
    await tx.done;
}

// --- Version Functions ---

/**
 * Adds a new prompt version to the versions store.
 * @param versionData - The PromptVersion object to add.
 * @returns A Promise that resolves when the version is added.
 */
export async function addVersion(versionData: PromptVersion): Promise<void> {
    await db.put(VERSIONS_STORE_NAME, versionData);
}

/**
 * Retrieves all versions for a specific prompt ID, sorted by saved date (oldest first).
 * @param promptId - The ID of the prompt.
 * @returns A Promise resolving to an array of PromptVersion objects.
 */
export async function getVersions(promptId: string): Promise<PromptVersion[]> {
    const versions = await db.getAllFromIndex(VERSIONS_STORE_NAME, 'promptId', promptId);
    return versions.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

/**
 * Deletes all versions associated with a specific prompt ID.
 * @param promptId - The ID of the prompt.
 * @returns A Promise that resolves when the versions are deleted.
 */
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

/**
 * Adds a new system prompt configuration.
 * @param config - The configuration data without ID and timestamps.
 * @returns A Promise resolving to the created SystemPromptConfig object.
 */
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

/**
 * Retrieves all system prompt configurations, sorted by creation date (newest first).
 * @returns A Promise resolving to an array of SystemPromptConfig objects.
 */
export async function getPromptConfigs(): Promise<SystemPromptConfig[]> {
  const configs = await db.getAllFromIndex(CONFIG_STORE_NAME, 'createdAt');
  return configs.reverse();
}

/**
 * Retrieves the default system prompt configuration.
 * @returns A Promise resolving to the default SystemPromptConfig or undefined if not found.
 */
export async function getDefaultPromptConfig(): Promise<SystemPromptConfig | undefined> {
  const allConfigs = await db.getAll(CONFIG_STORE_NAME);
  return allConfigs.find(config => config.isDefault);
}

/**
 * Updates an existing system prompt configuration.
 * @param config - The updated SystemPromptConfig object.
 * @returns A Promise that resolves when the update is complete.
 */
export async function updatePromptConfig(config: SystemPromptConfig): Promise<void> {
  const updatedConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };
  await db.put(CONFIG_STORE_NAME, updatedConfig);
}

/**
 * Deletes a system prompt configuration by ID.
 * @param id - The ID of the configuration to delete.
 * @returns A Promise that resolves when the deletion is complete.
 */
export async function deletePromptConfig(id: string): Promise<void> {
  await db.delete(CONFIG_STORE_NAME, id);
}

/**
 * Sets a system prompt configuration as the default.
 * @param id - The ID of the configuration to set as default.
 * @returns A Promise that resolves when the operation is complete.
 */
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

/**
 * Retrieves the application settings.
 * @returns A Promise resolving to the AppSettings object or undefined if not found.
 */
export async function getAppSettings(): Promise<AppSettings | undefined> {
  const allSettings = await db.getAll(SETTINGS_STORE_NAME);
  return allSettings[0];
}

/**
 * Saves or updates the application settings.
 * @param settings - The AppSettings object to save.
 * @returns A Promise that resolves when the settings are saved.
 */
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

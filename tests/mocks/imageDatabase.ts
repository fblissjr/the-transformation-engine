/**
 * Mock IndexedDB setup for Image Studio database
 * Uses idb package for promise-based API (same as main database)
 */

import 'fake-indexeddb/auto';
import { openDB, IDBPDatabase } from 'idb';

/**
 * Database configuration for Image Studio
 */
export const IMAGE_DB_CONFIG = {
  name: 'TransformationEngineImagesDB',
  version: 1,
  stores: {
    imageProjects: 'imageProjects',
    imageGenerations: 'imageGenerations',
    imageEdits: 'imageEdits',
    sceneLinks: 'sceneLinks'
  }
} as const;

let dbInstance: IDBPDatabase | null = null;

/**
 * Initialize the image database with all required stores
 * This mimics the structure described in the implementation plan
 */
export async function initImageDatabase(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(IMAGE_DB_CONFIG.name, IMAGE_DB_CONFIG.version, {
    upgrade(db) {
      const dbAny = db as any;

      // Image Projects store
      if (!dbAny.objectStoreNames.contains(IMAGE_DB_CONFIG.stores.imageProjects)) {
        const projectStore = dbAny.createObjectStore(IMAGE_DB_CONFIG.stores.imageProjects, {
          keyPath: 'id'
        });
        projectStore.createIndex('created', 'created');
        projectStore.createIndex('modified', 'modified');
      }

      // Image Generations store
      if (!dbAny.objectStoreNames.contains(IMAGE_DB_CONFIG.stores.imageGenerations)) {
        const generationStore = dbAny.createObjectStore(IMAGE_DB_CONFIG.stores.imageGenerations, {
          keyPath: 'id'
        });
        generationStore.createIndex('projectId', 'projectId');
        generationStore.createIndex('created', 'created');
        generationStore.createIndex('status', 'status');
      }

      // Image Edits store (tracks edit history)
      if (!dbAny.objectStoreNames.contains(IMAGE_DB_CONFIG.stores.imageEdits)) {
        const editStore = dbAny.createObjectStore(IMAGE_DB_CONFIG.stores.imageEdits, {
          keyPath: 'id'
        });
        editStore.createIndex('generationId', 'generationId');
        editStore.createIndex('parentEditId', 'parentEditId');
        editStore.createIndex('created', 'created');
      }

      // Scene Links store (links to main DB intermediates)
      if (!dbAny.objectStoreNames.contains(IMAGE_DB_CONFIG.stores.sceneLinks)) {
        const linkStore = dbAny.createObjectStore(IMAGE_DB_CONFIG.stores.sceneLinks, {
          keyPath: 'id'
        });
        linkStore.createIndex('imageGenerationId', 'imageGenerationId');
        linkStore.createIndex('intermediateId', 'intermediateId');
        linkStore.createIndex('created', 'created');
      }
    }
  });

  return dbInstance;
}

/**
 * Clear all data from image database (for test cleanup)
 */
export async function clearImageDatabase(): Promise<void> {
  const db = await getImageDB();

  const storeNames = [
    IMAGE_DB_CONFIG.stores.imageProjects,
    IMAGE_DB_CONFIG.stores.imageGenerations,
    IMAGE_DB_CONFIG.stores.imageEdits,
    IMAGE_DB_CONFIG.stores.sceneLinks
  ];

  for (const storeName of storeNames) {
    await db.clear(storeName);
  }
}

/**
 * Delete the entire image database (for complete cleanup)
 */
export async function deleteImageDatabase(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(IMAGE_DB_CONFIG.name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get database instance for testing
 */
export async function getImageDB(): Promise<IDBPDatabase> {
  return initImageDatabase();
}

/**
 * Helper to count records in a store
 */
export async function countRecords(storeName: string): Promise<number> {
  const db = await getImageDB();
  return await db.count(storeName);
}

/**
 * Helper to get all records from a store
 */
export async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const db = await getImageDB();
  return (await db.getAll(storeName)) as T[];
}

/**
 * Helper to add a record to a store
 */
export async function addRecord<T>(storeName: string, record: T): Promise<void> {
  const db = await getImageDB();
  await db.add(storeName, record);
}

/**
 * Helper to update a record in a store
 */
export async function updateRecord<T>(storeName: string, record: T): Promise<void> {
  const db = await getImageDB();
  await db.put(storeName, record);
}

/**
 * Helper to delete a record from a store
 */
export async function deleteRecord(storeName: string, id: string): Promise<void> {
  const db = await getImageDB();
  await db.delete(storeName, id);
}

/**
 * Helper to get records by index
 */
export async function getRecordsByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const db = await getImageDB();
  return (await db.getAllFromIndex(storeName, indexName, value)) as T[];
}

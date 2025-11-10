/**
 * Database Schema Definition
 *
 * This is NOT a migration - it ONLY supports fresh database creation.
 * If schema version changes, users must export/import their data manually.
 *
 * Database name: TransformationEngineDB (NEVER changes)
 * Schema version: 10 (NEVER increment - breaking changes require manual export/import)
 */

import { IDBPDatabase } from 'idb';

/**
 * Creates a fresh database schema with all stores and indexes.
 * This function should ONLY be called when creating a brand new database (oldVersion === 0).
 *
 * @param db - The IndexedDB database instance
 */
export function createFreshSchema(db: IDBPDatabase) {
  console.log('[IndexedDB] Creating fresh database schema v10');

  // Core Stores (Phases 1-9)
  const prompts = db.createObjectStore('prompts', { keyPath: 'id' });
  prompts.createIndex('createdAt', 'createdAt', { unique: false });
  prompts.createIndex('title_lowercase', 'title_lowercase', { unique: false });

  const intermediates = db.createObjectStore('intermediates', { keyPath: 'id' });
  intermediates.createIndex('created', 'created', { unique: false });
  intermediates.createIndex('modified', 'modified', { unique: false });
  intermediates.createIndex('tags', 'tags', { unique: false, multiEntry: true });
  intermediates.createIndex('title', 'title', { unique: false });
  // Scene Extension Phase 1 indexes
  intermediates.createIndex('extensionMetadata.parentSceneId', 'extensionMetadata.parentSceneId', { unique: false });
  intermediates.createIndex('extensionMetadata.sceneNumber', 'extensionMetadata.sceneNumber', { unique: false });

  const versions = db.createObjectStore('versions', { keyPath: 'versionId' });
  versions.createIndex('promptId', 'promptId', { unique: false });

  const promptConfigs = db.createObjectStore('promptConfigs', { keyPath: 'id' });
  promptConfigs.createIndex('isDefault', 'isDefault', { unique: false });
  promptConfigs.createIndex('createdAt', 'createdAt', { unique: false });

  db.createObjectStore('appSettings', { keyPath: 'id' });

  const media = db.createObjectStore('media', { keyPath: 'id' });
  media.createIndex('uploadedAt', 'uploadedAt', { unique: false });

  // Multi-Provider Stores (Phase 10)
  const providers = db.createObjectStore('providers', { keyPath: 'id' });
  providers.createIndex('type', 'type', { unique: false });
  providers.createIndex('enabled', 'enabled', { unique: false });

  const providerKeys = db.createObjectStore('providerKeys', { keyPath: 'id' });
  providerKeys.createIndex('providerId', 'providerId', { unique: false });

  db.createObjectStore('taskAssignments', { keyPath: 'taskId' });

  const conversations = db.createObjectStore('conversations', { keyPath: 'id' });
  conversations.createIndex('taskId', 'taskId', { unique: false });
  conversations.createIndex('promptId', 'promptId', { unique: false });

  const conversationTurns = db.createObjectStore('conversationTurns', { keyPath: 'id' });
  conversationTurns.createIndex('conversationId', 'conversationId', { unique: false });
  conversationTurns.createIndex('parentTurnId', 'parentTurnId', { unique: false });

  const tokenUsage = db.createObjectStore('tokenUsage', { keyPath: 'id' });
  tokenUsage.createIndex('providerId', 'providerId', { unique: false });
  tokenUsage.createIndex('taskId', 'taskId', { unique: false });
  tokenUsage.createIndex('timestamp', 'timestamp', { unique: false });

  console.log('[IndexedDB] Schema v10 created successfully');
}

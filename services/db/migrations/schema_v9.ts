/**
 * Schema Version 9 Migration
 *
 * Clean slate schema with all Phase 10 and Phase 11 features.
 * No auto-migration from previous versions - users keep existing data.
 *
 * Database name: TransformationEngineDB (NEVER changes)
 * Schema version: 9 (increments for schema changes)
 */

import { IDBPDatabase } from 'idb';

export function applySchemaV9(db: IDBPDatabase, oldVersion: number, newVersion: number | null, tx: any) {
  console.log(`[Migration] Applying schema version 9 (from v${oldVersion})`);

  // Core Stores (Phases 1-9)
  if (!db.objectStoreNames.contains('prompts')) {
    const store = db.createObjectStore('prompts', { keyPath: 'id' });
    store.createIndex('createdAt', 'createdAt', { unique: false });
    store.createIndex('title_lowercase', 'title_lowercase', { unique: false });
  }

  if (!db.objectStoreNames.contains('intermediates')) {
    const store = db.createObjectStore('intermediates', { keyPath: 'id' });
    store.createIndex('created', 'created', { unique: false });
    store.createIndex('modified', 'modified', { unique: false });
    store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
    store.createIndex('title', 'title', { unique: false });
  }

  if (!db.objectStoreNames.contains('versions')) {
    const store = db.createObjectStore('versions', { keyPath: 'versionId' });
    store.createIndex('promptId', 'promptId', { unique: false });
  }

  if (!db.objectStoreNames.contains('promptConfigs')) {
    const store = db.createObjectStore('promptConfigs', { keyPath: 'id' });
    store.createIndex('isDefault', 'isDefault', { unique: false });
    store.createIndex('createdAt', 'createdAt', { unique: false });
  }

  if (!db.objectStoreNames.contains('appSettings')) {
    db.createObjectStore('appSettings', { keyPath: 'id' });
  }

  if (!db.objectStoreNames.contains('media')) {
    const store = db.createObjectStore('media', { keyPath: 'id' });
    store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
  }

  // Multi-Provider Stores (Phase 10)
  if (!db.objectStoreNames.contains('providers')) {
    const store = db.createObjectStore('providers', { keyPath: 'id' });
    store.createIndex('type', 'type', { unique: false });
    store.createIndex('enabled', 'enabled', { unique: false });
  }

  if (!db.objectStoreNames.contains('providerKeys')) {
    const store = db.createObjectStore('providerKeys', { keyPath: 'id' });
    store.createIndex('providerId', 'providerId', { unique: false });
  }

  if (!db.objectStoreNames.contains('taskAssignments')) {
    db.createObjectStore('taskAssignments', { keyPath: 'taskId' });
  }

  if (!db.objectStoreNames.contains('conversations')) {
    const store = db.createObjectStore('conversations', { keyPath: 'id' });
    store.createIndex('taskId', 'taskId', { unique: false });
    store.createIndex('promptId', 'promptId', { unique: false });
  }

  if (!db.objectStoreNames.contains('conversationTurns')) {
    const store = db.createObjectStore('conversationTurns', { keyPath: 'id' });
    store.createIndex('conversationId', 'conversationId', { unique: false });
    store.createIndex('parentTurnId', 'parentTurnId', { unique: false });
  }

  if (!db.objectStoreNames.contains('tokenUsage')) {
    const store = db.createObjectStore('tokenUsage', { keyPath: 'id' });
    store.createIndex('providerId', 'providerId', { unique: false });
    store.createIndex('taskId', 'taskId', { unique: false });
    store.createIndex('timestamp', 'timestamp', { unique: false });
  }

  console.log('[Migration] Schema version 9 applied successfully');
}

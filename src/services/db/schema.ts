/**
 * Database Schema Definition
 *
 * This is NOT a migration - it ONLY supports fresh database creation.
 * Breaking schema changes are acceptable - old data will be lost.
 *
 * Database name: TransformationEngineDB (NEVER changes)
 * Schema version: 14 (v13 → v14 BREAKING: added Wildcard & Fragment stores)
 */

import { IDBPDatabase } from 'idb';

/**
 * Creates a fresh database schema with all stores and indexes.
 * This function should ONLY be called when creating a brand new database (oldVersion === 0).
 *
 * @param db - The IndexedDB database instance
 */
export function createFreshSchema(db: IDBPDatabase) {
  console.log('[IndexedDB] Creating fresh database schema v14');

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

  // Image Studio Stores (v11 - consolidated from separate Image DB)
  const imageProjects = db.createObjectStore('imageProjects', { keyPath: 'id' });
  imageProjects.createIndex('created', 'created', { unique: false });
  imageProjects.createIndex('modified', 'modified', { unique: false });
  imageProjects.createIndex('title', 'title', { unique: false });

  const imageGenerations = db.createObjectStore('imageGenerations', { keyPath: 'id' });
  imageGenerations.createIndex('projectId', 'projectId', { unique: false });
  imageGenerations.createIndex('created', 'created', { unique: false });
  imageGenerations.createIndex('modified', 'modified', { unique: false });
  imageGenerations.createIndex('status', 'status', { unique: false });
  imageGenerations.createIndex('parentImageId', 'parentImageId', { unique: false });

  const imageEdits = db.createObjectStore('imageEdits', { keyPath: 'id' });
  imageEdits.createIndex('generationId', 'generationId', { unique: false });
  imageEdits.createIndex('projectId', 'projectId', { unique: false });
  imageEdits.createIndex('status', 'status', { unique: false });
  imageEdits.createIndex('created', 'created', { unique: false });

  const sceneLinks = db.createObjectStore('sceneLinks', { keyPath: 'id' });
  sceneLinks.createIndex('imageGenerationId', 'imageGenerationId', { unique: false });
  sceneLinks.createIndex('intermediateId', 'intermediateId', { unique: false });
  sceneLinks.createIndex('created', 'created', { unique: false });

  // Wildcard & Fragment Stores (v14)
  const wildcardCategories = db.createObjectStore('wildcardCategories', { keyPath: 'id' });
  wildcardCategories.createIndex('name', 'name', { unique: true });
  wildcardCategories.createIndex('isCustom', 'isCustom', { unique: false });

  const fragments = db.createObjectStore('fragments', { keyPath: 'id' });
  fragments.createIndex('category', 'category', { unique: false });
  fragments.createIndex('subcategory', 'subcategory', { unique: false });
  fragments.createIndex('sourceCount', 'sourceCount', { unique: false });
  fragments.createIndex('name', 'name', { unique: false });

  const fragmentRelationships = db.createObjectStore('fragmentRelationships', { keyPath: 'id' });
  fragmentRelationships.createIndex('fragmentId', 'fragmentId', { unique: false });
  fragmentRelationships.createIndex('suggests', 'suggests', { unique: false });

  console.log('[IndexedDB] Schema v14 created successfully (19 stores: core + providers + image studio + wildcards/fragments)');
}

/**
 * Database Schema Definition
 *
 * This is NOT a migration - it ONLY supports fresh database creation.
 * Breaking schema changes are acceptable - old data will be lost.
 *
 * Database name: TransformationEngineDB (NEVER changes)
 * Schema version: 12 (v11 → v12 BREAKING: added Object Library stores)
 */

import { IDBPDatabase } from 'idb';

/**
 * Creates a fresh database schema with all stores and indexes.
 * This function should ONLY be called when creating a brand new database (oldVersion === 0).
 *
 * @param db - The IndexedDB database instance
 */
export function createFreshSchema(db: IDBPDatabase) {
  console.log('[IndexedDB] Creating fresh database schema v11');

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

  // Object Library Stores (v12 - Universal Object System)
  const characterObjects = db.createObjectStore('characterObjects', { keyPath: 'id' });
  characterObjects.createIndex('type', 'type', { unique: false });
  characterObjects.createIndex('name', 'name', { unique: false });
  characterObjects.createIndex('created', 'created', { unique: false });
  characterObjects.createIndex('modified', 'modified', { unique: false });
  characterObjects.createIndex('tags', 'tags', { unique: false, multiEntry: true });

  const locationObjects = db.createObjectStore('locationObjects', { keyPath: 'id' });
  locationObjects.createIndex('type', 'type', { unique: false });
  locationObjects.createIndex('name', 'name', { unique: false });
  locationObjects.createIndex('created', 'created', { unique: false });
  locationObjects.createIndex('modified', 'modified', { unique: false });
  locationObjects.createIndex('tags', 'tags', { unique: false, multiEntry: true });

  const cameraObjects = db.createObjectStore('cameraObjects', { keyPath: 'id' });
  cameraObjects.createIndex('type', 'type', { unique: false });
  cameraObjects.createIndex('name', 'name', { unique: false });
  cameraObjects.createIndex('created', 'created', { unique: false });
  cameraObjects.createIndex('modified', 'modified', { unique: false });

  const propObjects = db.createObjectStore('propObjects', { keyPath: 'id' });
  propObjects.createIndex('type', 'type', { unique: false });
  propObjects.createIndex('name', 'name', { unique: false });
  propObjects.createIndex('created', 'created', { unique: false });
  propObjects.createIndex('modified', 'modified', { unique: false });
  propObjects.createIndex('tags', 'tags', { unique: false, multiEntry: true });

  const audioObjects = db.createObjectStore('audioObjects', { keyPath: 'id' });
  audioObjects.createIndex('type', 'type', { unique: false });
  audioObjects.createIndex('category', 'data.category', { unique: false });
  audioObjects.createIndex('name', 'name', { unique: false });
  audioObjects.createIndex('created', 'created', { unique: false });
  audioObjects.createIndex('modified', 'modified', { unique: false });

  const conceptObjects = db.createObjectStore('conceptObjects', { keyPath: 'id' });
  conceptObjects.createIndex('type', 'type', { unique: false });
  conceptObjects.createIndex('category', 'data.category', { unique: false });
  conceptObjects.createIndex('name', 'name', { unique: false });
  conceptObjects.createIndex('created', 'created', { unique: false });
  conceptObjects.createIndex('modified', 'modified', { unique: false });

  const customObjects = db.createObjectStore('customObjects', { keyPath: 'id' });
  customObjects.createIndex('type', 'type', { unique: false });
  customObjects.createIndex('name', 'name', { unique: false });
  customObjects.createIndex('created', 'created', { unique: false });
  customObjects.createIndex('modified', 'modified', { unique: false });
  customObjects.createIndex('tags', 'tags', { unique: false, multiEntry: true });

  // Object Versioning & Relationships (v12)
  const objectVersions = db.createObjectStore('objectVersions', { keyPath: 'versionId' });
  objectVersions.createIndex('objectId', 'objectId', { unique: false });
  objectVersions.createIndex('objectType', 'objectType', { unique: false });
  objectVersions.createIndex('version', 'version', { unique: false });
  objectVersions.createIndex('created', 'created', { unique: false });

  const objectChangelogs = db.createObjectStore('objectChangelogs', { keyPath: 'changelogId' });
  objectChangelogs.createIndex('objectId', 'objectId', { unique: false });
  objectChangelogs.createIndex('objectType', 'objectType', { unique: false });
  objectChangelogs.createIndex('created', 'created', { unique: false });

  const objectRelationships = db.createObjectStore('objectRelationships', { keyPath: 'relationshipId' });
  objectRelationships.createIndex('fromObjectId', 'fromObjectId', { unique: false });
  objectRelationships.createIndex('toObjectId', 'toObjectId', { unique: false });
  objectRelationships.createIndex('relationType', 'relationType', { unique: false });

  console.log('[IndexedDB] Schema v12 created successfully (video + image + object library stores)');
}

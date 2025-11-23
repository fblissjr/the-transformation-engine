import { getDB } from '..//db/indexedDbService';
import { DB_CONFIG } from '../../config/database';
import type {
  ObjectStoreRecord,
  ObjectVersionRecord,
  ObjectChangelogRecord,
  ObjectRelationshipRecord,
} from '../../types/objectTypes';

/**
 * ObjectLibraryService
 * Core service for managing objects in the Universal Object Library
 *
 * Features:
 * - CRUD operations for all object types
 * - Automatic versioning and changelog
 * - Scene and object linking
 * - Relationship management
 * - Search and retrieval
 */
export class ObjectLibraryService {
  private db: IDBDatabase | null = null;

  /**
   * Initialize database connection
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      this.db = await getDB();
    }
    return this.db;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate unique object ID
   * Format: {prefix}_{timestamp}_{random}
   * Example: char_1731857280123_456
   */
  private generateObjectId(objectType: string): string {
    const prefix = objectType.substring(0, 4);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Get IndexedDB store name for object type
   */
  private getStoreName(objectType: string): string {
    const storeMap: Record<string, string> = {
      character: DB_CONFIG.stores.characterObjects,
      location: DB_CONFIG.stores.locationObjects,
      camera: DB_CONFIG.stores.cameraObjects,
      prop: DB_CONFIG.stores.propObjects,
      audio: DB_CONFIG.stores.audioObjects,
      concept: DB_CONFIG.stores.conceptObjects,
    };

    // Default to customObjects for any LLM-derived type
    return storeMap[objectType] || DB_CONFIG.stores.customObjects;
  }

  // ============================================================================
  // CREATE OPERATIONS
  // ============================================================================

  /**
   * Create new object in library
   *
   * @param objectType - Object type (character, location, camera, prop, audio, concept, or custom)
   * @param data - Object data (schema varies by type)
   * @param metadata - Object metadata (name, description, tags)
   * @param derivedFrom - Optional source tracking
   * @returns Object ID
   */
  async createObject<T = any>(
    objectType: string,
    data: T,
    metadata: {
      name: string;
      description?: string;
      tags?: string[];
    },
    derivedFrom?: {
      sourceType: 'user_input' | 'llm_generation' | 'imported' | 'duplicated';
      sourceId?: string;
    }
  ): Promise<string> {
    try {
      const db = await this.ensureDB();
      const id = this.generateObjectId(objectType);
      const now = new Date();

      const object: ObjectStoreRecord = {
        id,
        type: objectType,
        version: 1,
        data: data as Record<string, any>,
        linkedScenes: [],
        linkedObjects: [],
        name: metadata.name,
        description: metadata.description,
        tags: metadata.tags || [],
        created: now,
        modified: now,
        derivedFrom: derivedFrom ? { ...derivedFrom, timestamp: now } : undefined,
      };

      // Store in appropriate store
      const storeName = this.getStoreName(objectType);
      await db.add(storeName, object);

      // Create initial version snapshot
      await this.saveVersion(id, objectType, 1, data);

      console.log(`[ObjectLibraryService] Created ${objectType} object: ${id}`);
      return id;
    } catch (error) {
      console.error('[ObjectLibraryService] Error creating object:', error);
      throw new Error(`Failed to create object: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Duplicate existing object
   *
   * @param objectId - Source object ID
   * @param objectType - Source object type
   * @param newName - Name for duplicated object
   * @returns New object ID
   */
  async duplicateObject(
    objectId: string,
    objectType: string,
    newName: string
  ): Promise<string> {
    try {
      const sourceObject = await this.getObject(objectId, objectType);
      if (!sourceObject) {
        throw new Error(`Source object not found: ${objectId}`);
      }

      // Create duplicate with new ID
      const newId = await this.createObject(
        objectType,
        sourceObject.data,
        {
          name: newName,
          description: sourceObject.description,
          tags: sourceObject.tags,
        },
        {
          sourceType: 'duplicated',
          sourceId: objectId,
        }
      );

      console.log(`[ObjectLibraryService] Duplicated ${objectId} → ${newId}`);
      return newId;
    } catch (error) {
      console.error('[ObjectLibraryService] Error duplicating object:', error);
      throw new Error(`Failed to duplicate object: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  /**
   * Get object by ID
   */
  async getObject(
    objectId: string,
    objectType: string
  ): Promise<ObjectStoreRecord | null> {
    try {
      const db = await this.ensureDB();
      const storeName = this.getStoreName(objectType);

      const object = await db.get(storeName, objectId);
      return object || null;
    } catch (error) {
      console.error('[ObjectLibraryService] Error getting object:', error);
      throw new Error(`Failed to get object: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all objects of a specific type
   */
  async getObjectsByType(objectType: string): Promise<ObjectStoreRecord[]> {
    try {
      const db = await this.ensureDB();
      const storeName = this.getStoreName(objectType);

      const objects = await db.getAll(storeName);
      return objects;
    } catch (error) {
      console.error('[ObjectLibraryService] Error getting objects by type:', error);
      throw new Error(`Failed to get objects by type: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get objects by tag (supports multiple tags, AND logic)
   */
  async getObjectsByTag(
    objectType: string,
    tags: string[]
  ): Promise<ObjectStoreRecord[]> {
    try {
      const allObjects = await this.getObjectsByType(objectType);

      // Filter objects that have ALL specified tags
      return allObjects.filter(obj =>
        tags.every(tag => obj.tags?.includes(tag))
      );
    } catch (error) {
      console.error('[ObjectLibraryService] Error getting objects by tag:', error);
      throw new Error(`Failed to get objects by tag: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all objects used in a specific scene
   */
  async getObjectsUsedInScene(sceneId: string): Promise<ObjectStoreRecord[]> {
    try {
      const db = await this.ensureDB();
      const results: ObjectStoreRecord[] = [];

      // Search across all object stores
      const objectStores = [
        DB_CONFIG.stores.characterObjects,
        DB_CONFIG.stores.locationObjects,
        DB_CONFIG.stores.cameraObjects,
        DB_CONFIG.stores.propObjects,
        DB_CONFIG.stores.audioObjects,
        DB_CONFIG.stores.conceptObjects,
        DB_CONFIG.stores.customObjects,
      ];

      for (const storeName of objectStores) {
        const allObjects = await db.getAll(storeName);
        const sceneObjects = allObjects.filter(obj =>
          obj.linkedScenes.includes(sceneId)
        );
        results.push(...sceneObjects);
      }

      return results;
    } catch (error) {
      console.error('[ObjectLibraryService] Error getting objects used in scene:', error);
      throw new Error(`Failed to get objects used in scene: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  /**
   * Update object data directly
   * Creates new version and changelog automatically
   *
   * @param objectId - Object ID
   * @param objectType - Object type
   * @param newData - New data to replace current data
   * @param changeReason - Reason for change (for changelog)
   * @returns Updated object
   */
  async updateObject<T = any>(
    objectId: string,
    objectType: string,
    newData: T,
    changeReason?: string
  ): Promise<ObjectStoreRecord> {
    try {
      const db = await this.ensureDB();
      const existing = await this.getObject(objectId, objectType);

      if (!existing) {
        throw new Error(`Object not found: ${objectId}`);
      }

      const newVersion = existing.version + 1;
      const oldData = existing.data;

      const updated: ObjectStoreRecord = {
        ...existing,
        data: newData as Record<string, any>,
        version: newVersion,
        modified: new Date(),
      };

      // Update in store
      const storeName = this.getStoreName(objectType);
      await db.put(storeName, updated);

      // Save version snapshot
      await this.saveVersion(objectId, objectType, newVersion, newData);

      // Generate and save changelog
      const changes = this.generateChanges(oldData, newData as Record<string, any>);
      await this.saveChangelog({
        objectId,
        objectType,
        fromVersion: existing.version,
        toVersion: newVersion,
        changes,
        editInstructions: changeReason,
      });

      console.log(`[ObjectLibraryService] Updated ${objectId} to v${newVersion}`);
      return updated;
    } catch (error) {
      console.error('[ObjectLibraryService] Error updating object:', error);
      throw new Error(`Failed to update object: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update object metadata only (name, description, tags)
   * Does NOT create new version (metadata changes don't bump version)
   */
  async updateMetadata(
    objectId: string,
    objectType: string,
    metadata: {
      name?: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<ObjectStoreRecord> {
    try {
      const db = await this.ensureDB();
      const existing = await this.getObject(objectId, objectType);

      if (!existing) {
        throw new Error(`Object not found: ${objectId}`);
      }

      const updated: ObjectStoreRecord = {
        ...existing,
        name: metadata.name ?? existing.name,
        description: metadata.description ?? existing.description,
        tags: metadata.tags ?? existing.tags,
        modified: new Date(),
      };

      const storeName = this.getStoreName(objectType);
      await db.put(storeName, updated);

      console.log(`[ObjectLibraryService] Updated metadata for ${objectId}`);
      return updated;
    } catch (error) {
      console.error('[ObjectLibraryService] Error updating metadata:', error);
      throw new Error(`Failed to update metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Edit object with LLM assistance
   * This is a placeholder for LLM-powered editing
   * Actual LLM call should be handled by the caller using editObjectTask.ts
   *
   * @param objectId - Object ID
   * @param objectType - Object type
   * @param editedData - New data from LLM
   * @param llmMetadata - LLM reasoning and preserved fields
   * @returns Updated object
   */
  async editObjectWithLLM(
    objectId: string,
    objectType: string,
    editedData: any,
    llmMetadata: {
      editInstructions: string;
      preserveRules?: string[];
      llmReasoning?: string;
      changelog?: Array<{
        field: string;
        oldValue: any;
        newValue: any;
        reason: string;
      }>;
    }
  ): Promise<ObjectStoreRecord> {
    try {
      const db = await this.ensureDB();
      const existing = await this.getObject(objectId, objectType);

      if (!existing) {
        throw new Error(`Object not found: ${objectId}`);
      }

      const newVersion = existing.version + 1;

      const updated: ObjectStoreRecord = {
        ...existing,
        data: editedData,
        version: newVersion,
        modified: new Date(),
      };

      // Update in store
      const storeName = this.getStoreName(objectType);
      await db.put(storeName, updated);

      // Save version snapshot
      await this.saveVersion(objectId, objectType, newVersion, editedData);

      // Save changelog with LLM metadata
      const changes = llmMetadata.changelog || this.generateChanges(existing.data, editedData);
      await this.saveChangelog({
        objectId,
        objectType,
        fromVersion: existing.version,
        toVersion: newVersion,
        changes,
        editInstructions: llmMetadata.editInstructions,
        preserveRules: llmMetadata.preserveRules,
        llmReasoning: llmMetadata.llmReasoning,
      });

      console.log(`[ObjectLibraryService] LLM-edited ${objectId} to v${newVersion}`);
      return updated;
    } catch (error) {
      console.error('[ObjectLibraryService] Error editing object with LLM:', error);
      throw new Error(`Failed to edit object with LLM: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  /**
   * Delete object from library
   *
   * @param objectId - Object ID
   * @param objectType - Object type
   * @param options - Delete options
   *   - unlinkFromScenes: Remove from all scene linkages (default: true)
   *   - deleteRelationships: Remove all relationships (default: true)
   *   - force: Force delete even if still linked (default: false)
   */
  async deleteObject(
    objectId: string,
    objectType: string,
    options: {
      unlinkFromScenes?: boolean;
      deleteRelationships?: boolean;
      force?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const db = await this.ensureDB();
      const object = await this.getObject(objectId, objectType);

      if (!object) {
        throw new Error(`Object not found: ${objectId}`);
      }

      // Check if object is still linked to scenes
      if (!options.force && object.linkedScenes.length > 0 && !options.unlinkFromScenes) {
        throw new Error(
          `Cannot delete object ${objectId}: still linked to ${object.linkedScenes.length} scene(s). ` +
          `Use force=true or unlinkFromScenes=true to proceed.`
        );
      }

      // Unlink from scenes if requested
      if (options.unlinkFromScenes !== false) {
        for (const sceneId of object.linkedScenes) {
          await this.unlinkObjectFromScene(objectId, objectType, sceneId);
        }
      }

      // Delete relationships if requested
      if (options.deleteRelationships !== false) {
        const relationships = await this.getRelationships(objectId);
        for (const rel of relationships) {
          await this.deleteRelationship(rel.relationshipId);
        }
      }

      // Delete from store
      const storeName = this.getStoreName(objectType);
      await db.delete(storeName, objectId);

      console.log(`[ObjectLibraryService] Deleted object ${objectId}`);
    } catch (error) {
      console.error('[ObjectLibraryService] Error deleting object:', error);
      throw new Error(`Failed to delete object: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // LINKING OPERATIONS
  // ============================================================================

  /**
   * Link object to scene
   */
  async linkObjectToScene(
    objectId: string,
    objectType: string,
    sceneId: string
  ): Promise<void> {
    try {
      const db = await this.ensureDB();
      const object = await this.getObject(objectId, objectType);

      if (!object) {
        throw new Error(`Object not found: ${objectId}`);
      }

      // Add scene to linkedScenes if not already present
      if (!object.linkedScenes.includes(sceneId)) {
        object.linkedScenes.push(sceneId);
        object.modified = new Date();

        const storeName = this.getStoreName(objectType);
        await db.put(storeName, object);

        console.log(`[ObjectLibraryService] Linked ${objectId} to scene ${sceneId}`);
      }
    } catch (error) {
      console.error('[ObjectLibraryService] Error linking object to scene:', error);
      throw new Error(`Failed to link object to scene: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Unlink object from scene
   */
  async unlinkObjectFromScene(
    objectId: string,
    objectType: string,
    sceneId: string
  ): Promise<void> {
    try {
      const db = await this.ensureDB();
      const object = await this.getObject(objectId, objectType);

      if (!object) {
        throw new Error(`Object not found: ${objectId}`);
      }

      // Remove scene from linkedScenes
      object.linkedScenes = object.linkedScenes.filter(id => id !== sceneId);
      object.modified = new Date();

      const storeName = this.getStoreName(objectType);
      await db.put(storeName, object);

      console.log(`[ObjectLibraryService] Unlinked ${objectId} from scene ${sceneId}`);
    } catch (error) {
      console.error('[ObjectLibraryService] Error unlinking object from scene:', error);
      throw new Error(`Failed to unlink object from scene: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create relationship between two objects
   */
  async createRelationship(
    fromObjectId: string,
    fromObjectType: string,
    toObjectId: string,
    toObjectType: string,
    relationType: string,
    metadata?: {
      strength?: number;
      context?: string;
    }
  ): Promise<string> {
    try {
      const db = await this.ensureDB();

      // Verify both objects exist
      const fromObject = await this.getObject(fromObjectId, fromObjectType);
      const toObject = await this.getObject(toObjectId, toObjectType);

      if (!fromObject || !toObject) {
        throw new Error(`One or both objects not found: ${fromObjectId}, ${toObjectId}`);
      }

      const relationshipId = `rel_${fromObjectId}_${relationType}_${toObjectId}`;
      const now = new Date();

      const relationship: ObjectRelationshipRecord = {
        relationshipId,
        fromObjectId,
        fromObjectType,
        toObjectId,
        toObjectType,
        relationType,
        strength: metadata?.strength,
        context: metadata?.context,
        created: now,
        modified: now,
      };

      await db.add(DB_CONFIG.stores.objectRelationships, relationship);

      // Update linkedObjects arrays
      if (!fromObject.linkedObjects?.includes(toObjectId)) {
        fromObject.linkedObjects = [...(fromObject.linkedObjects || []), toObjectId];
        await db.put(this.getStoreName(fromObjectType), fromObject);
      }

      if (!toObject.linkedObjects?.includes(fromObjectId)) {
        toObject.linkedObjects = [...(toObject.linkedObjects || []), fromObjectId];
        await db.put(this.getStoreName(toObjectType), toObject);
      }

      console.log(`[ObjectLibraryService] Created relationship: ${relationshipId}`);
      return relationshipId;
    } catch (error) {
      console.error('[ObjectLibraryService] Error creating relationship:', error);
      throw new Error(`Failed to create relationship: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all relationships for an object
   */
  async getRelationships(objectId: string): Promise<ObjectRelationshipRecord[]> {
    try {
      const db = await this.ensureDB();
      const allRelationships = await db.getAll(DB_CONFIG.stores.objectRelationships);

      // Find relationships where object is either source or target
      return allRelationships.filter(
        rel => rel.fromObjectId === objectId || rel.toObjectId === objectId
      );
    } catch (error) {
      console.error('[ObjectLibraryService] Error getting relationships:', error);
      throw new Error(`Failed to get relationships: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete relationship
   */
  async deleteRelationship(relationshipId: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      await db.delete(DB_CONFIG.stores.objectRelationships, relationshipId);
      console.log(`[ObjectLibraryService] Deleted relationship: ${relationshipId}`);
    } catch (error) {
      console.error('[ObjectLibraryService] Error deleting relationship:', error);
      throw new Error(`Failed to delete relationship: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // VERSIONING OPERATIONS
  // ============================================================================

  /**
   * Save version snapshot (private, called automatically)
   */
  private async saveVersion<T = any>(
    objectId: string,
    objectType: string,
    version: number,
    data: T
  ): Promise<void> {
    try {
      const db = await this.ensureDB();

      const versionId = `ver_${objectId}_v${version}_${Date.now()}`;
      const versionRecord: ObjectVersionRecord = {
        versionId,
        objectId,
        objectType,
        version,
        data: data as Record<string, any>,
        created: new Date(),
      };

      await db.add(DB_CONFIG.stores.objectVersions, versionRecord);
      console.log(`[ObjectLibraryService] Saved version snapshot: ${versionId}`);
    } catch (error) {
      console.error('[ObjectLibraryService] Error saving version:', error);
      // Don't throw - versioning failure shouldn't block main operation
    }
  }

  /**
   * Save changelog entry (private, called automatically)
   */
  private async saveChangelog(changelog: {
    objectId: string;
    objectType: string;
    fromVersion: number;
    toVersion: number;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      reason: string;
    }>;
    editInstructions?: string;
    preserveRules?: string[];
    llmReasoning?: string;
  }): Promise<void> {
    try {
      const db = await this.ensureDB();

      const changelogId = `log_${changelog.objectId}_v${changelog.fromVersion}to${changelog.toVersion}_${Date.now()}`;
      const changelogRecord: ObjectChangelogRecord = {
        changelogId,
        ...changelog,
        created: new Date(),
      };

      await db.add(DB_CONFIG.stores.objectChangelogs, changelogRecord);
      console.log(`[ObjectLibraryService] Saved changelog: ${changelogId}`);
    } catch (error) {
      console.error('[ObjectLibraryService] Error saving changelog:', error);
      // Don't throw - changelog failure shouldn't block main operation
    }
  }

  /**
   * Get version history for an object
   */
  async getVersionHistory(objectId: string): Promise<ObjectVersionRecord[]> {
    try {
      const db = await this.ensureDB();
      const allVersions = await db.getAll(DB_CONFIG.stores.objectVersions);

      // Filter versions for this object and sort by version number
      return allVersions
        .filter(ver => ver.objectId === objectId)
        .sort((a, b) => a.version - b.version);
    } catch (error) {
      console.error('[ObjectLibraryService] Error getting version history:', error);
      throw new Error(`Failed to get version history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get changelogs for an object
   */
  async getChangelogs(objectId: string): Promise<ObjectChangelogRecord[]> {
    try {
      const db = await this.ensureDB();
      const allChangelogs = await db.getAll(DB_CONFIG.stores.objectChangelogs);

      // Filter changelogs for this object and sort by fromVersion
      return allChangelogs
        .filter(log => log.objectId === objectId)
        .sort((a, b) => a.fromVersion - b.fromVersion);
    } catch (error) {
      console.error('[ObjectLibraryService] Error getting changelogs:', error);
      throw new Error(`Failed to get changelogs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Revert object to previous version
   */
  async revertToVersion(
    objectId: string,
    objectType: string,
    targetVersion: number
  ): Promise<ObjectStoreRecord> {
    try {
      const db = await this.ensureDB();

      // Get target version snapshot
      const versions = await this.getVersionHistory(objectId);
      const targetSnapshot = versions.find(ver => ver.version === targetVersion);

      if (!targetSnapshot) {
        throw new Error(`Version ${targetVersion} not found for object ${objectId}`);
      }

      // Update object with old data (creates new version)
      const updated = await this.updateObject(
        objectId,
        objectType,
        targetSnapshot.data,
        `Reverted to version ${targetVersion}`
      );

      console.log(`[ObjectLibraryService] Reverted ${objectId} to v${targetVersion}`);
      return updated;
    } catch (error) {
      console.error('[ObjectLibraryService] Error reverting to version:', error);
      throw new Error(`Failed to revert to version: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Generate changes array by comparing old and new data
   * Simple field-level diff
   */
  private generateChanges(
    oldData: Record<string, any>,
    newData: Record<string, any>
  ): Array<{ field: string; oldValue: any; newValue: any; reason: string }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any; reason: string }> = [];

    // Find changed fields (shallow comparison)
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      const oldValue = oldData[key];
      const newValue = newData[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          reason: 'Field updated',
        });
      }
    }

    return changes;
  }
}

// Export singleton instance
export const objectLibraryService = new ObjectLibraryService();

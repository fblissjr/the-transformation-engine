import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { objectLibraryService } from '../../../src/services/objectLibraryService';
import { getDB } from '../../../src/services/db/indexedDbService';
import 'fake-indexeddb/auto';

describe('ObjectLibraryService', () => {
  beforeEach(async () => {
    // Ensure database is initialized with proper schema
    await getDB();
  });

  afterEach(async () => {
    // Clean up: delete all objects after each test
    const db = await getDB();
    const storeNames = ['characterObjects', 'locationObjects', 'cameraObjects', 'propObjects', 'audioObjects', 'conceptObjects', 'customObjects', 'objectVersions', 'objectChangelogs', 'objectRelationships'];

    const tx = db.transaction(storeNames, 'readwrite');
    for (const storeName of storeNames) {
      const store = tx.objectStore(storeName);
      await store.clear();
    }
    await tx.complete;
  });

  // ============================================================================
  // CREATE OPERATIONS
  // ============================================================================

  describe('createObject', () => {
    it('should create a character object with metadata', async () => {
      const characterData = {
        name: 'Test Character',
        appearance: {
          head: { age: '30s', features: 'sharp', hair: 'dark' },
          body: { build: 'athletic', height: 'tall' },
        },
        personality: {
          traits: ['brave', 'loyal'],
          emotional_state: 'determined',
        },
      };

      const objectId = await objectLibraryService.createObject(
        'character',
        characterData,
        {
          name: 'Test Character',
          description: 'A brave protagonist',
          tags: ['hero', 'protagonist'],
        }
      );

      // Verify ID format
      expect(objectId).toMatch(/^char_\d+_\d+$/);

      // Verify object was actually saved by retrieving it
      const retrieved = await objectLibraryService.getObject(objectId, 'character');
      expect(retrieved).toBeTruthy();
      expect(retrieved?.name).toBe('Test Character');
      expect(retrieved?.description).toBe('A brave protagonist');
      expect(retrieved?.tags).toEqual(['hero', 'protagonist']);
      expect(retrieved?.data).toEqual(characterData);
    });

    it('should create an object with derivedFrom tracking', async () => {
      const data = { name: 'Test Location' };

      const objectId = await objectLibraryService.createObject(
        'location',
        data,
        { name: 'Test Location' },
        {
          sourceType: 'llm_generation',
          sourceId: 'prompt_123',
        }
      );

      expect(objectId).toMatch(/^loca_\d+_\d+$/);

      // Verify object was saved with derivedFrom
      const retrieved = await objectLibraryService.getObject(objectId, 'location');
      expect(retrieved).toBeTruthy();
      expect(retrieved?.derivedFrom?.sourceType).toBe('llm_generation');
      expect(retrieved?.derivedFrom?.sourceId).toBe('prompt_123');
    });
  });

  describe('duplicateObject', () => {
    it('should duplicate an existing object with new name', async () => {
      // Create source object first
      const sourceId = await objectLibraryService.createObject(
        'character',
        { name: 'Original Character' },
        { name: 'Original Character', tags: ['test'] }
      );

      // Duplicate it
      const newId = await objectLibraryService.duplicateObject(
        sourceId,
        'character',
        'Duplicated Character'
      );

      expect(newId).toMatch(/^char_\d+_\d+$/);
      expect(newId).not.toBe(sourceId);

      // Verify both objects exist
      const source = await objectLibraryService.getObject(sourceId, 'character');
      const duplicate = await objectLibraryService.getObject(newId, 'character');

      expect(source?.name).toBe('Original Character');
      expect(duplicate?.name).toBe('Duplicated Character');
      expect(duplicate?.data).toEqual(source?.data);
    });

    it('should throw error when source object not found', async () => {
      await expect(
        objectLibraryService.duplicateObject('nonexistent', 'character', 'New Name')
      ).rejects.toThrow('Source object not found');
    });
  });

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================

  describe('getObject', () => {
    it('should retrieve object by ID', async () => {
      // Create object first
      const objectId = await objectLibraryService.createObject(
        'character',
        { name: 'Test Character' },
        { name: 'Test Character' }
      );

      const result = await objectLibraryService.getObject(objectId, 'character');

      expect(result).toBeTruthy();
      expect(result?.id).toBe(objectId);
      expect(result?.type).toBe('character');
      expect(result?.data).toEqual({ name: 'Test Character' });
    });

    it('should return null for non-existent object', async () => {
      const result = await objectLibraryService.getObject('nonexistent', 'character');

      expect(result).toBeNull();
    });
  });

  describe('getObjectsByType', () => {
    it('should retrieve all objects of a type', async () => {
      // Create multiple objects
      await objectLibraryService.createObject(
        'character',
        { name: 'Character 1' },
        { name: 'Character 1' }
      );
      await objectLibraryService.createObject(
        'character',
        { name: 'Character 2' },
        { name: 'Character 2' }
      );

      const results = await objectLibraryService.getObjectsByType('character');

      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('character');
      expect(results[1].type).toBe('character');
    });
  });

  describe('getObjectsByTag', () => {
    it('should filter objects by tags (AND logic)', async () => {
      // Create objects with different tag combinations
      await objectLibraryService.createObject(
        'character',
        {},
        { name: 'char_1', tags: ['hero', 'protagonist', 'brave'] }
      );
      await objectLibraryService.createObject(
        'character',
        {},
        { name: 'char_2', tags: ['hero', 'brave'] }
      );
      await objectLibraryService.createObject(
        'character',
        {},
        { name: 'char_3', tags: ['hero'] }
      );

      const results = await objectLibraryService.getObjectsByTag('character', ['hero', 'brave']);

      expect(results).toHaveLength(2); // char_1 and char_2 have both tags
    });
  });

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  describe('updateObject', () => {
    it('should update object data and increment version', async () => {
      // Create object first
      const objectId = await objectLibraryService.createObject(
        'character',
        { name: 'Old Name' },
        { name: 'Test Character' }
      );

      // Update it
      const newData = { name: 'New Name' };
      const updated = await objectLibraryService.updateObject(
        objectId,
        'character',
        newData,
        { description: 'Updated name' }
      );

      expect(updated.version).toBe(2);
      expect(updated.data).toEqual(newData);

      // Verify it was persisted
      const retrieved = await objectLibraryService.getObject(objectId, 'character');
      expect(retrieved?.version).toBe(2);
      expect(retrieved?.data).toEqual(newData);
    });

    it('should throw error when object not found', async () => {
      await expect(
        objectLibraryService.updateObject('nonexistent', 'character', {}, { description: 'test' })
      ).rejects.toThrow('Object not found');
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata without incrementing version', async () => {
      // Create object first
      const objectId = await objectLibraryService.createObject(
        'character',
        { name: 'Character' },
        {
          name: 'Old Name',
          description: 'Old description',
          tags: ['old'],
        }
      );

      // Update metadata
      const updated = await objectLibraryService.updateMetadata(objectId, 'character', {
        name: 'New Name',
        tags: ['new', 'updated'],
      });

      expect(updated.version).toBe(1); // Version unchanged
      expect(updated.name).toBe('New Name');
      expect(updated.tags).toEqual(['new', 'updated']);

      // Verify persisted
      const retrieved = await objectLibraryService.getObject(objectId, 'character');
      expect(retrieved?.version).toBe(1);
      expect(retrieved?.name).toBe('New Name');
    });
  });

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  describe('deleteObject', () => {
    it('should delete object when not linked to scenes', async () => {
      // Create object
      const objectId = await objectLibraryService.createObject(
        'character',
        {},
        { name: 'Test' }
      );

      // Delete it
      await objectLibraryService.deleteObject(objectId, 'character');

      // Verify it's gone
      const retrieved = await objectLibraryService.getObject(objectId, 'character');
      expect(retrieved).toBeNull();
    });

    it('should throw error when object is linked to scenes without force', async () => {
      // Create object and link to scene
      const objectId = await objectLibraryService.createObject(
        'character',
        {},
        { name: 'Test' }
      );
      await objectLibraryService.linkObjectToScene(objectId, 'character', 'scene1');

      // Try to delete without force
      await expect(
        objectLibraryService.deleteObject(objectId, 'character', {
          unlinkFromScenes: false,
          force: false,
        })
      ).rejects.toThrow('still linked to');
    });

    it('should delete with force even if linked', async () => {
      // Create object and link to scene
      const objectId = await objectLibraryService.createObject(
        'character',
        {},
        { name: 'Test' }
      );
      await objectLibraryService.linkObjectToScene(objectId, 'character', 'scene1');

      // Delete with force
      await objectLibraryService.deleteObject(objectId, 'character', { force: true });

      // Verify it's gone
      const retrieved = await objectLibraryService.getObject(objectId, 'character');
      expect(retrieved).toBeNull();
    });
  });

  // ============================================================================
  // LINKING OPERATIONS
  // ============================================================================

  describe('linkObjectToScene', () => {
    it('should add scene to linkedScenes', async () => {
      // Create object
      const objectId = await objectLibraryService.createObject(
        'character',
        {},
        { name: 'Test' }
      );

      // Link to scene
      await objectLibraryService.linkObjectToScene(objectId, 'character', 'scene1');

      // Verify link
      const retrieved = await objectLibraryService.getObject(objectId, 'character');
      expect(retrieved?.linkedScenes).toContain('scene1');
    });

    it('should not duplicate scene link if already present', async () => {
      // Create object and link to scene
      const objectId = await objectLibraryService.createObject(
        'character',
        {},
        { name: 'Test' }
      );
      await objectLibraryService.linkObjectToScene(objectId, 'character', 'scene1');

      // Try to link again
      await objectLibraryService.linkObjectToScene(objectId, 'character', 'scene1');

      // Verify only one link
      const retrieved = await objectLibraryService.getObject(objectId, 'character');
      expect(retrieved?.linkedScenes.filter(s => s === 'scene1')).toHaveLength(1);
    });
  });

  describe('unlinkObjectFromScene', () => {
    it('should remove scene from linkedScenes', async () => {
      // Create object and link to multiple scenes
      const objectId = await objectLibraryService.createObject(
        'character',
        {},
        { name: 'Test' }
      );
      await objectLibraryService.linkObjectToScene(objectId, 'character', 'scene1');
      await objectLibraryService.linkObjectToScene(objectId, 'character', 'scene2');

      // Unlink one scene
      await objectLibraryService.unlinkObjectFromScene(objectId, 'character', 'scene1');

      // Verify it's gone
      const retrieved = await objectLibraryService.getObject(objectId, 'character');
      expect(retrieved?.linkedScenes).not.toContain('scene1');
      expect(retrieved?.linkedScenes).toContain('scene2');
    });
  });

  // ============================================================================
  // VERSIONING OPERATIONS
  // ============================================================================

  describe('getVersionHistory', () => {
    it('should return all versions for an object', async () => {
      // Create object and update it to create versions
      const objectId = await objectLibraryService.createObject(
        'character',
        { name: 'Version 1' },
        { name: 'Test' }
      );

      await objectLibraryService.updateObject(
        objectId,
        'character',
        { name: 'Version 2' },
        { description: 'Update 1' }
      );

      const versions = await objectLibraryService.getVersionHistory(objectId);

      expect(versions.length).toBeGreaterThanOrEqual(1);
      expect(versions.every(v => v.objectId === objectId)).toBe(true);
    });
  });

  describe('getChangelogs', () => {
    it('should return all changelogs for an object', async () => {
      // Create object and update it to create changelogs
      const objectId = await objectLibraryService.createObject(
        'character',
        { name: 'Version 1' },
        { name: 'Test' }
      );

      await objectLibraryService.updateObject(
        objectId,
        'character',
        { name: 'Version 2' },
        {
          description: 'Update 1',
          changelog: {
            changes: [
              { field: 'name', oldValue: 'Version 1', newValue: 'Version 2', reason: 'Test' },
            ],
          },
        }
      );

      const changelogs = await objectLibraryService.getChangelogs(objectId);

      expect(changelogs.length).toBeGreaterThanOrEqual(1);
      expect(changelogs.every(c => c.objectId === objectId)).toBe(true);
    });
  });

  describe('revertToVersion', () => {
    it('should revert object to previous version', async () => {
      // Create object and update it
      const objectId = await objectLibraryService.createObject(
        'character',
        { name: 'Version 1' },
        { name: 'Test' }
      );

      await objectLibraryService.updateObject(
        objectId,
        'character',
        { name: 'Version 2' },
        { description: 'Update to v2' }
      );

      // Revert to version 1
      const reverted = await objectLibraryService.revertToVersion(objectId, 'character', 1);

      expect(reverted.data).toEqual({ name: 'Version 1' });
      expect(reverted.version).toBe(3); // New version created
    });

    it('should throw error when target version not found', async () => {
      // Create object
      const objectId = await objectLibraryService.createObject(
        'character',
        {},
        { name: 'Test' }
      );

      await expect(
        objectLibraryService.revertToVersion(objectId, 'character', 999)
      ).rejects.toThrow('Version 999 not found');
    });
  });
});

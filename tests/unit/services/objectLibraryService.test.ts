import { describe, it, expect, beforeEach, vi } from 'vitest';
import { objectLibraryService } from '../../../src/services/objectLibraryService';
import { getDB } from '../../../services/db/indexedDbService';

// Mock IndexedDB
vi.mock('../../../services/db/indexedDbService', () => ({
  getDB: vi.fn(),
}));

describe('ObjectLibraryService', () => {
  let mockDB: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock IndexedDB
    mockDB = {
      transaction: vi.fn(),
      objectStore: vi.fn(),
      add: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      getAll: vi.fn().mockResolvedValue([]),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    (getDB as any).mockResolvedValue(mockDB);
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

      // Verify add was called
      expect(mockDB.add).toHaveBeenCalled();
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
      expect(mockDB.add).toHaveBeenCalled();
    });
  });

  describe('duplicateObject', () => {
    it('should duplicate an existing object with new name', async () => {
      const sourceObject = {
        id: 'char_123_456',
        type: 'character',
        version: 1,
        data: { name: 'Original Character' },
        linkedScenes: [],
        linkedObjects: [],
        name: 'Original Character',
        tags: ['test'],
        created: new Date(),
        modified: new Date(),
      };

      mockDB.get.mockResolvedValue(sourceObject);

      const newId = await objectLibraryService.duplicateObject(
        'char_123_456',
        'character',
        'Duplicated Character'
      );

      expect(newId).toMatch(/^char_\d+_\d+$/);
      expect(newId).not.toBe('char_123_456');
    });

    it('should throw error when source object not found', async () => {
      mockDB.get.mockResolvedValue(null);

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
      const mockObject = {
        id: 'char_123_456',
        type: 'character',
        version: 1,
        data: { name: 'Test Character' },
        linkedScenes: [],
        linkedObjects: [],
        name: 'Test Character',
        created: new Date(),
        modified: new Date(),
      };

      mockDB.get.mockResolvedValue(mockObject);

      const result = await objectLibraryService.getObject('char_123_456', 'character');

      expect(result).toEqual(mockObject);
    });

    it('should return null for non-existent object', async () => {
      mockDB.get.mockResolvedValue(undefined);

      const result = await objectLibraryService.getObject('nonexistent', 'character');

      expect(result).toBeNull();
    });
  });

  describe('getObjectsByType', () => {
    it('should retrieve all objects of a type', async () => {
      const mockObjects = [
        { id: 'char_1', type: 'character', name: 'Character 1' },
        { id: 'char_2', type: 'character', name: 'Character 2' },
      ];

      mockDB.getAll.mockResolvedValue(mockObjects);

      const results = await objectLibraryService.getObjectsByType('character');

      expect(results).toEqual(mockObjects);
      expect(results).toHaveLength(2);
    });
  });

  describe('getObjectsByTag', () => {
    it('should filter objects by tags (AND logic)', async () => {
      const mockObjects = [
        { id: 'char_1', tags: ['hero', 'protagonist', 'brave'] },
        { id: 'char_2', tags: ['hero', 'brave'] },
        { id: 'char_3', tags: ['hero'] },
      ];

      mockDB.getAll.mockResolvedValue(mockObjects);

      const results = await objectLibraryService.getObjectsByTag('character', ['hero', 'brave']);

      expect(results).toHaveLength(2); // char_1 and char_2
    });
  });

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  describe('updateObject', () => {
    it('should update object data and increment version', async () => {
      const existingObject = {
        id: 'char_123_456',
        type: 'character',
        version: 1,
        data: { name: 'Old Name' },
        linkedScenes: [],
        linkedObjects: [],
        name: 'Test Character',
        created: new Date('2024-01-01'),
        modified: new Date('2024-01-01'),
      };

      mockDB.get.mockResolvedValue(existingObject);

      const newData = { name: 'New Name' };
      const updated = await objectLibraryService.updateObject(
        'char_123_456',
        'character',
        newData,
        'Updated name'
      );

      expect(updated.version).toBe(2);
      expect(updated.data).toEqual(newData);
      expect(mockDB.put).toHaveBeenCalled();
    });

    it('should throw error when object not found', async () => {
      mockDB.get.mockResolvedValue(null);

      await expect(
        objectLibraryService.updateObject('nonexistent', 'character', {}, 'test')
      ).rejects.toThrow('Object not found');
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata without incrementing version', async () => {
      const existingObject = {
        id: 'char_123_456',
        type: 'character',
        version: 1,
        data: { name: 'Character' },
        linkedScenes: [],
        linkedObjects: [],
        name: 'Old Name',
        description: 'Old description',
        tags: ['old'],
        created: new Date('2024-01-01'),
        modified: new Date('2024-01-01'),
      };

      mockDB.get.mockResolvedValue(existingObject);

      const updated = await objectLibraryService.updateMetadata('char_123_456', 'character', {
        name: 'New Name',
        tags: ['new', 'updated'],
      });

      expect(updated.version).toBe(1); // Version unchanged
      expect(updated.name).toBe('New Name');
      expect(updated.tags).toEqual(['new', 'updated']);
    });
  });

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  describe('deleteObject', () => {
    it('should delete object when not linked to scenes', async () => {
      const mockObject = {
        id: 'char_123_456',
        type: 'character',
        linkedScenes: [],
        linkedObjects: [],
      };

      mockDB.get.mockResolvedValue(mockObject);
      mockDB.getAll.mockResolvedValue([]); // No relationships

      await objectLibraryService.deleteObject('char_123_456', 'character');

      expect(mockDB.delete).toHaveBeenCalled();
    });

    it('should throw error when object is linked to scenes without force', async () => {
      const mockObject = {
        id: 'char_123_456',
        type: 'character',
        linkedScenes: ['scene1', 'scene2'],
        linkedObjects: [],
      };

      mockDB.get.mockResolvedValue(mockObject);

      await expect(
        objectLibraryService.deleteObject('char_123_456', 'character', {
          unlinkFromScenes: false,
          force: false,
        })
      ).rejects.toThrow('still linked to');
    });

    it('should delete with force even if linked', async () => {
      const mockObject = {
        id: 'char_123_456',
        type: 'character',
        linkedScenes: ['scene1'],
        linkedObjects: [],
      };

      mockDB.get.mockResolvedValue(mockObject);
      mockDB.getAll.mockResolvedValue([]); // No relationships

      await objectLibraryService.deleteObject('char_123_456', 'character', {
        force: true,
      });

      expect(mockDB.delete).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // LINKING OPERATIONS
  // ============================================================================

  describe('linkObjectToScene', () => {
    it('should add scene to linkedScenes', async () => {
      const mockObject = {
        id: 'char_123_456',
        type: 'character',
        linkedScenes: [],
        linkedObjects: [],
      };

      mockDB.get.mockResolvedValue(mockObject);

      await objectLibraryService.linkObjectToScene('char_123_456', 'character', 'scene1');

      expect(mockDB.put).toHaveBeenCalled();
    });

    it('should not duplicate scene link if already present', async () => {
      const mockObject = {
        id: 'char_123_456',
        type: 'character',
        linkedScenes: ['scene1'],
        linkedObjects: [],
      };

      mockDB.get.mockResolvedValue(mockObject);

      await objectLibraryService.linkObjectToScene('char_123_456', 'character', 'scene1');

      // Should still call put, but linkedScenes should remain ['scene1']
      expect(mockDB.put).not.toHaveBeenCalled(); // Not called if already linked
    });
  });

  describe('unlinkObjectFromScene', () => {
    it('should remove scene from linkedScenes', async () => {
      const mockObject = {
        id: 'char_123_456',
        type: 'character',
        linkedScenes: ['scene1', 'scene2'],
        linkedObjects: [],
      };

      mockDB.get.mockResolvedValue(mockObject);

      await objectLibraryService.unlinkObjectFromScene('char_123_456', 'character', 'scene1');

      expect(mockDB.put).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // VERSIONING OPERATIONS
  // ============================================================================

  describe('getVersionHistory', () => {
    it('should return all versions for an object', async () => {
      const mockVersions = [
        { versionId: 'ver1', objectId: 'char_123', version: 1 },
        { versionId: 'ver2', objectId: 'char_123', version: 2 },
        { versionId: 'ver3', objectId: 'char_456', version: 1 }, // Different object
      ];

      mockDB.getAll.mockResolvedValue(mockVersions);

      const results = await objectLibraryService.getVersionHistory('char_123');

      expect(results).toHaveLength(2); // Only char_123 versions
      expect(results[0].version).toBe(1);
      expect(results[1].version).toBe(2);
    });
  });

  describe('getChangelogs', () => {
    it('should return all changelogs for an object', async () => {
      const mockChangelogs = [
        { changelogId: 'log1', objectId: 'char_123', fromVersion: 1, toVersion: 2 },
        { changelogId: 'log2', objectId: 'char_456', fromVersion: 1, toVersion: 2 },
      ];

      mockDB.getAll.mockResolvedValue(mockChangelogs);

      const results = await objectLibraryService.getChangelogs('char_123');

      expect(results).toHaveLength(1); // Only char_123 changelogs
    });
  });

  describe('revertToVersion', () => {
    it('should revert object to previous version', async () => {
      const mockVersions = [
        {
          versionId: 'ver1',
          objectId: 'char_123',
          version: 1,
          data: { name: 'Version 1' },
        },
        {
          versionId: 'ver2',
          objectId: 'char_123',
          version: 2,
          data: { name: 'Version 2' },
        },
      ];

      const currentObject = {
        id: 'char_123',
        type: 'character',
        version: 2,
        data: { name: 'Version 2' },
        linkedScenes: [],
        linkedObjects: [],
        name: 'Test',
        created: new Date(),
        modified: new Date(),
      };

      mockDB.getAll.mockResolvedValue(mockVersions);
      mockDB.get.mockResolvedValue(currentObject);

      const reverted = await objectLibraryService.revertToVersion('char_123', 'character', 1);

      expect(reverted.data).toEqual({ name: 'Version 1' });
      expect(reverted.version).toBe(3); // New version created
    });

    it('should throw error when target version not found', async () => {
      mockDB.getAll.mockResolvedValue([]);

      await expect(
        objectLibraryService.revertToVersion('char_123', 'character', 5)
      ).rejects.toThrow('Version 5 not found');
    });
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { objectSearchService } from '../../../src/services/objectSearchService';
import { objectLibraryService } from '../../../src/services/objectLibraryService';
import { getDB } from '../../../src/services/db/indexedDbService';
import 'fake-indexeddb/auto';

describe('ObjectSearchService', () => {
  // Track created object IDs for cleanup
  let createdIds: { id: string; type: string }[] = [];

  beforeEach(async () => {
    // Ensure database is initialized
    await getDB();
    createdIds = [];
  });

  afterEach(async () => {
    // Clean up created objects
    for (const { id, type } of createdIds) {
      try {
        await objectLibraryService.deleteObject(id, type as any, { force: true });
      } catch {
        // Ignore errors during cleanup
      }
    }

    // Also clear all stores
    const db = await getDB();
    const storeNames = [
      'characterObjects', 'locationObjects', 'cameraObjects',
      'propObjects', 'audioObjects', 'conceptObjects', 'customObjects',
      'objectVersions', 'objectChangelogs', 'objectRelationships'
    ];
    const tx = db.transaction(storeNames, 'readwrite');
    for (const storeName of storeNames) {
      const store = tx.objectStore(storeName);
      await store.clear();
    }
    await tx.complete;
  });

  // Helper to create test objects
  async function createTestObject(
    type: 'character' | 'location' | 'prop',
    name: string,
    tags: string[] = [],
    description?: string
  ): Promise<string> {
    const id = await objectLibraryService.createObject(
      type,
      { name },
      { name, tags, description }
    );
    createdIds.push({ id, type });
    return id;
  }

  // ============================================================================
  // SEARCH BY NAME
  // ============================================================================

  describe('searchByName', () => {
    it('should find objects by partial name match', async () => {
      await createTestObject('character', 'John Smith');
      await createTestObject('character', 'John Doe');
      await createTestObject('character', 'Jane Doe');

      const results = await objectSearchService.searchByName('John');

      expect(results).toHaveLength(2);
      expect(results.every(r => r.name.includes('John'))).toBe(true);
    });

    it('should find objects by exact name match', async () => {
      await createTestObject('character', 'John Smith');
      await createTestObject('character', 'John');

      const results = await objectSearchService.searchByName('John', { exact: true });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John');
    });

    it('should be case-insensitive by default', async () => {
      await createTestObject('character', 'JOHN');
      await createTestObject('character', 'john');
      await createTestObject('character', 'John');

      const results = await objectSearchService.searchByName('john');

      expect(results).toHaveLength(3);
    });

    it('should support case-sensitive search', async () => {
      await createTestObject('character', 'JOHN');
      await createTestObject('character', 'john');
      await createTestObject('character', 'John');

      const results = await objectSearchService.searchByName('john', { caseSensitive: true });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('john');
    });

    it('should filter by object type', async () => {
      await createTestObject('character', 'Test Object');
      await createTestObject('location', 'Test Object');
      await createTestObject('prop', 'Test Object');

      const results = await objectSearchService.searchByName('Test', {
        objectTypes: ['character', 'prop']
      });

      expect(results).toHaveLength(2);
      expect(results.some(r => r.type === 'character')).toBe(true);
      expect(results.some(r => r.type === 'prop')).toBe(true);
      expect(results.some(r => r.type === 'location')).toBe(false);
    });

    it('should return empty array when no matches', async () => {
      await createTestObject('character', 'John');

      const results = await objectSearchService.searchByName('NonExistent');

      expect(results).toHaveLength(0);
    });
  });

  // ============================================================================
  // SEARCH BY TAGS
  // ============================================================================

  describe('searchByTags', () => {
    it('should find objects with all tags (AND logic)', async () => {
      await createTestObject('character', 'Hero1', ['brave', 'strong', 'leader']);
      await createTestObject('character', 'Hero2', ['brave', 'strong']);
      await createTestObject('character', 'Hero3', ['brave']);

      const results = await objectSearchService.searchByTags(['brave', 'strong']);

      expect(results).toHaveLength(2);
    });

    it('should find objects with any tag (OR logic)', async () => {
      await createTestObject('character', 'Hero1', ['brave']);
      await createTestObject('character', 'Hero2', ['strong']);
      await createTestObject('character', 'Hero3', ['smart']);

      const results = await objectSearchService.searchByTags(['brave', 'strong'], { logic: 'OR' });

      expect(results).toHaveLength(2);
    });

    it('should return empty for objects without tags', async () => {
      await createTestObject('character', 'NoTags', []);

      const results = await objectSearchService.searchByTags(['any']);

      expect(results).toHaveLength(0);
    });

    it('should filter by object type', async () => {
      await createTestObject('character', 'Tagged Char', ['test']);
      await createTestObject('location', 'Tagged Loc', ['test']);

      const results = await objectSearchService.searchByTags(['test'], {
        objectTypes: ['character']
      });

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('character');
    });
  });

  // ============================================================================
  // SEARCH BY USAGE
  // ============================================================================

  describe('searchByUsage', () => {
    it('should find objects by minimum usage', async () => {
      const id1 = await createTestObject('character', 'Popular');
      const id2 = await createTestObject('character', 'Unpopular');

      // Link first object to multiple scenes
      await objectLibraryService.linkObjectToScene(id1, 'character', 'scene1');
      await objectLibraryService.linkObjectToScene(id1, 'character', 'scene2');
      await objectLibraryService.linkObjectToScene(id1, 'character', 'scene3');

      const results = await objectSearchService.searchByUsage({ minUsage: 2 });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Popular');
      expect(results[0].usageCount).toBe(3);
    });

    it('should sort by usage descending by default', async () => {
      const id1 = await createTestObject('character', 'Used3');
      const id2 = await createTestObject('character', 'Used1');
      const id3 = await createTestObject('character', 'Used2');

      await objectLibraryService.linkObjectToScene(id1, 'character', 's1');
      await objectLibraryService.linkObjectToScene(id1, 'character', 's2');
      await objectLibraryService.linkObjectToScene(id1, 'character', 's3');
      await objectLibraryService.linkObjectToScene(id2, 'character', 's1');
      await objectLibraryService.linkObjectToScene(id3, 'character', 's1');
      await objectLibraryService.linkObjectToScene(id3, 'character', 's2');

      const results = await objectSearchService.searchByUsage({ minUsage: 1 });

      expect(results[0].usageCount).toBe(3);
      expect(results[1].usageCount).toBe(2);
      expect(results[2].usageCount).toBe(1);
    });

    it('should sort by usage ascending when specified', async () => {
      const id1 = await createTestObject('character', 'Used3');
      const id2 = await createTestObject('character', 'Used1');

      await objectLibraryService.linkObjectToScene(id1, 'character', 's1');
      await objectLibraryService.linkObjectToScene(id1, 'character', 's2');
      await objectLibraryService.linkObjectToScene(id1, 'character', 's3');
      await objectLibraryService.linkObjectToScene(id2, 'character', 's1');

      const results = await objectSearchService.searchByUsage({
        minUsage: 1,
        sortBy: 'usage'
      });

      expect(results[0].usageCount).toBe(1);
      expect(results[1].usageCount).toBe(3);
    });

    it('should respect limit option', async () => {
      const id1 = await createTestObject('character', 'Obj1');
      const id2 = await createTestObject('character', 'Obj2');
      const id3 = await createTestObject('character', 'Obj3');

      await objectLibraryService.linkObjectToScene(id1, 'character', 's1');
      await objectLibraryService.linkObjectToScene(id2, 'character', 's1');
      await objectLibraryService.linkObjectToScene(id3, 'character', 's1');

      const results = await objectSearchService.searchByUsage({
        minUsage: 1,
        limit: 2
      });

      expect(results).toHaveLength(2);
    });
  });

  // ============================================================================
  // SEARCH BY RELATIONSHIP
  // ============================================================================

  describe('searchByRelationship', () => {
    it('should find objects related to a given object', async () => {
      const heroId = await createTestObject('character', 'Hero');
      const sidekickId = await createTestObject('character', 'Sidekick');
      const villainId = await createTestObject('character', 'Villain');

      await objectLibraryService.createRelationship(heroId, 'character', sidekickId, 'character', 'works_with');
      await objectLibraryService.createRelationship(heroId, 'character', villainId, 'character', 'enemy_of');

      const results = await objectSearchService.searchByRelationship(heroId);

      expect(results).toHaveLength(2);
    });

    it('should filter by relationship type', async () => {
      const heroId = await createTestObject('character', 'Hero');
      const sidekickId = await createTestObject('character', 'Sidekick');
      const villainId = await createTestObject('character', 'Villain');

      await objectLibraryService.createRelationship(heroId, 'character', sidekickId, 'character', 'works_with');
      await objectLibraryService.createRelationship(heroId, 'character', villainId, 'character', 'enemy_of');

      const results = await objectSearchService.searchByRelationship(heroId, {
        relationTypes: ['works_with']
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Sidekick');
    });

    it('should find outgoing relationships only', async () => {
      const heroId = await createTestObject('character', 'Hero');
      const sidekickId = await createTestObject('character', 'Sidekick');

      // Hero -> Sidekick
      await objectLibraryService.createRelationship(heroId, 'character', sidekickId, 'character', 'mentors');

      // Search from Hero's perspective (outgoing)
      const fromResults = await objectSearchService.searchByRelationship(heroId, { direction: 'from' });
      expect(fromResults).toHaveLength(1);
      expect(fromResults[0].name).toBe('Sidekick');

      // Search from Sidekick's perspective (outgoing) - should be empty
      const sidekickOutgoing = await objectSearchService.searchByRelationship(sidekickId, { direction: 'from' });
      expect(sidekickOutgoing).toHaveLength(0);
    });

    it('should find incoming relationships only', async () => {
      const heroId = await createTestObject('character', 'Hero');
      const sidekickId = await createTestObject('character', 'Sidekick');

      // Hero -> Sidekick
      await objectLibraryService.createRelationship(heroId, 'character', sidekickId, 'character', 'mentors');

      // Search from Sidekick's perspective (incoming)
      const toResults = await objectSearchService.searchByRelationship(sidekickId, { direction: 'to' });
      expect(toResults).toHaveLength(1);
      expect(toResults[0].name).toBe('Hero');
    });
  });

  // ============================================================================
  // SEMANTIC SEARCH (FALLBACK MODE)
  // ============================================================================

  describe('searchSemantic', () => {
    it('should fallback to name/description search without LLM', async () => {
      await createTestObject('character', 'Brave Knight', [], 'A courageous warrior');
      await createTestObject('character', 'Evil Wizard', [], 'A dark sorcerer');

      const results = await objectSearchService.searchSemantic('brave');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Brave Knight');
    });

    it('should search in descriptions', async () => {
      await createTestObject('character', 'Hero', [], 'fights for justice');

      const results = await objectSearchService.searchSemantic('justice');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Hero');
    });

    it('should respect limit option', async () => {
      await createTestObject('character', 'Test1', [], 'test description');
      await createTestObject('character', 'Test2', [], 'test description');
      await createTestObject('character', 'Test3', [], 'test description');

      const results = await objectSearchService.searchSemantic('test', { limit: 2 });

      expect(results).toHaveLength(2);
    });

    it('should filter by object type', async () => {
      await createTestObject('character', 'Test Char');
      await createTestObject('location', 'Test Loc');

      const results = await objectSearchService.searchSemantic('Test', {
        objectTypes: ['location']
      });

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('location');
    });
  });

  // ============================================================================
  // OBJECT STATISTICS
  // ============================================================================

  describe('getObjectStatistics', () => {
    it('should return correct total count', async () => {
      await createTestObject('character', 'Char1');
      await createTestObject('character', 'Char2');
      await createTestObject('location', 'Loc1');

      const stats = await objectSearchService.getObjectStatistics();

      expect(stats.totalObjects).toBe(3);
    });

    it('should return correct counts by type', async () => {
      await createTestObject('character', 'Char1');
      await createTestObject('character', 'Char2');
      await createTestObject('location', 'Loc1');
      await createTestObject('prop', 'Prop1');

      const stats = await objectSearchService.getObjectStatistics();

      expect(stats.byType.character).toBe(2);
      expect(stats.byType.location).toBe(1);
      expect(stats.byType.prop).toBe(1);
    });

    it('should calculate usage statistics', async () => {
      const id1 = await createTestObject('character', 'Popular');
      const id2 = await createTestObject('character', 'Unused');

      await objectLibraryService.linkObjectToScene(id1, 'character', 's1');
      await objectLibraryService.linkObjectToScene(id1, 'character', 's2');

      const stats = await objectSearchService.getObjectStatistics();

      expect(stats.totalUsage).toBe(2);
      expect(stats.averageUsage).toBe(1); // 2 total / 2 objects
      expect(stats.mostUsed?.name).toBe('Popular');
    });

    it('should handle empty library', async () => {
      const stats = await objectSearchService.getObjectStatistics();

      expect(stats.totalObjects).toBe(0);
      expect(stats.totalUsage).toBe(0);
      expect(stats.averageUsage).toBe(0);
      expect(stats.mostUsed).toBeNull();
    });
  });
});

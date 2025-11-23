import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createIntermediate,
  updateIntermediate,
  getIntermediate,
  getAllIntermediates,
  deleteIntermediate,
} from './intermediateService';
import type { IntermediatePrompt } from '../../types/intermediate';
import { getDB } from './indexedDbService';

describe('intermediateService', () => {
  let testIntermediate: IntermediatePrompt;

  beforeEach(async () => {
    // fake-indexeddb provides clean DB for each test
    testIntermediate = {
      id: 'test-intermediate-1',
      title: 'Test Intermediate',
      created: new Date(),
      modified: new Date(),
      structure: {
        visual: {
          subjects: 'Test subject',
          setting: 'Test setting',
        },
      },
    };
  });

  afterEach(async () => {
    // Clean up test data
    try {
      const db = await getDB();
      const tx = db.transaction('intermediates', 'readwrite');
      await tx.objectStore('intermediates').clear();
      await tx.done;
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  describe('createIntermediate', () => {
    it('should save intermediate to database', async () => {
      await createIntermediate(testIntermediate);

      const retrieved = await getIntermediate(testIntermediate.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(testIntermediate.id);
      expect(retrieved?.title).toBe('Test Intermediate');
    });

    it('should preserve structure data', async () => {
      await createIntermediate(testIntermediate);

      const retrieved = await getIntermediate(testIntermediate.id);
      expect(retrieved?.structure.visual.subjects).toBe('Test subject');
    });
  });

  describe('updateIntermediate', () => {
    beforeEach(async () => {
      await createIntermediate(testIntermediate);
    });

    it('should update existing intermediate', async () => {
      await updateIntermediate(testIntermediate.id, {
        structure: {
          visual: {
            subjects: 'Updated subject',
          },
        },
      });

      const updated = await getIntermediate(testIntermediate.id);
      expect(updated?.structure.visual.subjects).toBe('Updated subject');
    });

    it('should update modified timestamp', async () => {
      const originalModified = testIntermediate.modified.getTime();

      // Add small delay to ensure timestamp changes (tests can run too fast)
      await new Promise(resolve => setTimeout(resolve, 10));

      await updateIntermediate(testIntermediate.id, {
        title: 'Updated Title',
      });

      const updated = await getIntermediate(testIntermediate.id);
      expect(updated?.modified.getTime()).toBeGreaterThan(originalModified);
    });

    it('should throw error for non-existent intermediate', async () => {
      await expect(
        updateIntermediate('non-existent', { title: 'Fail' })
      ).rejects.toThrow('Intermediate non-existent not found');
    });
  });

  describe('getAllIntermediates', () => {
    it('should return empty array when no intermediates', async () => {
      const all = await getAllIntermediates();
      expect(all).toEqual([]);
    });

    it('should return all saved intermediates', async () => {
      await createIntermediate(testIntermediate);
      await createIntermediate({
        ...testIntermediate,
        id: 'test-2',
        title: 'Test 2',
      });

      const all = await getAllIntermediates();
      expect(all).toHaveLength(2);
    });
  });

  describe('deleteIntermediate', () => {
    beforeEach(async () => {
      await createIntermediate(testIntermediate);
    });

    it('should delete intermediate from database', async () => {
      await deleteIntermediate(testIntermediate.id);

      const retrieved = await getIntermediate(testIntermediate.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('scene extension metadata', () => {
    it('should save intermediate with extensionMetadata', async () => {
      const childIntermediate: IntermediatePrompt = {
        id: 'child-1',
        title: 'Child Scene',
        created: new Date(),
        modified: new Date(),
        structure: { visual: { subjects: 'Child' } },
        extensionMetadata: {
          parentSceneId: 'parent-1',
          method: 'continue',
          preservation: {
            characters: true,
            environment: true,
            visualStyle: true,
            audio: false,
          },
          sceneNumber: 2,
        },
      };

      await createIntermediate(childIntermediate);
      const retrieved = await getIntermediate('child-1');

      expect(retrieved?.extensionMetadata?.parentSceneId).toBe('parent-1');
      expect(retrieved?.extensionMetadata?.method).toBe('continue');
    });
  });
});

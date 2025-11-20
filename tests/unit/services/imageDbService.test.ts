import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initImageDatabase,
  clearImageDatabase,
  IMAGE_DB_CONFIG,
  getImageDB,
  countRecords,
  getAllRecords
} from '../../mocks/imageDatabase';
import {
  mockImageProject,
  mockImageProject2,
  mockImageGeneration,
  mockImageGeneration2,
  mockImageGenerationWithLink,
  mockGeneratingImage,
  mockErrorImage,
  mockImageEdit,
  mockImageEdit2,
  mockSceneLink,
  mockSceneLink2,
  createTestImageGeneration,
  createTestImageProject
} from '../../fixtures/imageData';

/**
 * Image Database Service Tests
 *
 * Tests all CRUD operations for the Image Studio database:
 * - Image Projects
 * - Image Generations
 * - Image Edits
 * - Scene Links
 */

describe('imageDbService', () => {
  beforeEach(async () => {
    await initImageDatabase();
  });

  afterEach(async () => {
    await clearImageDatabase();
  });

  describe('Database Initialization', () => {
    it('should initialize database with correct name', async () => {
      const db = await getImageDB();
      expect(db.name).toBe(IMAGE_DB_CONFIG.name);
    });

    it('should create all required object stores', async () => {
      const db = await getImageDB();
      const storeNames = Array.from(db.objectStoreNames);

      expect(storeNames).toContain(IMAGE_DB_CONFIG.stores.imageProjects);
      expect(storeNames).toContain(IMAGE_DB_CONFIG.stores.imageGenerations);
      expect(storeNames).toContain(IMAGE_DB_CONFIG.stores.imageEdits);
      expect(storeNames).toContain(IMAGE_DB_CONFIG.stores.sceneLinks);
    });

    it('should create correct version', async () => {
      const db = await getImageDB();
      expect(db.version).toBe(IMAGE_DB_CONFIG.version);
    });

    it('should create indexes on imageGenerations store', async () => {
      const db = await getImageDB();
      const tx = db.transaction(IMAGE_DB_CONFIG.stores.imageGenerations, 'readonly');
      const store = tx.objectStore(IMAGE_DB_CONFIG.stores.imageGenerations);

      expect(store.indexNames.contains('projectId')).toBe(true);
      expect(store.indexNames.contains('created')).toBe(true);
      expect(store.indexNames.contains('status')).toBe(true);

      await tx.done;
    });

    it('should create indexes on sceneLinks store', async () => {
      const db = await getImageDB();
      const tx = db.transaction(IMAGE_DB_CONFIG.stores.sceneLinks, 'readonly');
      const store = tx.objectStore(IMAGE_DB_CONFIG.stores.sceneLinks);

      expect(store.indexNames.contains('imageGenerationId')).toBe(true);
      expect(store.indexNames.contains('intermediateId')).toBe(true);

      await tx.done;
    });
  });

  describe('Image Projects CRUD', () => {
    it('should save image project to database', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject);

      const count = await countRecords(IMAGE_DB_CONFIG.stores.imageProjects);
      expect(count).toBe(1);
    });

    it('should retrieve image project by ID', async () => {
      // Save project
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject);

      // Retrieve project
      const project = await db.get(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject.id);

      expect(project).toBeTruthy();
      expect(project.id).toBe(mockImageProject.id);
      expect(project.title).toBe(mockImageProject.title);
    });

    it('should return undefined for non-existent project ID', async () => {
      const db = await getImageDB();
      const project = await db.get(IMAGE_DB_CONFIG.stores.imageProjects, 'non-existent-id');

      expect(project).toBeUndefined();
    });

    it('should get all image projects', async () => {
      // Save multiple projects
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject);
      await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject2);

      // Get all projects
      const projects = await getAllRecords(IMAGE_DB_CONFIG.stores.imageProjects);
      expect(projects).toHaveLength(2);
      expect(projects.map((p: any) => p.id)).toContain(mockImageProject.id);
      expect(projects.map((p: any) => p.id)).toContain(mockImageProject2.id);
    });

    it('should update image project', async () => {
      // Save project
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject);

      // Update project
      const updatedProject = { ...mockImageProject, title: 'Updated Title' };
      await db.put(IMAGE_DB_CONFIG.stores.imageProjects, updatedProject);

      // Verify update
      const project = await db.get(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject.id);
      expect(project.title).toBe('Updated Title');
    });

    it('should delete image project', async () => {
      // Save project
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject);

      // Delete project
      await db.delete(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject.id);

      // Verify deletion
      const count = await countRecords(IMAGE_DB_CONFIG.stores.imageProjects);
      expect(count).toBe(0);
    });
  });

  describe('Image Generations CRUD', () => {
    it('should save image generation to database', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);

      const count = await countRecords(IMAGE_DB_CONFIG.stores.imageGenerations);
      expect(count).toBe(1);
    });

    it('should retrieve image generation by ID', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);

      const generation = await db.get(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration.id);

      expect(generation).toBeTruthy();
      expect(generation.id).toBe(mockImageGeneration.id);
      expect(generation.prompt).toBe(mockImageGeneration.prompt);
    });

    it('should link generation to project via projectId', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);

      const generation = await db.get(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration.id);

      expect(generation.projectId).toBe(mockImageProject.id);
    });

    it('should get generations filtered by projectId', async () => {
      // Save generations for different projects
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration2);
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, { ...mockImageGeneration, id: 'gen_003', projectId: 'different_project' });

      // Query by projectId index
      const generations = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.imageGenerations, 'projectId', mockImageProject.id);

      expect(generations).toHaveLength(2);
      expect(generations.every((g: any) => g.projectId === mockImageProject.id)).toBe(true);
    });

    // SKIPPED: fake-indexeddb doesn't properly serialize Blob objects
    // When retrieved, Blobs become plain objects {} instead of Blob instances
    // This is a known limitation of fake-indexeddb, not our code
    // Real browser IndexedDB handles Blob serialization correctly
    it.skip('should preserve image blob data', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);

      const generation = await db.get(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration.id);

      expect(generation.imageData).toBeInstanceOf(Blob);
      expect(generation.thumbnailData).toBeInstanceOf(Blob);
    });

    it('should preserve structured YAML', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);

      const generation = await db.get(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration.id);

      expect(generation.structuredYaml).toContain('image_metadata');
      expect(generation.structuredYaml).toContain('visual_properties');
    });

    it('should preserve quality scores', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);

      const generation = await db.get(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration.id);

      expect(generation.qualityScores).toBeTruthy();
      expect(generation.qualityScores.promptAdherence).toBe(8.5);
      expect(generation.qualityScores.technicalQuality).toBe(9.0);
    });

    it('should track generation status (generating/ready/error)', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockGeneratingImage);
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration); // ready
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockErrorImage);

      // Query by status
      const readyImages = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.imageGenerations, 'status', 'ready');
      const generatingImages = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.imageGenerations, 'status', 'generating');
      const errorImages = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.imageGenerations, 'status', 'error');

      expect(readyImages).toHaveLength(1);
      expect(generatingImages).toHaveLength(1);
      expect(errorImages).toHaveLength(1);
    });

    it('should store error message for failed generations', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockErrorImage);

      const generation = await db.get(IMAGE_DB_CONFIG.stores.imageGenerations, mockErrorImage.id);

      expect(generation.status).toBe('error');
      expect(generation.errorMessage).toBe('API request failed: Invalid prompt');
    });

    it('should track linkedSceneIds array', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGenerationWithLink);

      const generation = await db.get(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGenerationWithLink.id);

      expect(generation.linkedSceneIds).toHaveLength(1);
      expect(generation.linkedSceneIds[0]).toBe('scene_test_001');
    });
  });

  describe('Image Edits CRUD', () => {
    it('should save image edit to database', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit);

      const count = await countRecords(IMAGE_DB_CONFIG.stores.imageEdits);
      expect(count).toBe(1);
    });

    it('should retrieve edit by ID', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit);

      const edit = await db.get(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit.id);

      expect(edit).toBeTruthy();
      expect(edit.operation).toBe('Add Film Grain');
      expect(edit.prompt).toBe('Add moderate film grain and vintage sepia filter');
    });

    it('should get edits for a generation via generationId index', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit);
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit2);

      // Query edits for first generation
      const edits = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.imageEdits, 'generationId', 'img_gen_test_001');

      expect(edits).toHaveLength(1);
      expect(edits[0].id).toBe(mockImageEdit.id);
    });

    it('should track edit chain via parentEditId', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit);
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit2);

      // Verify parent-child relationship
      const childEdit = await db.get(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit2.id);

      expect(childEdit.parentEditId).toBe(mockImageEdit.id);
    });

    it('should store edit metadata (template, wildcards)', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit);

      const edit = await db.get(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit.id);

      expect(edit.metadata.template).toBe('film_grain_vintage');
      expect(edit.metadata.wildcards.grain_intensity).toBe('moderate');
    });

    it('should link to result generation', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit);

      const edit = await db.get(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit.id);

      expect(edit.resultGenerationId).toBe('img_gen_test_006');
    });
  });

  describe('Scene Links CRUD', () => {
    it('should save scene link to database', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink);

      const count = await countRecords(IMAGE_DB_CONFIG.stores.sceneLinks);
      expect(count).toBe(1);
    });

    it('should retrieve link by ID', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink);

      const link = await db.get(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink.id);

      expect(link).toBeTruthy();
      expect(link.imageGenerationId).toBe('img_gen_test_001');  // Updated to match fixture
      expect(link.intermediateId).toBe('scene_test_001');
    });

    it('should get links by imageGenerationId', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink);
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink2);

      const links = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.sceneLinks, 'imageGenerationId', 'img_gen_test_001');  // Updated to match fixture

      expect(links).toHaveLength(1);
      expect(links[0].intermediateId).toBe('scene_test_001');
    });

    it('should get links by intermediateId (scene)', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink);
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink2);

      const links = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.sceneLinks, 'intermediateId', 'scene_test_001');

      expect(links).toHaveLength(1);
      expect(links[0].imageGenerationId).toBe('img_gen_test_001');  // Updated to match fixture
    });

    it('should track different link types (first_frame, ingredient)', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink);
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink2);

      const link1 = await db.get(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink.id);
      const link2 = await db.get(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink2.id);

      expect(link1.linkType).toBe('first_frame');
      expect(link2.linkType).toBe('ingredient');
    });

    it('should store link metadata', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink2);

      const link = await db.get(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink2.id);

      expect(link.metadata.ingredientIndex).toBe(0);
      expect(link.metadata.autoGenerated).toBe(false);
    });

    it('should delete link', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink);

      await db.delete(IMAGE_DB_CONFIG.stores.sceneLinks, mockSceneLink.id);

      const count = await countRecords(IMAGE_DB_CONFIG.stores.sceneLinks);
      expect(count).toBe(0);
    });
  });

  describe('Cascading Deletes', () => {
    it('should support cascade delete of project and all its generations', async () => {
      // Save project and generations
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject);
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration2);

      // Delete project
      await db.delete(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject.id);

      // Delete associated generations (cascade logic would be in service layer)
      const generations = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.imageGenerations, 'projectId', mockImageProject.id);

      for (const gen of generations) {
        await db.delete(IMAGE_DB_CONFIG.stores.imageGenerations, gen.id);
      }

      // Verify cascading delete
      const genCount = await countRecords(IMAGE_DB_CONFIG.stores.imageGenerations);
      expect(genCount).toBe(0);
    });

    it('should support cascade delete of generation and all its edits', async () => {
      // Save generation and edits
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration);
      await db.add(IMAGE_DB_CONFIG.stores.imageEdits, mockImageEdit);

      // Delete generation
      await db.delete(IMAGE_DB_CONFIG.stores.imageGenerations, mockImageGeneration.id);

      // Delete associated edits (cascade logic)
      const edits = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.imageEdits, 'generationId', mockImageGeneration.id);

      for (const edit of edits) {
        await db.delete(IMAGE_DB_CONFIG.stores.imageEdits, edit.id);
      }

      const editCount = await countRecords(IMAGE_DB_CONFIG.stores.imageEdits);
      expect(editCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for duplicate IDs', async () => {
      const db = await getImageDB();
      await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject);

      // Try to add duplicate
      await expect(async () => {
        await db.add(IMAGE_DB_CONFIG.stores.imageProjects, mockImageProject);
      }).rejects.toThrow();
    });

    it('should handle corrupted database gracefully', async () => {
      // This would test error recovery in service layer
      // For now, just verify database can be reinitialized
      await clearImageDatabase();
      const db = await initImageDatabase();
      expect(db.name).toBe(IMAGE_DB_CONFIG.name);
    });

    it('should handle empty query results', async () => {
      const db = await getImageDB();
      const generations = await db.getAllFromIndex(IMAGE_DB_CONFIG.stores.imageGenerations, 'projectId', 'non-existent-project');

      expect(generations).toHaveLength(0);
    });
  });

  describe('Test Helpers', () => {
    it('should create test image generation with overrides', () => {
      const testGen = createTestImageGeneration({ prompt: 'Custom prompt' });

      expect(testGen.id).toBeTruthy();
      expect(testGen.prompt).toBe('Custom prompt');
      expect(testGen.projectId).toBe(mockImageProject.id);
    });

    it('should create test image project with overrides', () => {
      const testProject = createTestImageProject({ title: 'Custom Title' });

      expect(testProject.id).toBeTruthy();
      expect(testProject.title).toBe('Custom Title');
      expect(testProject.created).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for test data', () => {
      const gen1 = createTestImageGeneration();
      const gen2 = createTestImageGeneration();

      expect(gen1.id).not.toBe(gen2.id);
    });
  });
});

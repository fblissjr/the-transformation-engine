/**
 * Integration Tests: End-to-End Transform Pipeline
 *
 * These tests validate complete transformation workflows:
 * - Different scene types through different transformers
 * - Cross-model comparison (same intermediate -> multiple outputs)
 * - Minimal/maximal data handling
 * - Full object lifecycle (create -> use -> transform)
 * - Timestamp and audio handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Veo3ContinuousTransformer } from '../../../src/services/transformers/Veo3ContinuousTransformer';
import { Veo3AudioTransformer } from '../../../src/services/transformers/Veo3AudioTransformer';
import { Veo3AttributeValueTransformer } from '../../../src/services/transformers/Veo3AttributeValueTransformer';
import { Sora2NarrativeTransformer } from '../../../src/services/transformers/Sora2NarrativeTransformer';
import { GenericTransformer } from '../../../src/services/transformers/genericTransformer';
import type { ObjectLibraryService } from '../../../src/services/objectLibraryService';
import type { IntermediateV3 } from '../../../types/intermediate';
import {
  INTERMEDIATE_DIALOGUE_1,
  INTERMEDIATE_DIALOGUE_2,
  INTERMEDIATE_CINEMATIC_1,
  INTERMEDIATE_CINEMATIC_2,
  INTERMEDIATE_ACTION_1,
  INTERMEDIATE_ACTION_2,
  INTERMEDIATE_PRODUCT_1,
  INTERMEDIATE_PRODUCT_2,
  INTERMEDIATE_EDGE_MINIMAL,
  INTERMEDIATE_EDGE_MAXIMAL,
  getAllObjects,
  getAllIntermediates,
} from '../../fixtures/syntheticTestData';

// ============================================================================
// MOCK SETUP
// ============================================================================

const createMockObjectLibrary = (): ObjectLibraryService => {
  const objects = getAllObjects();

  return {
    getObject: vi.fn().mockImplementation((id: string, type: string) => {
      const obj = objects.find(o => o.id === id && o.type === type);
      return Promise.resolve(obj || null);
    }),
    createObject: vi.fn(),
    updateObject: vi.fn(),
    deleteObject: vi.fn(),
    getObjectsByType: vi.fn(),
    getObjectsByTag: vi.fn(),
    linkObjectToScene: vi.fn(),
    unlinkObjectFromScene: vi.fn(),
    getRelationships: vi.fn(),
    createRelationship: vi.fn(),
    deleteRelationship: vi.fn(),
    getVersionHistory: vi.fn(),
    getChangelogs: vi.fn(),
    revertToVersion: vi.fn(),
    duplicateObject: vi.fn(),
    updateMetadata: vi.fn(),
    editObjectWithLLM: vi.fn(),
    getObjectsUsedInScene: vi.fn(),
  } as unknown as ObjectLibraryService;
};

// ============================================================================
// SCENE TYPE TO VEO3 TRANSFORMATIONS
// ============================================================================

describe('Scene Type Transformations to Veo 3.1', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let veo3Transformer: Veo3ContinuousTransformer;
  let veo3AudioTransformer: Veo3AudioTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    veo3Transformer = new Veo3ContinuousTransformer();
    veo3AudioTransformer = new Veo3AudioTransformer();
  });

  it('should transform dialogue intermediate with audio-first, quoted speech', async () => {
    const result = await veo3AudioTransformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Should prioritize audio/dialogue content
    expect(result).toMatch(/says|dialogue/i);

    // Should include quoted speech from originalSyntax
    expect(result).toContain('"');

    // Should have audio content before or prominently placed
    const audioPosition = result.indexOf('says');
    expect(audioPosition).toBeGreaterThan(-1);
  });

  it('should transform cinematic intermediate with camera-first, depth layers', async () => {
    const result = await veo3Transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);

    // Should include camera/cinematography details prominently
    expect(result.toLowerCase()).toMatch(/camera|shot|dolly|steadicam|tracking/);

    // Should include visual composition terms
    expect(result.toLowerCase()).toMatch(/frame|composition|depth|layer/i);
  });

  it('should transform action intermediate with movement-focused content', async () => {
    const result = await veo3Transformer.transform(INTERMEDIATE_ACTION_1, mockObjectLibrary);

    // Should emphasize action verbs and movement
    expect(result.toLowerCase()).toMatch(/chases|sprints|dodges|slides/);

    // Should include temporal markers for choreography
    expect(result).toMatch(/\d+s|\(.*?\d.*?\)/);
  });

  it('should transform product intermediate with product-focused content', async () => {
    const result = await veo3Transformer.transform(INTERMEDIATE_PRODUCT_1, mockObjectLibrary);

    // Should focus on the product subject
    expect(result.toLowerCase()).toMatch(/usb|drive|encrypted|product/);

    // Should include presentation details (rotation, lighting)
    expect(result.toLowerCase()).toMatch(/rotating|reveal|spotlight|macro/);
  });
});

// ============================================================================
// SCENE TYPE TO SORA2 TRANSFORMATIONS
// ============================================================================

describe('Scene Type Transformations to Sora 2', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let sora2Transformer: Sora2NarrativeTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    sora2Transformer = new Sora2NarrativeTransformer();
  });

  it('should transform any intermediate with timecoded structure', async () => {
    const result = await sora2Transformer.transform(INTERMEDIATE_ACTION_1, mockObjectLibrary);

    // Should have timecode markers for Sora 2
    expect(result).toMatch(/\[\d:\d{2}/);
  });

  it('should transform any intermediate with imperial measurements', async () => {
    const result = await sora2Transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);

    // Should include imperial units
    expect(result).toMatch(/ft|inch|yard/i);
  });
});

// ============================================================================
// GENERIC TRANSFORMER TESTS
// ============================================================================

describe('Scene Type Transformations to Generic', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let genericTransformer: GenericTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    genericTransformer = new GenericTransformer();
  });

  it('should transform any intermediate to model-agnostic, usable output', async () => {
    const result = await genericTransformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Should produce readable, non-empty output
    expect(result.length).toBeGreaterThan(100);

    // Should not have model-specific formatting (timecodes, specific syntax)
    // Generic should be plain prose
    expect(result).not.toMatch(/\[\d{2}:\d{2}\]/);
  });
});

// ============================================================================
// CROSS-MODEL COMPARISON
// ============================================================================

describe('Cross-Model Comparison', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let veo3AudioTransformer: Veo3AudioTransformer;
  let sora2Transformer: Sora2NarrativeTransformer;
  let genericTransformer: GenericTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    veo3AudioTransformer = new Veo3AudioTransformer();
    sora2Transformer = new Sora2NarrativeTransformer();
    genericTransformer = new GenericTransformer();
  });

  it('should produce different valid outputs for same intermediate across all 3 transformers', async () => {
    // INTERMEDIATE_CINEMATIC_1 has audio, so Veo3Audio will produce distinct "AUDIO SPECIFICATION" format
    const intermediate = INTERMEDIATE_CINEMATIC_1;

    const veo3Result = await veo3AudioTransformer.transform(intermediate, mockObjectLibrary);
    const sora2Result = await sora2Transformer.transform(intermediate, mockObjectLibrary);
    const genericResult = await genericTransformer.transform(intermediate, mockObjectLibrary);

    // All three should produce valid output
    expect(veo3Result.length).toBeGreaterThan(50);
    expect(sora2Result.length).toBeGreaterThan(50);
    expect(genericResult.length).toBeGreaterThan(50);

    // All three should be different (using string !== for content comparison)
    expect(veo3Result !== sora2Result).toBe(true);
    expect(sora2Result !== genericResult).toBe(true);
    expect(veo3Result !== genericResult).toBe(true);

    // But all should include core content (the car)
    expect(veo3Result.toLowerCase()).toMatch(/mustang|car/);
    expect(sora2Result.toLowerCase()).toMatch(/mustang|car/);
    expect(genericResult.toLowerCase()).toMatch(/mustang|car/);
  });
});

// ============================================================================
// MINIMAL AND MAXIMAL DATA HANDLING
// ============================================================================

describe('Minimal and Maximal Data Handling', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let veo3Transformer: Veo3ContinuousTransformer;
  let sora2Transformer: Sora2NarrativeTransformer;
  let genericTransformer: GenericTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    veo3Transformer = new Veo3ContinuousTransformer();
    sora2Transformer = new Sora2NarrativeTransformer();
    genericTransformer = new GenericTransformer();
  });

  it('should handle minimal intermediate gracefully across all transformers', async () => {
    const minimal = INTERMEDIATE_EDGE_MINIMAL;

    // Should not throw for any transformer
    const veo3Result = await veo3Transformer.transform(minimal, mockObjectLibrary);
    const sora2Result = await sora2Transformer.transform(minimal, mockObjectLibrary);
    const genericResult = await genericTransformer.transform(minimal, mockObjectLibrary);

    // All should produce some output
    expect(veo3Result.length).toBeGreaterThan(10);
    expect(sora2Result.length).toBeGreaterThan(10);
    expect(genericResult.length).toBeGreaterThan(10);

    // Should include the minimal subject "Person standing"
    expect(veo3Result.toLowerCase()).toMatch(/person|standing/);
  });

  it('should handle maximal intermediate with all data included', async () => {
    const maximal = INTERMEDIATE_EDGE_MAXIMAL;

    const result = await veo3Transformer.transform(maximal, mockObjectLibrary);

    // Should include all three characters
    expect(result).toContain('Sarah Chen');
    expect(result).toContain('Marcus Wolfe');
    expect(result).toContain('Jamie Park');

    // Should include location
    expect(result.toLowerCase()).toMatch(/warehouse/);

    // Should include timestamp segments if present
    expect(result).toMatch(/\(?\d+s|\[\d+:\d+\]/);

    // Should include multiple audio types
    expect(result.toLowerCase()).toMatch(/sfx|music|ambient|dialogue/i);
  });
});

// ============================================================================
// OBJECT LIFECYCLE TESTS
// ============================================================================

describe('Object Lifecycle (Create -> Use -> Transform)', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let veo3Transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    veo3Transformer = new Veo3ContinuousTransformer();
  });

  it('should complete full lifecycle: object create -> use in scene -> transform', async () => {
    // Simulate object creation by ensuring it exists in mock
    const result = await veo3Transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Verify object was looked up (simulating "use in scene")
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('char_hero_001', 'character');

    // Verify transform includes object data
    expect(result).toContain('Sarah Chen');
  });

  it('should reflect changes when object is edited and re-transformed', async () => {
    // First transform
    const result1 = await veo3Transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);
    expect(result1).toContain('Sarah Chen');

    // Simulate object edit by modifying mock
    const editedObjects = getAllObjects().map(obj => {
      if (obj.id === 'char_hero_001') {
        return {
          ...obj,
          data: {
            ...obj.data,
            name: 'Detective Sarah "Eagle Eye" Chen',
          },
        };
      }
      return obj;
    });

    const editedMock = createMockObjectLibrary();
    (editedMock.getObject as any).mockImplementation((id: string, type: string) => {
      const obj = editedObjects.find(o => o.id === id && o.type === type);
      return Promise.resolve(obj || null);
    });

    // Re-transform should reflect edit
    const result2 = await veo3Transformer.transform(INTERMEDIATE_DIALOGUE_1, editedMock);
    expect(result2).toContain('Eagle Eye');
  });
});

// ============================================================================
// TIMESTAMP HANDLING
// ============================================================================

describe('Timestamp Segment Handling', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let veo3Transformer: Veo3ContinuousTransformer;
  let sora2Transformer: Sora2NarrativeTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    veo3Transformer = new Veo3ContinuousTransformer();
    sora2Transformer = new Sora2NarrativeTransformer();
  });

  it('should preserve temporal structure in Veo3 output for timestamp-segmented scenes', async () => {
    // ACTION_1 uses timestamp_segmented strategy
    const result = await veo3Transformer.transform(INTERMEDIATE_ACTION_1, mockObjectLibrary);

    // Should have time markers from the timestamps
    // Timestamps are: (0s-2s), (2s-4s), (4s-7s)
    expect(result).toMatch(/0s|2s|4s|7s|\(.*?s.*?\)/);
  });

  it('should convert timestamps to paragraphs in Sora2 output', async () => {
    // ACTION_1 has 3 timestamp segments
    const result = await sora2Transformer.transform(INTERMEDIATE_ACTION_1, mockObjectLibrary);

    // Should have paragraph breaks corresponding to segments
    const paragraphs = result.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Should have at least 2 paragraphs (may combine some)
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// AUDIO HANDLING
// ============================================================================

describe('Audio Handling', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let veo3Transformer: Veo3ContinuousTransformer;
  let veo3AudioTransformer: Veo3AudioTransformer;
  let genericTransformer: GenericTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    veo3Transformer = new Veo3ContinuousTransformer();
    veo3AudioTransformer = new Veo3AudioTransformer();
    genericTransformer = new GenericTransformer();
  });

  it('should expand audio properly for audio-heavy scenes in Veo3', async () => {
    // DIALOGUE_1 has multiple dialogue and SFX
    const result = await veo3AudioTransformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Should include all audio types
    expect(result).toMatch(/says|SFX|dialogue/i);

    // Should have substantial audio content
    const audioLines = result.split('\n').filter(line =>
      /says|SFX|Music|Ambient/i.test(line)
    );
    expect(audioLines.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle no-audio scenes gracefully across all transformers', async () => {
    // EDGE_MINIMAL has no audio
    const veo3Result = await veo3Transformer.transform(INTERMEDIATE_EDGE_MINIMAL, mockObjectLibrary);
    const genericResult = await genericTransformer.transform(INTERMEDIATE_EDGE_MINIMAL, mockObjectLibrary);

    // Should not crash and should produce valid output
    expect(veo3Result.length).toBeGreaterThan(10);
    expect(genericResult.length).toBeGreaterThan(10);

    // Should not have audio placeholders or errors
    expect(veo3Result).not.toMatch(/undefined|null|error/i);
    expect(genericResult).not.toMatch(/undefined|null|error/i);
  });
});

/**
 * Integration Tests: Object Reference Resolution
 *
 * These tests validate that object references in IntermediateV3 are correctly
 * resolved during transformation, including:
 * - Character, location, camera, prop, and audio references
 * - Error handling for missing/wrong type objects
 * - Override merging
 * - Multiple and nested references
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Veo3ContinuousTransformer } from '../../../src/services/transformers/Veo3ContinuousTransformer';
import { TransformerUtils } from '../../../src/services/transformers/TransformerUtils';
import type { ObjectLibraryService } from '../../../src/services/objectLibraryService';
import type { IntermediateV3 } from '../../../types/intermediate';
import type { ObjectReferenceComponent, TextComponent } from '../../../types/componentTypes';
import {
  INTERMEDIATE_DIALOGUE_1,
  INTERMEDIATE_CINEMATIC_1,
  INTERMEDIATE_ACTION_1,
  INTERMEDIATE_EDGE_MAXIMAL,
  CHARACTER_HERO,
  CHARACTER_VILLAIN,
  CHARACTER_SIDEKICK,
  LOCATION_WAREHOUSE,
  LOCATION_ALLEY,
  CAMERA_HANDHELD_INTENSE,
  CAMERA_STEADICAM_FOLLOW,
  PROP_ENCRYPTED_DRIVE,
  PROP_VINTAGE_CAR,
  AUDIO_NOIR_SCORE,
  getAllObjects,
} from '../../fixtures/syntheticTestData';

// ============================================================================
// MOCK SETUP
// ============================================================================

const createMockObjectLibrary = (
  customOverrides?: Partial<ObjectLibraryService>
): ObjectLibraryService => {
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
    ...customOverrides,
  } as unknown as ObjectLibraryService;
};

// ============================================================================
// CHARACTER REFERENCE RESOLUTION
// ============================================================================

describe('Character Reference Resolution', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    transformer = new Veo3ContinuousTransformer();
  });

  it('should resolve character reference and include full character data in output', async () => {
    // INTERMEDIATE_DIALOGUE_1 has character references for hero and villain
    const result = await transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Should contain resolved character names
    expect(result).toContain('Sarah Chen');
    expect(result).toContain('Marcus Wolfe');

    // Should call getObject for characters
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('char_hero_001', 'character');
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('char_villain_001', 'character');
  });

  it('should include character appearance details in output', async () => {
    const result = await transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Should contain resolved character appearance details
    // Hero: "Sharp cheekbones, intense gaze" from CHARACTER_HERO
    expect(result.toLowerCase()).toMatch(/detective|trench\s*coat|charcoal|grey/);
  });
});

// ============================================================================
// LOCATION REFERENCE RESOLUTION
// ============================================================================

describe('Location Reference Resolution', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    transformer = new Veo3ContinuousTransformer();
  });

  it('should resolve location reference and include full location data in output', async () => {
    // INTERMEDIATE_DIALOGUE_1 has location reference to warehouse
    const result = await transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Should contain resolved location details
    expect(result.toLowerCase()).toMatch(/warehouse|waterfront|industrial/);

    // Should call getObject for location
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('loc_warehouse_001', 'location');
  });

  it('should include location lighting and atmosphere details', async () => {
    const result = await transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // LOCATION_WAREHOUSE has "film-noir" lighting quality
    expect(result.toLowerCase()).toMatch(/noir|contrast|shadow/);
  });
});

// ============================================================================
// CAMERA REFERENCE RESOLUTION
// ============================================================================

describe('Camera Reference Resolution', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    transformer = new Veo3ContinuousTransformer();
  });

  it('should resolve camera reference and include full camera data in output', async () => {
    // INTERMEDIATE_DIALOGUE_1 has camera reference to handheld_001
    const result = await transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Should contain camera details: handheld, close-up, low-angle
    expect(result.toLowerCase()).toMatch(/handheld|close-up|close\s*up|low[\s-]*angle/);

    // Should call getObject for camera
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('cam_handheld_001', 'camera');
  });
});

// ============================================================================
// PROP REFERENCE RESOLUTION
// ============================================================================

describe('Prop Reference Resolution', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    transformer = new Veo3ContinuousTransformer();
  });

  it('should resolve prop reference and include full prop data in output', async () => {
    // INTERMEDIATE_CINEMATIC_1 has prop reference to vintage car
    const result = await transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);

    // Should contain prop details: 1967 Mustang GT
    expect(result.toLowerCase()).toMatch(/mustang|1967|muscle\s*car|dark\s*blue/);

    // Should call getObject for prop
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('prop_car_001', 'prop');
  });
});

// ============================================================================
// AUDIO REFERENCE RESOLUTION
// ============================================================================

describe('Audio Reference Resolution', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    transformer = new Veo3ContinuousTransformer();
  });

  it('should resolve audio reference and include full audio data in output', async () => {
    // INTERMEDIATE_CINEMATIC_1 has audio reference to noir_score
    const result = await transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);

    // Should contain audio details from AUDIO_NOIR_SCORE
    expect(result.toLowerCase()).toMatch(/jazz|trumpet|bass|melancholic/);
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

describe('Error Handling', () => {
  let transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    transformer = new Veo3ContinuousTransformer();
  });

  it('should throw clear error when referenced object is not found', async () => {
    // Create mock that returns null for all objects
    const emptyMock = createMockObjectLibrary({
      getObject: vi.fn().mockResolvedValue(null),
    });

    // Should throw an error with clear message
    await expect(
      transformer.transform(INTERMEDIATE_DIALOGUE_1, emptyMock)
    ).rejects.toThrow(/not found|missing|could not find/i);
  });

  it('should throw clear error when object type does not match', async () => {
    // Create mock that returns wrong type
    const wrongTypeMock = createMockObjectLibrary({
      getObject: vi.fn().mockImplementation((id: string, type: string) => {
        // Return a location when character is requested
        if (type === 'character') {
          return Promise.resolve(LOCATION_WAREHOUSE);
        }
        return Promise.resolve(null);
      }),
    });

    // This should throw or produce unexpected results
    // depending on implementation, either throw or validate type
    const result = transformer.transform(INTERMEDIATE_DIALOGUE_1, wrongTypeMock);

    // Either throws or produces invalid output
    // For TDD, we want it to throw
    await expect(result).rejects.toThrow();
  });
});

// ============================================================================
// OVERRIDE MERGING
// ============================================================================

describe('Object Override Merging', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    transformer = new Veo3ContinuousTransformer();
  });

  it('should merge override values with base object data', async () => {
    // INTERMEDIATE_CINEMATIC_1 has camera reference with overrides for movement
    // The override changes movement.direction to "following car from side"
    const result = await transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);

    // Should contain the OVERRIDE value, not base
    // Base CAMERA_STEADICAM_FOLLOW has direction: "following subject from behind"
    // Override specifies: "following car from side"
    expect(result.toLowerCase()).toMatch(/following\s*car|from\s*side|dolly/);
  });

  it('should preserve base values when override is partial', async () => {
    // The override only changes movement, not lens or other properties
    const result = await transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);

    // Should still contain base camera values like shot type
    // Base has shotType: "medium" and lens: "35mm"
    expect(result.toLowerCase()).toMatch(/medium|35mm/);
  });
});

// ============================================================================
// MULTIPLE AND NESTED REFERENCES
// ============================================================================

describe('Multiple Object References', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let transformer: Veo3ContinuousTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    transformer = new Veo3ContinuousTransformer();
  });

  it('should resolve all object refs in single transform', async () => {
    // INTERMEDIATE_EDGE_MAXIMAL has multiple characters, locations, cameras, props, audio
    const result = await transformer.transform(INTERMEDIATE_EDGE_MAXIMAL, mockObjectLibrary);

    // Should contain all three characters
    expect(result).toContain('Sarah Chen');
    expect(result).toContain('Marcus Wolfe');
    expect(result).toContain('Jamie Park');

    // Should call getObject for all referenced objects
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('char_hero_001', 'character');
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('char_villain_001', 'character');
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('char_side_001', 'character');
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('loc_warehouse_001', 'location');
    expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('cam_steadicam_001', 'camera');
  });

  it('should resolve nested object references (character equipment)', async () => {
    // Characters have equipment arrays that should be included
    const result = await transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // CHARACTER_HERO has equipment: ['Glock 19', 'Flashlight', 'Crime scene gloves']
    // Should include equipment in description
    expect(result.toLowerCase()).toMatch(/glock|flashlight|equipment|holster/);
  });
});

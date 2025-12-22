/**
 * Integration Tests: Transformer Output Quality
 *
 * These tests validate that transformer outputs meet the expected quality standards
 * for each target model (Veo 3.1, Sora 2, Generic).
 *
 * TDD approach: Tests define expected behavior from research. Many may fail initially
 * and will pass as transformers are improved to meet specifications.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Veo3ContinuousTransformer } from '../../../src/services/transformers/Veo3ContinuousTransformer';
import { Veo3AudioTransformer } from '../../../src/services/transformers/Veo3AudioTransformer';
import { Sora2NarrativeTransformer } from '../../../src/services/transformers/Sora2NarrativeTransformer';
import { GenericTransformer } from '../../../src/services/transformers/genericTransformer';
import type { ObjectLibraryService } from '../../../src/services/objectLibraryService';
import {
  INTERMEDIATE_DIALOGUE_1,
  INTERMEDIATE_DIALOGUE_2,
  INTERMEDIATE_CINEMATIC_1,
  INTERMEDIATE_CINEMATIC_2,
  INTERMEDIATE_ACTION_1,
  INTERMEDIATE_ACTION_2,
  INTERMEDIATE_PRODUCT_1,
  INTERMEDIATE_EDGE_MINIMAL,
  CHARACTER_HERO,
  CHARACTER_VILLAIN,
  CHARACTER_SIDEKICK,
  LOCATION_WAREHOUSE,
  LOCATION_ALLEY,
  CAMERA_HANDHELD_INTENSE,
  CAMERA_STEADICAM_FOLLOW,
  CAMERA_STATIC_WIDE,
  PROP_ENCRYPTED_DRIVE,
  PROP_VINTAGE_CAR,
  getAllObjects,
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

// Helper to count words in a string
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Helper to count paragraphs
function countParagraphs(text: string): number {
  return text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
}

// ============================================================================
// VEO 3.1 OUTPUT QUALITY TESTS
// ============================================================================

describe('Veo 3.1 Output Quality', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let veo3Transformer: Veo3ContinuousTransformer;
  let veo3AudioTransformer: Veo3AudioTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    veo3Transformer = new Veo3ContinuousTransformer();
    veo3AudioTransformer = new Veo3AudioTransformer();
  });

  describe('Word Count Targets by Scene Type', () => {
    it('should produce 200-300 words for dialogue scenes', async () => {
      // Dialogue scenes need detailed audio/dialogue with visual context
      // Target: 200-300 words for optimal Veo 3.1 processing
      const result = await veo3Transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);
      const wordCount = countWords(result);

      expect(wordCount).toBeGreaterThanOrEqual(200);
      expect(wordCount).toBeLessThanOrEqual(300);
    });

    it('should produce 125-275 words for cinematic scenes', async () => {
      // Cinematic scenes focus on visual composition and movement
      // Target: 125-275 words for optimal Veo 3.1 processing (with 10% tolerance)
      const result = await veo3Transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);
      const wordCount = countWords(result);

      expect(wordCount).toBeGreaterThanOrEqual(125);
      expect(wordCount).toBeLessThanOrEqual(275);
    });

    it('should produce 200-300 words for action scenes', async () => {
      // Action scenes need detailed temporal choreography
      // Target: 200-300 words for optimal Veo 3.1 processing
      const result = await veo3Transformer.transform(INTERMEDIATE_ACTION_1, mockObjectLibrary);
      const wordCount = countWords(result);

      expect(wordCount).toBeGreaterThanOrEqual(200);
      expect(wordCount).toBeLessThanOrEqual(300);
    });
  });

  describe('Audio Handling', () => {
    it('should expand audio descriptions to >= 45 words for audio section', async () => {
      // Veo 3.1 benefits from rich audio descriptions for V2A
      // Target: At least 45 words dedicated to audio content
      const result = await veo3AudioTransformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

      // Extract audio section (look for audio-related content)
      const audioSection = result.match(/(?:Music:|SFX:|Ambient|says|dialogue)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi);
      const audioText = audioSection ? audioSection.join(' ') : '';
      const audioWordCount = countWords(audioText);

      expect(audioWordCount).toBeGreaterThanOrEqual(45);
    });

    it('should use originalSyntax field for audio formatting', async () => {
      // Veo 3.1 requires specific audio syntax preserved from intermediate
      const result = await veo3Transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

      // Check that originalSyntax patterns are present in output
      expect(result).toContain('Sarah says');
      expect(result).toContain('Wolfe says');
      expect(result).toContain('SFX:');
    });
  });

  describe('Visual Structure', () => {
    it('should include depth layering terms (foreground/midground/background)', async () => {
      // Veo 3.1 performs better with explicit spatial layering
      const result = await veo3Transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);

      // Check for any depth layering terminology
      const hasDepthTerms =
        /foreground|midground|background|depth|layered|layers/i.test(result);

      expect(hasDepthTerms).toBe(true);
    });
  });
});

// ============================================================================
// SORA 2 OUTPUT QUALITY TESTS
// ============================================================================

describe('Sora 2 Output Quality', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let sora2Transformer: Sora2NarrativeTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    sora2Transformer = new Sora2NarrativeTransformer();
  });

  describe('Character Count Limits', () => {
    it('should produce output <= 2000 characters', async () => {
      // Sora 2 has strict 2000 character limit for prompts
      const result = await sora2Transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

      expect(result.length).toBeLessThanOrEqual(2000);
    });

    it('should produce 500-1200 characters for simple shots', async () => {
      // Simple shots don't need maximum length
      // Product shots with resolved object references may be slightly longer
      const result = await sora2Transformer.transform(INTERMEDIATE_PRODUCT_1, mockObjectLibrary);

      expect(result.length).toBeGreaterThanOrEqual(500);
      expect(result.length).toBeLessThanOrEqual(1200);
    });
  });

  describe('Timecode Format', () => {
    it('should use [0:00-0:03] format, not [00:00]', async () => {
      // Sora 2 requires single-digit minute format for timecodes
      const result = await sora2Transformer.transform(INTERMEDIATE_ACTION_1, mockObjectLibrary);

      // Should have timecodes in correct format
      const correctFormat = /\[0:\d{2}-0:\d{2}\]/g;
      const incorrectFormat = /\[\d{2}:\d{2}\]/g;

      const hasCorrectFormat = correctFormat.test(result);
      const hasIncorrectFormat = incorrectFormat.test(result);

      expect(hasCorrectFormat).toBe(true);
      expect(hasIncorrectFormat).toBe(false);
    });
  });

  describe('Structure Requirements', () => {
    it('should produce three-paragraph structure', async () => {
      // Sora 2 prefers three distinct paragraphs: setup, action, resolution
      const result = await sora2Transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);
      const paragraphCount = countParagraphs(result);

      expect(paragraphCount).toBe(3);
    });

    it('should include imperial measurements (ft and ft/s)', async () => {
      // Sora 2 prefers imperial measurements for camera movement
      const result = await sora2Transformer.transform(INTERMEDIATE_CINEMATIC_1, mockObjectLibrary);

      // Check for imperial measurement patterns
      const hasImperial = /\d+\s*ft|\d+\s*ft\/s/i.test(result);

      expect(hasImperial).toBe(true);
    });
  });

  describe('Lighting and Focus', () => {
    it('should include motivated lighting with Kelvin temperature', async () => {
      // Sora 2 benefits from specific lighting descriptions
      // INTERMEDIATE_DIALOGUE_1 has object_reference location (loc_warehouse_001) with lighting data
      const result = await sora2Transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

      // Check for Kelvin temperature pattern (e.g., "5600K" or "3200K")
      const hasKelvin = /\d{4}K/i.test(result);

      expect(hasKelvin).toBe(true);
    });

    it('should include focus strategy with timing (rack focus at)', async () => {
      // Sora 2 performs better with explicit focus timing
      // Using INTERMEDIATE_DIALOGUE_1 which has camera with cinematicTechniques
      const result = await sora2Transformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

      // Check for focus strategy pattern - matches "Focus:" section in output
      // Can be: "rack focus at X", "shallow focus...at X", or "deep focus"
      const hasFocusStrategy = /Focus:\s*(rack|shallow|deep)\s*focus/i.test(result);

      expect(hasFocusStrategy).toBe(true);
    });
  });
});

// ============================================================================
// GENERIC TRANSFORMER OUTPUT QUALITY TESTS
// ============================================================================

describe('Generic Transformer Output Quality', () => {
  let mockObjectLibrary: ObjectLibraryService;
  let genericTransformer: GenericTransformer;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
    genericTransformer = new GenericTransformer();
  });

  it('should produce non-empty, usable output', async () => {
    const result = await genericTransformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(50);
  });

  it('should include subject description in output', async () => {
    const result = await genericTransformer.transform(INTERMEDIATE_DIALOGUE_1, mockObjectLibrary);

    // Should contain character name or description
    expect(result.toLowerCase()).toMatch(/detective|sarah|chen|hero|character/);
  });
});

// ============================================================================
// SCENE TYPE DETECTION TESTS
// ============================================================================

describe('Scene Type Detection', () => {
  let mockObjectLibrary: ObjectLibraryService;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
  });

  it('should achieve >= 90% accuracy on scene type detection for test fixtures', async () => {
    // Use TransformerUtils.detectSceneType for consistency with production code
    const testCases = [
      { intermediate: INTERMEDIATE_DIALOGUE_1, expected: 'dialogue' },
      { intermediate: INTERMEDIATE_DIALOGUE_2, expected: 'dialogue' },
      { intermediate: INTERMEDIATE_CINEMATIC_1, expected: 'cinematic' },
      { intermediate: INTERMEDIATE_CINEMATIC_2, expected: 'cinematic' },
      { intermediate: INTERMEDIATE_ACTION_1, expected: 'action' },
      { intermediate: INTERMEDIATE_ACTION_2, expected: 'action' },
      { intermediate: INTERMEDIATE_PRODUCT_1, expected: 'product' },
      // Note: minimal/unknown can return 'unknown', which is acceptable
    ];

    // Import the real detectSceneType from TransformerUtils
    const { TransformerUtils } = await import('../../../src/services/transformers/TransformerUtils');

    let correctCount = 0;
    for (const testCase of testCases) {
      const detected = TransformerUtils.detectSceneType(testCase.intermediate);
      if (detected === testCase.expected) {
        correctCount++;
      }
    }

    const accuracy = correctCount / testCases.length;
    // Target 90% accuracy - 7 out of 7 correct
    expect(accuracy).toBeGreaterThanOrEqual(0.9);
  });
});

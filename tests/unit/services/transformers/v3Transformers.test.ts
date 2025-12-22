import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Veo3ContinuousTransformer } from '../../../../src/services/transformers/Veo3ContinuousTransformer';
import { Veo3AttributeValueTransformer } from '../../../../src/services/transformers/Veo3AttributeValueTransformer';
import { Veo3AudioTransformer } from '../../../../src/services/transformers/Veo3AudioTransformer';
import { Sora2NarrativeTransformer } from '../../../../src/services/transformers/Sora2NarrativeTransformer';
import { GenericTransformer } from '../../../../src/services/transformers/genericTransformer';
import { TransformerUtils } from '../../../../src/services/transformers/TransformerUtils';
import type { IntermediateV3 } from '../../../../types/intermediate';
import type { ObjectLibraryService } from '../../../../src/services/objectLibraryService';

// Mock ObjectLibraryService
const createMockObjectLibrary = (): ObjectLibraryService => ({
  getObject: vi.fn().mockResolvedValue(null),
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
} as unknown as ObjectLibraryService);

// Create minimal IntermediateV3 with proper component types
const createTextIntermediate = (overrides: Partial<IntermediateV3> = {}): IntermediateV3 => ({
  id: 'test-intermediate-1',
  promptId: 'prompt-1',
  version: 3,
  components: {
    cinematography: {
      type: 'text',
      text: 'Wide establishing shot, slowly dollying forward',
    },
    subject: {
      type: 'text',
      text: 'A weathered detective in a trench coat',
    },
    action: {
      type: 'action',
      verb: 'walks',
      target: 'through the streets',
      manner: 'cautiously',
    },
    context: {
      type: 'context',
      location: {
        type: 'text',
        text: 'noir-style 1940s city',
      },
      timeOfDay: 'midnight',
      era: '1940s',
    },
    style: {
      type: 'style',
      visualStyle: ['Film noir aesthetic', 'high contrast'],
      mood: ['mysterious', 'dramatic'],
      colorPalette: ['black', 'white', 'shadows'],
    },
  },
  ...overrides,
} as IntermediateV3);

// Create IntermediateV3 with audio (matches AudioSegment interface)
const createIntermediateWithAudio = (): IntermediateV3 => ({
  ...createTextIntermediate(),
  audio: [
    {
      type: 'ambient',
      content: 'Heavy rain falling on pavement',
      originalSyntax: 'Ambient noise: Heavy rain falling on pavement',
    },
    {
      type: 'music',
      content: 'Melancholic jazz saxophone',
      originalSyntax: 'Music: Melancholic jazz saxophone playing softly',
    },
  ],
});

describe('V3 Transformers', () => {
  let mockObjectLibrary: ObjectLibraryService;

  beforeEach(() => {
    mockObjectLibrary = createMockObjectLibrary();
  });

  // ============================================================================
  // TRANSFORMER UTILS
  // ============================================================================

  describe('TransformerUtils', () => {
    describe('formatCharacter', () => {
      it('should format character with name and appearance', () => {
        const character = {
          name: 'John Smith',
          appearance: {
            head: { age: '40s', features: 'rugged', hair: 'grey' },
            body: { build: 'muscular', height: 'tall' },
          },
        };

        const result = TransformerUtils.formatCharacter(character);

        expect(result).toContain('John Smith');
        expect(result).toContain('40s');
        expect(result).toContain('rugged');
      });

      it('should handle minimal character data', () => {
        const character = { name: 'Jane' };

        const result = TransformerUtils.formatCharacter(character);

        expect(result).toContain('Jane');
      });
    });

    describe('formatCamera', () => {
      it('should format camera settings', () => {
        const camera = {
          shotType: 'close-up',
          movement: { type: 'dolly', speed: 'slow', direction: 'forward' },
          angle: 'low',
        };

        const result = TransformerUtils.formatCamera(camera);

        expect(result).toContain('close-up shot');
        expect(result).toContain('dolly');
        expect(result).toContain('slow');
      });

      it('should handle empty camera data', () => {
        const result = TransformerUtils.formatCamera({});

        expect(typeof result).toBe('string');
      });
    });

    describe('formatAction', () => {
      it('should format action with verb, target, and manner', () => {
        const action = {
          type: 'action' as const,
          verb: 'runs',
          target: 'through the forest',
          manner: 'quickly',
        };

        const result = TransformerUtils.formatAction(action);

        expect(result).toContain('runs');
        expect(result).toContain('through the forest');
        expect(result).toContain('quickly');
      });
    });

    describe('formatStyle', () => {
      it('should format style with visual style and mood', () => {
        const style = {
          type: 'style' as const,
          visualStyle: ['cinematic', 'dramatic'],
          mood: ['tense', 'mysterious'],
        };

        const result = TransformerUtils.formatStyle(style);

        expect(result).toContain('cinematic');
        expect(result).toContain('dramatic');
      });
    });

    describe('formatAudio', () => {
      it('should format audio segments using originalSyntax', () => {
        const audio = [
          { type: 'ambient' as const, content: 'wind howling', originalSyntax: 'Ambient noise: wind howling' },
          { type: 'music' as const, content: 'orchestral swell', originalSyntax: 'Music: orchestral swell' },
        ];

        const result = TransformerUtils.formatAudio(audio);

        expect(result).toContain('Ambient noise: wind howling');
        expect(result).toContain('Music: orchestral swell');
      });

      it('should handle empty audio array', () => {
        const result = TransformerUtils.formatAudio([]);

        expect(result).toBe('');
      });
    });

    describe('deepMerge', () => {
      it('should merge nested objects', () => {
        const target = { a: 1, b: { c: 2, d: 3 } };
        const override = { b: { c: 10 } };

        const result = TransformerUtils.deepMerge(target, override);

        expect(result.a).toBe(1);
        expect(result.b.c).toBe(10);
        expect(result.b.d).toBe(3);
      });

      it('should handle array overrides', () => {
        const target = { items: [1, 2, 3] };
        const override = { items: [4, 5] };

        const result = TransformerUtils.deepMerge(target, override);

        expect(result.items).toEqual([4, 5]);
      });
    });
  });

  // ============================================================================
  // VEO 3 CONTINUOUS TRANSFORMER
  // ============================================================================

  describe('Veo3ContinuousTransformer', () => {
    const transformer = new Veo3ContinuousTransformer();

    it('should transform text components into continuous narrative', async () => {
      const intermediate = createTextIntermediate();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      expect(result).toContain('weathered detective');
      expect(result).toContain('1940s city'); // from context
      expect(result).toContain('establishing shot'); // from cinematography
    });

    it('should include audio when present', async () => {
      const intermediate = createIntermediateWithAudio();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      expect(result).toContain('Ambient noise');
      expect(result).toContain('saxophone');
    });

    it('should handle intermediate without audio', async () => {
      const intermediate = createTextIntermediate();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      expect(result).not.toContain('Audio:');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should resolve object references from library', async () => {
      const intermediate: IntermediateV3 = {
        ...createTextIntermediate(),
        components: {
          ...createTextIntermediate().components,
          subject: {
            type: 'object_reference',
            objectId: 'char-123',
            objectType: 'character',
          },
        },
      };

      // Mock the object library to return a character
      (mockObjectLibrary.getObject as any).mockResolvedValue({
        id: 'char-123',
        type: 'character',
        data: {
          name: 'Detective Noir',
          appearance: { head: { age: '50s', features: 'weathered' } },
        },
      });

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      expect(result).toContain('Detective Noir');
      expect(mockObjectLibrary.getObject).toHaveBeenCalledWith('char-123', 'character');
    });
  });

  // ============================================================================
  // VEO 3 ATTRIBUTE VALUE TRANSFORMER
  // ============================================================================

  describe('Veo3AttributeValueTransformer', () => {
    const transformer = new Veo3AttributeValueTransformer();

    it('should transform to attribute:value format', async () => {
      const intermediate = createTextIntermediate();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      // Should contain attribute labels
      expect(result).toMatch(/subject:|camera:|action:|context:|style:/i);
    });

    it('should include audio when present', async () => {
      const intermediate = createIntermediateWithAudio();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      // Audio is appended directly with originalSyntax
      expect(result).toContain('Ambient noise');
      expect(result).toContain('saxophone');
    });
  });

  // ============================================================================
  // VEO 3 AUDIO TRANSFORMER
  // ============================================================================

  describe('Veo3AudioTransformer', () => {
    const transformer = new Veo3AudioTransformer();

    it('should prioritize audio in output', async () => {
      const intermediate = createIntermediateWithAudio();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      // Audio should appear prominently
      expect(result).toContain('Ambient noise');
      expect(result).toContain('saxophone');
    });

    it('should handle intermediate without audio gracefully', async () => {
      const intermediate = createTextIntermediate();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // SORA 2 NARRATIVE TRANSFORMER
  // ============================================================================

  describe('Sora2NarrativeTransformer', () => {
    const transformer = new Sora2NarrativeTransformer();

    it('should transform to flowing narrative format', async () => {
      const intermediate = createTextIntermediate();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      expect(result).toContain('detective');
      expect(result).toContain('1940s'); // from context
      expect(typeof result).toBe('string');
    });

    it('should stay within Sora 2 character limits', async () => {
      const intermediate = createTextIntermediate();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      // Sora 2 has 2500 character limit
      expect(result.length).toBeLessThanOrEqual(2500);
    });
  });

  // ============================================================================
  // GENERIC TRANSFORMER
  // ============================================================================

  describe('GenericTransformer', () => {
    const transformer = new GenericTransformer();

    it('should transform to model-agnostic format', async () => {
      const intermediate = createTextIntermediate();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      expect(result).toContain('detective');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50);
    });

    it('should include subject and cinematography components', async () => {
      const intermediate = createTextIntermediate();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      // Should reference subject and cinematography
      expect(result).toContain('detective'); // subject
      expect(result).toContain('establishing shot'); // cinematography
    });

    it('should include audio when present', async () => {
      const intermediate = createIntermediateWithAudio();

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      // Audio should be appended (originalSyntax is used)
      expect(result).toContain('Ambient noise');
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle missing style component gracefully', async () => {
      const transformer = new Veo3ContinuousTransformer();
      const intermediate = createTextIntermediate({
        components: {
          ...createTextIntermediate().components,
          style: { type: 'text', text: '' },
        },
      });

      const result = await transformer.transform(intermediate, mockObjectLibrary);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw error when referenced object not found', async () => {
      const transformer = new Veo3ContinuousTransformer();
      const intermediate: IntermediateV3 = {
        ...createTextIntermediate(),
        components: {
          ...createTextIntermediate().components,
          subject: {
            type: 'object_reference',
            objectId: 'nonexistent',
            objectType: 'character',
          },
        },
      };

      // Mock returns null (object not found)
      (mockObjectLibrary.getObject as any).mockResolvedValue(null);

      await expect(
        transformer.transform(intermediate, mockObjectLibrary)
      ).rejects.toThrow();
    });
  });
});

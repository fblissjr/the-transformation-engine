import { describe, it, expect, beforeEach } from 'vitest';
import { transformToModel } from './index';
import type { IntermediatePrompt } from '../../types/intermediate';

describe('transformToModel', () => {
  let mockIntermediate: IntermediatePrompt;

  beforeEach(() => {
    mockIntermediate = {
      id: 'test-123',
      title: 'Test Prompt',
      created: new Date(),
      modified: new Date(),
      structure: {
        visual: {
          subjects: 'A red car',
          setting: 'Desert highway',
          lighting: 'Golden hour',
          style: 'Cinematic',
        },
        temporal: {
          duration: '5s',
          pacing: 'Steady',
        },
        audio: {
          music: 'Epic orchestral',
          soundEffects: ['Engine roar'],
        },
        camera: {
          movement: 'Dolly forward',
          angles: ['Wide shot'],
        },
      },
    };
  });

  it('should transform to generic format', () => {
    const result = transformToModel(mockIntermediate, 'generic');

    expect(result).toBeTruthy();
    expect(result).toContain('A red car');
    expect(result).toContain('Desert highway');
  });

  it('should transform to sora2 format', () => {
    const result = transformToModel(mockIntermediate, 'sora2');

    expect(result).toBeTruthy();
    expect(result.length).toBeLessThanOrEqual(2500);
  });

  it('should transform to veo3 format', () => {
    const result = transformToModel(mockIntermediate, 'veo3');

    expect(result).toBeTruthy();
    expect(result.length).toBeLessThanOrEqual(3000);
  });

  it('should handle unknown model by falling back to generic', () => {
    const result = transformToModel(mockIntermediate, 'unknown-model');

    expect(result).toBeTruthy();
  });

  it('should handle minimal structure', () => {
    const minimal: IntermediatePrompt = {
      id: 'min-1',
      title: 'Minimal',
      created: new Date(),
      modified: new Date(),
      structure: {
        visual: { subjects: 'Test subject' },
      },
    };

    const result = transformToModel(minimal, 'generic');
    expect(result).toContain('Test subject');
  });

  it('should handle empty structure gracefully', () => {
    const empty: IntermediatePrompt = {
      id: 'empty-1',
      title: 'Empty',
      created: new Date(),
      modified: new Date(),
      structure: {
        visual: {},
      },
    };

    const result = transformToModel(empty, 'generic');
    expect(typeof result).toBe('string'); // Should return empty string without crashing
  });
});

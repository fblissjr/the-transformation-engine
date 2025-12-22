import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeDeriveSchemaTask,
  type DeriveSchemaInput,
  type DeriveSchemaOutput,
} from '../../../../src/services/llm/deriveSchemaTask';
import {
  executeExtractObjectTask,
  type ExtractObjectInput,
  type ExtractObjectOutput,
} from '../../../../src/services/llm/extractObjectTask';
import {
  executeEditObjectTask,
  type EditObjectInput,
  type EditObjectOutput,
} from '../../../../src/services/llm/editObjectTask';
import type { TaskRouter } from '../../../../src/taskRouter';

// ============================================================================
// MOCK TASK ROUTER
// ============================================================================

function createMockTaskRouter(mockResponse: string): TaskRouter {
  return {
    executeTask: vi.fn().mockResolvedValue({
      response: mockResponse,
    }),
  } as unknown as TaskRouter;
}

// ============================================================================
// DERIVE SCHEMA TASK TESTS
// ============================================================================

describe('LLM Tasks', () => {
  describe('executeDeriveSchemaTask', () => {
    it('should parse valid JSON response', async () => {
      const mockResponse = JSON.stringify({
        objectType: 'character',
        schema: { name: 'string', age: 'number' },
        confidence: 0.95,
        reasoning: 'Clear character description provided',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: 'A tall warrior with silver hair',
      };

      const result = await executeDeriveSchemaTask(input, taskRouter);

      expect(result.objectType).toBe('character');
      expect(result.schema).toEqual({ name: 'string', age: 'number' });
      expect(result.confidence).toBe(0.95);
      expect(result.reasoning).toBe('Clear character description provided');
    });

    it('should extract JSON from markdown code blocks', async () => {
      const mockResponse = `Here's the analysis:
\`\`\`json
{
  "objectType": "location",
  "schema": { "name": "string", "type": "string" },
  "confidence": 0.85,
  "reasoning": "Location identified"
}
\`\`\``;

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: 'A dark cave in the mountains',
      };

      const result = await executeDeriveSchemaTask(input, taskRouter);

      expect(result.objectType).toBe('location');
      expect(result.confidence).toBe(0.85);
    });

    it('should extract JSON from generic code blocks', async () => {
      const mockResponse = `\`\`\`
{
  "objectType": "prop",
  "schema": { "name": "string" },
  "confidence": 0.9,
  "reasoning": "Prop identified"
}
\`\`\``;

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: 'A glowing sword',
      };

      const result = await executeDeriveSchemaTask(input, taskRouter);

      expect(result.objectType).toBe('prop');
    });

    it('should handle source object with text type', async () => {
      const mockResponse = JSON.stringify({
        objectType: 'character',
        schema: { name: 'string' },
        confidence: 0.9,
        reasoning: 'Text analysis',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: { type: 'text', content: 'A brave knight' },
      };

      const result = await executeDeriveSchemaTask(input, taskRouter);

      expect(result.objectType).toBe('character');
      expect(taskRouter.executeTask).toHaveBeenCalled();
      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('A brave knight');
    });

    it('should handle source object with image type', async () => {
      const mockResponse = JSON.stringify({
        objectType: 'character',
        schema: { name: 'string' },
        confidence: 0.8,
        reasoning: 'Image analysis',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: { type: 'image', content: 'base64imagedata' },
      };

      const result = await executeDeriveSchemaTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('[Image provided');
    });

    it('should handle source object with video type', async () => {
      const mockResponse = JSON.stringify({
        objectType: 'camera',
        schema: { shotType: 'string' },
        confidence: 0.7,
        reasoning: 'Video analysis',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: { type: 'video', content: 'videodata' },
      };

      const result = await executeDeriveSchemaTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('[Video provided');
    });

    it('should include context hint in prompt when provided', async () => {
      const mockResponse = JSON.stringify({
        objectType: 'character',
        schema: {},
        confidence: 0.9,
        reasoning: 'Context helped',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: 'Some description',
        context: 'character',
      };

      await executeDeriveSchemaTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('Context hint: This is likely a character object');
    });

    it('should include output format in prompt when provided', async () => {
      const mockResponse = JSON.stringify({
        objectType: 'character',
        schema: {},
        confidence: 0.9,
        reasoning: 'Format noted',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: 'Some description',
        outputFormat: 'video_generation',
      };

      await executeDeriveSchemaTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('Output format: video_generation');
    });

    it('should throw error for missing objectType', async () => {
      const mockResponse = JSON.stringify({
        schema: {},
        confidence: 0.9,
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: 'Test',
      };

      await expect(executeDeriveSchemaTask(input, taskRouter)).rejects.toThrow(
        'Invalid response structure from LLM'
      );
    });

    it('should throw error for missing confidence', async () => {
      const mockResponse = JSON.stringify({
        objectType: 'character',
        schema: {},
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: 'Test',
      };

      await expect(executeDeriveSchemaTask(input, taskRouter)).rejects.toThrow(
        'Invalid response structure from LLM'
      );
    });

    it('should use default reasoning when not provided', async () => {
      const mockResponse = JSON.stringify({
        objectType: 'character',
        schema: {},
        confidence: 0.9,
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: DeriveSchemaInput = {
        source: 'Test',
      };

      const result = await executeDeriveSchemaTask(input, taskRouter);

      expect(result.reasoning).toBe('No reasoning provided');
    });

    it('should throw error for invalid JSON', async () => {
      const taskRouter = createMockTaskRouter('not valid json');
      const input: DeriveSchemaInput = {
        source: 'Test',
      };

      await expect(executeDeriveSchemaTask(input, taskRouter)).rejects.toThrow(
        'Failed to derive schema'
      );
    });
  });

  // ============================================================================
  // EXTRACT OBJECT TASK TESTS
  // ============================================================================

  describe('executeExtractObjectTask', () => {
    it('should parse valid JSON response', async () => {
      const mockResponse = JSON.stringify({
        data: { name: 'John', age: 30 },
        confidence: 0.9,
        ambiguities: ['occupation'],
        reasoning: 'Extracted from text',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: 'John is a 30-year-old man',
        objectType: 'character',
        schema: { name: 'string', age: 'number', occupation: 'string' },
      };

      const result = await executeExtractObjectTask(input, taskRouter);

      expect(result.data).toEqual({ name: 'John', age: 30 });
      expect(result.confidence).toBe(0.9);
      expect(result.ambiguities).toEqual(['occupation']);
      expect(result.reasoning).toBe('Extracted from text');
    });

    it('should extract JSON from markdown code blocks', async () => {
      const mockResponse = `\`\`\`json
{
  "data": { "name": "Jane" },
  "confidence": 0.85,
  "reasoning": "Extracted"
}
\`\`\``;

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: 'Jane is here',
        objectType: 'character',
        schema: { name: 'string' },
      };

      const result = await executeExtractObjectTask(input, taskRouter);

      expect(result.data.name).toBe('Jane');
    });

    it('should include schema in prompt', async () => {
      const mockResponse = JSON.stringify({
        data: {},
        confidence: 0.9,
        reasoning: 'Test',
      });

      const schema = { name: 'string', traits: 'string[]' };
      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: 'Test character',
        objectType: 'character',
        schema,
      };

      await executeExtractObjectTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('"name": "string"');
      expect(callArgs[1]).toContain('"traits": "string[]"');
    });

    it('should include context when provided', async () => {
      const mockResponse = JSON.stringify({
        data: {},
        confidence: 0.9,
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: 'Test',
        objectType: 'character',
        schema: {},
        context: 'This is for a fantasy game',
      };

      await executeExtractObjectTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('CONTEXT:');
      expect(callArgs[1]).toContain('This is for a fantasy game');
    });

    it('should handle source object with text type', async () => {
      const mockResponse = JSON.stringify({
        data: {},
        confidence: 0.9,
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: { type: 'text', content: 'Text content here' },
        objectType: 'character',
        schema: {},
      };

      await executeExtractObjectTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('SOURCE (text):');
      expect(callArgs[1]).toContain('Text content here');
    });

    it('should handle source object with image type', async () => {
      const mockResponse = JSON.stringify({
        data: {},
        confidence: 0.9,
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: { type: 'image', content: 'imagedata' },
        objectType: 'character',
        schema: {},
      };

      await executeExtractObjectTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('SOURCE (image):');
    });

    it('should default to empty ambiguities array', async () => {
      const mockResponse = JSON.stringify({
        data: {},
        confidence: 0.9,
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: 'Test',
        objectType: 'character',
        schema: {},
      };

      const result = await executeExtractObjectTask(input, taskRouter);

      expect(result.ambiguities).toEqual([]);
    });

    it('should throw error for missing data field', async () => {
      const mockResponse = JSON.stringify({
        confidence: 0.9,
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: 'Test',
        objectType: 'character',
        schema: {},
      };

      await expect(executeExtractObjectTask(input, taskRouter)).rejects.toThrow(
        'Invalid response structure from LLM'
      );
    });

    it('should throw error for missing confidence', async () => {
      const mockResponse = JSON.stringify({
        data: {},
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: ExtractObjectInput = {
        source: 'Test',
        objectType: 'character',
        schema: {},
      };

      await expect(executeExtractObjectTask(input, taskRouter)).rejects.toThrow(
        'Invalid response structure from LLM'
      );
    });

    it('should throw error for invalid JSON', async () => {
      const taskRouter = createMockTaskRouter('not valid json');
      const input: ExtractObjectInput = {
        source: 'Test',
        objectType: 'character',
        schema: {},
      };

      await expect(executeExtractObjectTask(input, taskRouter)).rejects.toThrow(
        'Failed to extract object'
      );
    });
  });

  // ============================================================================
  // EDIT OBJECT TASK TESTS
  // ============================================================================

  describe('executeEditObjectTask', () => {
    it('should parse valid JSON response', async () => {
      const mockResponse = JSON.stringify({
        editedData: { name: 'John', age: 25 },
        changelog: [
          { field: 'age', oldValue: 30, newValue: 25, reason: 'Made younger' },
        ],
        preserved: ['name'],
        reasoning: 'Changed age per instruction',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: { name: 'John', age: 30 },
        editInstructions: 'Make him younger',
        preserveFields: ['name'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      expect(result.editedData).toEqual({ name: 'John', age: 25 });
      expect(result.changelog).toHaveLength(1);
      expect(result.changelog[0].field).toBe('age');
      expect(result.preserved).toEqual(['name']);
      expect(result.reasoning).toBe('Changed age per instruction');
    });

    it('should extract JSON from markdown code blocks', async () => {
      const mockResponse = `\`\`\`json
{
  "editedData": { "name": "Jane" },
  "changelog": [],
  "preserved": [],
  "reasoning": "No changes needed"
}
\`\`\``;

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: { name: 'Jane' },
        editInstructions: 'Keep as is',
      };

      const result = await executeEditObjectTask(input, taskRouter);

      expect(result.editedData.name).toBe('Jane');
    });

    it('should include preserve fields in prompt', async () => {
      const mockResponse = JSON.stringify({
        editedData: {},
        changelog: [],
        preserved: ['name'],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: { name: 'John' },
        editInstructions: 'Change something',
        preserveFields: ['name', 'id'],
      };

      await executeEditObjectTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('PRESERVATION RULES');
      expect(callArgs[1]).toContain('- name');
      expect(callArgs[1]).toContain('- id');
    });

    it('should include context when provided', async () => {
      const mockResponse = JSON.stringify({
        editedData: {},
        changelog: [],
        preserved: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {},
        editInstructions: 'Test',
        context: 'This is a medieval setting',
      };

      await executeEditObjectTask(input, taskRouter);

      const callArgs = (taskRouter.executeTask as any).mock.calls[0];
      expect(callArgs[1]).toContain('CONTEXT:');
      expect(callArgs[1]).toContain('This is a medieval setting');
    });

    it('should enforce preservation rules by reverting LLM changes', async () => {
      // LLM ignores preservation rules and changes the name
      const mockResponse = JSON.stringify({
        editedData: { name: 'Changed Name', age: 25 },
        changelog: [
          { field: 'name', oldValue: 'John', newValue: 'Changed Name', reason: 'Oops' },
          { field: 'age', oldValue: 30, newValue: 25, reason: 'Made younger' },
        ],
        preserved: [],
        reasoning: 'Changed everything',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: { name: 'John', age: 30 },
        editInstructions: 'Make him younger',
        preserveFields: ['name'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      // Name should be reverted to original
      expect(result.editedData.name).toBe('John');
      expect(result.editedData.age).toBe(25);
    });

    it('should enforce nested field preservation', async () => {
      // LLM tries to change a nested preserved field
      const mockResponse = JSON.stringify({
        editedData: {
          name: 'John',
          appearance: {
            head: { hair: 'blonde' }, // Should be 'brown'
            body: { build: 'athletic' },
          },
        },
        changelog: [],
        preserved: [],
        reasoning: 'Changed hair',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {
          name: 'John',
          appearance: {
            head: { hair: 'brown' },
            body: { build: 'slim' },
          },
        },
        editInstructions: 'Make him more athletic',
        preserveFields: ['appearance.head.hair'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      // Nested preserved field should be reverted
      expect(result.editedData.appearance.head.hair).toBe('brown');
      // Non-preserved field should be changed
      expect(result.editedData.appearance.body.build).toBe('athletic');
    });

    it('should default preserved array from preserveFields', async () => {
      const mockResponse = JSON.stringify({
        editedData: {},
        changelog: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {},
        editInstructions: 'Test',
        preserveFields: ['name', 'id'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      expect(result.preserved).toEqual(['name', 'id']);
    });

    it('should default to empty preserved array when no preserveFields', async () => {
      const mockResponse = JSON.stringify({
        editedData: {},
        changelog: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {},
        editInstructions: 'Test',
      };

      const result = await executeEditObjectTask(input, taskRouter);

      expect(result.preserved).toEqual([]);
    });

    it('should throw error for missing editedData', async () => {
      const mockResponse = JSON.stringify({
        changelog: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {},
        editInstructions: 'Test',
      };

      await expect(executeEditObjectTask(input, taskRouter)).rejects.toThrow(
        'Invalid response structure from LLM'
      );
    });

    it('should throw error for non-array changelog', async () => {
      const mockResponse = JSON.stringify({
        editedData: {},
        changelog: 'not an array',
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {},
        editInstructions: 'Test',
      };

      await expect(executeEditObjectTask(input, taskRouter)).rejects.toThrow(
        'Invalid response structure from LLM'
      );
    });

    it('should throw error for invalid JSON', async () => {
      const taskRouter = createMockTaskRouter('not valid json');
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {},
        editInstructions: 'Test',
      };

      await expect(executeEditObjectTask(input, taskRouter)).rejects.toThrow(
        'Failed to edit object'
      );
    });
  });

  // ============================================================================
  // HELPER FUNCTION TESTS (via edit object behavior)
  // ============================================================================

  describe('Helper Functions (getNestedValue / setNestedValue)', () => {
    it('should handle deeply nested preservation', async () => {
      const mockResponse = JSON.stringify({
        editedData: {
          a: { b: { c: { d: 'changed' } } },
        },
        changelog: [],
        preserved: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'custom',
        currentData: {
          a: { b: { c: { d: 'original' } } },
        },
        editInstructions: 'Change d',
        preserveFields: ['a.b.c.d'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      // Deeply nested field should be reverted
      expect(result.editedData.a.b.c.d).toBe('original');
    });

    it('should handle preservation when nested path does not exist in edited data', async () => {
      const mockResponse = JSON.stringify({
        editedData: {
          a: { x: 'something' }, // Missing b.c.d path
        },
        changelog: [],
        preserved: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'custom',
        currentData: {
          a: { b: { c: { d: 'original' } } },
        },
        editInstructions: 'Some edit',
        preserveFields: ['a.b.c.d'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      // Should create the missing path and set the preserved value
      expect(result.editedData.a.b.c.d).toBe('original');
    });

    it('should handle top-level field preservation', async () => {
      const mockResponse = JSON.stringify({
        editedData: {
          id: 'new-id',
          name: 'New Name',
        },
        changelog: [],
        preserved: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {
          id: 'original-id',
          name: 'Original Name',
        },
        editInstructions: 'Change name',
        preserveFields: ['id'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      expect(result.editedData.id).toBe('original-id');
      expect(result.editedData.name).toBe('New Name');
    });

    it('should handle array field preservation', async () => {
      const mockResponse = JSON.stringify({
        editedData: {
          tags: ['different', 'tags'],
          name: 'Test',
        },
        changelog: [],
        preserved: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'character',
        currentData: {
          tags: ['original', 'tags', 'here'],
          name: 'Original',
        },
        editInstructions: 'Change name',
        preserveFields: ['tags'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      expect(result.editedData.tags).toEqual(['original', 'tags', 'here']);
    });

    it('should handle object field preservation', async () => {
      const mockResponse = JSON.stringify({
        editedData: {
          metadata: { author: 'different', version: 2 },
          name: 'New Name',
        },
        changelog: [],
        preserved: [],
        reasoning: 'Test',
      });

      const taskRouter = createMockTaskRouter(mockResponse);
      const input: EditObjectInput = {
        objectType: 'custom',
        currentData: {
          metadata: { author: 'original', version: 1 },
          name: 'Original',
        },
        editInstructions: 'Change name',
        preserveFields: ['metadata'],
      };

      const result = await executeEditObjectTask(input, taskRouter);

      expect(result.editedData.metadata).toEqual({ author: 'original', version: 1 });
    });
  });
});

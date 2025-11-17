/**
 * LLM_OBJECT_EDIT Task
 * Edits structured object data with LLM assistance and preservation rules
 *
 * Use cases:
 * - User asks to modify character ("make him younger")
 * - Batch edits across multiple objects ("change all to nighttime")
 * - Style transformations ("make this more cyberpunk")
 */

import type { TaskRouter } from '../../../services/taskRouter';
import { TASK_IDS } from '../../../types/providers';

export interface EditObjectInput {
  objectType: string; // 'character', 'location', 'prop', etc.
  currentData: Record<string, any>; // Current object data
  editInstructions: string; // Natural language edit instructions
  preserveFields?: string[]; // Fields that must not change
  context?: string; // Additional context
}

export interface EditObjectOutput {
  editedData: Record<string, any>; // New object data
  changelog: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
  preserved: string[]; // Fields that were preserved
  reasoning: string; // LLM's explanation of changes
}

/**
 * System prompt for object editing
 */
const EDIT_OBJECT_SYSTEM_PROMPT = `You are an object editor for a structured video generation system.

Your task: Edit structured object data according to natural language instructions while respecting preservation rules.

Guidelines:
1. PRESERVATION RULES (CRITICAL):
   - Fields listed in "preserveFields" MUST NOT be changed
   - Return those fields EXACTLY as provided
   - Explain which fields were preserved in "preserved" array

2. Edit interpretation:
   - Understand user intent from natural language
   - Apply changes precisely and logically
   - Maintain consistency across related fields
   - Preserve data structure (types, nesting)

3. Change documentation:
   - Generate detailed changelog for EVERY changed field
   - Include the specific reason for each change
   - Use dot notation for nested fields (e.g., "appearance.head.hair")

4. Quality standards:
   - Be specific in changes (not "younger" but "early 20s instead of mid-40s")
   - Maintain professional descriptive language
   - Consider knock-on effects (changing age → change hair, clothing, etc.)
   - Ensure visual consistency

5. Edge cases:
   - If instruction is ambiguous, make reasonable choice and explain
   - If instruction conflicts with preservation, skip that change and explain
   - If instruction is unclear, edit minimally and note in reasoning

Examples:

INPUT:
{
  "editInstructions": "make him younger",
  "currentData": { "appearance": { "head": { "age": "mid-40s" } } },
  "preserveFields": ["name"]
}

OUTPUT:
{
  "editedData": { "appearance": { "head": { "age": "early 20s" } } },
  "changelog": [
    {
      "field": "appearance.head.age",
      "oldValue": "mid-40s",
      "newValue": "early 20s",
      "reason": "User requested to make character younger"
    }
  ],
  "preserved": ["name"],
  "reasoning": "Changed age from mid-40s to early 20s per user instruction. Name preserved as requested."
}

OUTPUT JSON FORMAT:
{
  "editedData": { ...complete edited object data... },
  "changelog": [ { "field": "...", "oldValue": ..., "newValue": ..., "reason": "..." }, ... ],
  "preserved": ["field1", "field2"],
  "reasoning": "Detailed explanation of changes made and preservation applied."
}

IMPORTANT:
- Always output valid JSON only
- Include COMPLETE editedData (all fields, not just changed ones)
- Preserve structure exactly
- No markdown formatting`;

/**
 * Execute EDIT_OBJECT task
 */
export async function executeEditObjectTask(
  input: EditObjectInput,
  taskRouter: TaskRouter
): Promise<EditObjectOutput> {
  try {
    // Build user prompt
    let userPrompt = `Edit this ${input.objectType} object according to the instructions below.\n\n`;

    // Add current data
    userPrompt += `CURRENT DATA:\n`;
    userPrompt += JSON.stringify(input.currentData, null, 2);
    userPrompt += `\n\n`;

    // Add edit instructions
    userPrompt += `EDIT INSTRUCTIONS:\n`;
    userPrompt += input.editInstructions;
    userPrompt += `\n\n`;

    // Add preservation rules if provided
    if (input.preserveFields && input.preserveFields.length > 0) {
      userPrompt += `PRESERVATION RULES (CRITICAL - DO NOT CHANGE THESE FIELDS):\n`;
      userPrompt += input.preserveFields.map(f => `- ${f}`).join('\n');
      userPrompt += `\n\n`;
    }

    // Add context if provided
    if (input.context) {
      userPrompt += `CONTEXT:\n`;
      userPrompt += input.context;
      userPrompt += `\n\n`;
    }

    userPrompt += `Return the edited data with complete changelog as JSON.`;

    // Execute task via task router
    const turn = await taskRouter.executeTask(
      TASK_IDS.LLM_OBJECT_EDIT,
      userPrompt,
      EDIT_OBJECT_SYSTEM_PROMPT,
      { enableStreaming: false }
    );

    // Parse response
    const response = turn.response.trim();

    // Try to extract JSON if wrapped in markdown
    let jsonText = response;
    if (response.includes('```json')) {
      const match = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    } else if (response.includes('```')) {
      const match = response.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonText = match[1];
      }
    }

    const parsed = JSON.parse(jsonText);

    // Validate output structure
    if (!parsed.editedData || !Array.isArray(parsed.changelog)) {
      throw new Error('Invalid response structure from LLM');
    }

    // Verify preservation rules were followed
    if (input.preserveFields && input.preserveFields.length > 0) {
      for (const field of input.preserveFields) {
        const currentValue = getNestedValue(input.currentData, field);
        const editedValue = getNestedValue(parsed.editedData, field);

        if (JSON.stringify(currentValue) !== JSON.stringify(editedValue)) {
          console.warn(`[editObjectTask] Preserved field "${field}" was modified by LLM. Reverting.`);
          setNestedValue(parsed.editedData, field, currentValue);
        }
      }
    }

    return {
      editedData: parsed.editedData,
      changelog: parsed.changelog,
      preserved: parsed.preserved || input.preserveFields || [],
      reasoning: parsed.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('[editObjectTask] Error:', error);
    throw new Error(`Failed to edit object: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue({ a: { b: { c: 1 } } }, 'a.b.c') => 1
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Set nested value in object using dot notation
 * Example: setNestedValue({ a: { b: {} } }, 'a.b.c', 1) => { a: { b: { c: 1 } } }
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

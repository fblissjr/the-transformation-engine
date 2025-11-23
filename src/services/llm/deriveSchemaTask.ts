/**
 * LLM_DERIVE_SCHEMA Task
 * Analyzes source material and determines appropriate object schema
 *
 * Use cases:
 * - User provides text description → derive character/location/prop schema
 * - User uploads image → analyze and derive object schema
 * - Extract objects from unstructured data → generate schema dynamically
 */

import type { TaskRouter } from '../../taskRouter';
import { TASK_IDS } from '../../../types/providers';

export interface DeriveSchemaInput {
  source: string | { type: 'text' | 'image' | 'video'; content: string };
  context?: string; // Hint: "character", "location", "prop", etc.
  outputFormat?: string; // "video_generation", "image_generation", etc.
}

export interface DeriveSchemaOutput {
  objectType: string; // 'character', 'location', 'camera', 'prop', 'audio', 'concept', or custom
  schema: Record<string, any>; // TypeScript-like interface as JSON
  confidence: number; // 0-1
  reasoning: string;
}

/**
 * System prompt for schema derivation
 */
const DERIVE_SCHEMA_SYSTEM_PROMPT = `You are a schema analyzer for a structured data system for video generation prompts.

Your task: Analyze the provided source material and determine the most appropriate object schema.

Guidelines:
1. Identify what type of object this describes:
   - Standard types: character, location, camera, prop, audio, concept
   - Custom types: Any LLM-derived type (e.g., "weather_event", "transition_effect")

2. Generate a JSON schema that captures all relevant fields:
   - Use descriptive field names
   - Use appropriate data types (string, number, array, object)
   - Include nested objects for complex properties
   - Follow existing schema patterns when possible

3. Character schema pattern (reference):
   {
     "name": "string",
     "appearance": {
       "head": { "age": "string", "features": "string", "hair": "string", "expression": "string" },
       "body": { "build": "string", "height": "string", "clothing": "string[]", "accessories": "string[]" }
     },
     "personality": { "traits": "string[]", "motivations": "string[]", "emotional_state": "string" },
     "equipment": "string[]"
   }

4. Location schema pattern (reference):
   {
     "name": "string",
     "type": "interior" | "exterior" | "hybrid",
     "setting": "string",
     "environment": { "weather": "string", "timeOfDay": "string", "lighting": "string" },
     "details": "string[]"
   }

5. Camera schema pattern (reference):
   {
     "shotType": "wide" | "medium" | "close-up" | "extreme-close-up",
     "angle": "eye-level" | "high-angle" | "low-angle" | "dutch-angle",
     "movement": "static" | "pan" | "tilt" | "dolly" | "handheld",
     "lens": { "focalLength": "string", "aperture": "string" }
   }

6. For custom types, derive schema from content:
   - Analyze what fields would be most useful for video generation
   - Consider temporal, spatial, and visual properties
   - Include fields that can be modified/animated

7. Provide confidence score (0-1) based on clarity of source
8. Explain your reasoning

Output JSON format:
{
  "objectType": "character",
  "schema": { ...schema fields... },
  "confidence": 0.95,
  "reasoning": "Description contains detailed character information including appearance and personality traits."
}

IMPORTANT: Always output valid JSON only. No markdown formatting, no explanations outside the JSON structure.`;

/**
 * Executes the DERIVE_SCHEMA task to analyze source material and generate an object schema.
 *
 * @param input - The input data containing source material, context hint, and output format.
 * @param taskRouter - The task router instance used to execute the LLM task.
 * @returns A Promise resolving to a DeriveSchemaOutput object containing the derived object type, schema, confidence score, and reasoning.
 * @throws Error if the LLM response is invalid or execution fails.
 */
export async function executeDeriveSchemaTask(
  input: DeriveSchemaInput,
  taskRouter: TaskRouter
): Promise<DeriveSchemaOutput> {
  try {
    // Build user prompt
    let userPrompt = `Analyze this source and derive an appropriate schema:\n\n`;

    if (typeof input.source === 'string') {
      userPrompt += input.source;
    } else {
      if (input.source.type === 'text') {
        userPrompt += input.source.content;
      } else if (input.source.type === 'image') {
        userPrompt += `[Image provided - analyze visual content]\n${input.source.content}`;
      } else if (input.source.type === 'video') {
        userPrompt += `[Video provided - analyze motion and content]\n${input.source.content}`;
      }
    }

    if (input.context) {
      userPrompt += `\n\nContext hint: This is likely a ${input.context} object.`;
    }

    if (input.outputFormat) {
      userPrompt += `\n\nOutput format: ${input.outputFormat}`;
    }

    // Execute task via task router
    const turn = await taskRouter.executeTask(
      TASK_IDS.LLM_DERIVE_SCHEMA,
      userPrompt,
      DERIVE_SCHEMA_SYSTEM_PROMPT,
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
    if (!parsed.objectType || !parsed.schema || typeof parsed.confidence !== 'number') {
      throw new Error('Invalid response structure from LLM');
    }

    return {
      objectType: parsed.objectType,
      schema: parsed.schema,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('[deriveSchemaTask] Error:', error);
    throw new Error(`Failed to derive schema: ${error instanceof Error ? error.message : String(error)}`);
  }
}

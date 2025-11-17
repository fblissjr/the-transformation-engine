/**
 * LLM_EXTRACT_OBJECT Task
 * Extracts structured object data from source material using a provided schema
 *
 * Use cases:
 * - User provides text → extract character/location/prop data
 * - User uploads image → analyze and extract object data
 * - Convert unstructured description → structured object data
 */

import type { TaskRouter } from '../../../services/taskRouter';
import { TASK_IDS } from '../../../types/providers';

export interface ExtractObjectInput {
  source: string | { type: 'text' | 'image' | 'video'; content: string };
  objectType: string; // 'character', 'location', 'prop', etc.
  schema: Record<string, any>; // Schema to extract data into
  context?: string; // Additional context for extraction
}

export interface ExtractObjectOutput {
  data: Record<string, any>; // Extracted data matching schema
  confidence: number; // 0-1
  ambiguities?: string[]; // Fields that were unclear or missing
  reasoning: string;
}

/**
 * System prompt for object extraction
 */
const EXTRACT_OBJECT_SYSTEM_PROMPT = `You are an object data extractor for a structured video generation system.

Your task: Extract structured data from source material according to a provided schema.

Guidelines:
1. Analyze the source material carefully
2. Extract data for ALL fields in the provided schema
3. If a field is not mentioned in the source:
   - Use reasonable defaults based on context
   - Mark the field in "ambiguities" array
   - Explain your assumptions in "reasoning"

4. Data extraction rules:
   - Be faithful to the source material
   - Infer reasonable details when appropriate
   - For visual descriptions, be specific and concrete
   - For arrays, extract all relevant items
   - For nested objects, extract all sub-fields

5. Confidence scoring:
   - 1.0: All fields explicitly stated in source
   - 0.8-0.9: Most fields stated, some reasonable inferences
   - 0.6-0.7: Significant inferences required
   - <0.6: Source lacks critical information

6. Quality standards:
   - Use professional descriptive language
   - Be specific (not "blue shirt" but "navy button-down shirt")
   - Avoid generic terms like "nice" or "good"
   - Include texture, material, style details when relevant

Output JSON format:
{
  "data": { ...extracted data matching schema... },
  "confidence": 0.85,
  "ambiguities": ["personality.motivations", "equipment"],
  "reasoning": "Appearance details well-specified. Personality inferred from described actions. Equipment not mentioned."
}

IMPORTANT: Always output valid JSON only. No markdown formatting, no explanations outside the JSON structure.`;

/**
 * Execute EXTRACT_OBJECT task
 */
export async function executeExtractObjectTask(
  input: ExtractObjectInput,
  taskRouter: TaskRouter
): Promise<ExtractObjectOutput> {
  try {
    // Build user prompt with schema injection
    let userPrompt = `Extract ${input.objectType} data from the following source:\n\n`;

    // Add source content
    if (typeof input.source === 'string') {
      userPrompt += `SOURCE:\n${input.source}\n\n`;
    } else {
      if (input.source.type === 'text') {
        userPrompt += `SOURCE (text):\n${input.source.content}\n\n`;
      } else if (input.source.type === 'image') {
        userPrompt += `SOURCE (image):\n${input.source.content}\n\n`;
      } else if (input.source.type === 'video') {
        userPrompt += `SOURCE (video):\n${input.source.content}\n\n`;
      }
    }

    // Add schema
    userPrompt += `SCHEMA (extract data matching this structure):\n`;
    userPrompt += JSON.stringify(input.schema, null, 2);
    userPrompt += `\n\n`;

    // Add context if provided
    if (input.context) {
      userPrompt += `CONTEXT:\n${input.context}\n\n`;
    }

    userPrompt += `Extract the data and return as JSON.`;

    // Execute task via task router
    const turn = await taskRouter.executeTask(
      TASK_IDS.LLM_EXTRACT_OBJECT,
      userPrompt,
      EXTRACT_OBJECT_SYSTEM_PROMPT,
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
    if (!parsed.data || typeof parsed.confidence !== 'number') {
      throw new Error('Invalid response structure from LLM');
    }

    return {
      data: parsed.data,
      confidence: parsed.confidence,
      ambiguities: parsed.ambiguities || [],
      reasoning: parsed.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('[extractObjectTask] Error:', error);
    throw new Error(`Failed to extract object: ${error instanceof Error ? error.message : String(error)}`);
  }
}

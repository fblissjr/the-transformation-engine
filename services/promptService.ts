import { Prompt, PromptSettings, SystemPromptConfig } from "../types";
import {
  PRIMARY_GENERATION_PROMPT,
  NORMALIZER_PROMPT,
  SYNESTHETIC_MIXER_PROMPT,
  SCHEMA_INFERENCE_PROMPT,
  MODEL_PRESETS,
} from "../constants";
import { fragmentLoader } from "./fragmentLoader";
import { selectFewShotExamples, shouldUseFewShot } from "./fewShotService";
import { taskRouter } from "./taskRouter";
import { TASK_IDS } from "../types/providers";

const getFormatGuidance = (format: string): string => {
  const formatLower = format.toLowerCase();

  if (formatLower.includes("yaml")) {
    return 'Use YAML syntax with keys followed by colon and value (e.g., "key: value"). DO NOT wrap your output in code fences or markdown formatting. Output raw YAML only.';
  } else if (formatLower.includes("xml")) {
    return 'Use XML syntax with opening and closing tags (e.g., "<key>value</key>"). DO NOT wrap your output in code fences or markdown formatting. Output raw XML only.';
  } else if (formatLower.includes("json")) {
    return 'Use valid JSON object syntax with quoted keys and values (e.g., {"key": "value"}). DO NOT wrap your output in code fences or markdown formatting. Output raw JSON only.';
  } else if (formatLower.includes("markdown")) {
    return "Use Markdown syntax with headers (## for each key) and content below each header. Separate out each part of the scene by using bullet point lists.";
  } else if (formatLower.includes("natural")) {
    return "Write in flowing, natural language prose. Describe the scene as you would tell someone about it in conversation, without any structured format or labels. Focus on vivid, cinematic description.";
  } else if (formatLower.includes("emoji")) {
    return "Use emoji-based formatting where each key is represented by relevant emojis.";
  }

  return ""; // No additional guidance for unknown formats
};

export const generatePrimaryPrompt = (
  naturalLanguageInput: string,
  settings: PromptSettings,
  config?: SystemPromptConfig,
): string => {
  // Check for custom prompt in localStorage first
  const customPrompt =
    typeof window !== "undefined"
      ? localStorage.getItem("custom_primary_prompt")
      : null;
  let prompt =
    config?.prompts.primary || customPrompt || PRIMARY_GENERATION_PROMPT;

  // Note: Advanced controls (dialogue, soundscape, pacing) removed in favor of mix options
  // UserDefinedCanonicalElements placeholder removed from system prompt
  prompt = prompt.replace(
    "{{UserDefinedCanonicalElements}}",
    "No specific canonical elements were provided. You have full creative control over these details.",
  );

  prompt = prompt.replace("{{naturalLanguageInput}}", naturalLanguageInput);
  prompt = prompt.replace("{{format}}", settings.format);
  prompt = prompt.replace(
    "{{formatGuidance}}",
    getFormatGuidance(settings.format),
  );
  prompt = prompt.replace("{{schemaKeys}}", settings.schemaKeys.join(", "));

  // Generate instructions based on mix options (or fall back to legacy textDirection)
  let textDirectionInstruction =
    "Output the keys and content in normal, forward direction.";

  if (settings.mixOptions && settings.mixOptions.length > 0) {
    const enabledOptions = settings.mixOptions.filter((opt) => opt.isEnabled);
    if (enabledOptions.length > 0) {
      textDirectionInstruction =
        "Apply the following transformations:\n" +
        enabledOptions
          .map((opt, idx) => `${idx + 1}. ${opt.instruction}`)
          .join("\n");
    }
  } else if (settings.textDirection === "Backwards") {
    // Legacy fallback
    textDirectionInstruction =
      "Apply reversal to both the keys and their content as specified by the format.";
  }

  prompt = prompt.replace(
    "{{textDirectionInstruction}}",
    textDirectionInstruction,
  );

  // Replace custom slider values
  if (config?.customSliders && settings.customSliderValues) {
    for (const slider of config.customSliders) {
      const value =
        settings.customSliderValues[slider.placeholder] ?? slider.defaultValue;
      prompt = prompt.replace(`{{${slider.placeholder}}}`, String(value));
    }
  }

  return prompt;
};

// ============================================
// MODULAR FRAGMENT-BASED PROMPT GENERATION
// ============================================

/**
 * Load and compose a prompt template from fragments
 */
async function loadPromptTemplate(
  templateName: string,
  modelPreset?: string,
): Promise<string> {
  // Try model-specific template first, fallback to generic
  const templateSuffix = modelPreset || "";
  let response = await fetch(`/core/${templateName}${templateSuffix}.md`);

  if (!response.ok && templateSuffix) {
    // Fallback to generic template
    response = await fetch(`/core/${templateName}.md`);
  }

  if (!response.ok) {
    throw new Error(`Failed to load template: ${templateName}`);
  }
  return await response.text();
}

/**
 * Detect target model from schema keys or settings
 */
function detectTargetModel(settings: PromptSettings): string {
  const keySet = new Set(settings.schemaKeys.map((k) => k.toLowerCase()));

  // Veo 3 indicators (audio-first model)
  const veo3Keys = [
    "audio_elements",
    "dialogue",
    "voiceover_script",
    "ambient_audio",
    "subject",
  ];
  const veo3Score = veo3Keys.filter((k) => keySet.has(k)).length;

  // Sora 2 indicators (visual-first with temporal progression)
  const sora2Keys = [
    "temporal_progression",
    "cinematography",
    "visual_description",
  ];
  const sora2Score = sora2Keys.filter((k) => keySet.has(k)).length;

  // Decision: Use highest score, prefer Veo 3 on tie (audio is distinctive)
  if (veo3Score > sora2Score || (veo3Score === sora2Score && veo3Score > 0)) {
    return "veo3";
  }

  if (sora2Score > 0) {
    return "sora2";
  }

  // Add more detection logic as needed
  // if (keySet.has("wan_specific_key")) return "wan";

  return "generic";
}

/**
 * Generate primary prompt using fragment composition
 *
 * NOTE: After calling this function, use fragmentLoader.getLoadedFragments()
 * to retrieve the list of fragments that were used in the composition.
 * This is useful for tracking which fragments were used in version history.
 */
/**
 * Generate mixer prompt using fragment composition
 */
export async function generateMixPrompt(
  sourcePrompts: Prompt[],
  settings: PromptSettings,
  userGuidance: string,
  config?: SystemPromptConfig,
): Promise<string> {
  // Check for custom prompt first (backward compat)
  const customPrompt =
    typeof window !== "undefined"
      ? localStorage.getItem("custom_mixer_prompt")
      : null;

  if (customPrompt) {
    return generateMixPrompt(sourcePrompts, settings, userGuidance, config);
  }

  // Detect target model and get preset
  const targetModel = detectTargetModel(settings);
  const modelPreset =
    MODEL_PRESETS[targetModel as keyof typeof MODEL_PRESETS] ||
    MODEL_PRESETS.generic;

  // Load template (model-specific or generic)
  const template = await loadPromptTemplate(
    "mixer",
    modelPreset.templateSuffix,
  );

  const sourcePromptsText = sourcePrompts
    .map(
      (p, index) =>
        `*   **PROMPT ${String.fromCharCode(65 + index)}:**\n\`\`\`\n${p.structuredOutput}\n\`\`\``,
    )
    .join("\n");

  // Build variables map
  const variables: Record<string, string> = {
    // Expert role template variables
    expertise: "expert creative prompt blender",
    capabilities:
      "analyze and synthesize the core cinematic, emotional, and thematic elements from two or more existing structured prompts",
    domain: "prompt engineering and creative synthesis",

    // Mix-specific
    sourcePrompts: sourcePromptsText,
    userGuidance:
      userGuidance ||
      "Find an interesting, surprising, or interesting thematic link between the prompts that would make for a great 8-10 second video clip.",

    // Format settings
    format: settings.format,
    formatGuidance: getFormatGuidance(settings.format),
    schemaKeys: settings.schemaKeys.join(", "),

    // Length guidance (model-specific)
    lengthGuidance: modelPreset.lengthGuidance,

    // Text direction/mix options
    textDirectionInstruction: generateTextDirectionInstruction(settings),
  };

  // Add model-specific technical specs if available
  if ("technicalSpecs" in modelPreset && modelPreset.technicalSpecs) {
    Object.assign(variables, modelPreset.technicalSpecs);
  }

  // Compose prompt
  return await fragmentLoader.composePrompt(template, variables);
}

/**
 * Generate normalizer prompt using fragment composition
 */
export async function generateNormalizePrompt(
  structuredOutput: string,
  language: string,
  config?: SystemPromptConfig,
): Promise<string> {
  // Load template
  const template = await loadPromptTemplate("normalizer");

  // Build variables map
  const variables: Record<string, string> = {
    // Expert role template variables
    expertise: "expert prompt de-constructor and creative writer",
    capabilities:
      "take a structured, machine-readable prompt and translate it into a single, coherent, and cinematic scene description in a flowing paragraph",
    domain: "screenwriting and narrative structure",

    // Normalizer-specific
    structuredOutput,
    language,
  };

  // Compose prompt
  return await fragmentLoader.composePrompt(template, variables);
}

/**
 * Generate schema inference prompt using fragment composition
 */
export async function generateSchemaInferencePrompt(
  naturalLanguageInput: string,
  existingKeys: string[],
  mode: "additional" | "full",
  config?: SystemPromptConfig,
): Promise<string> {
  // Load template
  const template = await loadPromptTemplate("schema_inference");

  let instructions = "";
  if (mode === "additional") {
    instructions = `**Existing Schema Keys:**
["${existingKeys.join('", "')}"]

**Your Task:**
Based on the User's Creative Idea, suggest 1 to 3 *additional* keys that would enhance the existing schema. Do not include the existing keys in your response. Focus on what's missing.`;
  } else {
    instructions = `**Your Task:**
Generate a *complete* new schema that best represents the user's idea from scratch. This new schema should fully replace any existing one. Aim for 2-4 highly relevant keys.`;
  }

  // Build variables map
  const variables: Record<string, string> = {
    // Expert role template variables
    expertise: "expert schema designer for creative, structured prompts",
    capabilities:
      "analyze a user's creative idea and suggest a set of structured keys (a schema) to represent it effectively for a text-to-video model",
    domain: "prompt engineering and schema design",

    // Schema-specific
    naturalLanguageInput,
    instructions,
  };

  // Compose prompt
  return await fragmentLoader.composePrompt(template, variables);
}

/**
 * Helper: Generate text direction instruction from settings
 */
function generateTextDirectionInstruction(settings: PromptSettings): string {
  if (settings.mixOptions && settings.mixOptions.length > 0) {
    const enabledOptions = settings.mixOptions.filter((opt) => opt.isEnabled);
    if (enabledOptions.length > 0) {
      return (
        "Apply the following transformations:\n" +
        enabledOptions
          .map((opt, idx) => `${idx + 1}. ${opt.instruction}`)
          .join("\n")
      );
    }
  } else if (settings.textDirection === "Backwards") {
    return "Apply reversal to both the keys and their content as specified by the format.";
  }

  return "Output the keys and content in normal, forward direction.";
}

/**
 * Generate a model conversion prompt using fragment-based templates
 * @param structuredOutput - The prompt to convert
 * @param targetModel - Target model: 'sora2', 'veo3', or 'generic'
 * @returns Conversion prompt with instructions and examples
 */
export async function generateConversionPrompt(
  structuredOutput: string,
  targetModel: "sora2" | "veo3" | "generic",
): Promise<string> {
  const templatePath = `/core/convert_to_${targetModel}.md`;

  try {
    // Fetch template directly (not as a fragment - no frontmatter required)
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const template = await response.text();

    // Compose with variables (this will resolve @include directives)
    const variables = { structuredOutput };
    return await fragmentLoader.composePrompt(template, variables);
  } catch (error) {
    console.error(
      `Failed to load conversion template for ${targetModel}:`,
      error,
    );
    throw new Error(`Conversion template not found: ${templatePath}`);
  }
}

/**
 * Detect target model from intermediate structure
 * Used to auto-select best transformer after generation
 */
export function detectTargetModelFromIntermediate(intermediate: {
  structure: { temporal?: any; audio?: any };
}): "sora2" | "veo3" | "generic" {
  // Veo 3 indicators: Rich audio with dialogue or music
  if (
    intermediate.structure.audio?.dialogue ||
    intermediate.structure.audio?.music ||
    (intermediate.structure.audio?.ambient &&
      intermediate.structure.audio?.soundEffects)
  ) {
    return "veo3";
  }

  // Sora 2 indicators: Temporal progression with multiple segments
  if (
    intermediate.structure.temporal?.segments &&
    intermediate.structure.temporal.segments.length > 0
  ) {
    return "sora2";
  }

  // Default to generic
  return "generic";
}

/**
 * Extract title from input (first sentence, max 50 chars)
 */
function extractTitleFromInput(input: string): string {
  const firstSentence = input.split(/[.!?]/)[0].trim();
  return firstSentence.length > 50
    ? firstSentence.substring(0, 47) + "..."
    : firstSentence;
}

/**
 * Generate intermediate representation from natural language
 * Uses primary_intermediate.md template to get semantic JSON structure
 * Routes through taskRouter for provider/model handling
 *
 * @param input - Natural language description of the scene
 * @param options - Generation options (model, temperature, etc.)
 * @param settings - Prompt settings (schema keys, format, etc.)
 * @returns IntermediatePrompt object ready to save to IndexedDB
 */
export async function generateIntermediate(
  input: string,
  options?: {
    modelName?: string;
    temperature?: number;
  },
  settings?: PromptSettings,
): Promise<any> {
  // Load intermediate generation template
  const fragment = await fragmentLoader.loadFragment(
    "/core/primary_intermediate.md",
  );
  const template = typeof fragment === "string" ? fragment : fragment.content;

  // Compose prompt with user input
  const systemPrompt = await fragmentLoader.composePrompt(template, {
    naturalLanguageInput: input,
    schemaKeys: settings?.schemaKeys?.join(", ") || "",
    format: settings?.format || "Standard YAML",
  });

  // Use taskRouter with JSON mode for structured output (v2.0)
  // executeTaskJson returns the parsed JSON directly, not a turn object
  const structuredOutput = await taskRouter.executeTaskJson(
    TASK_IDS.INTERMEDIATE_GENERATION,
    input,
    systemPrompt
  );

  if (!structuredOutput) {
    throw new Error('No response from LLM (executeTaskJson returned null/undefined)');
  }

  // Validate with Zod schema
  const { validateIntermediateStructure } = await import('../types/schemas');
  const validationResult = validateIntermediateStructure(structuredOutput);

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map(issue =>
      `${issue.path.join('.')}: ${issue.message}`
    ).join('; ');
    throw new Error(
      `Invalid intermediate structure from LLM. Validation errors: ${errors}`,
    );
  }

  // Create IntermediatePrompt with v2.0 structured format
  const intermediate: any = {
    id: `intermediate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    version: "2.0.0",
    created: new Date(),
    modified: new Date(),
    title: extractTitleFromInput(input),
    tags: [],
    sources: {
      text: input,
    },
    // Store the validated structured format (v2.0)
    structure: validationResult.data,
  };

  return intermediate;
}

// Export fragmentLoader for accessing loaded fragments list
export { fragmentLoader };

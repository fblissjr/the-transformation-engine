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

const getFormatGuidance = (format: string): string => {
  const formatLower = format.toLowerCase();

  if (formatLower.includes("yaml")) {
    return 'Use YAML syntax with keys followed by colon and value (e.g., "key: value"). Be concise while maintaining the overall specifics of the scene envisioned by the user.';
  } else if (formatLower.includes("xml")) {
    return 'Use XML syntax with opening and closing tags (e.g., "<key>value</key>"). Be concise while maintaining the overall specifics of the scene envisioned by the user.';
  } else if (formatLower.includes("json")) {
    return 'Use valid JSON object syntax with quoted keys and values (e.g., {"key": "value"}). Be concise while maintaining the overall specifics of the scene envisioned by the user.';
  } else if (formatLower.includes("markdown")) {
    return "Use Markdown syntax with headers (## for each key) and content below each header. Separate out each part of the scene by using bullet point lists. Be concise while maintaining the overall specifics of the scene envisioned by the user.";
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

export const generateMixPrompt = (
  sourcePrompts: Prompt[],
  settings: PromptSettings,
  userGuidance: string,
  config?: SystemPromptConfig,
): string => {
  // Check for custom prompt in localStorage first
  const customPrompt =
    typeof window !== "undefined"
      ? localStorage.getItem("custom_mixer_prompt")
      : null;
  let prompt =
    config?.prompts.mixer || customPrompt || SYNESTHETIC_MIXER_PROMPT;

  const sourcePromptsText = sourcePrompts
    .map(
      (p, index) =>
        `*   **PROMPT ${String.fromCharCode(65 + index)}:**\n\`\`\`\n${p.structuredOutput}\n\`\`\``,
    )
    .join("\n");

  prompt = prompt.replace("{{sourcePrompts}}", sourcePromptsText);
  prompt = prompt.replace(
    "{{userGuidance}}",
    userGuidance ||
      "Find an interesting, surprising, or interesting thematic link between the prompts that would make for a great 8-10 second video clip.",
  );
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

  return prompt;
};

export const generateNormalizePrompt = (
  structuredOutput: string,
  language: string,
  config?: SystemPromptConfig,
): string => {
  // Check for custom prompt in localStorage first
  const customPrompt =
    typeof window !== "undefined"
      ? localStorage.getItem("custom_normalizer_prompt")
      : null;
  let prompt = config?.prompts.normalizer || customPrompt || NORMALIZER_PROMPT;
  prompt = prompt.replace("{{language}}", language);
  prompt = prompt.replace("{{structuredOutput}}", structuredOutput);
  return prompt;
};

export const generateSchemaInferencePrompt = (
  naturalLanguageInput: string,
  existingKeys: string[],
  mode: "additional" | "full",
  config?: SystemPromptConfig,
): string => {
  // Check for custom prompt in localStorage first
  const customPrompt =
    typeof window !== "undefined"
      ? localStorage.getItem("custom_schema_inference_prompt")
      : null;
  let prompt =
    config?.prompts.schemaInference || customPrompt || SCHEMA_INFERENCE_PROMPT;

  let instructions = "";
  if (mode === "additional") {
    instructions = `**Existing Schema Keys:**
[\"${existingKeys.join('", "')}\"]

**Your Task:**
Based on the User's Creative Idea, suggest 1 to 3 *additional* keys that would enhance the existing schema. Do not include the existing keys in your response. Focus on what's missing.`;
  } else {
    // mode === 'full'
    instructions = `**Your Task:**
Generate a *complete* new schema that best represents the user's idea from scratch. This new schema should fully replace any existing one. Aim for 2-4 highly relevant keys.`;
  }

  prompt = prompt.replace("{{naturalLanguageInput}}", naturalLanguageInput);
  prompt = prompt.replace("{{instructions}}", instructions);

  return prompt;
};

// ============================================
// MODULAR FRAGMENT-BASED PROMPT GENERATION
// ============================================

/**
 * Load and compose a prompt template from fragments
 */
async function loadPromptTemplate(templateName: string, modelPreset?: string): Promise<string> {
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
  const keySet = new Set(settings.schemaKeys.map(k => k.toLowerCase()));

  // Veo 3 indicators (audio-first model)
  const veo3Keys = ['audio_elements', 'dialogue', 'voiceover_script', 'ambient_audio', 'subject'];
  const veo3Score = veo3Keys.filter(k => keySet.has(k)).length;

  // Sora 2 indicators (visual-first with temporal progression)
  const sora2Keys = ['temporal_progression', 'cinematography', 'visual_description'];
  const sora2Score = sora2Keys.filter(k => keySet.has(k)).length;

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
export async function generatePrimaryPromptV2(
  naturalLanguageInput: string,
  settings: PromptSettings,
  config?: SystemPromptConfig,
): Promise<string> {
  // Check for custom prompt first (backward compat)
  const customPrompt =
    typeof window !== "undefined"
      ? localStorage.getItem("custom_primary_prompt")
      : null;

  if (customPrompt) {
    // Use old system for custom prompts
    return generatePrimaryPrompt(naturalLanguageInput, settings, config);
  }

  // Detect target model and get preset
  const targetModel = detectTargetModel(settings);
  const modelPreset = MODEL_PRESETS[targetModel as keyof typeof MODEL_PRESETS] || MODEL_PRESETS.generic;

  // Load template (model-specific or generic)
  const template = await loadPromptTemplate("primary", modelPreset.templateSuffix);

  // Select few-shot examples if using Sora 2 or Veo 3
  let fewShotExamples = "";
  const fewShotModel = shouldUseFewShot(settings.schemaKeys);
  if (fewShotModel) {
    try {
      fewShotExamples = await selectFewShotExamples(naturalLanguageInput, 2, fewShotModel);
    } catch (error) {
      console.warn("Failed to load few-shot examples:", error);
      // Continue without examples if loading fails
    }
  }

  // Build variables map
  const variables: Record<string, string> = {
    // Expert role template variables
    expertise: "structured prompt generator for text-to-video models",
    capabilities:
      "translate a user's creative idea into a detailed, multi-modal, machine-readable prompt",
    domain: "cinematic language and sound design",

    // User input
    naturalLanguageInput,

    // Format settings
    format: settings.format,
    formatGuidance: getFormatGuidance(settings.format),
    schemaKeys: settings.schemaKeys.join(", "),

    // Length guidance (model-specific)
    lengthGuidance: modelPreset.lengthGuidance,

    // Text direction/mix options
    textDirectionInstruction: generateTextDirectionInstruction(settings),

    // Few-shot examples (Sora 2 only)
    fewShotExamples,
  };

  // Add model-specific technical specs if available
  if ('technicalSpecs' in modelPreset && modelPreset.technicalSpecs) {
    Object.assign(variables, modelPreset.technicalSpecs);
  }

  // Compose prompt
  return await fragmentLoader.composePrompt(template, variables);
}

/**
 * Generate mixer prompt using fragment composition
 */
export async function generateMixPromptV2(
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
  const modelPreset = MODEL_PRESETS[targetModel as keyof typeof MODEL_PRESETS] || MODEL_PRESETS.generic;

  // Load template (model-specific or generic)
  const template = await loadPromptTemplate("mixer", modelPreset.templateSuffix);

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
  if ('technicalSpecs' in modelPreset && modelPreset.technicalSpecs) {
    Object.assign(variables, modelPreset.technicalSpecs);
  }

  // Compose prompt
  return await fragmentLoader.composePrompt(template, variables);
}

/**
 * Generate normalizer prompt using fragment composition
 */
export async function generateNormalizePromptV2(
  structuredOutput: string,
  language: string,
  config?: SystemPromptConfig,
): Promise<string> {
  // Check for custom prompt first (backward compat)
  const customPrompt =
    typeof window !== "undefined"
      ? localStorage.getItem("custom_normalizer_prompt")
      : null;

  if (customPrompt) {
    return generateNormalizePrompt(structuredOutput, language, config);
  }

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
export async function generateSchemaInferencePromptV2(
  naturalLanguageInput: string,
  existingKeys: string[],
  mode: "additional" | "full",
  config?: SystemPromptConfig,
): Promise<string> {
  // Check for custom prompt first (backward compat)
  const customPrompt =
    typeof window !== "undefined"
      ? localStorage.getItem("custom_schema_inference_prompt")
      : null;

  if (customPrompt) {
    return generateSchemaInferencePrompt(
      naturalLanguageInput,
      existingKeys,
      mode,
      config,
    );
  }

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
  targetModel: 'sora2' | 'veo3' | 'generic'
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
    console.error(`Failed to load conversion template for ${targetModel}:`, error);
    throw new Error(`Conversion template not found: ${templatePath}`);
  }
}

// Export fragmentLoader for accessing loaded fragments list
export { fragmentLoader };

import { PromptSettings, SystemPromptConfig, AppSettings, OutputFormat, ModelSettings, MixOption } from './types';

// Asset paths
export const LOGO_PATH = 'assets/logo_256x256.png';

export const PRIMARY_GENERATION_PROMPT = `
You are a world-class structured prompt generator for text-to-video models. Your purpose is to translate a user's creative idea into a detailed, multi-modal, machine-readable prompt. You are descriptive yet to the point. Always exclude timestamps. Your knowledge of cinematic language and sound design is unparalleled.

**Your Task:**
Based on the user's creative idea and control parameters below, generate a complete prompt scene. Think like a director, a sound designer, and a composer simultaneously.

**CRITICAL RULE: Obscuring Known Figures**
To foster creative interpretation, you MUST NOT use proper names of well known figures. Instead, you must "talk around them." Describe them by their iconic roles, historical context, signature appearance, famous quotes, or public persona.
*   **Example 1:** Instead of "Napoleon Bonaparte," describe "a diminutive Corsican general in a bicorne hat obsessed with destiny."
*   **Example 2:** Instead of "Queen Elizabeth," describe "a long-reigning British monarch known for her steadfast composure and love of corgis."
*   **Example 3:** Instead of "The Wright Brothers," describe "two American bicycle mechanics from Ohio who achieved the first powered flight."

**User's Creative Idea:**
"{{naturalLanguageInput}}"

**Output Structure & Constraints:**
1.  **Format:** Generate the output using the exact syntax: {{format}}.
    {{formatGuidance}}
2.  **Schema Keys:** Use ONLY the following keys/tags: {{schemaKeys}}.
3.  **Text Direction:** {{textDirectionInstruction}}
4.  **Length:** The final output must be under 2000 characters.

**Final Instruction:** Your response must contain ONLY the structured prompt itself, with no additional commentary, introductions, or explanations.
`;

export const SYNESTHETIC_MIXER_PROMPT = `
You are an expert creative prompt blender. Your task is to analyze and synthesize the core cinematic, emotional, and thematic elements from two or more existing structured prompts. You will then generate a single, completely new, and coherent hybrid scene. Do not simply combine the prompts; create a novel synthesis inspired by them.

**CRITICAL RULE: Obscuring Known Figures**
This rule still applies. If the source prompts contain descriptions of known figures, maintain the obscured, descriptive style in your new creation.

**Source Prompts:**
{{sourcePrompts}}

**User Guidance for the Mix:**
"{{userGuidance}}"

**Your Task & Output Constraints:**
1.  Analyze the source prompts to understand their core themes and moods.
2.  Use the user's guidance to create a new, synthesized scene.
3.  **Crucially, format your final output using the following new structure, ignoring the formats of the source prompts:**
    *   **Format:** {{format}}
        {{formatGuidance}}
    *   **Schema Keys:** {{schemaKeys}}
    *   **Text Direction:** {{textDirectionInstruction}}
4.  The final output must be under 2000 characters.

**Final Instruction:** Your response must contain ONLY the structured prompt itself, with no additional commentary, introductions, or explanations.
`;


export const NORMALIZER_PROMPT = `
You are an expert prompt de-constructor and creative writer. Your task is to take a structured, machine-readable prompt and translate it into a single, coherent, and **cinematic** scene description in a flowing paragraph.

**Instructions:**
1.  Synthesize all the elements (scene, sound, music, speech) into a cohesive narrative.
2.  Do not just list the elements; weave them together to evoke the full mood and intent of the prompt.
3.  Write in the present tense, as if describing a scene from a screenplay.

**Target Language:** {{language}}

**Structured Prompt to Normalize:**
\`\`\`
{{structuredOutput}}
\`\`\`

Write the cinematic scene description now.
`;

export const SCHEMA_INFERENCE_PROMPT = `
You are an expert schema designer for creative, structured prompts. Your task is to analyze a user's creative idea and suggest a set of structured keys (a schema) to represent it effectively for a text-to-video model. The keys should be concise, lowercase, and use snake_case.

**User's Creative Idea:**
"{{naturalLanguageInput}}"

{{instructions}}

**Output Format:**
You MUST respond with a single, valid JSON object. Do not include any text or formatting before or after the JSON object.
The JSON object must contain two keys:
1. "newSchemaKeys": An array of strings representing the suggested schema keys.
2. "reasoning": A brief, user-friendly explanation for your key choices.

**Example Response:**
{
  "newSchemaKeys": ["setting_description", "character_action", "internal_monologue", "ambient_sound"],
  "reasoning": "The idea involves a character's internal thoughts and specific actions in a detailed setting, so keys were chosen to capture these distinct elements."
}

Generate the JSON response now.
`;

export const DEFAULT_SETTINGS: PromptSettings = {
  format: 'Standard YAML',
  textDirection: 'Forwards', // Legacy, kept for backward compatibility
  mixOptions: [], // No options enabled by default
  schemaKeys: ['scene', 'sound_effects', 'speech'],
  advanced: {
    dialogue: [],
    soundscape: {
      soundEffects: '',
      musicDirection: '',
    },
    pacing: {
      timingNotes: '',
    },
  },
};

export const STRINGS = {
  MIX_PROMPTS_GUIDANCE_PROMPT: "Optional: Provide any specific guidance for the mix:",
  MIX_PROMPTS_GUIDANCE_DEFAULT: "Create a surprising and coherent blend of the selected prompts.",
  DELETE_PROMPT_CONFIRM_TITLE: "Delete Prompt",
  DELETE_PROMPT_CONFIRM_MESSAGE: (promptTitle: string) => `Are you sure you want to permanently delete "${promptTitle}"? This action cannot be undone.`,
  CONFIRM_MODAL_DELETE_BUTTON_TEXT: "Delete",
  ERROR_MODAL_TITLE: "Error",
};

export const GEMINI_MODEL_NAME = 'gemini-2.5-pro';

export const BUILT_IN_FORMATS: OutputFormat[] = [
  { id: 'yaml', name: 'Standard YAML', isBuiltIn: true },
  { id: 'xml', name: 'Standard XML', isBuiltIn: true },
  { id: 'json', name: 'JSON', isBuiltIn: true },
  { id: 'markdown', name: 'Markdown', isBuiltIn: true },
  { id: 'emoji', name: 'Emoji Script', isBuiltIn: true },
  { id: 'reversed-yaml-xml', name: 'Reversed YAML-like in XML', isBuiltIn: true },
];

export const BUILT_IN_MIX_OPTIONS: MixOption[] = [
  {
    id: 'reverse',
    name: 'Reverse',
    instruction: 'Apply reversal to both the keys and their content as specified by the format.',
    isBuiltIn: true,
    isEnabled: false,
  },
  {
    id: 'compress',
    name: 'Compress',
    instruction: 'Remove all filler words and unnecessary language. Keep only essential descriptive content while maintaining clarity.',
    isBuiltIn: true,
    isEnabled: false,
  },
  {
    id: 'expand',
    name: 'Expand',
    instruction: 'Add rich descriptive detail and atmospheric language to enhance the scene.',
    isBuiltIn: true,
    isEnabled: false,
  },
  {
    id: 'technical',
    name: 'Technical',
    instruction: 'Use precise, technical language and industry-specific terminology.',
    isBuiltIn: true,
    isEnabled: false,
  },
];

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  modelName: 'gemini-2.5-pro',
  maxTokens: 2048,
  temperature: 1.0,
  topP: 0.95,
};

export const DEFAULT_SCHEMA_KEYS = ['scene', 'sound_effects', 'speech'];

export const SETTINGS_ID = 'app-settings-singleton';

export const createDefaultAppSettings = (defaultConfigId: string): Omit<AppSettings, 'id'> => ({
  modelSettings: DEFAULT_MODEL_SETTINGS,
  defaultSchemaKeys: DEFAULT_SCHEMA_KEYS,
  outputFormats: BUILT_IN_FORMATS,
  activePromptConfigId: defaultConfigId,
  updatedAt: new Date().toISOString(),
});

export const createDefaultPromptConfig = (): Omit<SystemPromptConfig, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: 'Default Configuration',
  isDefault: true,
  prompts: {
    primary: PRIMARY_GENERATION_PROMPT,
    mixer: SYNESTHETIC_MIXER_PROMPT,
    normalizer: NORMALIZER_PROMPT,
    schemaInference: SCHEMA_INFERENCE_PROMPT,
  },
  customSliders: [],
});

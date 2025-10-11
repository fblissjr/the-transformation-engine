import {
  PromptSettings,
  SystemPromptConfig,
  AppSettings,
  OutputFormat,
  ModelSettings,
  MixOption,
} from "./types";

// Asset paths
export const LOGO_PATH = "assets/logo_256x256.png";

export const PRIMARY_GENERATION_PROMPT = `
You are a world-class structured prompt generator for text-to-video AI models. Your purpose is to translate a user's creative idea into a detailed, comprehensive, machine-readable prompt optimized for modern video generation systems.

**CRITICAL CONTEXT:**
- Modern text-to-video models (Sora 2, Veo 3, etc.) are trained on DETAILED captions, not terse descriptions
- More visual detail = better results
- Describe HOW scenes evolve over time, not just static snapshots
- Use professional cinematography terminology

**Your Task:**
Based on the user's creative idea and control parameters below, generate a complete prompt scene. Think like a director who understands visual storytelling, camera work, and (if the model supports it) sound design.

**CRITICAL RULE: Duration Constraints**
- **Sora 2**: 10 second clips
- **Veo 3**: 8 second clips
- **Generic/Unknown**: 8-10 second clips

You must ensure you don't try to cram too much into one clip. Focus on ONE coherent moment with clear beginning, middle, and end.

**CRITICAL RULE: Obscuring Known Figures**
To foster creative interpretation, you MUST NOT use proper names of well-known figures. Instead, "talk around them" using iconic roles, historical context, signature appearance, famous quotes, or public persona.

**Examples:**
- ❌ "Napoleon Bonaparte" → ✅ "a diminutive Corsican general in a bicorne hat obsessed with destiny"
- ❌ "Queen Elizabeth" → ✅ "a long-reigning British monarch known for her steadfast composure and love of corgis"
- ❌ "The Wright Brothers" → ✅ "two American bicycle mechanics from Ohio who achieved the first powered flight"

**User's Creative Idea:**
"{{naturalLanguageInput}}"

**Output Structure & Constraints:**
1. **Format:** Generate the output using the exact syntax: {{format}}.
   {{formatGuidance}}

2. **Schema Keys:** Use ONLY the following keys/tags: {{schemaKeys}}.

3. **Transformations:** {{textDirectionInstruction}}

4. **Detail Level:** Be comprehensive and descriptive. Aim for rich visual detail that helps the model understand:
   - WHAT is in the scene (subjects, environment, objects)
   - HOW things evolve over time (temporal progression)
   - WHERE elements are positioned (spatial relationships)
   - HOW the camera moves (specific cinematography terminology)
   - WHAT the lighting/mood is (atmospheric qualities)

5. **Length Guidelines:**
   - **Minimum**: 150-200 words (below this is insufficient detail)
   - **Optimal**: 250-400 words (matches training data)
   - **Maximum**: 600 words or 2400 characters (API limits)

**Model-Specific Considerations:**
- **If schema keys include audio/sound/dialogue**: Provide audio descriptions (dialogue, ambient sounds, music)
- **If schema keys are visual-only**: Focus exclusively on visual elements (no audio descriptions)
- **If schema keys include temporal_progression**: Describe how scene evolves from start to finish
- **If schema keys include character/subject**: Provide 30-50 word detailed character descriptions

**Final Instruction:**
Your response must contain ONLY the structured prompt itself, with no additional commentary, introductions, or explanations. Be comprehensive yet efficient - every word should add visual or temporal clarity.
`;

export const SYNESTHETIC_MIXER_PROMPT = `
You are an expert creative prompt blender. Your task is to analyze and synthesize the core cinematic, emotional, and thematic elements from two or more existing structured prompts. You will then generate a single, completely new, and coherent hybrid scene. Do not simply combine the prompts; create a novel synthesis inspired by them.

**CRITICAL RULE: 8-10 second clips**
All generated video clips are 8-10 seconds in duration. You must ensure you don't try to cram too much into one clip. Be concise and to the point. Pay attention to the formatting specifications provided by the user.

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
4.  The final output must be under 1500 characters.

**Final Instruction:** Your response must contain ONLY the structured prompt itself, with no additional commentary, introductions, or explanations.
`;

export const NORMALIZER_PROMPT = `
You are an expert prompt de-constructor and creative writer. Your task is to take a structured, machine-readable prompt and translate it into a single, coherent, and **cinematic** scene description in a flowing paragraph.

**CRITICAL RULE: 8-10 second clips**
All generated video clips are 8-10 seconds in duration. You must ensure you don't try to cram too much into one clip. Be concise and to the point. Pay attention to the formatting specifications provided by the user.

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
  format: "Markdown",
  textDirection: "Forwards", // Legacy, kept for backward compatibility
  mixOptions: [], // No options enabled by default
  schemaKeys: ["scene", "sound_effects", "speech"],
  advanced: {
    dialogue: [],
    soundscape: {
      soundEffects: "",
      musicDirection: "",
    },
    pacing: {
      timingNotes: "",
    },
  },
};

export const STRINGS = {
  MIX_PROMPTS_GUIDANCE_PROMPT:
    "Optional: Provide any specific guidance for the mix:",
  MIX_PROMPTS_GUIDANCE_DEFAULT:
    "Create a surprising and coherent blend of the selected prompts.",
  DELETE_PROMPT_CONFIRM_TITLE: "Delete Prompt",
  DELETE_PROMPT_CONFIRM_MESSAGE: (promptTitle: string) =>
    `Are you sure you want to permanently delete "${promptTitle}"? This action cannot be undone.`,
  CONFIRM_MODAL_DELETE_BUTTON_TEXT: "Delete",
  ERROR_MODAL_TITLE: "Error",
};

export const GEMINI_MODEL_NAME = "gemini-2.5-flash";

export const BUILT_IN_FORMATS: OutputFormat[] = [
  { id: "markdown", name: "Markdown", isBuiltIn: true },
  { id: "yaml", name: "Standard YAML", isBuiltIn: true },
  { id: "xml", name: "Standard XML", isBuiltIn: true },
  { id: "json", name: "JSON", isBuiltIn: true },
  { id: "emoji", name: "Emoji Script", isBuiltIn: true },
  {
    id: "reversed-yaml-xml",
    name: "Reversed YAML-like in XML",
    isBuiltIn: true,
  },
];

export const BUILT_IN_MIX_OPTIONS: MixOption[] = [
  {
    id: "reverse",
    name: "Reverse",
    instruction:
      "Apply reversal to both the keys and their content as specified by the format.",
    isBuiltIn: true,
    isEnabled: false,
  },
  {
    id: "compress",
    name: "Compress",
    instruction:
      'COMPRESS THE PROMPT AGGRESSIVELY. Remove ALL adjectives, adverbs, overly verbose descriptions and phrases, and filler words. Use only nouns and verbs, with adjectives used only when necessary. Example: "scene: dark alley, man walks" NOT "scene: A dimly lit alleyway where a mysterious figure walks slowly". Final output MUST be as concise and as compressed as possible while maintaining the overall specifics of the scene envisioned by the user.',
    isBuiltIn: true,
    isEnabled: false,
  },
  {
    id: "expand",
    name: "Expand",
    instruction:
      "Add rich descriptive detail and atmospheric language to enhance the scene.",
    isBuiltIn: true,
    isEnabled: false,
  },
  {
    id: "technical",
    name: "Technical",
    instruction:
      "Use precise, technical language and industry-specific terminology.",
    isBuiltIn: true,
    isEnabled: false,
  },
];

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  modelName: "gemini-2.5-flash",
  maxTokens: 2048,
  temperature: 1.0,
  topP: 0.95,
};

// Model-specific presets with recommended settings
export const MODEL_PRESETS = {
  generic: {
    name: "Generic / Any Model",
    maxOutputTokens: 2048,
    recommendedLength: "~1500 characters (terse, optimized)",
    maxInputChars: 2000,
    lengthGuidance: "Be concise while maintaining the overall specifics of the scene.",
    templateSuffix: "", // Uses default templates
  },
  sora2: {
    name: "Sora 2 (OpenAI)",
    maxOutputTokens: 4096,
    recommendedLength: "300-500 words (~1500-2500 chars)",
    maxInputChars: 2500, // Empirical limit - Sora truncates longer prompts
    lengthGuidance: "Comprehensive detail significantly outperforms terse descriptions. Aim for 300-500 words with rich visual, temporal, and atmospheric detail. WARNING: Sora 2 has a hard input limit of ~2500 characters. Longer prompts will be truncated.",
    templateSuffix: "_sora2", // Uses *_sora2.md templates
    technicalSpecs: {
      duration: "10s",
      resolution: "1920x1080",
      aspect_ratio: "16:9",
    },
  },
  veo3: {
    name: "Veo 3 (Google)",
    maxOutputTokens: 3072,
    recommendedLength: "200-400 words (~1000-2000 chars)",
    maxInputChars: 3000, // Conservative estimate
    lengthGuidance: "Veo 3 excels at detailed, narrative-driven prompts with native audio generation. Structure your description using the 9 core elements framework. ALWAYS include audio elements (dialogue, ambient sound, music). Use professional cinematic terminology. Aim for 200-400 words with rich detail.",
    templateSuffix: "_veo3",
    technicalSpecs: {
      duration: "8s",
      resolution: "720p",
      aspect_ratio: "16:9",
      fps: "24fps",
    },
  },
  wan: {
    name: "Wan Video (Alibaba)",
    maxOutputTokens: 2048,
    recommendedLength: "150-300 words (balanced)",
    lengthGuidance: "Balanced detail level. Focus on style consistency and coherent narratives. Aim for 150-300 words.",
    templateSuffix: "_wan",
  },
};

/**
 * Canonical schema keys for each model - RESEARCH-BASED
 *
 * These keys are derived from official documentation, patents, and peer-reviewed research.
 * They define the standard structure used in conversion templates and should be used in presets
 * to ensure consistency when converting between models.
 *
 * Sources:
 * - Veo 3: Google AI API docs + VEO3_RESEARCH_ANALYSIS.md
 * - Sora 2: US_2025259362_A1 (Prompt Editor Patent) + SORA2_DOC_ANALYSIS.md
 * - Storyboard approach: US_2025259361_A1 (Storyboard Patent) - future roadmap
 */
export const CANONICAL_SCHEMA_KEYS = {
  /**
   * Veo 3 (Google DeepMind): 9-element framework
   *
   * Source: convert_to_veo3.md template
   * Official framework: 6 elements (Subject, Action, Style, Camera, Composition, Ambiance)
   * Our framework: 9 elements (expands official with Context, Audio Elements, Lighting/Background separation)
   *
   * Justification for 9-element expansion:
   * - context: Separates "where/when" from "what happens" for clarity
   * - audio_elements: Critical for Veo 3's native audio generation (V2A system)
   * - lighting_mood + background_setting: Splits "Ambiance" into actionable components
   * - camera_motion: More specific than generic "Camera"
   *
   * See internal/veo3/VEO3_RESEARCH_ANALYSIS.md for research details
   */
  veo3: [
    'veo3_specs',        // Technical specifications (8s duration, 720p @ 24fps, native audio)
    'subject',           // Main character/object with detailed description (30-50 words for consistency)
    'context',           // Setting and environmental context (where, when)
    'action',            // What happens in the scene with narrative progression (beginning/middle/end)
    'style',             // Visual aesthetic, artistic direction, color palette, mood
    'camera_motion',     // Camera movement and angles (smooth tracking, handheld, static, crane)
    'audio_elements',    // **CRITICAL** Dialogue (quoted), ambient sounds, music (Veo 3's key differentiator)
    'lighting_mood',     // Lighting setup and emotional tone (warm/cool, harsh/soft, natural/artificial)
    'background_setting',// Detailed environment (architecture, props, textures, depth elements)
    'composition',       // Framing, focal points, visual hierarchy, rule of thirds, leading lines
  ],

  /**
   * Sora 2 (OpenAI): Comprehensive single-prompt approach
   *
   * Source: convert_to_sora2.md template + US_2025259362_A1 (Prompt Editor Patent)
   *
   * Training: Fine-tuned on 300-500 word detailed captions
   * Architecture: Diffusion-transformer with spacetime patches
   * Duration: Typically 10 seconds
   * NO AUDIO SUPPORT - Sora 2 is visual-only
   *
   * NOTE: The storyboard patent (US_2025259361_A1) reveals a more advanced FRAME-BASED approach
   * with prompts at specific timestamps (0s, 2.5s, 5s, 7.5s, 10s). This is the FUTURE direction
   * but requires timeline UI. Current approach uses monolithic prompts with embedded temporal
   * progression. See internal/sora/US_2025259361_STORYBOARD_ANALYSIS.md
   */
  sora2: [
    'technical_specs',      // **REQUIRED** Duration, resolution, aspect ratio (determined BEFORE generation)
    'temporal_progression', // **CRITICAL** How scene evolves from start to finish with specific visual changes
    'visual_description',   // Rich visual details (colors, textures, atmospheric elements, depth, composition)
    'camera_movement',      // Specific camera techniques with technical precision (dolly, crane, pan, tilt, zoom, rack focus)
    'cinematography',       // Framing, composition, depth of field, focal length characteristics
    'lighting',             // Lighting setup, quality, direction, color temperature, mood
    'style',                // Visual aesthetic, artistic references, color grading, overall look
  ],

  /**
   * Generic: Universal model-agnostic keys
   *
   * Source: convert_to_generic.md template
   * Simplified 4-key structure that works across all models
   * Use when model target is unknown or for broad compatibility
   */
  generic: [
    'scene',    // Core concept and narrative - the essential story
    'visuals',  // Key visual elements (subject, setting, camera work, composition, lighting, style)
    'audio',    // Essential sound elements (dialogue, ambient sounds, music if relevant)
    'style',    // Overall aesthetic, mood, color palette, artistic direction
  ],
} as const;

export const DEFAULT_SCHEMA_KEYS = ["scene", "sound_effects", "speech"];

export const SETTINGS_ID = "app-settings-singleton";

export const createDefaultAppSettings = (
  defaultConfigId: string,
): Omit<AppSettings, "id"> => ({
  modelSettings: DEFAULT_MODEL_SETTINGS,
  defaultSchemaKeys: DEFAULT_SCHEMA_KEYS,
  outputFormats: BUILT_IN_FORMATS,
  activePromptConfigId: defaultConfigId,
  updatedAt: new Date().toISOString(),
});

export const createDefaultPromptConfig = (): Omit<
  SystemPromptConfig,
  "id" | "createdAt" | "updatedAt"
> => ({
  name: "Default Configuration",
  isDefault: true,
  prompts: {
    primary: PRIMARY_GENERATION_PROMPT,
    mixer: SYNESTHETIC_MIXER_PROMPT,
    normalizer: NORMALIZER_PROMPT,
    schemaInference: SCHEMA_INFERENCE_PROMPT,
  },
  customSliders: [],
});

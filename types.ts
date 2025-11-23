
/**
 * MediaReference interface
 *
 * Represents a reference to a media item (image or video) used in the application.
 *
 * @property id - Unique identifier for the media reference.
 * @property type - The type of media, either 'image' or 'video'.
 * @property dataUrl - (Legacy) Base64 encoded data URL for the media content. Being phased out in favor of `blobId`.
 * @property blobId - Identifier for the Blob stored in the media store.
 * @property filename - Original filename of the media.
 * @property mimeType - MIME type of the media (e.g., 'image/jpeg', 'video/mp4').
 * @property thumbnail - Base64 encoded thumbnail image string (max 200x200).
 */
export interface MediaReference {
  id: string;
  type: 'image' | 'video';
  dataUrl?: string; // base64 encoded data URL (legacy, being phased out)
  blobId?: string; // Reference to blob in media store (new approach)
  filename: string;
  mimeType: string;
  thumbnail?: string; // smaller version for display (base64, max 200x200)
}

/**
 * MediaBlob interface
 *
 * Represents a raw media blob stored in the application.
 *
 * @property id - Unique identifier for the media blob.
 * @property blob - The actual Blob object containing the media data.
 * @property mimeType - MIME type of the blob data.
 * @property uploadedAt - ISO timestamp string of when the blob was uploaded.
 */
export interface MediaBlob {
  id: string;
  blob: Blob;
  mimeType: string;
  uploadedAt: string;
}

/**
 * Prompt interface
 *
 * Represents a user prompt and its associated metadata and outputs.
 *
 * @property id - Unique identifier for the prompt.
 * @property title - User-defined title for the prompt.
 * @property title_lowercase - Lowercase version of the title for search/sorting.
 * @property naturalLanguageInput - The raw natural language input from the user.
 * @property mediaReferences - Optional array of media references used for conditioning.
 * @property structuredOutput - The generated structured output (e.g., JSON string).
 * @property normalizedOutput - The normalized output text.
 * @property settingsSnapshot - JSON string representation of the `PromptSettings` used.
 * @property tags - JSON string representing an array of tags associated with the prompt.
 * @property createdAt - ISO timestamp string of creation time.
 * @property isFavorite - Boolean indicating if the prompt is marked as favorite.
 * @property intermediate - JSON string representing the `IntermediatePrompt` (model-agnostic representation).
 */
export interface Prompt {
  id: string;
  title: string;
  title_lowercase?: string;
  naturalLanguageInput: string;
  mediaReferences?: MediaReference[]; // Images/videos for conditioning
  structuredOutput: string;
  normalizedOutput: string;
  settingsSnapshot: string; // JSON string of PromptSettings
  tags: string; // JSON string of string[]
  createdAt: string;
  isFavorite: boolean;
  intermediate?: string; // JSON string of IntermediatePrompt (model-agnostic representation)
}

/**
 * GenerationMetadata interface
 *
 * detailed metadata about a generation request and its execution.
 *
 * @property naturalLanguageInput - The input text used for generation.
 * @property mediaReferences - Media references included in the generation context.
 * @property format - The output format requested.
 * @property schemaKeys - List of schema keys used.
 * @property mixOptions - Applied mix options.
 * @property modelName - Name of the model used for generation.
 * @property temperature - Sampling temperature used.
 * @property topP - Top-P sampling parameter used.
 * @property maxTokens - Maximum tokens allowed for generation.
 * @property systemPrompt - The full system prompt sent to the model.
 * @property userPrompt - The full user prompt sent to the model.
 * @property operationType - The type of operation performed ('generate', 'mix', 'normalize', 'schema_inference').
 * @property mixSourcePromptIds - IDs of source prompts if this was a mix operation.
 * @property normalizeInstruction - Instruction used for normalization if applicable.
 * @property tokensUsed - Total tokens consumed by the API call.
 * @property apiLatencyMs - Time taken for the API call in milliseconds.
 * @property parentVersionId - ID of the parent prompt version for history tracking.
 * @property branchName - Name of the branch (e.g., "main").
 * @property fragmentsUsed - List of prompt fragment identifiers used in the generation.
 */
export interface GenerationMetadata {
  // Input
  naturalLanguageInput: string;
  mediaReferences?: MediaReference[];

  // Settings
  format: string;
  schemaKeys: string[];
  mixOptions: MixOption[];
  modelName: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;

  // Prompts used (for full transparency)
  systemPrompt: string;
  userPrompt: string;

  // Operation type
  operationType: 'generate' | 'mix' | 'normalize' | 'schema_inference';
  mixSourcePromptIds?: string[]; // If this is a mix operation
  normalizeInstruction?: string; // If this is a normalize operation

  // API Response
  tokensUsed?: number;
  apiLatencyMs?: number;

  // Lineage & Branching
  parentVersionId?: string; // For branching/history tracking
  branchName?: string; // Branch identifier (e.g., "main", "experiment-audio-focus")
  fragmentsUsed?: string[]; // Track which fragments composed this prompt (e.g., ["sora2_temporal_progression", "sora2_technical_specs"])
}

/**
 * PromptVersion interface
 *
 * Represents a specific version of a prompt in history.
 *
 * @property versionId - Unique identifier for this version.
 * @property promptId - ID of the prompt this version belongs to.
 * @property savedAt - ISO timestamp string when this version was saved.
 * @property structuredOutput - The structured output for this version.
 * @property normalizedOutput - The normalized output for this version.
 * @property metadata - Optional metadata about the generation of this version.
 * @property parentVersionId - ID of the parent version.
 * @property branchName - Branch name this version belongs to.
 * @property fragmentsUsed - Prompt fragments used in this version.
 */
export interface PromptVersion {
  versionId: string;
  promptId: string;
  savedAt: string;
  structuredOutput: string;
  normalizedOutput: string;
  metadata?: GenerationMetadata; // Optional for backward compatibility

  // Branching fields (duplicated from metadata for easier access)
  parentVersionId?: string; // Link to parent version
  branchName?: string; // Branch identifier (defaults to "main")
  fragmentsUsed?: string[]; // Track which fragments were used
}

/**
 * PromptSettings interface
 *
 * Configuration settings for prompt generation.
 *
 * @property format - The output format identifier.
 * @property textDirection - (Legacy) 'Forwards' or 'Backwards'.
 * @property mixOptions - Array of mix options to apply.
 * @property schemaKeys - Keys identifying which parts of the schema to include.
 * @property modelName - The specific model to use (e.g., 'gemini-1.5-flash').
 * @property customSliderValues - Values for custom sliders, keyed by placeholder name.
 * @property advanced - Advanced settings object containing dialogue, soundscape, and pacing.
 */
export interface PromptSettings {
  format: string; // Can be any format name (user-defined or built-in)
  textDirection: 'Forwards' | 'Backwards'; // Legacy, kept for backward compatibility
  mixOptions: MixOption[]; // New: multiple transformations that can be applied
  schemaKeys: string[];
  modelName?: string; // Selected Gemini model (e.g., 'gemini-1.5-flash')
  customSliderValues?: { [key: string]: number }; // key is CustomSlider.placeholder
  advanced: {
    dialogue: DialogueLine[];
    soundscape: Soundscape;
    pacing: Pacing;
  };
}

/**
 * DialogueLine interface
 *
 * Represents a single line of dialogue in a script.
 *
 * @property id - Unique identifier for the line.
 * @property character - Name of the character speaking.
 * @property line - The dialogue text.
 * @property delivery - Instructions on how the line should be delivered.
 */
export interface DialogueLine {
  id: string;
  character: string;
  line: string;
  delivery: string;
}

/**
 * Soundscape interface
 *
 * Describes the audio environment for a scene.
 *
 * @property soundEffects - Description of sound effects.
 * @property musicDirection - Description of music direction.
 */
export interface Soundscape {
  soundEffects: string;
  musicDirection: string;
}

/**
 * Pacing interface
 *
 * Describes the pacing or timing of a scene.
 *
 * @property timingNotes - Notes regarding the timing and flow.
 */
export interface Pacing {
  timingNotes: string;
}

/**
 * MixOption interface
 *
 * Represents a transformation option that can be mixed into the prompt generation.
 *
 * @property id - Unique identifier for the mix option.
 * @property name - Display name of the option.
 * @property instruction - Instruction text for the LLM on how to apply this option.
 * @property isBuiltIn - Boolean indicating if this is a built-in system option.
 * @property isEnabled - Boolean indicating if this option is currently active.
 */
export interface MixOption {
  id: string;
  name: string;
  instruction: string; // Instruction to LLM on how to apply this option
  isBuiltIn: boolean;
  isEnabled: boolean;
}

/**
 * LogEntry interface
 *
 * Represents a single log message in the application.
 *
 * @property timestamp - ISO timestamp string of the log entry.
 * @property message - The log message text.
 * @property type - The severity or type of log ('info', 'error', 'success').
 */
export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

/**
 * CustomSlider interface
 *
 * definition for a custom slider control in the UI.
 *
 * @property id - Unique identifier for the slider.
 * @property label - Display label for the slider.
 * @property placeholder - Placeholder string used in prompt templates (e.g., {{placeholder}}).
 * @property min - Minimum value for the slider.
 * @property max - Maximum value for the slider.
 * @property defaultValue - The default starting value.
 * @property description - Optional description of what the slider controls.
 */
export interface CustomSlider {
  id: string;
  label: string;
  placeholder: string; // Used in prompt template as {{placeholder}}
  min: number;
  max: number;
  defaultValue: number;
  description?: string;
}

/**
 * SystemPromptConfig interface
 *
 * Configuration for system-level prompts and controls.
 *
 * @property id - Unique identifier for the config.
 * @property name - Name of the configuration.
 * @property isDefault - Boolean indicating if this is the default configuration.
 * @property prompts - Object containing primary, mixer, normalizer, and schema inference prompt templates.
 * @property customSliders - Array of custom sliders available in this configuration.
 * @property createdAt - ISO timestamp string of creation.
 * @property updatedAt - ISO timestamp string of last update.
 */
export interface SystemPromptConfig {
  id: string;
  name: string;
  isDefault: boolean;
  prompts: {
    primary: string;
    mixer: string;
    normalizer: string;
    schemaInference: string;
  };
  customSliders: CustomSlider[];
  createdAt: string;
  updatedAt: string;
}

/**
 * OutputFormat interface
 *
 * Defines an output format for the generation.
 *
 * @property id - Unique identifier for the format.
 * @property name - Display name of the format.
 * @property isBuiltIn - Boolean indicating if it is a built-in format.
 * @property description - Optional description of the format.
 */
export interface OutputFormat {
  id: string;
  name: string;
  isBuiltIn: boolean;
  description?: string;
}

/**
 * ModelSettings interface
 *
 * Settings specific to the underlying AI model.
 *
 * @property modelName - The name of the model to use.
 * @property maxTokens - Maximum number of tokens to generate (optional).
 * @property temperature - Sampling temperature (optional).
 * @property topP - Top-P sampling parameter (optional).
 */
export interface ModelSettings {
  modelName: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * AppSettings interface
 *
 * Global application settings persisted in storage.
 *
 * @property id - Unique identifier for the settings object.
 * @property modelSettings - Current model configuration.
 * @property defaultSchemaKeys - Default schema keys to use.
 * @property outputFormats - Available output formats.
 * @property activePromptConfigId - ID of the currently active prompt configuration.
 * @property updatedAt - ISO timestamp string of last update.
 */
export interface AppSettings {
  id: string;
  modelSettings: ModelSettings;
  defaultSchemaKeys: string[];
  outputFormats: OutputFormat[];
  activePromptConfigId: string;
  updatedAt: string;
}

/**
 * ExportedConfig interface
 *
 * Structure for exporting configuration to a file.
 *
 * @property version - Version string of the export format.
 * @property exportedAt - ISO timestamp string of export time.
 * @property settings - The prompt settings (excluding legacy textDirection).
 * @property modelSettings - The model settings.
 * @property outputFormats - The output formats.
 * @property customSliders - Optional array of custom sliders.
 */
export interface ExportedConfig {
  version: string;
  exportedAt: string;
  settings: Omit<PromptSettings, 'textDirection'>; // Export mix options, not legacy textDirection
  modelSettings: ModelSettings;
  outputFormats: OutputFormat[];
  customSliders?: CustomSlider[];
}

// ==================== Intermediate Representation ====================
// Export all intermediate types for multi-model portability
export * from './types/intermediate';

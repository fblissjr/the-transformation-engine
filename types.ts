
export interface MediaReference {
  id: string;
  type: 'image' | 'video';
  dataUrl?: string; // base64 encoded data URL (legacy, being phased out)
  blobId?: string; // Reference to blob in media store (new approach)
  filename: string;
  mimeType: string;
  thumbnail?: string; // smaller version for display (base64, max 200x200)
}

export interface MediaBlob {
  id: string;
  blob: Blob;
  mimeType: string;
  uploadedAt: string;
}

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
}

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

export interface DialogueLine {
  id: string;
  character: string;
  line: string;
  delivery: string;
}

export interface Soundscape {
  soundEffects: string;
  musicDirection: string;
}

export interface Pacing {
  timingNotes: string;
}

export interface MixOption {
  id: string;
  name: string;
  instruction: string; // Instruction to LLM on how to apply this option
  isBuiltIn: boolean;
  isEnabled: boolean;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface CustomSlider {
  id: string;
  label: string;
  placeholder: string; // Used in prompt template as {{placeholder}}
  min: number;
  max: number;
  defaultValue: number;
  description?: string;
}

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

export interface OutputFormat {
  id: string;
  name: string;
  isBuiltIn: boolean;
  description?: string;
}

export interface ModelSettings {
  modelName: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface AppSettings {
  id: string;
  modelSettings: ModelSettings;
  defaultSchemaKeys: string[];
  outputFormats: OutputFormat[];
  activePromptConfigId: string;
  updatedAt: string;
}

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
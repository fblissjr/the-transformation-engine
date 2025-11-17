// Provider abstraction layer for multi-LLM support

export type ProviderType = "openrouter" | "openai" | "gemini" | "local" | "custom";

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProviderKey {
  id: string;
  providerId: string;
  encryptedKey: string; // AES-GCM encrypted
  label?: string; // Optional label (e.g., "Work account", "Personal")
  ttl: number; // milliseconds
  createdAt: number;
  expiresAt: number;
}

export interface ModelCapabilities {
  vision: boolean;
  video: boolean;
  streaming: boolean;
  jsonMode: boolean;
  maxContextTokens: number;
  maxOutputTokens: number;
}

export interface Model {
  id: string;
  name: string;
  providerId: string;
  capabilities: ModelCapabilities;
  pricing?: {
    inputPerMillion: number;
    outputPerMillion: number;
  };
  description?: string;
  tags?: string[];
}

// Multimodal content support for vision models
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string; // base64 data URL or URL
  mimeType: string; // e.g., "image/jpeg", "image/png"
}

export type MessageContent = string | Array<TextContent | ImageContent>;

export interface GenerateRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: MessageContent;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  responseFormat?: 'json' | 'text'; // JSON mode for structured outputs
}

export interface GenerateResponse {
  id: string;
  content: string;
  model: string;
  providerId: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: "stop" | "length" | "error";
  metadata?: {
    providerName?: string;
    latencyMs?: number;
  };
}

export interface IProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;

  // Core methods
  listModels(): Promise<Model[]>;
  generate(request: GenerateRequest): Promise<GenerateResponse>;

  // Optional streaming
  generateStream?(
    request: GenerateRequest,
    onToken: (token: string) => void,
    onComplete: (response: GenerateResponse) => void,
    onError: (error: Error) => void
  ): Promise<void>;

  // Optional JSON mode (for structured outputs like schema inference)
  generateJson?(request: GenerateRequest): Promise<any>;

  // Optional image generation (Gemini only for now)
  generateImage?(params: {
    prompt: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    negativePrompt?: string;
    numberOfImages?: number;
  }): Promise<{ imageData: string; mimeType: string }>;

  // Optional image editing (Gemini only for now)
  editImage?(params: {
    sourceImageData: string;
    sourceImageMimeType: string;
    instruction: string;
  }): Promise<{ imageData: string; mimeType: string }>;

  // Capabilities
  readonly supportsVision: boolean;
  readonly supportsVideo: boolean;
  readonly supportsStreaming: boolean;
  readonly supportsJsonMode: boolean;
  readonly supportsImageGeneration?: boolean;
}

export interface TaskAssignment {
  taskId: string; // "primary_generation", "mix_prompts", etc.
  providerId: string;
  modelId: string;
  enableRewrite: boolean; // Optional post-processing
  enableStreaming: boolean; // Enable streaming for this task

  // Sampler settings (per-task defaults, can be overridden per-generation)
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  repetitionPenalty?: number;
  minP?: number;

  updatedAt: number;
}

export interface TokenUsage {
  id: string;
  taskId: string;
  providerId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: number;
  cost?: number;
}

// Task IDs (all possible LLM tasks in the app)
export const TASK_IDS = {
  PRIMARY_GENERATION: "primary_generation",
  INTERMEDIATE_GENERATION: "intermediate_generation",
  MIX_PROMPTS: "mix_prompts",
  NORMALIZE: "normalize",
  SCHEMA_INFERENCE: "schema_inference",
  MEDIA_DESCRIPTION: "media_description",
  TRANSFORM: "transform",
  MODEL_CONVERSION: "model_conversion",
  PROMPT_REWRITE: "prompt_rewrite",
  // Image Studio tasks
  IMAGE_GENERATION: "image_generation",
  IMAGE_EDITING: "image_editing",
  IMAGE_ANALYSIS: "image_analysis",
  IMAGE_QUALITY_SCORING: "image_quality_scoring",
  // Object Library tasks (Intermediate v3.0)
  LLM_DERIVE_SCHEMA: "llm_derive_schema",
  LLM_EXTRACT_OBJECT: "llm_extract_object",
  LLM_OBJECT_EDIT: "llm_object_edit",
} as const;

export type TaskId = typeof TASK_IDS[keyof typeof TASK_IDS];

// Task metadata (what each task requires)
export interface TaskMetadata {
  id: TaskId;
  name: string;
  description: string;
  requiresVision: boolean;
  requiresVideo: boolean;
  requiresJsonMode: boolean;
  defaultTemperature: number;
  defaultMaxTokens: number;
}

export const TASK_METADATA: Record<TaskId, TaskMetadata> = {
  [TASK_IDS.PRIMARY_GENERATION]: {
    id: TASK_IDS.PRIMARY_GENERATION,
    name: "Primary Generation",
    description: "Generate structured prompts from natural language",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 4096,
  },
  [TASK_IDS.INTERMEDIATE_GENERATION]: {
    id: TASK_IDS.INTERMEDIATE_GENERATION,
    name: "Intermediate Generation",
    description: "Generate model-agnostic semantic structure",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 3072,
  },
  [TASK_IDS.MIX_PROMPTS]: {
    id: TASK_IDS.MIX_PROMPTS,
    name: "Mix Prompts",
    description: "Synesthetic blending of multiple prompts",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 4096,
  },
  [TASK_IDS.NORMALIZE]: {
    id: TASK_IDS.NORMALIZE,
    name: "Normalize",
    description: "Transform structured output to plain English",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 2048,
  },
  [TASK_IDS.SCHEMA_INFERENCE]: {
    id: TASK_IDS.SCHEMA_INFERENCE,
    name: "Schema Inference",
    description: "AI-suggested schema keys",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: true,
    defaultTemperature: 1.0,
    defaultMaxTokens: 1024,
  },
  [TASK_IDS.MEDIA_DESCRIPTION]: {
    id: TASK_IDS.MEDIA_DESCRIPTION,
    name: "Media Description",
    description: "Analyze images and videos",
    requiresVision: true,
    requiresVideo: true,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 2048,
  },
  [TASK_IDS.TRANSFORM]: {
    id: TASK_IDS.TRANSFORM,
    name: "Transform",
    description: "Custom output transformations",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 2048,
  },
  [TASK_IDS.MODEL_CONVERSION]: {
    id: TASK_IDS.MODEL_CONVERSION,
    name: "Model Conversion",
    description: "Convert between Sora 2, Veo 3, Generic formats",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 4096,
  },
  [TASK_IDS.PROMPT_REWRITE]: {
    id: TASK_IDS.PROMPT_REWRITE,
    name: "Prompt Rewrite",
    description: "Rewrite prompt in target model family's style",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 4096,
  },
  [TASK_IDS.IMAGE_GENERATION]: {
    id: TASK_IDS.IMAGE_GENERATION,
    name: "Image Generation",
    description: "Generate images from text prompts",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 1024,
  },
  [TASK_IDS.IMAGE_EDITING]: {
    id: TASK_IDS.IMAGE_EDITING,
    name: "Image Editing",
    description: "Edit existing images with instructions",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 1024,
  },
  [TASK_IDS.IMAGE_ANALYSIS]: {
    id: TASK_IDS.IMAGE_ANALYSIS,
    name: "Image Analysis",
    description: "Analyze image quality and content",
    requiresVision: true,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 2048,
  },
  [TASK_IDS.IMAGE_QUALITY_SCORING]: {
    id: TASK_IDS.IMAGE_QUALITY_SCORING,
    name: "Image Quality Scoring",
    description: "Score image quality across 4 dimensions",
    requiresVision: true,
    requiresVideo: false,
    requiresJsonMode: true,
    defaultTemperature: 1.0,
    defaultMaxTokens: 1024,
  },
  [TASK_IDS.LLM_DERIVE_SCHEMA]: {
    id: TASK_IDS.LLM_DERIVE_SCHEMA,
    name: "Derive Object Schema",
    description: "Analyze source material and derive appropriate object schema",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: true,
    defaultTemperature: 1.0,
    defaultMaxTokens: 2048,
  },
  [TASK_IDS.LLM_EXTRACT_OBJECT]: {
    id: TASK_IDS.LLM_EXTRACT_OBJECT,
    name: "Extract Object Data",
    description: "Extract structured object data from source using schema",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: true,
    defaultTemperature: 1.0,
    defaultMaxTokens: 3072,
  },
  [TASK_IDS.LLM_OBJECT_EDIT]: {
    id: TASK_IDS.LLM_OBJECT_EDIT,
    name: "Edit Object with LLM",
    description: "Edit object data with natural language instructions",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: true,
    defaultTemperature: 1.0,
    defaultMaxTokens: 3072,
  },
};

// Provider abstraction layer for multi-LLM support

/** Type of AI provider */
export type ProviderType = "openrouter" | "openai" | "gemini" | "local" | "custom";

/** Provider configuration */
export interface Provider {
  /** Unique ID */
  id: string;
  /** Display name */
  name: string;
  /** Provider type */
  type: ProviderType;
  /** Base URL for API calls */
  baseUrl: string;
  /** Whether the provider is enabled */
  enabled: boolean;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/** Provider API key */
export interface ProviderKey {
  /** Unique ID */
  id: string;
  /** ID of the provider */
  providerId: string;
  /** AES-GCM encrypted API key */
  encryptedKey: string;
  /** Optional label */
  label?: string;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Creation timestamp */
  createdAt: number;
  /** Expiration timestamp */
  expiresAt: number;
}

/** Capabilities of a specific model */
export interface ModelCapabilities {
  /** Supports vision/image input */
  vision: boolean;
  /** Supports video input */
  video: boolean;
  /** Supports streaming response */
  streaming: boolean;
  /** Supports JSON mode output */
  jsonMode: boolean;
  /** Maximum context window tokens */
  maxContextTokens: number;
  /** Maximum output tokens */
  maxOutputTokens: number;
}

/** AI Model definition */
export interface Model {
  /** Unique ID */
  id: string;
  /** Display name */
  name: string;
  /** ID of the provider */
  providerId: string;
  /** Model capabilities */
  capabilities: ModelCapabilities;
  /** Pricing information per million tokens */
  pricing?: {
    inputPerMillion: number;
    outputPerMillion: number;
  };
  /** Description of the model */
  description?: string;
  /** Categorization tags */
  tags?: string[];
}

// Multimodal content support for vision models
/** Text content part for multimodal messages */
export interface TextContent {
  /** Content type discriminator */
  type: 'text';
  /** The text content */
  text: string;
}

/** Image content part for multimodal messages */
export interface ImageContent {
  /** Content type discriminator */
  type: 'image';
  /** Base64 data or URL */
  data: string;
  /** MIME type (e.g., "image/jpeg") */
  mimeType: string;
}

/** Message content can be string or array of multimodal parts */
export type MessageContent = string | Array<TextContent | ImageContent>;

/** Request payload for content generation */
export interface GenerateRequest {
  /** Model ID to use */
  model: string;
  /** List of messages in the conversation */
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: MessageContent;
  }>;
  /** Sampling temperature */
  temperature?: number;
  /** Maximum output tokens */
  maxTokens?: number;
  /** Top-P sampling */
  topP?: number;
  /** Enable streaming */
  stream?: boolean;
  /** Response format preference */
  responseFormat?: 'json' | 'text'; // JSON mode for structured outputs
}

/** Response from content generation */
export interface GenerateResponse {
  /** Unique ID of the response */
  id: string;
  /** Generated content text */
  content: string;
  /** Model used */
  model: string;
  /** Provider ID used */
  providerId: string;
  /** Token usage statistics */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Reason for stopping generation */
  finishReason: "stop" | "length" | "error";
  /** Additional metadata */
  metadata?: {
    providerName?: string;
    latencyMs?: number;
  };
}

/** Interface for provider implementations */
export interface IProvider {
  /** Unique ID */
  readonly id: string;
  /** Display name */
  readonly name: string;
  /** Provider type */
  readonly type: ProviderType;

  // Core methods
  /** List available models */
  listModels(): Promise<Model[]>;
  /** Generate content */
  generate(request: GenerateRequest): Promise<GenerateResponse>;

  // Optional streaming
  /** Generate content with streaming */
  generateStream?(
    request: GenerateRequest,
    onToken: (token: string) => void,
    onComplete: (response: GenerateResponse) => void,
    onError: (error: Error) => void
  ): Promise<void>;

  // Optional JSON mode (for structured outputs like schema inference)
  /** Generate JSON content */
  generateJson?(request: GenerateRequest): Promise<any>;

  // Optional image generation (Gemini only for now)
  /** Generate image from prompt */
  generateImage?(params: {
    prompt: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    negativePrompt?: string;
    numberOfImages?: number;
  }): Promise<{ imageData: string; mimeType: string }>;

  // Optional image editing (Gemini only for now)
  /** Edit image with instruction */
  editImage?(params: {
    sourceImageData: string;
    sourceImageMimeType: string;
    instruction: string;
  }): Promise<{ imageData: string; mimeType: string }>;

  // Capabilities
  /** Supports vision input */
  readonly supportsVision: boolean;
  /** Supports video input */
  readonly supportsVideo: boolean;
  /** Supports streaming */
  readonly supportsStreaming: boolean;
  /** Supports JSON mode */
  readonly supportsJsonMode: boolean;
  /** Supports image generation */
  readonly supportsImageGeneration?: boolean;
}

/** Assignment of a task to a specific provider and model */
export interface TaskAssignment {
  /** Task ID */
  taskId: string;
  /** Provider ID */
  providerId: string;
  /** Model ID */
  modelId: string;
  /** Enable optional post-processing rewrite */
  enableRewrite: boolean;
  /** Enable streaming for this task */
  enableStreaming: boolean;

  // Sampler settings (per-task defaults, can be overridden per-generation)
  /** Default temperature */
  temperature: number;
  /** Default max tokens */
  maxTokens: number;
  /** Default top-P */
  topP: number;
  /** Default top-K */
  topK?: number;
  /** Default repetition penalty */
  repetitionPenalty?: number;
  /** Default min-P */
  minP?: number;

  /** Last update timestamp */
  updatedAt: number;
}

/** Token usage record */
export interface TokenUsage {
  /** Unique ID */
  id: string;
  /** Task ID */
  taskId: string;
  /** Provider ID */
  providerId: string;
  /** Model ID */
  modelId: string;
  /** Input tokens used */
  inputTokens: number;
  /** Output tokens used */
  outputTokens: number;
  /** Timestamp */
  timestamp: number;
  /** Estimated cost */
  cost?: number;
}

// Task IDs (all possible LLM tasks in the app)
/** Enumeration of all available LLM task IDs */
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
  IMAGE_INTERMEDIATE_GENERATION: "image_intermediate_generation",
  // Object Library tasks (Intermediate v3.0)
  LLM_DERIVE_SCHEMA: "llm_derive_schema",
  LLM_EXTRACT_OBJECT: "llm_extract_object",
  LLM_OBJECT_EDIT: "llm_object_edit",
} as const;

/** Type definition for Task ID */
export type TaskId = typeof TASK_IDS[keyof typeof TASK_IDS];

// Task metadata (what each task requires)
/** Metadata definition for a task */
export interface TaskMetadata {
  /** Task ID */
  id: TaskId;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Requires vision capability */
  requiresVision: boolean;
  /** Requires video capability */
  requiresVideo: boolean;
  /** Requires JSON mode capability */
  requiresJsonMode: boolean;
  /** Default temperature setting */
  defaultTemperature: number;
  /** Default max tokens setting */
  defaultMaxTokens: number;
}

/** Registry of metadata for all tasks */
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
  [TASK_IDS.IMAGE_INTERMEDIATE_GENERATION]: {
    id: TASK_IDS.IMAGE_INTERMEDIATE_GENERATION,
    name: "Image Intermediate Generation",
    description: "Generate structured YAML intermediate from text prompt",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 1.0,
    defaultMaxTokens: 2048,
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

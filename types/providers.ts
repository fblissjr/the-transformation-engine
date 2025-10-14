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

export interface GenerateRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
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

  // Capabilities
  readonly supportsVision: boolean;
  readonly supportsVideo: boolean;
  readonly supportsStreaming: boolean;
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
    defaultTemperature: 0.7,
    defaultMaxTokens: 4096,
  },
  [TASK_IDS.INTERMEDIATE_GENERATION]: {
    id: TASK_IDS.INTERMEDIATE_GENERATION,
    name: "Intermediate Generation",
    description: "Generate model-agnostic semantic structure",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 0.7,
    defaultMaxTokens: 3072,
  },
  [TASK_IDS.MIX_PROMPTS]: {
    id: TASK_IDS.MIX_PROMPTS,
    name: "Mix Prompts",
    description: "Synesthetic blending of multiple prompts",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 0.8,
    defaultMaxTokens: 4096,
  },
  [TASK_IDS.NORMALIZE]: {
    id: TASK_IDS.NORMALIZE,
    name: "Normalize",
    description: "Transform structured output to plain English",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 0.5,
    defaultMaxTokens: 2048,
  },
  [TASK_IDS.SCHEMA_INFERENCE]: {
    id: TASK_IDS.SCHEMA_INFERENCE,
    name: "Schema Inference",
    description: "AI-suggested schema keys",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: true,
    defaultTemperature: 0.3,
    defaultMaxTokens: 1024,
  },
  [TASK_IDS.MEDIA_DESCRIPTION]: {
    id: TASK_IDS.MEDIA_DESCRIPTION,
    name: "Media Description",
    description: "Analyze images and videos",
    requiresVision: true,
    requiresVideo: true,
    requiresJsonMode: false,
    defaultTemperature: 0.5,
    defaultMaxTokens: 2048,
  },
  [TASK_IDS.TRANSFORM]: {
    id: TASK_IDS.TRANSFORM,
    name: "Transform",
    description: "Custom output transformations",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 0.5,
    defaultMaxTokens: 2048,
  },
  [TASK_IDS.MODEL_CONVERSION]: {
    id: TASK_IDS.MODEL_CONVERSION,
    name: "Model Conversion",
    description: "Convert between Sora 2, Veo 3, Generic formats",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 0.5,
    defaultMaxTokens: 4096,
  },
  [TASK_IDS.PROMPT_REWRITE]: {
    id: TASK_IDS.PROMPT_REWRITE,
    name: "Prompt Rewrite",
    description: "Rewrite prompt in target model family's style",
    requiresVision: false,
    requiresVideo: false,
    requiresJsonMode: false,
    defaultTemperature: 0.7,
    defaultMaxTokens: 4096,
  },
};

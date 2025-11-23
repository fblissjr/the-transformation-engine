// Multi-turn conversation system for refinement and iteration

import type { TaskId } from "./providers";

/**
 * Represents a single turn in a conversation (user input + system response).
 */
export interface ConversationTurn {
  /** Unique ID for the turn */
  id: string;
  /** ID of the conversation this turn belongs to */
  conversationId: string;
  /** The task ID associated with this turn */
  taskId: TaskId;
  /** Sequential number of the turn in the conversation */
  turnNumber: number;

  // Input
  /** The user's input prompt */
  userPrompt: string;
  /** The system prompt used for generation */
  systemPrompt: string;

  // Output
  /** The model's generated response */
  response: string;

  // Generation settings
  /** ID of the provider used */
  providerId: string;
  /** ID of the model used */
  modelId: string;
  /** Sampling temperature */
  temperature: number;
  /** Maximum tokens for generation */
  maxTokens: number;
  /** Top-P sampling parameter */
  topP?: number;

  // Metadata
  /** Token usage statistics */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Generation latency in milliseconds */
  latencyMs: number;
  /** Timestamp of completion */
  timestamp: number;

  // Optional refinement context
  /** ID of the parent turn if this is a refinement */
  parentTurnId?: string;
  /** User instruction for refinement */
  refinementInstruction?: string;
}

/**
 * Represents a multi-turn conversation.
 */
export interface Conversation {
  /** Unique ID for the conversation */
  id: string;
  /** The task ID associated with the conversation */
  taskId: TaskId;
  /** Conversation title */
  title: string;
  /** List of conversation turns */
  turns: ConversationTurn[];
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;

  // Associated prompt (if saved to library)
  /** Linked prompt ID in the library */
  promptId?: string;

  // Metadata
  /** Total tokens used across all turns */
  totalTokens: number;
  /** Total estimated cost (if available) */
  totalCost?: number;
}

/**
 * Tracks the state of a streaming generation.
 */
export interface StreamingState {
  /** Whether streaming is currently active */
  isStreaming: boolean;
  /** Content accumulated so far */
  accumulatedContent: string;
  /** Current count of tokens received */
  currentTokenCount: number;
  /** Tokens per second rate */
  tokensPerSecond: number;
  /** Start timestamp of the stream */
  startTime: number;
}

/**
 * Sampler settings that can be adjusted per-task or per-generation.
 */
export interface SamplerSettings {
  /** Sampling temperature (randomness) */
  temperature: number;
  /** Maximum number of tokens to generate */
  maxTokens: number;
  /** Nucleus sampling (top-p) */
  topP: number;
  /** Top-k sampling */
  topK?: number;
  /** Repetition penalty */
  repetitionPenalty?: number;
  /** Minimum probability threshold (min-p) */
  minP?: number;
}

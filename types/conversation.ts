// Multi-turn conversation system for refinement and iteration

import type { TaskId } from "./providers";

export interface ConversationTurn {
  id: string;
  conversationId: string;
  taskId: TaskId;
  turnNumber: number; // 1, 2, 3, etc.

  // Input
  userPrompt: string;
  systemPrompt: string;

  // Output
  response: string;

  // Generation settings
  providerId: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP?: number;

  // Metadata
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  timestamp: number;

  // Optional refinement context
  parentTurnId?: string; // If this is a refinement of a previous turn
  refinementInstruction?: string; // What the user asked to change
}

export interface Conversation {
  id: string;
  taskId: TaskId;
  title: string; // Auto-generated or user-set
  turns: ConversationTurn[];
  createdAt: number;
  updatedAt: number;

  // Associated prompt (if saved to library)
  promptId?: string;

  // Metadata
  totalTokens: number; // Sum of all turns
  totalCost?: number; // If pricing available
}

export interface StreamingState {
  isStreaming: boolean;
  accumulatedContent: string;
  currentTokenCount: number;
  tokensPerSecond: number;
  startTime: number;
}

// Sampler settings that can be adjusted per-task or per-generation
export interface SamplerSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  repetitionPenalty?: number;
  minP?: number;
}

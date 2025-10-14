import type {
  TaskId,
  GenerateRequest,
  GenerateResponse,
  IProvider,
} from "../types/providers";
import type { ConversationTurn, SamplerSettings } from "../types/conversation";
import { taskAssignmentService } from "./taskAssignmentService";
import { conversationService } from "./conversationService";
import { tokenTrackingService } from "./tokenTrackingService";
import { providerService } from "./providerService";
import { ProviderRegistry } from "./providerRegistry";

export interface ExecuteTaskOptions {
  // Conversation context
  conversationId?: string;
  parentTurnId?: string;
  refinementInstruction?: string;

  // Override sampler settings (optional)
  overrideSampler?: Partial<SamplerSettings>;

  // Override streaming (optional)
  enableStreaming?: boolean;

  // Streaming callbacks
  onToken?: (token: string) => void;
  onProgress?: (state: {
    accumulatedContent: string;
    currentTokenCount: number;
    tokensPerSecond: number;
  }) => void;
  onError?: (error: Error) => void;
}

export class TaskRouter {
  private providerRegistry: ProviderRegistry;

  constructor() {
    this.providerRegistry = new ProviderRegistry();
  }

  /**
   * Execute a task with automatic provider routing
   */
  async executeTask(
    taskId: TaskId,
    userPrompt: string,
    systemPrompt: string,
    options: ExecuteTaskOptions = {}
  ): Promise<ConversationTurn> {
    const startTime = Date.now();

    try {
      // 1. Get task assignment (provider + model + sampler settings)
      const assignment = await taskAssignmentService.getOrCreateAssignment(
        taskId
      );

      // 2. Get provider instance
      const provider = await this.providerRegistry.getProvider(
        assignment.providerId
      );

      if (!provider) {
        throw new Error(`Provider ${assignment.providerId} not found`);
      }

      // 3. Get API key
      const apiKey = await providerService.getFirstValidKey(
        assignment.providerId
      );

      if (!apiKey) {
        throw new Error(
          `No valid API key found for provider ${assignment.providerId}`
        );
      }

      // 4. Build GenerateRequest with sampler settings
      const samplerSettings: SamplerSettings = {
        temperature: assignment.temperature,
        maxTokens: assignment.maxTokens,
        topP: assignment.topP,
        topK: assignment.topK,
        repetitionPenalty: assignment.repetitionPenalty,
        minP: assignment.minP,
        ...options.overrideSampler, // Apply overrides
      };

      const request: GenerateRequest = {
        model: assignment.modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: samplerSettings.temperature,
        maxTokens: samplerSettings.maxTokens,
        topP: samplerSettings.topP,
      };

      // 5. Determine if streaming
      const useStreaming =
        options.enableStreaming !== undefined
          ? options.enableStreaming
          : assignment.enableStreaming;

      // 6. Execute generation
      let response: GenerateResponse;

      if (useStreaming && provider.generateStream) {
        response = await this.executeStreaming(
          provider,
          request,
          options.onToken,
          options.onProgress,
          options.onError
        );
      } else {
        response = await provider.generate(request);
      }

      // 7. Calculate latency
      const latencyMs = Date.now() - startTime;

      // 8. Create or get conversation
      let conversationId = options.conversationId;
      if (!conversationId) {
        const conversation = await conversationService.createConversation(
          taskId
        );
        conversationId = conversation.id;
      }

      // 9. Create conversation turn
      const turn = await conversationService.addTurn(conversationId, {
        conversationId,
        taskId,
        userPrompt,
        systemPrompt,
        response: response.content,
        providerId: assignment.providerId,
        modelId: response.model,
        temperature: samplerSettings.temperature,
        maxTokens: samplerSettings.maxTokens,
        topP: samplerSettings.topP,
        usage: {
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
        },
        latencyMs,
        parentTurnId: options.parentTurnId,
        refinementInstruction: options.refinementInstruction,
      });

      // 10. Track token usage
      await tokenTrackingService.recordUsage({
        taskId,
        providerId: assignment.providerId,
        modelId: response.model,
        inputTokens: response.usage.promptTokens,
        outputTokens: response.usage.completionTokens,
        cost: this.calculateCost(response, assignment.providerId),
      });

      return turn;
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Execute streaming generation
   */
  private async executeStreaming(
    provider: IProvider,
    request: GenerateRequest,
    onToken?: (token: string) => void,
    onProgress?: (state: any) => void,
    onError?: (error: Error) => void
  ): Promise<GenerateResponse> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let accumulatedContent = "";
      let currentTokenCount = 0;

      provider.generateStream!(
        request,
        // onToken callback
        (token: string) => {
          accumulatedContent += token;
          currentTokenCount++;

          if (onToken) {
            onToken(token);
          }

          if (onProgress) {
            const elapsed = (Date.now() - startTime) / 1000;
            const tokensPerSecond = currentTokenCount / elapsed;

            onProgress({
              accumulatedContent,
              currentTokenCount,
              tokensPerSecond,
            });
          }
        },
        // onComplete callback
        (response: GenerateResponse) => {
          resolve(response);
        },
        // onError callback
        (error: Error) => {
          if (onError) {
            onError(error);
          }
          reject(error);
        }
      );
    });
  }

  /**
   * Calculate cost for a generation (if pricing available)
   */
  private calculateCost(
    response: GenerateResponse,
    providerId: string
  ): number | undefined {
    // TODO: Fetch pricing from provider/model metadata
    // For now, return undefined (pricing not implemented)
    return undefined;
  }

  /**
   * Refine an existing turn (creates new turn with parentTurnId)
   */
  async refineTurn(
    turnId: string,
    refinementInstruction: string,
    options: Omit<ExecuteTaskOptions, "parentTurnId" | "refinementInstruction"> =
      {}
  ): Promise<ConversationTurn> {
    // Get original turn
    const originalTurn = await conversationService.getTurn(turnId);
    if (!originalTurn) {
      throw new Error(`Turn ${turnId} not found`);
    }

    // Get conversation
    const conversation = await conversationService.getConversation(
      originalTurn.conversationId
    );
    if (!conversation) {
      throw new Error(
        `Conversation ${originalTurn.conversationId} not found`
      );
    }

    // Build refinement user prompt
    const userPrompt = `${originalTurn.userPrompt}\n\nREFINEMENT: ${refinementInstruction}\n\nPREVIOUS OUTPUT:\n${originalTurn.response}`;

    // Execute task with parentTurnId set
    return this.executeTask(
      originalTurn.taskId,
      userPrompt,
      originalTurn.systemPrompt,
      {
        ...options,
        conversationId: originalTurn.conversationId,
        parentTurnId: turnId,
        refinementInstruction,
      }
    );
  }
}

export const taskRouter = new TaskRouter();

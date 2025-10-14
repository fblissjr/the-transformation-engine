import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  IProvider,
  ProviderType,
  Model,
  ModelCapabilities,
  GenerateRequest,
  GenerateResponse,
} from "../../types/providers";

export class GeminiProvider implements IProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "gemini";
  readonly supportsVision: boolean = true;
  readonly supportsVideo: boolean = true;
  readonly supportsStreaming: boolean = true;

  private apiKey: string;
  private baseUrl: string;

  constructor(id: string, name: string, apiKey: string, baseUrl?: string) {
    this.id = id;
    this.name = name;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  }

  async listModels(): Promise<Model[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();

      const models: Model[] = (data.models || [])
        .filter((model: any) =>
          model.supportedGenerationMethods?.includes("generateContent")
        )
        .map((model: any) => {
          const modelId = model.name.replace("models/", "");
          const capabilities = this.parseCapabilities(model);

          return {
            id: modelId,
            name: model.displayName || modelId,
            providerId: this.id,
            capabilities,
            description: model.description,
            tags: this.extractTags(model),
          };
        });

      return models;
    } catch (error) {
      console.error("Failed to list Gemini models:", error);
      throw new Error("Failed to fetch available models. Check your API key.");
    }
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({
      model: request.model,
      generationConfig: {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature,
        topP: request.topP,
      },
    });

    const startTime = Date.now();

    // Convert messages to Gemini format
    const prompt = this.convertMessagesToPrompt(request.messages);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const latencyMs = Date.now() - startTime;

    // Extract token usage
    const usage = {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    };

    return {
      id: crypto.randomUUID(),
      content: text,
      model: request.model,
      providerId: this.id,
      usage,
      finishReason: "stop",
      metadata: {
        providerName: this.name,
        latencyMs,
      },
    };
  }

  async generateStream(
    request: GenerateRequest,
    onToken: (token: string) => void,
    onComplete: (response: GenerateResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: request.model,
        generationConfig: {
          maxOutputTokens: request.maxTokens,
          temperature: request.temperature,
          topP: request.topP,
        },
      });

      const startTime = Date.now();
      const prompt = this.convertMessagesToPrompt(request.messages);

      const result = await model.generateContentStream(prompt);
      let fullText = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onToken(chunkText);
      }

      const finalResponse = await result.response;
      const latencyMs = Date.now() - startTime;

      const usage = {
        promptTokens: finalResponse.usageMetadata?.promptTokenCount || 0,
        completionTokens: finalResponse.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: finalResponse.usageMetadata?.totalTokenCount || 0,
      };

      const response: GenerateResponse = {
        id: crypto.randomUUID(),
        content: fullText,
        model: request.model,
        providerId: this.id,
        usage,
        finishReason: "stop",
        metadata: {
          providerName: this.name,
          latencyMs,
        },
      };

      onComplete(response);
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Private helper methods

  private convertMessagesToPrompt(
    messages: Array<{ role: string; content: string }>
  ): string {
    // Gemini API expects a single prompt string for simple cases
    // For multi-turn, we'd use the chat API, but for now we'll concatenate
    const systemMessages = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const userMessages = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n\n");

    if (systemMessages) {
      return `${systemMessages}\n\n${userMessages}`;
    }
    return userMessages;
  }

  private parseCapabilities(model: any): ModelCapabilities {
    const modelId = model.name.replace("models/", "").toLowerCase();

    return {
      vision: modelId.includes("vision") || modelId.includes("pro"),
      video: modelId.includes("vision") || modelId.includes("pro"),
      streaming: true,
      jsonMode: true,
      maxContextTokens: this.estimateContextSize(modelId),
      maxOutputTokens: this.estimateOutputSize(modelId),
    };
  }

  private estimateContextSize(modelId: string): number {
    if (modelId.includes("2.5")) return 1000000;
    if (modelId.includes("1.5")) return 2000000;
    return 128000;
  }

  private estimateOutputSize(modelId: string): number {
    if (modelId.includes("2.5")) return 8192;
    if (modelId.includes("1.5")) return 8192;
    return 4096;
  }

  private extractTags(model: any): string[] {
    const tags: string[] = [];
    const modelId = model.name.replace("models/", "").toLowerCase();

    if (modelId.includes("pro")) tags.push("pro");
    if (modelId.includes("flash")) tags.push("flash");
    if (modelId.includes("vision")) tags.push("vision");
    if (modelId.includes("2.5")) tags.push("latest");
    if (model.supportedGenerationMethods?.includes("generateContent"))
      tags.push("generation");

    return tags;
  }
}

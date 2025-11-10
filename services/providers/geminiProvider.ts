import { GoogleGenAI } from "@google/genai";
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
  readonly supportsJsonMode: boolean = true;

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
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const startTime = Date.now();

    // Convert messages to Gemini format
    const prompt = this.convertMessagesToPrompt(request.messages);

    const response = await ai.models.generateContent({
      model: request.model,
      config: {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature,
        topP: request.topP,
      },
      contents: prompt,
    });

    const latencyMs = Date.now() - startTime;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      const startTime = Date.now();
      const prompt = this.convertMessagesToPrompt(request.messages);

      const streamResponse = await ai.models.generateContentStream({
        model: request.model,
        config: {
          maxOutputTokens: request.maxTokens,
          temperature: request.temperature,
          topP: request.topP,
        },
        contents: prompt,
      });

      let fullText = "";

      for await (const chunk of streamResponse) {
        const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
        fullText += chunkText;
        onToken(chunkText);
      }

      const latencyMs = Date.now() - startTime;

      const usage = {
        promptTokens: 0, // Stream doesn't provide usage metadata in chunks
        completionTokens: 0,
        totalTokens: 0,
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

  async generateJson(request: GenerateRequest): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const prompt = this.convertMessagesToPrompt(request.messages);

    const response = await ai.models.generateContent({
      model: request.model,
      config: {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature,
        topP: request.topP,
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${text}`);
    }
  }

  // Private helper methods

  private convertMessagesToPrompt(
    messages: Array<{ role: string; content: any }>
  ): any {
    // Check if any message has multimodal content
    const hasMultimodal = messages.some(m => Array.isArray(m.content));

    if (!hasMultimodal) {
      // Simple text-only case - return string
      const systemMessages = messages
        .filter((m) => m.role === "system")
        .map((m) => m.content as string)
        .join("\n\n");
      const userMessages = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content as string)
        .join("\n\n");

      if (systemMessages) {
        return `${systemMessages}\n\n${userMessages}`;
      }
      return userMessages;
    }

    // Multimodal case - build Gemini parts format
    const parts: any[] = [];

    for (const message of messages) {
      if (typeof message.content === 'string') {
        // Text-only message
        parts.push({ text: message.content });
      } else if (Array.isArray(message.content)) {
        // Multimodal message
        for (const item of message.content) {
          if (item.type === 'text') {
            parts.push({ text: item.text });
          } else if (item.type === 'image') {
            // Extract base64 data from data URL
            const base64Data = item.data.split(',')[1] || item.data;
            parts.push({
              inlineData: {
                mimeType: item.mimeType,
                data: base64Data
              }
            });
          }
        }
      }
    }

    return { role: 'user', parts };
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

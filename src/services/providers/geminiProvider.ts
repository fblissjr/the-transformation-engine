import { GoogleGenAI } from "@google/genai";
import type {
  IProvider,
  ProviderType,
  Model,
  ModelCapabilities,
  GenerateRequest,
  GenerateResponse,
} from "../../types/providers";

/**
 * Gemini Provider Implementation
 * Adapts Google's Gemini API to the IProvider interface.
 * Supports text, vision, and image generation/editing.
 */
export class GeminiProvider implements IProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "gemini";
  readonly supportsVision: boolean = true;
  readonly supportsVideo: boolean = true;
  readonly supportsStreaming: boolean = true;
  readonly supportsJsonMode: boolean = true;
  readonly supportsImageGeneration: boolean = true;

  private apiKey: string;
  private baseUrl: string;

  /**
   * Constructs a new GeminiProvider instance.
   * @param id - Unique identifier for this provider instance.
   * @param name - Display name for the provider.
   * @param apiKey - API key for authentication.
   * @param baseUrl - Optional base URL for the API (defaults to Google's standard endpoint).
   */
  constructor(id: string, name: string, apiKey: string, baseUrl?: string) {
    this.id = id;
    this.name = name;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  }

  /**
   * Lists available models from the Gemini API.
   * Filters for models that support 'generateContent'.
   * @returns A Promise resolving to an array of Model objects.
   * @throws Error if the API request fails.
   */
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

  /**
   * Generates content using the specified model and request parameters.
   * @param request - The generation request containing model, messages, and config.
   * @returns A Promise resolving to a GenerateResponse object.
   */
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

  /**
   * Generates content in a streaming fashion.
   * @param request - The generation request.
   * @param onToken - Callback function invoked for each received token/chunk.
   * @param onComplete - Callback function invoked when generation is complete.
   * @param onError - Callback function invoked if an error occurs.
   * @returns A Promise that resolves when the stream setup is complete.
   */
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

  /**
   * Generates a JSON response from the model.
   * Enforces strict JSON output format.
   * @param request - The generation request.
   * @returns A Promise resolving to the parsed JSON object.
   * @throws Error if the response cannot be parsed as JSON.
   */
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

  /**
   * Converts standard message format to Gemini's specific prompt structure.
   * Handles both text-only and multimodal (image) content.
   * @param messages - Array of messages.
   * @returns The prompt structure expected by Gemini API.
   */
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

  /**
   * Infers model capabilities from the model object.
   * @param model - The raw model object from the API.
   * @returns The parsed ModelCapabilities.
   */
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

  /**
   * Estimates context window size based on model ID.
   * @param modelId - The model ID string.
   * @returns Estimated max context tokens.
   */
  private estimateContextSize(modelId: string): number {
    if (modelId.includes("2.5")) return 1000000;
    if (modelId.includes("1.5")) return 2000000;
    return 128000;
  }

  /**
   * Estimates max output tokens based on model ID.
   * @param modelId - The model ID string.
   * @returns Estimated max output tokens.
   */
  private estimateOutputSize(modelId: string): number {
    if (modelId.includes("2.5")) return 8192;
    if (modelId.includes("1.5")) return 8192;
    return 4096;
  }

  /**
   * Extracts tags from the model object for categorization.
   * @param model - The raw model object.
   * @returns Array of tag strings.
   */
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

  /**
   * Generates an image using the Gemini 2.5 Flash Image model.
   * @param params - Parameters for image generation (prompt, aspect ratio, etc.).
   * @returns A Promise resolving to an object containing base64 image data and MIME type.
   * @throws Error if the response does not contain image data.
   */
  async generateImage(params: {
    prompt: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    negativePrompt?: string;
    numberOfImages?: number;
  }): Promise<{ imageData: string; mimeType: string }> {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const model = 'gemini-2.5-flash-image';

    const config: any = {
      prompt: params.prompt,
    };

    if (params.aspectRatio) {
      config.aspectRatio = params.aspectRatio;
    }

    if (params.negativePrompt) {
      config.negativePrompt = params.negativePrompt;
    }

    if (params.numberOfImages) {
      config.numberOfImages = params.numberOfImages;
    }

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      config,
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData);

    if (!imagePart?.inlineData) {
      throw new Error('No image data in response');
    }

    return {
      imageData: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
    };
  }

  /**
   * Edits an existing image using the Gemini 2.5 Flash Image model.
   * @param params - Parameters for image editing (source image, instructions).
   * @returns A Promise resolving to the edited image data and MIME type.
   * @throws Error if the response does not contain edited image data.
   */
  async editImage(params: {
    sourceImageData: string;
    sourceImageMimeType: string;
    instruction: string;
  }): Promise<{ imageData: string; mimeType: string }> {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const model = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: params.sourceImageMimeType,
              data: params.sourceImageData,
            },
          },
          {
            text: params.instruction,
          },
        ],
      }],
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData);

    if (!imagePart?.inlineData) {
      throw new Error('No edited image data in response');
    }

    return {
      imageData: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
    };
  }
}

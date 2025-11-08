import type {
  IProvider,
  ProviderType,
  Model,
  GenerateRequest,
  GenerateResponse,
  ModelCapabilities,
} from "../../types/providers";

export class OpenRouterProvider implements IProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType = "openrouter";
  readonly supportsVision: boolean = true;
  readonly supportsVideo: boolean = false;
  readonly supportsStreaming: boolean = true;
  readonly supportsJsonMode: boolean = true;

  private apiKey: string;
  private baseUrl: string = "https://openrouter.ai/api/v1";

  constructor(id: string, name: string, apiKey: string) {
    this.id = id;
    this.name = name;
    this.apiKey = apiKey;
  }

  async listModels(): Promise<Model[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();

    return data.data.map((model: any) => {
      const capabilities: ModelCapabilities = {
        vision: model.architecture?.modality?.includes("image") ?? false,
        video: false, // OpenRouter doesn't support video input yet
        streaming: true, // All OpenRouter models support streaming
        jsonMode: model.supported_generation_methods?.includes("json") ?? false,
        maxContextTokens: model.context_length ?? 4096,
        maxOutputTokens: model.top_provider?.max_completion_tokens ?? 4096,
      };

      return {
        id: model.id,
        name: model.name || model.id,
        providerId: this.id,
        capabilities,
        pricing: model.pricing
          ? {
              inputPerMillion: parseFloat(model.pricing.prompt) * 1_000_000,
              outputPerMillion: parseFloat(model.pricing.completion) * 1_000_000,
            }
          : undefined,
        description: model.description,
        tags: this.extractTags(model),
      };
    });
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        top_p: request.topP ?? 1.0,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || `API request failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;

    return {
      id: data.id,
      content: data.choices[0]?.message?.content || "",
      model: data.model,
      providerId: this.id,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: this.mapFinishReason(data.choices[0]?.finish_reason),
      metadata: {
        providerName: data.provider || "OpenRouter",
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
    const startTime = Date.now();
    let accumulatedContent = "";
    let totalTokens = 0;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 4096,
          top_p: request.topP ?? 1.0,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || `API request failed: ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "" || !line.startsWith("data: ")) continue;

          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              accumulatedContent += content;
              totalTokens++;
              onToken(content);
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e);
          }
        }
      }

      const latencyMs = Date.now() - startTime;

      onComplete({
        id: `chatcmpl-${Date.now()}`,
        content: accumulatedContent,
        model: request.model,
        providerId: this.id,
        usage: {
          promptTokens: 0, // Not available in streaming
          completionTokens: totalTokens,
          totalTokens,
        },
        finishReason: "stop",
        metadata: {
          providerName: "OpenRouter",
          latencyMs,
        },
      });
    } catch (error) {
      onError(error as Error);
    }
  }

  private mapFinishReason(reason: string | undefined): "stop" | "length" | "error" {
    switch (reason) {
      case "stop":
        return "stop";
      case "length":
      case "max_tokens":
        return "length";
      default:
        return "error";
    }
  }

  async generateJson(request: GenerateRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        top_p: request.topP ?? 1.0,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || `API request failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${content}`);
    }
  }

  private extractTags(model: any): string[] {
    const tags: string[] = [];

    if (model.architecture?.modality?.includes("image")) tags.push("vision");
    if (model.pricing?.prompt === "0" && model.pricing?.completion === "0")
      tags.push("free");
    if (model.context_length >= 100000) tags.push("long-context");
    if (model.top_provider?.is_moderated) tags.push("moderated");

    return tags;
  }
}

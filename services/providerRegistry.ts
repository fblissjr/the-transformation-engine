import type { IProvider } from "../types/providers";
import { OpenRouterProvider } from "./providers/openrouterProvider";
import { GeminiProvider } from "./providers/geminiProvider";
import { providerService } from "./providerService";

/**
 * Registry for managing provider instances
 */
export class ProviderRegistry {
  private instances: Map<string, IProvider> = new Map();

  /**
   * Get provider instance by ID (creates if doesn't exist)
   */
  async getProvider(providerId: string): Promise<IProvider | null> {
    // Check if instance already exists
    if (this.instances.has(providerId)) {
      return this.instances.get(providerId)!;
    }

    // Get provider config from database
    const providerConfig = await providerService.getProvider(providerId);
    if (!providerConfig) {
      return null;
    }

    // Get API key
    const apiKey = await providerService.getFirstValidKey(providerId);
    if (!apiKey) {
      throw new Error(`No valid API key found for provider ${providerId}`);
    }

    // Create provider instance based on type
    let instance: IProvider;

    switch (providerConfig.type) {
      case "openrouter":
        instance = new OpenRouterProvider(
          providerConfig.id,
          providerConfig.name,
          apiKey
        );
        break;

      case "gemini":
        instance = new GeminiProvider(
          providerConfig.id,
          providerConfig.name,
          apiKey,
          providerConfig.baseUrl
        );
        break;

      case "openai":
        // TODO: Implement OpenAI provider
        throw new Error("OpenAI provider not yet implemented");

      case "local":
        // TODO: Implement local server provider
        throw new Error("Local provider not yet implemented");

      case "custom":
        throw new Error("Custom provider requires additional configuration");

      default:
        throw new Error(`Unknown provider type: ${providerConfig.type}`);
    }

    // Cache instance
    this.instances.set(providerId, instance);

    return instance;
  }

  /**
   * Remove provider instance from cache (forces recreation on next request)
   */
  clearProvider(providerId: string): void {
    this.instances.delete(providerId);
  }

  /**
   * Clear all cached instances
   */
  clearAll(): void {
    this.instances.clear();
  }

  /**
   * Get all active provider instances
   */
  getActiveProviders(): IProvider[] {
    return Array.from(this.instances.values());
  }
}

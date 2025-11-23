import type { IDBPDatabase } from "idb";
import type { Provider, ProviderKey, ProviderType } from "../types/providers";
import { encryptData, decryptData } from "./encryptedStorage";
import { getDB } from "./db/indexedDbService";

/**
 * ProviderService class
 *
 * Manages the lifecycle of AI providers and their API keys.
 * Supports adding, updating, deleting, and retrieving providers and keys.
 * Handles key encryption, decryption, and expiration.
 * Provides utility for testing provider connections.
 */
export class ProviderService {
  private async getDb(): Promise<IDBPDatabase> {
    return getDB();
  }

  // Provider CRUD
  /**
   * Adds a new provider.
   *
   * @param name - The display name of the provider.
   * @param type - The type of the provider (e.g., 'gemini', 'openrouter').
   * @param baseUrl - The base URL for the provider's API.
   * @returns The newly created Provider object.
   */
  async addProvider(
    name: string,
    type: ProviderType,
    baseUrl: string
  ): Promise<Provider> {
    const db = await this.getDb();
    const provider: Provider = {
      id: `provider_${type}_${Date.now()}`,
      name,
      type,
      baseUrl,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.put("providers", provider);
    return provider;
  }

  /**
   * Updates an existing provider.
   *
   * @param id - The ID of the provider to update.
   * @param updates - The partial updates to apply.
   * @returns The updated Provider object.
   * @throws Error if the provider is not found.
   */
  async updateProvider(
    id: string,
    updates: Partial<Omit<Provider, "id" | "createdAt">>
  ): Promise<Provider> {
    const db = await this.getDb();
    const existing = await db.get("providers", id);

    if (!existing) {
      throw new Error(`Provider ${id} not found`);
    }

    const updated: Provider = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    await db.put("providers", updated);
    return updated;
  }

  /**
   * Deletes a provider and all its associated keys.
   *
   * @param id - The ID of the provider to delete.
   */
  async deleteProvider(id: string): Promise<void> {
    const db = await this.getDb();

    // Delete all keys for this provider
    const keys = await this.getKeysForProvider(id);
    for (const key of keys) {
      await db.delete("providerKeys", key.id);
    }

    await db.delete("providers", id);
  }

  /**
   * Retrieves a provider by ID.
   *
   * @param id - The ID of the provider.
   * @returns The Provider object or undefined if not found.
   */
  async getProvider(id: string): Promise<Provider | undefined> {
    const db = await this.getDb();
    return db.get("providers", id);
  }

  /**
   * Retrieves all providers.
   *
   * @returns An array of all Provider objects.
   */
  async getAllProviders(): Promise<Provider[]> {
    const db = await this.getDb();
    return db.getAll("providers");
  }

  /**
   * Retrieves only enabled providers.
   *
   * @returns An array of enabled Provider objects.
   */
  async getEnabledProviders(): Promise<Provider[]> {
    const db = await this.getDb();
    const all = await db.getAll("providers");
    return all.filter((p) => p.enabled);
  }

  // Provider Key CRUD
  /**
   * Adds an API key for a provider.
   *
   * @param providerId - The ID of the provider.
   * @param apiKey - The API key string.
   * @param label - (Optional) A label for the key.
   * @param ttl - (Optional) Time-to-live in milliseconds. Defaults to 7 days.
   * @returns The created ProviderKey object.
   */
  async addProviderKey(
    providerId: string,
    apiKey: string,
    label?: string,
    ttl: number = 7 * 24 * 60 * 60 * 1000 // 7 days default
  ): Promise<ProviderKey> {
    const db = await this.getDb();

    // Encrypt the API key
    const encryptedKey = await encryptData(apiKey);

    const key: ProviderKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      providerId,
      encryptedKey,
      label,
      ttl,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    await db.put("providerKeys", key);
    return key;
  }

  /**
   * Deletes a provider key.
   *
   * @param keyId - The ID of the key to delete.
   */
  async deleteProviderKey(keyId: string): Promise<void> {
    const db = await this.getDb();
    await db.delete("providerKeys", keyId);
  }

  /**
   * Retrieves and decrypts a provider key by ID.
   *
   * @param keyId - The ID of the key.
   * @returns The decrypted API key string or null if not found or expired.
   */
  async getProviderKey(keyId: string): Promise<string | null> {
    const db = await this.getDb();
    const key = await db.get("providerKeys", keyId);

    if (!key) return null;

    // Check if expired
    if (Date.now() > key.expiresAt) {
      await this.deleteProviderKey(keyId);
      return null;
    }

    // Decrypt and return
    return decryptData(key.encryptedKey);
  }

  /**
   * Retrieves all valid keys for a specific provider.
   * Automatically cleans up expired keys.
   *
   * @param providerId - The ID of the provider.
   * @returns An array of valid ProviderKey objects.
   */
  async getKeysForProvider(providerId: string): Promise<ProviderKey[]> {
    const db = await this.getDb();
    const allKeys = await db.getAllFromIndex("providerKeys", "providerId", providerId);

    // Filter out expired keys
    const now = Date.now();
    const validKeys = allKeys.filter((key) => key.expiresAt > now);

    // Clean up expired keys
    const expiredKeys = allKeys.filter((key) => key.expiresAt <= now);
    for (const key of expiredKeys) {
      await this.deleteProviderKey(key.id);
    }

    return validKeys;
  }

  /**
   * Retrieves the first valid decrypted API key for a provider.
   *
   * @param providerId - The ID of the provider.
   * @returns The decrypted API key string or null if no valid keys exist.
   */
  async getFirstValidKey(providerId: string): Promise<string | null> {
    const keys = await this.getKeysForProvider(providerId);
    if (keys.length === 0) return null;

    // Return first valid key (decrypted)
    return this.getProviderKey(keys[0].id);
  }

  /**
   * Updates the expiration time of a provider key.
   *
   * @param keyId - The ID of the key to update.
   * @param ttl - The new time-to-live in milliseconds.
   * @throws Error if the key is not found.
   */
  async updateKeyExpiration(keyId: string, ttl: number): Promise<void> {
    const db = await this.getDb();
    const key = await db.get("providerKeys", keyId);

    if (!key) {
      throw new Error(`Provider key ${keyId} not found`);
    }

    key.ttl = ttl;
    key.expiresAt = Date.now() + ttl;

    await db.put("providerKeys", key);
  }

  // Utility
  /**
   * Removes all expired provider keys from the database.
   *
   * @returns The number of expired keys removed.
   */
  async cleanupExpiredKeys(): Promise<number> {
    const db = await this.getDb();
    const allKeys = await db.getAll("providerKeys");
    const now = Date.now();
    const expiredKeys = allKeys.filter((key) => key.expiresAt <= now);

    for (const key of expiredKeys) {
      await db.delete("providerKeys", key.id);
    }

    return expiredKeys.length;
  }

  /**
   * Tests the connection to a provider by attempting to list models.
   *
   * @param providerId - The ID of the provider to test.
   * @returns Object containing success status, potential error message, and model count.
   */
  async testConnection(providerId: string): Promise<{
    success: boolean;
    error?: string;
    modelCount?: number;
  }> {
    try {
      const provider = await this.getProvider(providerId);
      if (!provider) {
        return { success: false, error: "Provider not found" };
      }

      const apiKey = await this.getFirstValidKey(providerId);
      if (!apiKey) {
        return { success: false, error: "No valid API key found" };
      }

      // Build URL and headers based on provider type
      let url: string;
      const headers: Record<string, string> = {};

      if (provider.type === "gemini") {
        // Gemini uses query parameter authentication
        url = `${provider.baseUrl}/models?key=${apiKey}`;
      } else {
        // OpenRouter, OpenAI, etc. use Bearer token
        url = `${provider.baseUrl}/models`;
        headers.Authorization = `Bearer ${apiKey}`;
      }

      // Try to fetch models list as a connection test
      const response = await fetch(url, { headers });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      // Gemini returns { models: [...] }, OpenRouter returns { data: [...] }
      const modelCount = data.models?.length || data.data?.length || 0;

      return { success: true, modelCount };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const providerService = new ProviderService();

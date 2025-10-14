import type { IDBPDatabase } from "idb";
import type { Provider, ProviderKey, ProviderType } from "../types/providers";
import { encryptData, decryptData } from "./encryptedStorage";
import { getDB } from "./db/indexedDbService";

export class ProviderService {
  private async getDb(): Promise<IDBPDatabase> {
    return getDB();
  }

  // Provider CRUD
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

  async deleteProvider(id: string): Promise<void> {
    const db = await this.getDb();

    // Delete all keys for this provider
    const keys = await this.getKeysForProvider(id);
    for (const key of keys) {
      await db.delete("providerKeys", key.id);
    }

    await db.delete("providers", id);
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    const db = await this.getDb();
    return db.get("providers", id);
  }

  async getAllProviders(): Promise<Provider[]> {
    const db = await this.getDb();
    return db.getAll("providers");
  }

  async getEnabledProviders(): Promise<Provider[]> {
    const db = await this.getDb();
    const all = await db.getAll("providers");
    return all.filter((p) => p.enabled);
  }

  // Provider Key CRUD
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

  async deleteProviderKey(keyId: string): Promise<void> {
    const db = await this.getDb();
    await db.delete("providerKeys", keyId);
  }

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

  async getFirstValidKey(providerId: string): Promise<string | null> {
    const keys = await this.getKeysForProvider(providerId);
    if (keys.length === 0) return null;

    // Return first valid key (decrypted)
    return this.getProviderKey(keys[0].id);
  }

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

      // Try to fetch models list as a connection test
      const response = await fetch(`${provider.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const modelCount = data.data?.length || 0;

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

/**
 * Encrypted Storage Service
 *
 * Provides encrypted storage for sensitive data like API keys with TTL support.
 * Uses Web Crypto API for AES-GCM encryption.
 */

interface EncryptedEntry {
  ciphertext: string;
  iv: string;
  salt: string;
  expiresAt: number | null;
}

export interface StorageOptions {
  ttl?: number; // Time to live in milliseconds, null = no expiration
}

class EncryptedStorageService {
  private readonly STORAGE_PREFIX = 'enc_';

  /**
   * Derive encryption key from user's browser fingerprint
   */
  private async deriveKey(salt: Uint8Array): Promise<CryptoKey> {
    // Use a combination of browser characteristics as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(navigator.userAgent + navigator.language),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt and store data
   */
  async set(key: string, value: string, options: StorageOptions = {}): Promise<void> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cryptoKey = await this.deriveKey(salt);

      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        new TextEncoder().encode(value)
      );

      const entry: EncryptedEntry = {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
        iv: btoa(String.fromCharCode(...iv)),
        salt: btoa(String.fromCharCode(...salt)),
        expiresAt: options.ttl ? Date.now() + options.ttl : null,
      };

      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Retrieve and decrypt data
   */
  async get(key: string): Promise<string | null> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!storedData) return null;

      const entry: EncryptedEntry = JSON.parse(storedData);

      // Check expiration
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        await this.remove(key);
        return null;
      }

      const salt = Uint8Array.from(atob(entry.salt), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(entry.iv), c => c.charCodeAt(0));
      const ciphertext = Uint8Array.from(atob(entry.ciphertext), c => c.charCodeAt(0));

      const cryptoKey = await this.deriveKey(salt);

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        ciphertext
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      // If decryption fails, remove corrupted entry
      await this.remove(key);
      return null;
    }
  }

  /**
   * Remove encrypted data
   */
  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get expiration time for a key
   */
  async getExpiration(key: string): Promise<number | null> {
    const storedData = localStorage.getItem(this.STORAGE_PREFIX + key);
    if (!storedData) return null;

    const entry: EncryptedEntry = JSON.parse(storedData);
    return entry.expiresAt;
  }

  /**
   * Clear all encrypted entries
   */
  async clearAll(): Promise<void> {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }
}

export const encryptedStorage = new EncryptedStorageService();

/**
 * Standalone encrypt/decrypt functions for use in other services
 * These match the internal implementation of EncryptedStorageService
 */

interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const userAgent = navigator.userAgent || 'default-agent';
  const language = navigator.language || 'en-US';
  const fingerprint = `${userAgent}:${language}`;

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(fingerprint),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string): Promise<string> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const cryptoKey = await deriveKey(salt);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      new TextEncoder().encode(data)
    );

    const result: EncryptedData = {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt)),
    };

    return JSON.stringify(result);
  } catch (error) {
    console.error('Failed to encrypt data:', error);
    throw new Error('Encryption failed');
  }
}

export async function decryptData(encryptedString: string): Promise<string> {
  try {
    const entry: EncryptedData = JSON.parse(encryptedString);

    const ciphertext = Uint8Array.from(atob(entry.ciphertext), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(entry.iv), c => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(entry.salt), c => c.charCodeAt(0));

    const cryptoKey = await deriveKey(salt);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      ciphertext
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    throw new Error('Decryption failed');
  }
}

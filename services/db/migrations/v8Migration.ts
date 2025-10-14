import { openDB, type IDBPDatabase } from "idb";
import type { Provider, ProviderKey, TaskAssignment, TaskId } from "../../../types/providers";
import { TASK_IDS, TASK_METADATA } from "../../../types/providers";
import { encryptData } from "../../encryptedStorage";

const DB_NAME = "the-transformation-engine";

/**
 * Migrate from v7 to v8
 * - Adds providers, providerKeys, taskAssignments, conversations, conversationTurns, tokenUsage stores
 * - Auto-migrates existing Gemini API key to new provider system
 * - Creates default task assignments for all tasks
 */
export async function migrateToV8(db: IDBPDatabase): Promise<void> {
  console.log("Running v7 → v8 migration...");

  // 1. Create new object stores
  if (!db.objectStoreNames.contains("providers")) {
    const providerStore = db.createObjectStore("providers", { keyPath: "id" });
    providerStore.createIndex("type", "type", { unique: false });
    providerStore.createIndex("enabled", "enabled", { unique: false });
    console.log("Created 'providers' store");
  }

  if (!db.objectStoreNames.contains("providerKeys")) {
    const keyStore = db.createObjectStore("providerKeys", { keyPath: "id" });
    keyStore.createIndex("providerId", "providerId", { unique: false });
    console.log("Created 'providerKeys' store");
  }

  if (!db.objectStoreNames.contains("taskAssignments")) {
    db.createObjectStore("taskAssignments", { keyPath: "taskId" });
    console.log("Created 'taskAssignments' store");
  }

  if (!db.objectStoreNames.contains("conversations")) {
    const convStore = db.createObjectStore("conversations", { keyPath: "id" });
    convStore.createIndex("taskId", "taskId", { unique: false });
    convStore.createIndex("promptId", "promptId", { unique: false });
    console.log("Created 'conversations' store");
  }

  if (!db.objectStoreNames.contains("conversationTurns")) {
    const turnStore = db.createObjectStore("conversationTurns", {
      keyPath: "id",
    });
    turnStore.createIndex("conversationId", "conversationId", {
      unique: false,
    });
    turnStore.createIndex("parentTurnId", "parentTurnId", { unique: false });
    console.log("Created 'conversationTurns' store");
  }

  if (!db.objectStoreNames.contains("tokenUsage")) {
    const usageStore = db.createObjectStore("tokenUsage", { keyPath: "id" });
    usageStore.createIndex("providerId", "providerId", { unique: false });
    usageStore.createIndex("taskId", "taskId", { unique: false });
    usageStore.createIndex("timestamp", "timestamp", { unique: false });
    console.log("Created 'tokenUsage' store");
  }
}

/**
 * Post-migration data migration (called after stores are created)
 * Migrates existing Gemini API key to new provider system
 */
export async function migrateV8Data(): Promise<void> {
  const db = await openDB(DB_NAME, 8);

  console.log("Running v8 data migration...");

  // Check if migration already ran
  const existingProvider = await db.get("providers", "provider_gemini_default");
  if (existingProvider) {
    console.log("v8 data migration already completed, skipping");
    return;
  }

  // 1. Check for existing Gemini API key in localStorage
  const existingKeyData = localStorage.getItem("gemini_api_key");
  let geminiApiKey: string | null = null;

  if (existingKeyData) {
    try {
      const parsed = JSON.parse(existingKeyData);
      // Key is already encrypted in localStorage
      geminiApiKey = parsed.encryptedKey;
      console.log("Found existing Gemini API key in localStorage");
    } catch (e) {
      console.error("Failed to parse existing API key:", e);
    }
  }

  // 2. Create default Gemini provider
  const geminiProvider: Provider = {
    id: "provider_gemini_default",
    name: "Google Gemini",
    type: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await db.put("providers", geminiProvider);
  console.log("Created default Gemini provider");

  // 3. If API key exists, migrate it
  if (geminiApiKey) {
    const geminiKey: ProviderKey = {
      id: "key_gemini_default",
      providerId: "provider_gemini_default",
      encryptedKey: geminiApiKey, // Already encrypted
      label: "Migrated from v7",
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    await db.put("providerKeys", geminiKey);
    console.log("Migrated Gemini API key to new system");
  }

  // 4. Set global default provider
  await db.put("appSettings", {
    key: "globalDefaultProvider",
    value: {
      providerId: "provider_gemini_default",
      modelId: "gemini-2.0-flash-exp", // Default model
    },
  });
  console.log("Set global default provider");

  // 5. Create default task assignments for all tasks
  const taskIds = Object.keys(TASK_IDS) as TaskId[];
  for (const taskId of taskIds) {
    const metadata = TASK_METADATA[taskId];
    const assignment: TaskAssignment = {
      taskId,
      providerId: "provider_gemini_default",
      modelId: "gemini-2.0-flash-exp",
      enableRewrite: false,
      enableStreaming: false,
      temperature: metadata.defaultTemperature,
      maxTokens: metadata.defaultMaxTokens,
      topP: 1.0,
      updatedAt: Date.now(),
    };

    await db.put("taskAssignments", assignment);
  }
  console.log(`Created default task assignments for ${taskIds.length} tasks`);

  console.log("v8 data migration complete!");
}

/**
 * Helper to run migration on app startup
 */
export async function ensureV8Migration(): Promise<void> {
  // Open DB (triggers upgrade if needed)
  const db = await openDB(DB_NAME, 8, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 8) {
        migrateToV8(db);
      }
    },
  });

  // Run data migration (must be separate from upgrade transaction)
  await migrateV8Data();

  db.close();
}

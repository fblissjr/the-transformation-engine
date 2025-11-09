/**
 * Database Configuration
 * Single source of truth for all IndexedDB constants and store names
 *
 * IMPORTANT: All services must import from this file - no hardcoded values
 */

export const DB_CONFIG = {
  // Database name (NEVER change this - would lose all user data)
  name: 'TransformationEngineDB',

  // Schema version (NEVER increment - breaking changes require manual export/import)
  // If schema needs changes, users must export data, clear DB, and import
  version: 9,

  // Store names
  stores: {
    prompts: 'prompts',
    intermediates: 'intermediates',
    versions: 'versions',
    promptConfigs: 'promptConfigs',
    appSettings: 'appSettings',
    media: 'media',
    providers: 'providers',
    providerKeys: 'providerKeys',
    taskAssignments: 'taskAssignments',
    conversations: 'conversations',
    conversationTurns: 'conversationTurns',
    tokenUsage: 'tokenUsage',
  }
} as const;

// Export individual constants for backward compatibility
export const DB_NAME = DB_CONFIG.name;
export const DB_VERSION = DB_CONFIG.version;
export const STORE_NAMES = DB_CONFIG.stores;

// Type-safe store name type
export type StoreName = typeof DB_CONFIG.stores[keyof typeof DB_CONFIG.stores];

/**
 * Database Configuration
 * Single source of truth for all IndexedDB constants and store names
 *
 * IMPORTANT: All services must import from this file - no hardcoded values
 */

export const DB_CONFIG = {
  // Database name (NEVER change this - would lose all user data)
  name: 'TransformationEngineDB',

  // Schema version - BREAKING CHANGE: v13 → v14 (added Wildcard & Fragment stores)
  // Old data will be lost - export/import not required (solo dev project)
  version: 14,

  // Store names (19 stores total)
  stores: {
    // Core video generation stores
    prompts: 'prompts',
    intermediates: 'intermediates',
    versions: 'versions',
    promptConfigs: 'promptConfigs',
    appSettings: 'appSettings',
    media: 'media',

    // Multi-provider stores
    providers: 'providers',
    providerKeys: 'providerKeys',
    taskAssignments: 'taskAssignments',
    conversations: 'conversations',
    conversationTurns: 'conversationTurns',
    tokenUsage: 'tokenUsage',

    // Image Studio stores
    imageProjects: 'imageProjects',
    imageGenerations: 'imageGenerations',
    imageEdits: 'imageEdits',
    sceneLinks: 'sceneLinks',

    // Wildcard & Fragment stores (v14)
    wildcardCategories: 'wildcardCategories',
    fragments: 'fragments',
    fragmentRelationships: 'fragmentRelationships',
  }
} as const;

// Export individual constants for backward compatibility
/** The name of the IndexedDB database */
export const DB_NAME = DB_CONFIG.name;
/** The current schema version of the database */
export const DB_VERSION = DB_CONFIG.version;
/** Object containing all store names used in the database */
export const STORE_NAMES = DB_CONFIG.stores;

// Type-safe store name type
/** Type representing valid store names in the database */
export type StoreName = typeof DB_CONFIG.stores[keyof typeof DB_CONFIG.stores];

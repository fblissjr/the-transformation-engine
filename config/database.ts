/**
 * Database Configuration
 * Single source of truth for all IndexedDB constants and store names
 *
 * IMPORTANT: All services must import from this file - no hardcoded values
 */

export const DB_CONFIG = {
  // Database name (NEVER change this - would lose all user data)
  name: 'TransformationEngineDB',

  // Schema version - BREAKING CHANGE: v11 → v12 (added Object Library stores)
  // Old data will be lost - export/import not required (solo dev project)
  version: 12,

  // Store names
  stores: {
    // Video generation stores (v1-v10)
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

    // Image generation stores (v11 - Image Studio)
    imageProjects: 'imageProjects',
    imageGenerations: 'imageGenerations',
    imageEdits: 'imageEdits',
    sceneLinks: 'sceneLinks',

    // Object Library stores (v12 - Universal Object System)
    characterObjects: 'characterObjects',
    locationObjects: 'locationObjects',
    cameraObjects: 'cameraObjects',
    propObjects: 'propObjects',
    audioObjects: 'audioObjects',
    conceptObjects: 'conceptObjects',
    customObjects: 'customObjects',

    // Object versioning & relationships (v12)
    objectVersions: 'objectVersions',
    objectChangelogs: 'objectChangelogs',
    objectRelationships: 'objectRelationships',
  }
} as const;

// Export individual constants for backward compatibility
export const DB_NAME = DB_CONFIG.name;
export const DB_VERSION = DB_CONFIG.version;
export const STORE_NAMES = DB_CONFIG.stores;

// Type-safe store name type
export type StoreName = typeof DB_CONFIG.stores[keyof typeof DB_CONFIG.stores];

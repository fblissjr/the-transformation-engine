/**
 * Seed Data Service - Imports initial data on first run
 *
 * Handles:
 * - Loading wildcards.json into wildcardService
 * - Loading prompt_library.json as fragments
 * - Building default relationships
 */

import { wildcardService } from './wildcardService';
import { fragmentLibraryService } from './fragmentLibraryService';

interface PromptTemplate {
  name: string;
  category: string;
  template: string;
  description?: string;
  features?: string[];
  requires_input_images?: boolean;
  example_wildcards?: Record<string, string>;
  tags?: string[];
  notes?: string;
  content_rating?: string;
  content_context?: string;
  is_historical?: boolean;
}

interface PromptLibraryData {
  templates: PromptTemplate[];
}

/**
 * Check if seed data has been imported
 */
async function isDataImported(): Promise<boolean> {
  const stats = await fragmentLibraryService.getStats();
  return stats.totalFragments > 0;
}

/**
 * Import gemimg seed data on first run
 *
 * This should be called once at app startup.
 * It will skip if data has already been imported.
 */
export async function importGemimgSeedData(): Promise<{
  imported: boolean;
  wildcardCategories: number;
  fragments: number;
  relationships: number;
}> {
  // Check if already imported
  if (await isDataImported()) {
    console.log('[SeedData] Data already imported, skipping');
    return {
      imported: false,
      wildcardCategories: 0,
      fragments: 0,
      relationships: 0,
    };
  }

  console.log('[SeedData] Importing seed data from gemimg...');

  let wildcardCategories = 0;
  let fragments = 0;
  let relationships = 0;

  try {
    // 1. Load wildcards (this happens via fetch in wildcardService.load())
    await wildcardService.load();
    wildcardCategories = wildcardService.getCategories().length;
    console.log(`[SeedData] Loaded ${wildcardCategories} wildcard categories`);

    // 2. Load prompt_library.json and import as fragments
    try {
      const response = await fetch('/data/prompt_library.json');
      if (response.ok) {
        const data: PromptLibraryData = await response.json();

        if (data.templates && Array.isArray(data.templates)) {
          fragments = await fragmentLibraryService.importFromPromptLibrary(data.templates);
          console.log(`[SeedData] Imported ${fragments} fragments from prompt_library.json`);
        }
      } else {
        console.warn('[SeedData] prompt_library.json not found, skipping fragment import');
      }
    } catch (error) {
      console.error('[SeedData] Error loading prompt_library.json:', error);
    }

    // 3. Build default relationships
    if (fragments > 0) {
      relationships = await fragmentLibraryService.buildDefaultRelationships();
      console.log(`[SeedData] Built ${relationships} default relationships`);
    }

    console.log('[SeedData] Seed data import complete');

    return {
      imported: true,
      wildcardCategories,
      fragments,
      relationships,
    };
  } catch (error) {
    console.error('[SeedData] Error importing seed data:', error);
    return {
      imported: false,
      wildcardCategories,
      fragments,
      relationships,
    };
  }
}

/**
 * Reset all seed data (for development/testing)
 */
export async function resetSeedData(): Promise<void> {
  console.log('[SeedData] Resetting seed data...');

  // Clear fragment library
  await fragmentLibraryService.clearAll();

  console.log('[SeedData] Seed data cleared');
}

/**
 * Get seed data status
 */
export async function getSeedDataStatus(): Promise<{
  hasData: boolean;
  wildcardCategories: number;
  fragments: number;
  relationships: number;
}> {
  await wildcardService.load();
  const wildcardCategories = wildcardService.getCategories().length;
  const stats = await fragmentLibraryService.getStats();

  return {
    hasData: stats.totalFragments > 0,
    wildcardCategories,
    fragments: stats.totalFragments,
    relationships: stats.totalRelationships,
  };
}

// Export individual functions
export { isDataImported };

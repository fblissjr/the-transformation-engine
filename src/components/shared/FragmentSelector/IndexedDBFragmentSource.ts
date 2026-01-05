/**
 * IndexedDB Fragment Data Source
 *
 * Adapter for fragmentLibraryService to the FragmentDataSource interface.
 * Used by Video workspace for database-backed fragments with relationships.
 */

import {
  FragmentDataSource,
  UnifiedFragment,
  FragmentStats,
  FragmentCategory,
} from './types';
import {
  fragmentLibraryService,
  Fragment,
  FragmentCategory as LibraryCategory,
} from '../../../services/fragmentLibraryService';

/**
 * Category definitions for IndexedDB fragments
 */
const INDEXEDDB_CATEGORIES: FragmentCategory[] = [
  { id: 'action', name: 'Actions' },
  { id: 'specification', name: 'Specifications' },
  { id: 'constraint', name: 'Constraints' },
  { id: 'role', name: 'Roles' },
  { id: 'instruction', name: 'Instructions' },
];

/**
 * Convert library Fragment to UnifiedFragment
 */
function toUnifiedFragment(fragment: Fragment): UnifiedFragment {
  return {
    id: fragment.id,
    name: fragment.name,
    category: fragment.category,
    content: fragment.template,
    subcategory: fragment.subcategory,
    template: fragment.template,
    description: fragment.description,
    sourceCount: fragment.sourceCount,
    wildcards: fragment.wildcards,
    examples: fragment.examples,
    tags: fragment.tags,
    metadata: fragment.metadata,
    createdAt: fragment.createdAt,
    updatedAt: fragment.updatedAt,
  };
}

/**
 * IndexedDB-backed fragment data source
 */
export class IndexedDBFragmentSource implements FragmentDataSource {
  private statsCache: FragmentStats | null = null;
  private statsCacheTime = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds

  /**
   * Get all fragments with optional category filter
   */
  async getAllFragments(category?: string, limit = 100): Promise<UnifiedFragment[]> {
    if (category) {
      return this.getFragmentsByCategory(category, limit);
    }

    const fragments = await fragmentLibraryService.getAllFragments();
    return fragments.slice(0, limit).map(toUnifiedFragment);
  }

  /**
   * Search fragments by keyword
   */
  async searchFragments(
    query: string,
    category?: string,
    limit = 20
  ): Promise<UnifiedFragment[]> {
    const libraryCategory = category as LibraryCategory | undefined;
    const fragments = await fragmentLibraryService.searchFragments(
      query,
      libraryCategory,
      limit
    );
    return fragments.map(toUnifiedFragment);
  }

  /**
   * Get fragments by category
   */
  async getFragmentsByCategory(category: string, limit = 100): Promise<UnifiedFragment[]> {
    const libraryCategory = category as LibraryCategory;
    const fragments = await fragmentLibraryService.getFragmentsByCategory(
      libraryCategory,
      undefined,
      limit
    );
    return fragments.map(toUnifiedFragment);
  }

  /**
   * Get category statistics
   */
  async getStats(): Promise<FragmentStats> {
    const now = Date.now();

    // Return cached stats if still valid
    if (this.statsCache && now - this.statsCacheTime < this.CACHE_TTL) {
      return this.statsCache;
    }

    const allFragments = await fragmentLibraryService.getAllFragments();

    const byCategory: Record<string, number> = {};
    for (const category of INDEXEDDB_CATEGORIES) {
      byCategory[category.id] = 0;
    }

    for (const fragment of allFragments) {
      if (byCategory[fragment.category] !== undefined) {
        byCategory[fragment.category]++;
      }
    }

    this.statsCache = {
      totalFragments: allFragments.length,
      byCategory,
    };
    this.statsCacheTime = now;

    return this.statsCache;
  }

  /**
   * Get available categories with counts
   */
  async getCategories(): Promise<FragmentCategory[]> {
    const stats = await this.getStats();

    return INDEXEDDB_CATEGORIES.map(cat => ({
      ...cat,
      count: stats.byCategory[cat.id] || 0,
    }));
  }

  /**
   * Get suggested constraints for a fragment
   */
  async getSuggestedConstraints(fragmentId: string): Promise<UnifiedFragment[]> {
    const suggestions = await fragmentLibraryService.getSuggestedConstraints(fragmentId);
    return suggestions.map(toUnifiedFragment);
  }

  /**
   * Invalidate the stats cache
   */
  invalidateCache(): void {
    this.statsCache = null;
    this.statsCacheTime = 0;
  }
}

/**
 * Singleton instance for convenience
 */
export const indexedDBFragmentSource = new IndexedDBFragmentSource();

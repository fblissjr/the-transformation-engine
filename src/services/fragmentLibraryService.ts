/**
 * Fragment Library Service - Database-backed fragment storage with relationships
 *
 * Ported from gemimg/fragment_library.py
 *
 * Features:
 * - IndexedDB storage for fragments
 * - Category-based organization (action, specification, constraint)
 * - Relationship tracking for auto-suggestions
 * - Search and filtering
 * - Popularity tracking (sourceCount)
 */

import { getDB } from './db/indexedDbService';
import { STORE_NAMES } from '../config/database';

// Store names
const FRAGMENTS_STORE = STORE_NAMES.fragments;
const RELATIONSHIPS_STORE = STORE_NAMES.fragmentRelationships;
const WILDCARDS_STORE = STORE_NAMES.wildcardCategories;

/**
 * Fragment category types
 */
export type FragmentCategory = 'action' | 'specification' | 'constraint' | 'role' | 'instruction';

/**
 * Fragment record stored in IndexedDB
 */
export interface Fragment {
  id: string;
  name: string;
  category: FragmentCategory;
  subcategory: string;
  template: string;
  description?: string;
  sourceCount: number;
  wildcards: Record<string, string[]>;
  examples: string[];
  tags: string[];
  metadata?: {
    contentRating?: 'safe' | 'artistic' | 'mature';
    requiresInputImages?: boolean;
    features?: string[];
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Fragment relationship for auto-suggestions
 */
export interface FragmentRelationship {
  id: string;
  fragmentId: string;
  suggests: string;
  weight: number;
  context?: string;
}

/**
 * Custom wildcard category stored in IndexedDB
 */
export interface WildcardCategory {
  id: string;
  name: string;
  values: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fragment Library Service
 */
class FragmentLibraryService {
  /**
   * Get a fragment by ID
   */
  async getFragment(id: string): Promise<Fragment | undefined> {
    const db = await getDB();
    return db.get(FRAGMENTS_STORE, id);
  }

  /**
   * Get all fragments
   */
  async getAllFragments(): Promise<Fragment[]> {
    const db = await getDB();
    return db.getAll(FRAGMENTS_STORE);
  }

  /**
   * Get fragments by category
   */
  async getFragmentsByCategory(
    category: FragmentCategory,
    subcategory?: string,
    limit = 100
  ): Promise<Fragment[]> {
    const db = await getDB();
    const allFragments = await db.getAllFromIndex(FRAGMENTS_STORE, 'category', category);

    let filtered = subcategory
      ? allFragments.filter(f => f.subcategory === subcategory)
      : allFragments;

    // Sort by sourceCount (popularity) descending
    filtered.sort((a, b) => b.sourceCount - a.sourceCount);

    return filtered.slice(0, limit);
  }

  /**
   * Search fragments by keyword
   */
  async searchFragments(
    keyword: string,
    category?: FragmentCategory,
    limit = 20
  ): Promise<Fragment[]> {
    const db = await getDB();
    const allFragments = await db.getAll(FRAGMENTS_STORE);

    const keywordLower = keyword.toLowerCase();

    let results = allFragments.filter(f => {
      const matchesKeyword =
        f.name.toLowerCase().includes(keywordLower) ||
        f.template.toLowerCase().includes(keywordLower) ||
        f.subcategory.toLowerCase().includes(keywordLower) ||
        f.description?.toLowerCase().includes(keywordLower) ||
        f.tags.some(t => t.toLowerCase().includes(keywordLower));

      if (category) {
        return matchesKeyword && f.category === category;
      }
      return matchesKeyword;
    });

    // Sort by relevance (exact name match first, then by sourceCount)
    results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase() === keywordLower ? 1 : 0;
      const bNameMatch = b.name.toLowerCase() === keywordLower ? 1 : 0;
      if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;
      return b.sourceCount - a.sourceCount;
    });

    return results.slice(0, limit);
  }

  /**
   * Get action fragments by verb
   */
  async getActionFragments(verb: string, limit = 10): Promise<Fragment[]> {
    const db = await getDB();
    const allActions = await db.getAllFromIndex(FRAGMENTS_STORE, 'category', 'action');

    const verbLower = verb.toLowerCase();
    const filtered = allActions.filter(f =>
      f.subcategory.toLowerCase() === verbLower ||
      f.name.toLowerCase().includes(verbLower)
    );

    filtered.sort((a, b) => b.sourceCount - a.sourceCount);
    return filtered.slice(0, limit);
  }

  /**
   * Get suggested constraints for an action fragment
   * Uses the relationship table for auto-suggestion
   */
  async getSuggestedConstraints(actionFragmentId: string): Promise<Fragment[]> {
    const db = await getDB();

    // Get relationships where this fragment suggests others
    const relationships = await db.getAllFromIndex(
      RELATIONSHIPS_STORE,
      'fragmentId',
      actionFragmentId
    );

    // Sort by weight
    relationships.sort((a, b) => b.weight - a.weight);

    // Fetch the suggested fragments
    const suggestions: Fragment[] = [];
    for (const rel of relationships) {
      const fragment = await this.getFragment(rel.suggests);
      if (fragment && fragment.category === 'constraint') {
        suggestions.push(fragment);
      }
    }

    return suggestions;
  }

  /**
   * Add a new fragment
   */
  async addFragment(fragmentData: Omit<Fragment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fragment> {
    const db = await getDB();
    const now = new Date().toISOString();

    const fragment: Fragment = {
      ...fragmentData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.put(FRAGMENTS_STORE, fragment);
    return fragment;
  }

  /**
   * Update an existing fragment
   */
  async updateFragment(fragment: Fragment): Promise<void> {
    const db = await getDB();
    const updatedFragment = {
      ...fragment,
      updatedAt: new Date().toISOString(),
    };
    await db.put(FRAGMENTS_STORE, updatedFragment);
  }

  /**
   * Delete a fragment
   */
  async deleteFragment(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(FRAGMENTS_STORE, id);

    // Also delete any relationships involving this fragment
    const allRelationships = await db.getAll(RELATIONSHIPS_STORE);
    for (const rel of allRelationships) {
      if (rel.fragmentId === id || rel.suggests === id) {
        await db.delete(RELATIONSHIPS_STORE, rel.id);
      }
    }
  }

  /**
   * Increment usage count for a fragment
   */
  async incrementUsage(id: string): Promise<void> {
    const fragment = await this.getFragment(id);
    if (fragment) {
      fragment.sourceCount++;
      await this.updateFragment(fragment);
    }
  }

  /**
   * Add a relationship between fragments
   */
  async addRelationship(
    fragmentId: string,
    suggests: string,
    weight = 1.0,
    context?: string
  ): Promise<void> {
    const db = await getDB();

    const relationship: FragmentRelationship = {
      id: `${fragmentId}_${suggests}`,
      fragmentId,
      suggests,
      weight,
      context,
    };

    await db.put(RELATIONSHIPS_STORE, relationship);
  }

  /**
   * Get all relationships for a fragment
   */
  async getRelationships(fragmentId: string): Promise<FragmentRelationship[]> {
    const db = await getDB();
    return db.getAllFromIndex(RELATIONSHIPS_STORE, 'fragmentId', fragmentId);
  }

  /**
   * Get statistics about the fragment library
   */
  async getStats(): Promise<{
    totalFragments: number;
    totalRelationships: number;
    byCategory: Record<string, number>;
  }> {
    const db = await getDB();
    const allFragments = await db.getAll(FRAGMENTS_STORE);
    const allRelationships = await db.getAll(RELATIONSHIPS_STORE);

    const byCategory: Record<string, number> = {};
    for (const fragment of allFragments) {
      byCategory[fragment.category] = (byCategory[fragment.category] || 0) + 1;
    }

    return {
      totalFragments: allFragments.length,
      totalRelationships: allRelationships.length,
      byCategory,
    };
  }

  /**
   * Import fragments from prompt_library.json format
   */
  async importFromPromptLibrary(templates: Array<{
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
  }>): Promise<number> {
    let imported = 0;

    for (const template of templates) {
      // Map category to FragmentCategory
      let fragmentCategory: FragmentCategory = 'specification';
      const catLower = template.category.toLowerCase();

      if (catLower.includes('edit')) {
        fragmentCategory = 'action';
      } else if (catLower.includes('constraint')) {
        fragmentCategory = 'constraint';
      } else if (catLower.includes('role') || catLower.includes('system')) {
        fragmentCategory = 'role';
      } else if (catLower.includes('instruction')) {
        fragmentCategory = 'instruction';
      }

      // Extract wildcards from template
      const wildcardMatches = template.template.match(/\{([^}]+)\}/g) || [];
      const wildcardNames = wildcardMatches.map(m => m.slice(1, -1).split(':')[0]);

      const wildcards: Record<string, string[]> = {};
      for (const name of wildcardNames) {
        if (template.example_wildcards && name in template.example_wildcards) {
          wildcards[name] = [template.example_wildcards[name]];
        } else {
          wildcards[name] = [];
        }
      }

      await this.addFragment({
        name: template.name,
        category: fragmentCategory,
        subcategory: template.category,
        template: template.template,
        description: template.description,
        sourceCount: 1,
        wildcards,
        examples: [],
        tags: template.tags || [],
        metadata: {
          contentRating: (template.content_rating as 'safe' | 'artistic' | 'mature') || 'safe',
          requiresInputImages: template.requires_input_images || false,
          features: template.features || [],
          notes: template.notes,
        },
      });

      imported++;
    }

    return imported;
  }

  /**
   * Build default relationships based on common patterns
   */
  async buildDefaultRelationships(): Promise<number> {
    const db = await getDB();
    const allFragments = await db.getAll(FRAGMENTS_STORE);

    const actions = allFragments.filter(f => f.category === 'action');
    const constraints = allFragments.filter(f => f.category === 'constraint');

    let created = 0;

    // Default action -> constraint mappings
    const actionConstraintMap: Record<string, string[]> = {
      'remove': ['ensuring', 'seamlessly', 'maintaining'],
      'add': ['realistic', 'maintaining', 'consistent'],
      'replace': ['seamlessly', 'maintaining', 'realistic'],
      'transform': ['preserving', 'maintaining', 'consistent'],
      'modify': ['maintaining', 'consistent', 'realistic'],
      'change': ['seamlessly', 'maintaining', 'realistic'],
    };

    for (const action of actions) {
      const verb = action.subcategory.toLowerCase();
      const suggestedConstraintTypes = actionConstraintMap[verb] || ['maintaining', 'realistic'];

      for (const constraintType of suggestedConstraintTypes) {
        // Find matching constraints
        const matchingConstraints = constraints.filter(c =>
          c.name.toLowerCase().includes(constraintType) ||
          c.subcategory.toLowerCase().includes(constraintType) ||
          c.template.toLowerCase().includes(constraintType)
        );

        for (const constraint of matchingConstraints.slice(0, 2)) {
          await this.addRelationship(action.id, constraint.id, 0.8);
          created++;
        }
      }
    }

    return created;
  }

  // ==================== Custom Wildcard Categories ====================

  /**
   * Get all custom wildcard categories
   */
  async getCustomWildcardCategories(): Promise<WildcardCategory[]> {
    const db = await getDB();
    return db.getAll(WILDCARDS_STORE);
  }

  /**
   * Add a custom wildcard category
   */
  async addWildcardCategory(name: string, values: string[]): Promise<WildcardCategory> {
    const db = await getDB();
    const now = new Date().toISOString();

    const category: WildcardCategory = {
      id: crypto.randomUUID(),
      name,
      values,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.put(WILDCARDS_STORE, category);
    return category;
  }

  /**
   * Update a custom wildcard category
   */
  async updateWildcardCategory(category: WildcardCategory): Promise<void> {
    const db = await getDB();
    const updated = {
      ...category,
      updatedAt: new Date().toISOString(),
    };
    await db.put(WILDCARDS_STORE, updated);
  }

  /**
   * Delete a custom wildcard category
   */
  async deleteWildcardCategory(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(WILDCARDS_STORE, id);
  }

  /**
   * Clear all fragments (for testing/reset)
   */
  async clearAll(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction([FRAGMENTS_STORE, RELATIONSHIPS_STORE, WILDCARDS_STORE], 'readwrite');

    await tx.objectStore(FRAGMENTS_STORE).clear();
    await tx.objectStore(RELATIONSHIPS_STORE).clear();
    await tx.objectStore(WILDCARDS_STORE).clear();

    await tx.done;
  }
}

// Export singleton instance
export const fragmentLibraryService = new FragmentLibraryService();

// Export class for testing
export { FragmentLibraryService };

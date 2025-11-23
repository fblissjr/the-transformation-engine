import { getDB } from '..//db/indexedDbService';
import { DB_CONFIG } from '../../config/database';
import type { ObjectStoreRecord } from '../../types/objectTypes';
import { objectLibraryService } from './objectLibraryService';

/**
 * ObjectSearchService
 * Search and discovery methods for the Universal Object Library
 *
 * Features:
 * - Name-based search (exact and partial)
 * - Tag-based search (AND/OR logic)
 * - Semantic search (LLM-powered, optional)
 * - Relationship search (find related objects)
 * - Usage search (popular/frequently used objects)
 */
export class ObjectSearchService {
  private db: IDBDatabase | null = null;

  /**
   * Initialize database connection
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      this.db = await getDB();
    }
    return this.db;
  }

  /**
   * Get all object stores for search
   */
  private getAllObjectStores(): string[] {
    return [
      DB_CONFIG.stores.characterObjects,
      DB_CONFIG.stores.locationObjects,
      DB_CONFIG.stores.cameraObjects,
      DB_CONFIG.stores.propObjects,
      DB_CONFIG.stores.audioObjects,
      DB_CONFIG.stores.conceptObjects,
      DB_CONFIG.stores.customObjects,
    ];
  }

  /**
   * Search all objects across all stores
   */
  private async getAllObjects(): Promise<ObjectStoreRecord[]> {
    const db = await this.ensureDB();
    const results: ObjectStoreRecord[] = [];

    for (const storeName of this.getAllObjectStores()) {
      const objects = await db.getAll(storeName);
      results.push(...objects);
    }

    return results;
  }

  // ============================================================================
  // SEARCH METHODS
  // ============================================================================

  /**
   * Search by name (exact or partial match)
   *
   * @param query - Search query
   * @param options - Search options
   *   - exact: Exact match only (default: false)
   *   - caseSensitive: Case-sensitive search (default: false)
   *   - objectTypes: Limit to specific object types (optional)
   * @returns Matching objects
   */
  async searchByName(
    query: string,
    options: {
      exact?: boolean;
      caseSensitive?: boolean;
      objectTypes?: string[];
    } = {}
  ): Promise<ObjectStoreRecord[]> {
    try {
      const allObjects = await this.getAllObjects();

      const searchQuery = options.caseSensitive ? query : query.toLowerCase();

      return allObjects.filter(obj => {
        // Filter by object type if specified
        if (options.objectTypes && !options.objectTypes.includes(obj.type)) {
          return false;
        }

        const name = options.caseSensitive ? obj.name : obj.name.toLowerCase();

        if (options.exact) {
          return name === searchQuery;
        } else {
          return name.includes(searchQuery);
        }
      });
    } catch (error) {
      console.error('[ObjectSearchService] Error searching by name:', error);
      throw new Error(`Failed to search by name: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search by tags
   *
   * @param tags - Tags to search for
   * @param options - Search options
   *   - logic: 'AND' (all tags) or 'OR' (any tag) (default: 'AND')
   *   - objectTypes: Limit to specific object types (optional)
   * @returns Matching objects
   */
  async searchByTags(
    tags: string[],
    options: {
      logic?: 'AND' | 'OR';
      objectTypes?: string[];
    } = {}
  ): Promise<ObjectStoreRecord[]> {
    try {
      const allObjects = await this.getAllObjects();
      const logic = options.logic || 'AND';

      return allObjects.filter(obj => {
        // Filter by object type if specified
        if (options.objectTypes && !options.objectTypes.includes(obj.type)) {
          return false;
        }

        if (!obj.tags || obj.tags.length === 0) {
          return false;
        }

        if (logic === 'AND') {
          // All tags must be present
          return tags.every(tag => obj.tags?.includes(tag));
        } else {
          // At least one tag must be present
          return tags.some(tag => obj.tags?.includes(tag));
        }
      });
    } catch (error) {
      console.error('[ObjectSearchService] Error searching by tags:', error);
      throw new Error(`Failed to search by tags: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search by relationship
   * Find all objects related to a given object
   *
   * @param objectId - Object ID to find relationships for
   * @param options - Search options
   *   - relationTypes: Limit to specific relationship types (optional)
   *   - direction: 'from' (outgoing), 'to' (incoming), 'both' (default: 'both')
   * @returns Related objects
   */
  async searchByRelationship(
    objectId: string,
    options: {
      relationTypes?: string[];
      direction?: 'from' | 'to' | 'both';
    } = {}
  ): Promise<ObjectStoreRecord[]> {
    try {
      const direction = options.direction || 'both';

      // Get all relationships for this object
      const relationships = await objectLibraryService.getRelationships(objectId);

      // Filter by relationship type if specified
      const filteredRelationships = options.relationTypes
        ? relationships.filter(rel => options.relationTypes!.includes(rel.relationType))
        : relationships;

      // Collect related object IDs
      const relatedObjectIds = new Set<string>();

      for (const rel of filteredRelationships) {
        if (direction === 'from' || direction === 'both') {
          if (rel.fromObjectId === objectId) {
            relatedObjectIds.add(rel.toObjectId);
          }
        }
        if (direction === 'to' || direction === 'both') {
          if (rel.toObjectId === objectId) {
            relatedObjectIds.add(rel.fromObjectId);
          }
        }
      }

      // Fetch all related objects
      const results: ObjectStoreRecord[] = [];
      for (const relatedId of relatedObjectIds) {
        // Try each object type until we find it
        for (const storeName of this.getAllObjectStores()) {
          const db = await this.ensureDB();
          const obj = await db.get(storeName, relatedId);
          if (obj) {
            results.push(obj);
            break;
          }
        }
      }

      return results;
    } catch (error) {
      console.error('[ObjectSearchService] Error searching by relationship:', error);
      throw new Error(`Failed to search by relationship: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search by usage (popularity)
   * Find objects by how frequently they are used in scenes
   *
   * @param options - Search options
   *   - minUsage: Minimum number of scenes (default: 1)
   *   - maxUsage: Maximum number of scenes (optional)
   *   - objectTypes: Limit to specific object types (optional)
   *   - sortBy: 'usage' (ascending) or 'usage_desc' (descending) (default: 'usage_desc')
   *   - limit: Maximum number of results (optional)
   * @returns Objects sorted by usage
   */
  async searchByUsage(
    options: {
      minUsage?: number;
      maxUsage?: number;
      objectTypes?: string[];
      sortBy?: 'usage' | 'usage_desc';
      limit?: number;
    } = {}
  ): Promise<Array<ObjectStoreRecord & { usageCount: number }>> {
    try {
      const allObjects = await this.getAllObjects();
      const minUsage = options.minUsage ?? 1;
      const sortBy = options.sortBy || 'usage_desc';

      // Filter and annotate with usage count
      let results = allObjects
        .filter(obj => {
          // Filter by object type if specified
          if (options.objectTypes && !options.objectTypes.includes(obj.type)) {
            return false;
          }

          const usageCount = obj.linkedScenes.length;

          // Filter by usage range
          if (usageCount < minUsage) {
            return false;
          }
          if (options.maxUsage !== undefined && usageCount > options.maxUsage) {
            return false;
          }

          return true;
        })
        .map(obj => ({
          ...obj,
          usageCount: obj.linkedScenes.length,
        }));

      // Sort by usage
      results.sort((a, b) => {
        if (sortBy === 'usage') {
          return a.usageCount - b.usageCount; // Ascending
        } else {
          return b.usageCount - a.usageCount; // Descending
        }
      });

      // Apply limit if specified
      if (options.limit) {
        results = results.slice(0, options.limit);
      }

      return results;
    } catch (error) {
      console.error('[ObjectSearchService] Error searching by usage:', error);
      throw new Error(`Failed to search by usage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Semantic search (LLM-powered)
   * Uses LLM to find objects matching natural language query
   *
   * @param query - Natural language search query
   * @param options - Search options
   *   - objectTypes: Limit to specific object types (optional)
   *   - limit: Maximum number of results (default: 10)
   *   - llmTaskExecutor: Function to execute LLM semantic search task
   * @returns Matching objects with relevance scores
   *
   * NOTE: This method requires the semanticSearchTask.ts LLM task to be implemented
   * For now, this is a placeholder that falls back to name + description search
   */
  async searchSemantic(
    query: string,
    options: {
      objectTypes?: string[];
      limit?: number;
      llmTaskExecutor?: (query: string, objects: ObjectStoreRecord[]) => Promise<Array<{ objectId: string; score: number; reasoning: string }>>;
    } = {}
  ): Promise<Array<ObjectStoreRecord & { relevanceScore?: number; reasoning?: string }>> {
    try {
      const limit = options.limit || 10;
      const allObjects = await this.getAllObjects();

      // Filter by object type if specified
      const candidateObjects = options.objectTypes
        ? allObjects.filter(obj => options.objectTypes!.includes(obj.type))
        : allObjects;

      // If LLM task executor provided, use it
      if (options.llmTaskExecutor) {
        const llmResults = await options.llmTaskExecutor(query, candidateObjects);

        // Map LLM results back to objects
        const results: Array<ObjectStoreRecord & { relevanceScore?: number; reasoning?: string }> = [];
        for (const llmResult of llmResults.slice(0, limit)) {
          const obj = candidateObjects.find(o => o.id === llmResult.objectId);
          if (obj) {
            results.push({
              ...obj,
              relevanceScore: llmResult.score,
              reasoning: llmResult.reasoning,
            });
          }
        }

        return results;
      }

      // Fallback: Simple keyword search in name and description
      const queryLower = query.toLowerCase();
      const results = candidateObjects
        .filter(obj => {
          const name = obj.name.toLowerCase();
          const description = obj.description?.toLowerCase() || '';
          return name.includes(queryLower) || description.includes(queryLower);
        })
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('[ObjectSearchService] Error in semantic search:', error);
      throw new Error(`Failed to perform semantic search: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get object statistics
   * Returns counts by object type and usage statistics
   * @returns A Promise resolving to object statistics including total count, breakdown by type, and usage info.
   */
  async getObjectStatistics(): Promise<{
    totalObjects: number;
    byType: Record<string, number>;
    totalUsage: number;
    averageUsage: number;
    mostUsed: ObjectStoreRecord | null;
  }> {
    try {
      const allObjects = await this.getAllObjects();

      const byType: Record<string, number> = {};
      let totalUsage = 0;
      let mostUsed: ObjectStoreRecord | null = null;
      let maxUsage = 0;

      for (const obj of allObjects) {
        // Count by type
        byType[obj.type] = (byType[obj.type] || 0) + 1;

        // Count usage
        const usage = obj.linkedScenes.length;
        totalUsage += usage;

        // Track most used
        if (usage > maxUsage) {
          maxUsage = usage;
          mostUsed = obj;
        }
      }

      return {
        totalObjects: allObjects.length,
        byType,
        totalUsage,
        averageUsage: allObjects.length > 0 ? totalUsage / allObjects.length : 0,
        mostUsed,
      };
    } catch (error) {
      console.error('[ObjectSearchService] Error getting statistics:', error);
      throw new Error(`Failed to get object statistics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const objectSearchService = new ObjectSearchService();

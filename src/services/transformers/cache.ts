import type { IntermediatePrompt } from '../../types/intermediate';

interface CacheEntry {
  intermediate: IntermediatePrompt;
  modelId: string;
  output: string;
  timestamp: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
}

class TransformerCache {
  private cache = new Map<string, CacheEntry>();
  private maxEntries = 50;
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0 };

  // Generate cache key
  private getCacheKey(intermediateId: string, modelId: string, modified: Date): string {
    return `${intermediateId}_${modelId}_${modified.getTime()}`;
  }

  // Get cached output
  get(intermediate: IntermediatePrompt, modelId: string): string | null {
    const key = this.getCacheKey(intermediate.id, modelId, intermediate.modified);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if intermediate was modified since cache
    if (entry.intermediate.modified.getTime() !== intermediate.modified.getTime()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.output;
  }

  // Set cached output
  set(intermediate: IntermediatePrompt, modelId: string, output: string): void {
    const key = this.getCacheKey(intermediate.id, modelId, intermediate.modified);

    // LRU eviction if full
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }

    this.cache.set(key, {
      intermediate,
      modelId,
      output,
      timestamp: Date.now(),
    });
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  // Clear cache for specific intermediate
  clearIntermediate(intermediateId: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(intermediateId + '_')) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache size
  getSize(): number {
    return this.cache.size;
  }
}

export const transformerCache = new TransformerCache();

/**
 * Wildcard Service - Dynamic prompt variation through parameterized substitution
 *
 * Ported from gemimg/wildcards.py
 *
 * Supports:
 * - {category} - Random selection from category
 * - {category:random} - Explicit random
 * - {category:3random} - Select N random items
 * - {category:all} - All items joined with comma
 * - Seeded reproducibility for A/B testing
 * - Experiment matrix generation (cartesian product)
 */

// Simple seeded random number generator (mulberry32)
function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export interface WildcardLibrary {
  [category: string]: string[];
}

export interface ExperimentResult {
  prompt: string;
  wildcards: Record<string, string>;
  id: string;
}

export interface ExperimentMatrix {
  combinations: ExperimentResult[];
  totalCombinations: number;
  matrixConfig: Record<string, string[]>;
}

export interface WildcardMetadata {
  content_rating?: string;
  content_context?: string;
  _metadata?: {
    content_rating?: string;
    content_context?: string;
  };
}

class WildcardService {
  private wildcards: WildcardLibrary = {};
  private metadata: WildcardMetadata = {};
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  // Regex pattern for {wildcard} or {wildcard:modifier}
  private readonly wildcardPattern = /\{([^}]+)\}/g;

  /**
   * Load wildcard data from JSON file
   */
  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this._loadData();
    await this.loadPromise;
    this.loaded = true;
  }

  private async _loadData(): Promise<void> {
    try {
      const response = await fetch('/data/wildcards.json');
      if (!response.ok) {
        console.warn('Failed to load wildcards.json, using empty library');
        return;
      }

      const data = await response.json();

      // Separate metadata from categories
      const { content_rating, content_context, _metadata, ...categories } = data;

      this.wildcards = categories as WildcardLibrary;
      this.metadata = { content_rating, content_context, _metadata };
    } catch (error) {
      console.error('Error loading wildcards:', error);
    }
  }

  /**
   * Resolve all wildcards in a template string
   *
   * @param template - Template string with {category} or {category:modifier} syntax
   * @param overrides - Optional dict mapping wildcard names to specific values or counts
   * @param seed - Optional random seed for reproducibility
   * @returns Resolved template string with wildcards replaced
   *
   * @example
   * resolve("A {subject} in {style} style")
   * // "A kitten in baroque oil painting style"
   *
   * resolve("Shot with {camera:random}", { camera: "Canon EOS 90D" })
   * // "Shot with Canon EOS 90D"
   *
   * resolve("{lighting:3random}")
   * // "natural diffuse morning light, dramatic chiaroscuro lighting, soft high-key lighting"
   */
  resolve(
    template: string,
    overrides: Record<string, string | number> = {},
    seed?: number
  ): string {
    // Create random function (seeded or default)
    const random = seed !== undefined
      ? seededRandom(seed)
      : () => Math.random();

    // Find all wildcard matches
    const matches: Array<{ match: string; index: number; content: string }> = [];
    let match: RegExpExecArray | null;

    // Reset regex lastIndex
    this.wildcardPattern.lastIndex = 0;

    while ((match = this.wildcardPattern.exec(template)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        content: match[1]
      });
    }

    // Replace from right to left to maintain indices
    let result = template;
    for (let i = matches.length - 1; i >= 0; i--) {
      const { match: fullMatch, index, content } = matches[i];

      // Parse wildcard format: category[:modifier]
      const parts = content.split(':');
      const category = parts[0];
      const modifier = parts.length > 1 ? parts[1] : null;

      let replacement: string;

      // Check if user provided specific value
      if (category in overrides) {
        const value = overrides[category];
        if (typeof value === 'number') {
          // User wants N random items from this category
          replacement = this._getRandomItems(category, value, random);
        } else {
          // User provided specific value
          replacement = value;
        }
      } else if (modifier) {
        // Handle modifiers like 'random', '3random', 'all'
        replacement = this._resolveWithModifier(category, modifier, random);
      } else {
        // Default: pick one random item
        replacement = this._getRandomItems(category, 1, random);
      }

      // Replace in result
      result = result.slice(0, index) + replacement + result.slice(index + fullMatch.length);
    }

    return result;
  }

  /**
   * Resolve wildcard with a modifier
   */
  private _resolveWithModifier(
    category: string,
    modifier: string,
    random: () => number
  ): string {
    if (modifier === 'random') {
      return this._getRandomItems(category, 1, random);
    }

    if (modifier === 'all') {
      const items = this.wildcards[category] || [];
      return items.join(', ');
    }

    if (modifier.endsWith('random')) {
      // Extract number from '3random', '5random', etc.
      const countStr = modifier.slice(0, -6);
      const count = parseInt(countStr, 10);
      if (!isNaN(count)) {
        return this._getRandomItems(category, count, random);
      }
    }

    // Unknown modifier, treat as random
    return this._getRandomItems(category, 1, random);
  }

  /**
   * Get random items from a wildcard category
   */
  private _getRandomItems(
    category: string,
    count: number,
    random: () => number
  ): string {
    const items = this.wildcards[category];

    if (!items || items.length === 0) {
      return `{unknown:${category}}`;
    }

    if (count === 1) {
      const index = Math.floor(random() * items.length);
      return items[index];
    }

    // Select N random items without replacement
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    return selected.join(', ');
  }

  /**
   * Generate multiple variations of a template
   *
   * @param template - Template string with wildcards
   * @param count - Number of variations to generate
   * @returns Array of resolved template variations
   */
  generateVariations(template: string, count: number = 3): string[] {
    const variations: string[] = [];
    const baseSeed = Date.now();

    for (let i = 0; i < count; i++) {
      const variation = this.resolve(template, {}, baseSeed + i);
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Create experiment matrix (cartesian product of all combinations)
   *
   * @param template - Template string with wildcards
   * @param matrixConfig - Dict mapping wildcard names to lists of specific values
   * @returns Matrix with all combinations
   *
   * @example
   * createExperimentMatrix(
   *   "A portrait in {style} style with {lighting} lighting",
   *   {
   *     style: ['baroque', 'minimalist', 'cyberpunk'],
   *     lighting: ['natural', 'dramatic']
   *   }
   * )
   * // Returns 6 combinations (3 styles x 2 lighting)
   */
  createExperimentMatrix(
    template: string,
    matrixConfig: Record<string, string[]>
  ): ExperimentMatrix {
    const keys = Object.keys(matrixConfig);
    const values = keys.map(k => matrixConfig[k]);

    // Generate cartesian product
    const cartesian = this._cartesianProduct(values);

    const combinations: ExperimentResult[] = cartesian.map((combo, idx) => {
      const wildcards: Record<string, string> = {};
      keys.forEach((key, i) => {
        wildcards[key] = combo[i];
      });

      const prompt = this.resolve(template, wildcards);

      return {
        prompt,
        wildcards,
        id: `experiment_${Date.now()}_${idx}`
      };
    });

    return {
      combinations,
      totalCombinations: combinations.length,
      matrixConfig
    };
  }

  /**
   * Generate cartesian product of arrays
   */
  private _cartesianProduct(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]];

    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])),
      [[]]
    );
  }

  /**
   * Get list of available wildcard categories
   */
  getCategories(): string[] {
    return Object.keys(this.wildcards);
  }

  /**
   * Get all values for a specific wildcard category
   */
  getValues(category: string): string[] {
    return this.wildcards[category] || [];
  }

  /**
   * Add a new wildcard category or update existing one
   */
  addCategory(category: string, values: string[]): void {
    this.wildcards[category] = values;
  }

  /**
   * Remove a wildcard category
   */
  removeCategory(category: string): void {
    delete this.wildcards[category];
  }

  /**
   * Check if a category exists
   */
  hasCategory(category: string): boolean {
    return category in this.wildcards;
  }

  /**
   * Get total count of categories and values
   */
  getStats(): { categories: number; totalValues: number } {
    const categories = this.getCategories().length;
    const totalValues = Object.values(this.wildcards)
      .reduce((sum, arr) => sum + arr.length, 0);

    return { categories, totalValues };
  }

  /**
   * Extract wildcards from a template (for UI autocomplete)
   */
  extractWildcards(template: string): Array<{ category: string; modifier?: string }> {
    const wildcards: Array<{ category: string; modifier?: string }> = [];

    this.wildcardPattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = this.wildcardPattern.exec(template)) !== null) {
      const content = match[1];
      const parts = content.split(':');
      wildcards.push({
        category: parts[0],
        modifier: parts[1]
      });
    }

    return wildcards;
  }

  /**
   * Check if template contains any wildcards
   */
  hasWildcards(template: string): boolean {
    this.wildcardPattern.lastIndex = 0;
    return this.wildcardPattern.test(template);
  }

  /**
   * Get content rating metadata
   */
  getContentRating(): string | undefined {
    return this.metadata.content_rating || this.metadata._metadata?.content_rating;
  }
}

// Export singleton instance
export const wildcardService = new WildcardService();

// Export class for testing
export { WildcardService };

// Convenience function
export async function resolveWildcards(
  template: string,
  overrides: Record<string, string | number> = {},
  seed?: number
): Promise<string> {
  await wildcardService.load();
  return wildcardService.resolve(template, overrides, seed);
}

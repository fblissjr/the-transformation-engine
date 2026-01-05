/**
 * File-based Fragment Data Source
 *
 * Adapter for loading fragments from static files in /public directory.
 * Used by Image Studio for file-based fragments.
 */

import {
  FragmentDataSource,
  UnifiedFragment,
  FragmentStats,
  FragmentCategory,
} from './types';

/**
 * Fragment file definition
 */
interface FragmentFile {
  category: string;
  file: string;
  name: string;
}

/**
 * Category definitions for Image Studio fragments
 */
const IMAGE_STUDIO_CATEGORIES: FragmentCategory[] = [
  { id: 'lighting', name: 'Lighting' },
  { id: 'camera', name: 'Camera' },
  { id: 'style', name: 'Style' },
  { id: 'editing', name: 'Editing' },
  { id: 'composition', name: 'Composition' },
  { id: 'color', name: 'Color' },
];

/**
 * Fragment file mapping (56 total fragments)
 */
const FRAGMENT_FILES: FragmentFile[] = [
  // Lighting (10)
  { category: 'lighting', file: 'golden-hour-emphasis.md', name: 'Golden Hour' },
  { category: 'lighting', file: 'natural-outdoor-emphasis.md', name: 'Natural Outdoor' },
  { category: 'lighting', file: 'studio-professional-emphasis.md', name: 'Studio Professional' },
  { category: 'lighting', file: 'dramatic-low-key-emphasis.md', name: 'Dramatic Low-Key' },
  { category: 'lighting', file: 'soft-diffused-emphasis.md', name: 'Soft Diffused' },
  { category: 'lighting', file: 'neon-cyberpunk-emphasis.md', name: 'Neon Cyberpunk' },
  { category: 'lighting', file: 'backlighting-rim-emphasis.md', name: 'Backlighting Rim' },
  { category: 'lighting', file: 'chiaroscuro-emphasis.md', name: 'Chiaroscuro' },
  { category: 'lighting', file: 'overhead-harsh-emphasis.md', name: 'Overhead Harsh' },
  { category: 'lighting', file: 'colored-gel-emphasis.md', name: 'Colored Gel' },

  // Camera (10)
  { category: 'camera', file: 'portrait-professional-emphasis.md', name: 'Portrait Professional' },
  { category: 'camera', file: 'documentary-natural-emphasis.md', name: 'Documentary Natural' },
  { category: 'camera', file: 'wide-angle-dramatic-emphasis.md', name: 'Wide Angle Dramatic' },
  { category: 'camera', file: 'telephoto-compressed-emphasis.md', name: 'Telephoto Compressed' },
  { category: 'camera', file: 'macro-closeup-emphasis.md', name: 'Macro Closeup' },
  { category: 'camera', file: 'dutch-angle-emphasis.md', name: 'Dutch Angle' },
  { category: 'camera', file: 'low-angle-hero-emphasis.md', name: 'Low Angle Hero' },
  { category: 'camera', file: 'high-angle-vulnerable-emphasis.md', name: 'High Angle Vulnerable' },
  { category: 'camera', file: 'birds-eye-overhead-emphasis.md', name: 'Birds-Eye Overhead' },
  { category: 'camera', file: 'pov-first-person-emphasis.md', name: 'POV First-Person' },

  // Style (10)
  { category: 'style', file: 'editorial-high-fashion-emphasis.md', name: 'Editorial High Fashion' },
  { category: 'style', file: 'documentary-authentic-emphasis.md', name: 'Documentary Authentic' },
  { category: 'style', file: 'cinematic-widescreen-emphasis.md', name: 'Cinematic Widescreen' },
  { category: 'style', file: 'vintage-film-emphasis.md', name: 'Vintage Film' },
  { category: 'style', file: 'minimalist-clean-emphasis.md', name: 'Minimalist Clean' },
  { category: 'style', file: 'gritty-urban-emphasis.md', name: 'Gritty Urban' },
  { category: 'style', file: 'dreamy-ethereal-emphasis.md', name: 'Dreamy Ethereal' },
  { category: 'style', file: 'hyperrealistic-detailed-emphasis.md', name: 'Hyperrealistic' },
  { category: 'style', file: 'painterly-artistic-emphasis.md', name: 'Painterly Artistic' },
  { category: 'style', file: 'noir-dramatic-emphasis.md', name: 'Noir Dramatic' },

  // Editing (10)
  { category: 'editing', file: 'remove-object-emphasis.md', name: 'Remove Object' },
  { category: 'editing', file: 'style-transfer-emphasis.md', name: 'Style Transfer' },
  { category: 'editing', file: 'add-film-grain-emphasis.md', name: 'Add Film Grain' },
  { category: 'editing', file: 'color-grade-teal-orange-emphasis.md', name: 'Teal & Orange Grade' },
  { category: 'editing', file: 'increase-contrast-emphasis.md', name: 'Increase Contrast' },
  { category: 'editing', file: 'add-vignette-emphasis.md', name: 'Add Vignette' },
  { category: 'editing', file: 'desaturate-selective-emphasis.md', name: 'Selective Desaturation' },
  { category: 'editing', file: 'sharpen-details-emphasis.md', name: 'Sharpen Details' },
  { category: 'editing', file: 'add-glow-emphasis.md', name: 'Add Glow' },
  { category: 'editing', file: 'add-texture-overlay-emphasis.md', name: 'Texture Overlay' },

  // Composition (8)
  { category: 'composition', file: 'rule-of-thirds-emphasis.md', name: 'Rule of Thirds' },
  { category: 'composition', file: 'centered-symmetrical-emphasis.md', name: 'Centered Symmetrical' },
  { category: 'composition', file: 'leading-lines-emphasis.md', name: 'Leading Lines' },
  { category: 'composition', file: 'frame-within-frame-emphasis.md', name: 'Frame Within Frame' },
  { category: 'composition', file: 'negative-space-emphasis.md', name: 'Negative Space' },
  { category: 'composition', file: 'foreground-interest-emphasis.md', name: 'Foreground Interest' },
  { category: 'composition', file: 'diagonal-dynamic-emphasis.md', name: 'Diagonal Dynamic' },
  { category: 'composition', file: 'pattern-repetition-emphasis.md', name: 'Pattern Repetition' },

  // Color (8)
  { category: 'color', file: 'warm-sunset-palette-emphasis.md', name: 'Warm Sunset Palette' },
  { category: 'color', file: 'cool-blue-palette-emphasis.md', name: 'Cool Blue Palette' },
  { category: 'color', file: 'monochrome-palette-emphasis.md', name: 'Monochrome' },
  { category: 'color', file: 'vibrant-saturated-emphasis.md', name: 'Vibrant Saturated' },
  { category: 'color', file: 'muted-desaturated-emphasis.md', name: 'Muted Desaturated' },
  { category: 'color', file: 'complementary-contrast-emphasis.md', name: 'Complementary Contrast' },
  { category: 'color', file: 'pastel-soft-emphasis.md', name: 'Pastel Soft' },
  { category: 'color', file: 'earth-tones-emphasis.md', name: 'Earth Tones' },
];

/**
 * File-based fragment data source
 */
export class FileFragmentSource implements FragmentDataSource {
  private basePath: string;
  private cache: UnifiedFragment[] | null = null;
  private cacheTime = 0;
  private readonly CACHE_TTL = 300000; // 5 minutes (files don't change often)
  private isLoading = false;
  private loadPromise: Promise<UnifiedFragment[]> | null = null;

  constructor(basePath = '/image-studio/fragments') {
    this.basePath = basePath;
  }

  /**
   * Load all fragments from files (with caching)
   */
  private async loadAllFragments(): Promise<UnifiedFragment[]> {
    const now = Date.now();

    // Return cached if valid
    if (this.cache && now - this.cacheTime < this.CACHE_TTL) {
      return this.cache;
    }

    // Deduplicate concurrent requests
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.fetchFragments();

    try {
      this.cache = await this.loadPromise;
      this.cacheTime = now;
      return this.cache;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * Fetch fragments from files
   */
  private async fetchFragments(): Promise<UnifiedFragment[]> {
    const fragments: UnifiedFragment[] = [];

    for (const frag of FRAGMENT_FILES) {
      try {
        const response = await fetch(`${this.basePath}/${frag.category}/${frag.file}`);
        if (response.ok) {
          const content = await response.text();

          // Extract description from first line if it starts with #
          const lines = content.split('\n');
          const description = lines[0].startsWith('#')
            ? lines[0].replace(/^#\s*/, '')
            : content.substring(0, 100) + '...';

          fragments.push({
            id: `${frag.category}-${frag.file}`,
            name: frag.name,
            category: frag.category,
            content,
            description,
          });
        }
      } catch (err) {
        console.error(`Failed to load fragment ${frag.file}:`, err);
      }
    }

    return fragments;
  }

  /**
   * Get all fragments with optional category filter
   */
  async getAllFragments(category?: string, limit = 100): Promise<UnifiedFragment[]> {
    const all = await this.loadAllFragments();

    let filtered = category
      ? all.filter(f => f.category === category)
      : all;

    return filtered.slice(0, limit);
  }

  /**
   * Search fragments by keyword
   */
  async searchFragments(
    query: string,
    category?: string,
    limit = 20
  ): Promise<UnifiedFragment[]> {
    const all = await this.loadAllFragments();
    const queryLower = query.toLowerCase();

    let results = all.filter(f => {
      const matchesQuery =
        f.name.toLowerCase().includes(queryLower) ||
        f.description?.toLowerCase().includes(queryLower) ||
        f.content.toLowerCase().includes(queryLower);

      if (category) {
        return matchesQuery && f.category === category;
      }
      return matchesQuery;
    });

    return results.slice(0, limit);
  }

  /**
   * Get fragments by category
   */
  async getFragmentsByCategory(category: string, limit = 100): Promise<UnifiedFragment[]> {
    return this.getAllFragments(category, limit);
  }

  /**
   * Get category statistics
   */
  async getStats(): Promise<FragmentStats> {
    const all = await this.loadAllFragments();

    const byCategory: Record<string, number> = {};
    for (const cat of IMAGE_STUDIO_CATEGORIES) {
      byCategory[cat.id] = 0;
    }

    for (const fragment of all) {
      if (byCategory[fragment.category] !== undefined) {
        byCategory[fragment.category]++;
      }
    }

    return {
      totalFragments: all.length,
      byCategory,
    };
  }

  /**
   * Get available categories with counts
   */
  async getCategories(): Promise<FragmentCategory[]> {
    const stats = await this.getStats();

    return IMAGE_STUDIO_CATEGORIES.map(cat => ({
      ...cat,
      count: stats.byCategory[cat.id] || 0,
    }));
  }

  /**
   * Invalidate the cache
   */
  invalidateCache(): void {
    this.cache = null;
    this.cacheTime = 0;
  }
}

/**
 * Singleton instance for convenience
 */
export const fileFragmentSource = new FileFragmentSource();

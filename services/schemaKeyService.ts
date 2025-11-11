/**
 * Schema Key Service
 *
 * Manages schema key presets for The Transformation Engine.
 * Global presets are loaded from JSON, custom presets are stored in localStorage.
 *
 * Auto-suggestion logic based on scene classification and output format.
 */

import { SchemaKeyPreset, SceneClassification } from '../types/intermediate';
import { SchemaKeyPresetSchema } from '../types/schemas';

const CUSTOM_PRESETS_KEY = 'schemaKeyPresets_custom';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SuggestionResult {
  presetId: string;
  reasoning: string;
}

interface CachedPresets {
  presets: SchemaKeyPreset[];
  timestamp: number;
}

class SchemaKeyService {
  private globalPresetsCache: SchemaKeyPreset[] | null = null;
  private customPresetsCache: Map<string, SchemaKeyPreset> = new Map();

  /**
   * Load global presets from schema_presets.json
   */
  async loadGlobalPresets(): Promise<SchemaKeyPreset[]> {
    if (this.globalPresetsCache) {
      return this.globalPresetsCache;
    }

    try {
      const response = await fetch('/veo3/schema_presets.json');
      if (!response.ok) {
        throw new Error(`Failed to load schema presets: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate and mark as global
      const presets: SchemaKeyPreset[] = data.presets.map((preset: any) => ({
        ...preset,
        isGlobal: true,
      }));

      // Validate each preset
      presets.forEach(preset => {
        const result = SchemaKeyPresetSchema.safeParse(preset);
        if (!result.success) {
          console.error(`Invalid preset ${preset.id}:`, result.error);
        }
      });

      this.globalPresetsCache = presets;
      return presets;
    } catch (error) {
      console.error('Failed to load global presets:', error);
      return [];
    }
  }

  /**
   * Get all custom user-created presets from localStorage
   */
  getCustomPresets(): SchemaKeyPreset[] {
    try {
      const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
      if (!stored) {
        return [];
      }

      const presets: SchemaKeyPreset[] = JSON.parse(stored);

      // Rebuild cache
      this.customPresetsCache.clear();
      presets.forEach(preset => {
        this.customPresetsCache.set(preset.id, preset);
      });

      return presets;
    } catch (error) {
      console.error('Failed to load custom presets:', error);
      return [];
    }
  }

  /**
   * Get all presets (global + custom)
   */
  async getAllPresets(): Promise<SchemaKeyPreset[]> {
    const global = await this.loadGlobalPresets();
    const custom = this.getCustomPresets();
    return [...global, ...custom];
  }

  /**
   * Get preset by ID (checks both global and custom)
   */
  async getPresetById(id: string): Promise<SchemaKeyPreset | null> {
    // Check cache first
    if (this.customPresetsCache.has(id)) {
      return this.customPresetsCache.get(id)!;
    }

    // Check global
    const global = await this.loadGlobalPresets();
    const globalPreset = global.find(p => p.id === id);
    if (globalPreset) {
      return globalPreset;
    }

    // Check custom
    const custom = this.getCustomPresets();
    return custom.find(p => p.id === id) || null;
  }

  /**
   * Save custom preset to localStorage
   */
  saveCustomPreset(preset: SchemaKeyPreset): void {
    // Validate
    const result = SchemaKeyPresetSchema.safeParse(preset);
    if (!result.success) {
      throw new Error(`Invalid preset: ${result.error.message}`);
    }

    // Ensure it's marked as custom
    preset.isGlobal = false;

    // Get existing custom presets
    const custom = this.getCustomPresets();

    // Update or add
    const index = custom.findIndex(p => p.id === preset.id);
    if (index >= 0) {
      custom[index] = preset;
    } else {
      custom.push(preset);
    }

    // Save to localStorage
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(custom));

    // Update cache
    this.customPresetsCache.set(preset.id, preset);
  }

  /**
   * Delete custom preset from localStorage
   */
  deleteCustomPreset(id: string): void {
    const custom = this.getCustomPresets();
    const filtered = custom.filter(p => p.id !== id);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(filtered));
    this.customPresetsCache.delete(id);
  }

  /**
   * Auto-suggest preset based on scene classification and output format
   *
   * Rules (from schema_presets.json):
   * 1. Dialogue-heavy + Veo 3.1 → veo31-dialogue
   * 2. Action + Veo 3.1 → veo31-timestamp
   * 3. Animation + Veo 3.1 → veo31-animation
   * 4. Camera movement keywords + Veo 3.1 → veo31-cinematic
   * 5. Sora 2 → sora2-standard
   * 6. Default → format-specific default or generic-versatile
   */
  async suggestPreset(
    classification: SceneClassification,
    outputFormat: 'veo3' | 'sora2' | 'generic'
  ): Promise<SuggestionResult> {
    const globalPresets = await this.loadGlobalPresets();

    // Rule 1: Dialogue-heavy + Veo 3.1 → veo31-dialogue
    if (
      classification.narrative.some(tag => tag.toLowerCase().includes('dialogue')) &&
      outputFormat === 'veo3'
    ) {
      return {
        presetId: 'veo31-dialogue',
        reasoning: 'Dialogue-Heavy narrative + Veo 3.1 output suggests audio-focused preset with explicit dialogue and sound effects'
      };
    }

    // Rule 2: Action + Veo 3.1 → veo31-timestamp
    if (
      (classification.genre.some(tag => tag.toLowerCase().includes('action')) ||
       classification.narrative.some(tag => tag.toLowerCase().includes('action'))) &&
      outputFormat === 'veo3'
    ) {
      return {
        presetId: 'veo31-timestamp',
        reasoning: 'Action scenes + Veo 3.1 suggest timestamp prompting for precise pacing control'
      };
    }

    // Rule 3: Animation + Veo 3.1 → veo31-animation
    if (
      classification.format.some(tag => tag.toLowerCase().includes('animation')) &&
      outputFormat === 'veo3'
    ) {
      return {
        presetId: 'veo31-animation',
        reasoning: 'Animation format + Veo 3.1 suggests stylized preset optimized for creative animation'
      };
    }

    // Rule 4: Camera movement keywords + Veo 3.1 → veo31-cinematic
    const cameraKeywords = ['aerial', 'drone', 'tracking', 'orbiting', 'crane', 'dolly'];
    if (
      classification.camera.some(tag =>
        cameraKeywords.some(kw => tag.toLowerCase().includes(kw))
      ) &&
      outputFormat === 'veo3'
    ) {
      return {
        presetId: 'veo31-cinematic',
        reasoning: 'Dynamic camera movement + Veo 3.1 suggests cinematic preset with wide shots and camera choreography'
      };
    }

    // Rule 5: Sora 2 → sora2-standard
    if (outputFormat === 'sora2') {
      return {
        presetId: 'sora2-standard',
        reasoning: 'Sora 2 output format suggests physics-based prompting with imperial units and GPT-5 methodology'
      };
    }

    // Rule 6: Default per output format
    const defaultPreset = globalPresets.find(
      p => p.isDefault && p.modelFamily === outputFormat
    );

    if (defaultPreset) {
      return {
        presetId: defaultPreset.id,
        reasoning: `Default ${outputFormat.toUpperCase()} preset for general use`
      };
    }

    // Fallback to generic
    return {
      presetId: 'generic-versatile',
      reasoning: 'No specific match found - using versatile model-agnostic preset'
    };
  }

  /**
   * Get presets by model family
   */
  async getPresetsByModelFamily(
    modelFamily: 'veo3' | 'sora2' | 'generic'
  ): Promise<SchemaKeyPreset[]> {
    const all = await this.getAllPresets();
    return all.filter(p => p.modelFamily === modelFamily);
  }

  /**
   * Search presets by keyword (searches name, description, tags)
   */
  async searchPresets(query: string): Promise<SchemaKeyPreset[]> {
    const all = await this.getAllPresets();
    const lowerQuery = query.toLowerCase();

    return all.filter(preset =>
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery) ||
      preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      preset.recommendedFor.some(use => use.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Clear global presets cache (for testing or reload)
   */
  clearCache(): void {
    this.globalPresetsCache = null;
    this.customPresetsCache.clear();
  }
}

export const schemaKeyService = new SchemaKeyService();

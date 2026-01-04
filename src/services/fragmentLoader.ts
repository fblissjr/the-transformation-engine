/**
 * Fragment Loader - Simple fragment loading and composition
 *
 * Loads prompt fragments from /fragments/ directory
 * and composes them into complete prompts.
 *
 * Supports:
 * - @include[path/to/fragment.md] directives
 * - {{variable}} interpolation with defaults
 * - {{#if variable}}...{{/if}} conditionals
 * - {wildcard} dynamic substitution (via wildcardService)
 */

import { wildcardService } from './wildcardService';

interface Fragment {
  id: string;
  version: string;
  category: string;
  priority: string;
  content: string;
  metadata: Record<string, any>;
}

/**
 * FragmentLoader class
 *
 * Handles loading, parsing, caching, and composing prompt fragments.
 * Fragments are Markdown files with optional YAML frontmatter.
 * Supports variable interpolation and recursive inclusion of fragments.
 */
class FragmentLoader {
  private cache: Map<string, Fragment> = new Map();
  private loadedFragments: Set<string> = new Set(); // Track fragments used in current composition

  /**
   * Load a fragment from the fragments directory
   *
   * @param path - The relative path to the fragment file.
   * @returns A Promise resolving to the parsed Fragment object.
   * @throws Error if the fragment cannot be fetched or parsed.
   */
  async loadFragment(path: string): Promise<Fragment> {
    // Check cache
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    try {
      // Fetch from public directory (served at root by Vite)
      // If path starts with /, it's absolute (e.g., /core/template.md)
      // Otherwise, assume it's relative to /fragments/
      const fullPath = path.startsWith('/') ? path : `/fragments/${path}`;
      console.log(`[FragmentLoader] Loading: ${path} -> ${fullPath}`);
      const response = await fetch(fullPath);

      if (!response.ok) {
        console.error(`[FragmentLoader] Failed to fetch: ${fullPath}, status: ${response.status}`);
        throw new Error(`Fragment not found: ${path} (tried: ${fullPath})`);
      }

      console.log(`[FragmentLoader] Successfully loaded: ${fullPath}`);

      const raw = await response.text();
      const fragment = this.parseFragment(raw);

      // Cache it
      this.cache.set(path, fragment);

      return fragment;
    } catch (error) {
      console.error(`Failed to load fragment: ${path}`, error);
      throw error;
    }
  }

  /**
   * Parse fragment with optional YAML frontmatter
   * If no frontmatter exists, treats entire content as fragment content
   */
  private parseFragment(raw: string): Fragment {
    const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!frontmatterMatch) {
      // No frontmatter - treat entire content as fragment
      return {
        id: 'unknown',
        version: '1.0.0',
        category: 'unknown',
        priority: 'medium',
        content: raw.trim(),
        metadata: {},
      };
    }

    const [, frontmatter, content] = frontmatterMatch;
    const metadata = this.parseYAML(frontmatter);

    return {
      id: metadata.id || 'unknown',
      version: metadata.version || '1.0.0',
      category: metadata.category || 'unknown',
      priority: metadata.priority || 'medium',
      content: content.trim(),
      metadata,
    };
  }

  /**
   * Simple YAML parser (only handles our fragment frontmatter format)
   */
  private parseYAML(yaml: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = yaml.split('\n');

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        // Handle arrays [item1, item2]
        if (value.startsWith('[') && value.endsWith(']')) {
          result[key] = value
            .slice(1, -1)
            .split(',')
            .map(s => s.trim());
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Compose a prompt by resolving @include directives, {{variables}}, and {wildcards}
   *
   * @param template - The template string containing include directives and variables.
   * @param variables - A map of variable names to values for substitution.
   * @param options - Additional options for composition.
   * @returns A Promise resolving to the composed prompt string.
   */
  async composePrompt(
    template: string,
    variables: Record<string, string | null> = {},
    options: {
      resolveWildcards?: boolean;
      wildcardOverrides?: Record<string, string | number>;
      wildcardSeed?: number;
    } = {}
  ): Promise<string> {
    const {
      resolveWildcards = true,
      wildcardOverrides = {},
      wildcardSeed,
    } = options;

    // Reset fragment tracking for new composition
    this.loadedFragments.clear();

    let output = template;

    // Replace @include directives
    const includePattern = /@include\[([^\]]+)\]/g;
    const includes = template.matchAll(includePattern);

    for (const match of includes) {
      const fullDirective = match[1];
      // Parse: path/to/file.md | param="value" | param2="value2"
      const parts = fullDirective.split('|').map(p => p.trim());
      const fragmentPath = parts[0];

      // Parse parameters (everything after the path)
      const fragmentVars: Record<string, string> = {};
      for (let i = 1; i < parts.length; i++) {
        const paramMatch = parts[i].match(/^(\w+)=["'](.*)["']$/);
        if (paramMatch) {
          const [, key, value] = paramMatch;
          fragmentVars[key] = value;
        }
      }

      try {
        const fragment = await this.loadFragment(fragmentPath);
        this.loadedFragments.add(fragmentPath); // Track this fragment

        // Interpolate variables in the fragment content before replacing
        // Merge fragmentVars with parent variables (fragmentVars takes precedence)
        const mergedVars = { ...variables, ...fragmentVars };
        const interpolatedContent = this.interpolateVariables(fragment.content, mergedVars);
        output = output.replace(match[0], interpolatedContent);
      } catch (error) {
        console.warn(`Failed to include fragment: ${fragmentPath}`, error);
        // Leave the @include directive in place if it fails
      }
    }

    // Replace {{variables}} (double braces)
    output = this.interpolateVariables(output, variables);

    // Resolve {wildcards} (single braces) if enabled
    if (resolveWildcards && this.hasWildcards(output)) {
      await wildcardService.load();
      output = wildcardService.resolve(output, wildcardOverrides, wildcardSeed);
    }

    return output;
  }

  /**
   * Check if text contains wildcard syntax {category} or {category:modifier}
   * Excludes double-brace {{variable}} syntax
   */
  private hasWildcards(text: string): boolean {
    // Match {word} but not {{word}}
    // Look for single braces that aren't part of double braces
    const wildcardPattern = /(?<!\{)\{([a-zA-Z_][a-zA-Z0-9_]*)(:[^}]*)?\}(?!\})/;
    return wildcardPattern.test(text);
  }

  /**
   * Get list of fragments used in the most recent composition
   *
   * @returns Array of fragment paths.
   */
  getLoadedFragments(): string[] {
    return Array.from(this.loadedFragments);
  }

  /**
   * Reset the loaded fragments tracker
   */
  resetLoadedFragments(): void {
    this.loadedFragments.clear();
  }

  /**
   * Replace {{variable}} placeholders with values
   * Also handles {{#if variable}}...{{/if}} conditionals
   */
  private interpolateVariables(
    template: string,
    variables: Record<string, string | null>
  ): string {
    let output = template;

    // Handle {{#if variable}}...{{/if}} conditionals
    const conditionalPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    output = output.replace(conditionalPattern, (match, varName, content) => {
      const value = variables[varName.trim()];
      // Include content if variable exists and is not null/empty
      if (value !== null && value !== undefined && value !== '') {
        return content;
      }
      return ''; // Remove conditional block if variable is falsy
    });

    // Handle simple {{variable}} replacements
    output = output.replace(/\{\{([^}|#\/]+)(?:\|([^}]+))?\}\}/g, (match, varName, defaultValue) => {
      const value = variables[varName.trim()];

      if (value !== undefined && value !== null) {
        return value;
      }

      if (defaultValue !== undefined) {
        return defaultValue.trim();
      }

      console.warn(`Unresolved variable: ${varName}`);
      return match; // Leave unresolved for debugging
    });

    return output;
  }

  /**
   * Clear the fragment cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const fragmentLoader = new FragmentLoader();

// Export for testing
export { FragmentLoader };

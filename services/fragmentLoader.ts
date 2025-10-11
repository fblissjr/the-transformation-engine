/**
 * Fragment Loader - Simple fragment loading and composition
 *
 * Loads prompt fragments from /fragments/ directory
 * and composes them into complete prompts.
 */

interface Fragment {
  id: string;
  version: string;
  category: string;
  priority: string;
  content: string;
  metadata: Record<string, any>;
}

class FragmentLoader {
  private cache: Map<string, Fragment> = new Map();
  private loadedFragments: Set<string> = new Set(); // Track fragments used in current composition

  /**
   * Load a fragment from the fragments directory
   */
  async loadFragment(path: string): Promise<Fragment> {
    // Check cache
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    try {
      // Fetch from public directory (served at root by Vite)
      const fullPath = `/fragments/${path}`;
      const response = await fetch(fullPath);

      if (!response.ok) {
        throw new Error(`Fragment not found: ${path}`);
      }

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
   * Compose a prompt by resolving @include directives and {{variables}}
   */
  async composePrompt(
    template: string,
    variables: Record<string, string> = {}
  ): Promise<string> {
    // Reset fragment tracking for new composition
    this.loadedFragments.clear();

    let output = template;

    // Replace @include directives
    const includePattern = /@include\[([^\]]+)\]/g;
    const includes = template.matchAll(includePattern);

    for (const match of includes) {
      const fragmentPath = match[1];
      try {
        const fragment = await this.loadFragment(fragmentPath);
        this.loadedFragments.add(fragmentPath); // Track this fragment
        output = output.replace(match[0], fragment.content);
      } catch (error) {
        console.warn(`Failed to include fragment: ${fragmentPath}`, error);
        // Leave the @include directive in place if it fails
      }
    }

    // Replace {{variables}}
    output = this.interpolateVariables(output, variables);

    return output;
  }

  /**
   * Get list of fragments used in the most recent composition
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
   */
  private interpolateVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    return template.replace(/\{\{([^}|]+)(?:\|([^}]+))?\}\}/g, (match, varName, defaultValue) => {
      const value = variables[varName.trim()];

      if (value !== undefined) {
        return value;
      }

      if (defaultValue !== undefined) {
        return defaultValue.trim();
      }

      console.warn(`Unresolved variable: ${varName}`);
      return match; // Leave unresolved for debugging
    });
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

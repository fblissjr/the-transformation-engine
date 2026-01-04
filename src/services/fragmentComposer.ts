/**
 * Fragment Composer - Assembles prompts from fragments with intelligent composition
 *
 * Ported from gemimg/composer.py
 *
 * Features:
 * - Composition syntax: "fragment1 | fragment2 | fragment3"
 * - Intelligent fragment ordering (action -> specification -> constraint)
 * - Auto-constraint suggestion via relationships
 * - Wildcard resolution integration
 */

import { fragmentLibraryService, Fragment, FragmentCategory } from './fragmentLibraryService';
import { wildcardService } from './wildcardService';

/**
 * Result of prompt composition
 */
export interface ComposedPrompt {
  text: string;
  fragmentsUsed: string[];
  suggestionsApplied: string[];
  mode: 'generation' | 'editing';
  metadata: {
    totalFragments: number;
    autoConstraints: boolean;
    wildcardValues: Record<string, string>;
  };
}

/**
 * Options for composition
 */
export interface CompositionOptions {
  autoConstraints?: boolean;
  maxSuggestions?: number;
  mode?: 'generation' | 'editing';
  wildcardValues?: Record<string, string>;
  seed?: number;
}

/**
 * Category priority for ordering
 */
const CATEGORY_PRIORITY: Record<FragmentCategory, number> = {
  'role': 0,
  'instruction': 1,
  'action': 2,
  'specification': 3,
  'constraint': 4,
};

/**
 * Fragment Composer class
 */
class FragmentComposer {
  /**
   * Compose prompt from pipe-separated syntax
   *
   * @param syntax - Composition syntax like "action:remove | constraint:ensuring"
   * @param options - Composition options
   * @returns Composed prompt result
   *
   * @example
   * compose("action:remove | specification:style", {
   *   wildcardValues: { target: "red car" },
   *   autoConstraints: true
   * })
   */
  async compose(
    syntax: string,
    options: CompositionOptions = {}
  ): Promise<ComposedPrompt> {
    const {
      autoConstraints = false,
      maxSuggestions = 2,
      mode = 'generation',
      wildcardValues = {},
      seed,
    } = options;

    // Parse composition syntax
    const fragmentSpecs = syntax
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Resolve each spec to fragment
    const fragments: Fragment[] = [];
    const fragmentsUsed: string[] = [];

    for (const spec of fragmentSpecs) {
      const fragment = await this._resolveFragmentSpec(spec);
      if (fragment) {
        fragments.push(fragment);
        fragmentsUsed.push(fragment.id);
      }
    }

    // Auto-suggest constraints if enabled
    const suggestionsApplied: string[] = [];
    if (autoConstraints && fragments.length > 0) {
      const actionFragments = fragments.filter(f => f.category === 'action');

      for (const action of actionFragments) {
        const suggestions = await fragmentLibraryService.getSuggestedConstraints(action.id);
        const topSuggestions = suggestions.slice(0, maxSuggestions);

        for (const suggestion of topSuggestions) {
          // Don't add duplicates
          if (!fragments.some(f => f.id === suggestion.id)) {
            fragments.push(suggestion);
            suggestionsApplied.push(suggestion.id);
          }
        }
      }
    }

    // Order fragments by priority
    const orderedFragments = this._orderFragments(fragments);

    // Compose text from fragments
    const parts: string[] = [];
    for (const fragment of orderedFragments) {
      const rendered = this._renderFragment(fragment, wildcardValues);
      parts.push(rendered);
    }

    // Join with intelligent punctuation
    let text = this._joinFragments(parts);

    // Final wildcard resolution
    await wildcardService.load();
    text = wildcardService.resolve(text, wildcardValues, seed);

    return {
      text,
      fragmentsUsed,
      suggestionsApplied,
      mode,
      metadata: {
        totalFragments: orderedFragments.length,
        autoConstraints,
        wildcardValues,
      },
    };
  }

  /**
   * Compose an edit prompt with action and target
   *
   * @example
   * composeEditPrompt("remove", "red car", {
   *   constraints: ["seamlessly", "realistic lighting"],
   *   autoConstraints: true
   * })
   */
  async composeEditPrompt(
    action: string,
    target?: string,
    options: {
      constraints?: string[];
      location?: string;
      autoConstraints?: boolean;
      wildcardValues?: Record<string, string>;
    } = {}
  ): Promise<ComposedPrompt> {
    const {
      constraints = [],
      location,
      autoConstraints = true,
      wildcardValues = {},
    } = options;

    // Build syntax from action
    let syntax = `action:${action}`;

    // Add explicit constraints
    for (const constraint of constraints) {
      syntax += ` | constraint:${constraint}`;
    }

    // Merge target and location into wildcard values
    const mergedWildcards = { ...wildcardValues };
    if (target) mergedWildcards.target = target;
    if (location) mergedWildcards.location = location;

    return this.compose(syntax, {
      mode: 'editing',
      autoConstraints,
      wildcardValues: mergedWildcards,
    });
  }

  /**
   * Preview composition without full resolution
   * Useful for UI to show what will be composed
   */
  async previewComposition(syntax: string): Promise<{
    fragments: Fragment[];
    estimatedLength: number;
  }> {
    const fragmentSpecs = syntax
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const fragments: Fragment[] = [];

    for (const spec of fragmentSpecs) {
      const fragment = await this._resolveFragmentSpec(spec);
      if (fragment) {
        fragments.push(fragment);
      }
    }

    const ordered = this._orderFragments(fragments);
    const estimatedLength = ordered.reduce((sum, f) => sum + f.template.length, 0);

    return { fragments: ordered, estimatedLength };
  }

  /**
   * Suggest next fragments based on current composition
   */
  async suggestNextFragments(
    currentFragmentIds: string[],
    limit = 5
  ): Promise<Fragment[]> {
    const suggestions: Map<string, { fragment: Fragment; score: number }> = new Map();

    // Get suggestions from each current fragment's relationships
    for (const fragmentId of currentFragmentIds) {
      const related = await fragmentLibraryService.getSuggestedConstraints(fragmentId);

      for (const fragment of related) {
        if (currentFragmentIds.includes(fragment.id)) continue;

        const existing = suggestions.get(fragment.id);
        if (existing) {
          existing.score += 1;
        } else {
          suggestions.set(fragment.id, { fragment, score: 1 });
        }
      }
    }

    // Sort by score and return top N
    const sorted = Array.from(suggestions.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.fragment);

    return sorted;
  }

  /**
   * Resolve a fragment spec to an actual Fragment
   *
   * Tries in order:
   * 1. Exact ID match
   * 2. category:subcategory format
   * 3. Natural language search
   */
  private async _resolveFragmentSpec(spec: string): Promise<Fragment | null> {
    // 1. Try as exact ID
    const byId = await fragmentLibraryService.getFragment(spec);
    if (byId) return byId;

    // 2. Try as category:subcategory
    if (spec.includes(':')) {
      const [category, subcategory] = spec.split(':', 2);
      const fragments = await fragmentLibraryService.getFragmentsByCategory(
        category as FragmentCategory,
        subcategory,
        1
      );
      if (fragments.length > 0) return fragments[0];
    }

    // 3. Try natural language search
    const searchResults = await fragmentLibraryService.searchFragments(spec, undefined, 1);
    if (searchResults.length > 0) return searchResults[0];

    return null;
  }

  /**
   * Order fragments by priority
   * Role -> Instruction -> Action -> Specification -> Constraint
   */
  private _orderFragments(fragments: Fragment[]): Fragment[] {
    return [...fragments].sort((a, b) => {
      const priorityA = CATEGORY_PRIORITY[a.category] ?? 99;
      const priorityB = CATEGORY_PRIORITY[b.category] ?? 99;

      if (priorityA !== priorityB) return priorityA - priorityB;

      // Within same category, sort by sourceCount (popularity)
      return b.sourceCount - a.sourceCount;
    });
  }

  /**
   * Render a fragment with wildcard values
   */
  private _renderFragment(
    fragment: Fragment,
    wildcardValues: Record<string, string>
  ): string {
    let text = fragment.template;

    // Replace wildcards that have explicit values
    for (const [key, value] of Object.entries(wildcardValues)) {
      const pattern = new RegExp(`\\{${key}(:[^}]*)?\\}`, 'g');
      text = text.replace(pattern, value);
    }

    return text;
  }

  /**
   * Join fragment texts with intelligent punctuation
   */
  private _joinFragments(parts: string[]): string {
    if (parts.length === 0) return '';
    if (parts.length === 1) {
      let text = parts[0].trim();
      // Capitalize first letter
      text = text.charAt(0).toUpperCase() + text.slice(1);
      // Ensure ends with period
      if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
        text += '.';
      }
      return text;
    }

    const joinedParts: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i].trim();

      if (i === 0) {
        // First part - capitalize
        part = part.charAt(0).toUpperCase() + part.slice(1);
      } else {
        // Subsequent parts - lowercase first letter if it's uppercase
        if (part.charAt(0).toUpperCase() === part.charAt(0)) {
          part = part.charAt(0).toLowerCase() + part.slice(1);
        }
      }

      // Remove trailing punctuation (will add at end)
      part = part.replace(/[.,;]+$/, '');

      joinedParts.push(part);
    }

    // Join with commas and add final period
    let text = joinedParts.join(', ');
    if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
      text += '.';
    }

    return text;
  }
}

// Export singleton instance
export const fragmentComposer = new FragmentComposer();

// Export class for testing
export { FragmentComposer };

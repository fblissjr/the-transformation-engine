/**
 * FragmentSelector Types
 *
 * Unified types for the FragmentSelector component supporting both
 * panel (Video workspace) and modal (Image Studio) modes.
 */

// Re-export ComposedPrompt from fragmentComposer to ensure type consistency
export type { ComposedPrompt } from '../../../services/fragmentComposer';

/**
 * Unified fragment structure supporting both IndexedDB and file-based sources
 */
export interface UnifiedFragment {
  // Core fields (required)
  id: string;
  name: string;
  category: string;
  content: string;

  // Optional fields
  subcategory?: string;
  template?: string;
  description?: string;
  sourceCount?: number;
  wildcards?: Record<string, string[]>;
  examples?: string[];
  tags?: string[];
  metadata?: {
    contentRating?: 'safe' | 'artistic' | 'mature';
    requiresInputImages?: boolean;
    features?: string[];
    notes?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Category definition for filtering
 */
export interface FragmentCategory {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

/**
 * Statistics about fragments
 */
export interface FragmentStats {
  totalFragments: number;
  byCategory: Record<string, number>;
}

/**
 * Display modes for the FragmentSelector
 */
export type FragmentSelectorMode = 'panel' | 'modal';
export type CategoryDisplayMode = 'tabs' | 'sidebar';
export type FragmentDisplayMode = 'grid' | 'list';

/**
 * Abstract data source interface for fragments
 * Allows swapping between IndexedDB, files, API, etc.
 */
export interface FragmentDataSource {
  /**
   * Get all fragments (with optional category filter)
   */
  getAllFragments(category?: string, limit?: number): Promise<UnifiedFragment[]>;

  /**
   * Search fragments by keyword
   */
  searchFragments(query: string, category?: string, limit?: number): Promise<UnifiedFragment[]>;

  /**
   * Get fragments by category
   */
  getFragmentsByCategory(category: string, limit?: number): Promise<UnifiedFragment[]>;

  /**
   * Get category statistics
   */
  getStats(): Promise<FragmentStats>;

  /**
   * Get available categories
   */
  getCategories(): Promise<FragmentCategory[]>;

  /**
   * Get suggested constraints for a fragment (IndexedDB only)
   */
  getSuggestedConstraints?(fragmentId: string): Promise<UnifiedFragment[]>;
}

/**
 * Props for the unified FragmentSelector component
 */
export interface FragmentSelectorProps {
  /**
   * Display mode: embedded panel or modal overlay
   */
  mode: FragmentSelectorMode;

  /**
   * Data source adapter
   */
  dataSource: FragmentDataSource;

  /**
   * Callback when a fragment is selected
   */
  onSelectFragment: (fragment: UnifiedFragment) => void;

  /**
   * Modal-only: Close callback
   */
  onClose?: () => void;

  /**
   * Modal-only: Visibility control
   */
  isOpen?: boolean;

  /**
   * Enable composition features (Video workspace only)
   */
  enableComposition?: boolean;

  /**
   * Composition callback (Video workspace only)
   */
  onComposePrompt?: (composed: ComposedPrompt) => void;

  /**
   * Category display mode (defaults based on mode)
   */
  categoryDisplayMode?: CategoryDisplayMode;

  /**
   * Fragment display mode (defaults based on mode)
   */
  fragmentDisplayMode?: FragmentDisplayMode;

  /**
   * Category definitions (optional, inferred from data source if not provided)
   */
  categories?: FragmentCategory[];

  /**
   * Initial category selection
   */
  initialCategory?: string;

  /**
   * Custom class name for styling
   */
  className?: string;
}

/**
 * Props for FragmentCard component
 */
export interface FragmentCardProps {
  fragment: UnifiedFragment;
  onSelect: (fragment: UnifiedFragment) => void;
  onAdd?: (fragment: UnifiedFragment) => void;
  highlightQuery?: string;
  displayMode?: FragmentDisplayMode;
}

/**
 * Props for FragmentList component
 */
export interface FragmentListProps {
  fragments: UnifiedFragment[];
  isLoading: boolean;
  displayMode: FragmentDisplayMode;
  onSelectFragment: (fragment: UnifiedFragment) => void;
  onAddFragment?: (fragment: UnifiedFragment) => void;
  searchQuery?: string;
  emptyMessage?: string;
}

/**
 * Props for FragmentSearch component
 */
export interface FragmentSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Props for CategoryFilter component
 */
export interface CategoryFilterProps {
  mode: CategoryDisplayMode;
  categories: FragmentCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

/**
 * Props for FragmentSelectorHeader component
 */
export interface FragmentSelectorHeaderProps {
  mode: FragmentSelectorMode;
  stats?: FragmentStats;
  onClose?: () => void;
}

/**
 * Props for CompositionPanel component
 */
export interface CompositionPanelProps {
  selectedFragments: UnifiedFragment[];
  onRemoveFragment: (fragmentId: string) => void;
  onClearAll: () => void;
  suggestedConstraints: UnifiedFragment[];
  onAddSuggestion: (fragment: UnifiedFragment) => void;
  onCompose?: () => void;
  isComposing?: boolean;
  composedResult?: ComposedPrompt | null;
  compositionError?: string | null;
}

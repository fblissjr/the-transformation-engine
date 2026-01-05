/**
 * FragmentSelector Module
 *
 * Unified fragment browser supporting both panel and modal modes.
 */

// Main component
export { FragmentSelector } from './FragmentSelector';
export { default } from './FragmentSelector';

// Types
export type {
  UnifiedFragment,
  FragmentCategory,
  FragmentStats,
  ComposedPrompt,
  FragmentSelectorMode,
  CategoryDisplayMode,
  FragmentDisplayMode,
  FragmentDataSource,
  FragmentSelectorProps,
  FragmentCardProps,
  FragmentListProps,
  FragmentSearchProps,
  CategoryFilterProps,
  FragmentSelectorHeaderProps,
  CompositionPanelProps,
} from './types';

// Data Sources
export { IndexedDBFragmentSource, indexedDBFragmentSource } from './IndexedDBFragmentSource';
export { FileFragmentSource, fileFragmentSource } from './FileFragmentSource';

// Sub-components (for advanced customization)
export {
  FragmentSelectorHeader,
  FragmentSearch,
  CategoryFilter,
  FragmentCard,
  FragmentList,
  TabNavigation,
} from './components';

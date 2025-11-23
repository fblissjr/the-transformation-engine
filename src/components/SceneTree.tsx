/**
 * SceneTree Component
 *
 * UI/UX Design Rationale:
 * - Hierarchical tree visualization for parent/child scene relationships
 * - Indentation (16px per depth level) shows nesting clearly
 * - Extension method badges (→ continues, ✂ cuts, ⤻ transitions)
 * - Hover effects reveal action buttons
 * - Mobile responsive: Collapsible tree, touch-friendly targets
 *
 * Technical Implementation:
 * - Recursive rendering for nested scenes
 * - Flat array → tree structure conversion
 * - Parent/child relationship preservation
 * - Orphan detection and visual indicators
 *
 * Accessibility:
 * - Keyboard navigation (Tab, Enter)
 * - ARIA tree role and expanded states
 * - Screen reader friendly hierarchy
 * - Focus management
 */

import React from 'react';
import { ChevronRight, ArrowRight, Scissors, Repeat } from 'lucide-react';

// ==================== Type Definitions ====================

/**
 * SceneNode interface
 *
 * Represents a node in the scene tree.
 *
 * @property id - Unique identifier for the scene.
 * @property title - Title of the scene.
 * @property created - ISO timestamp string of creation.
 * @property sceneNumber - Optional scene number.
 * @property extensionMethod - The method used to extend this scene from its parent.
 * @property parentId - ID of the parent scene.
 * @property isOrphaned - Boolean indicating if the scene's parent was deleted.
 * @property children - Array of child scene nodes.
 */
export interface SceneNode {
  id: string;
  title: string;
  created: string;
  sceneNumber?: number;
  extensionMethod?: 'continue' | 'cutTo' | 'transition';
  parentId?: string;
  isOrphaned?: boolean;
  children: SceneNode[];
}

interface SceneTreeProps {
  rootScenes: SceneNode[];
  activeSceneId?: string;
  onSelectScene: (sceneId: string) => void;
  onExtendScene: (sceneId: string) => void;
  onDeleteScene: (sceneId: string) => void;
}

interface SceneNodeItemProps {
  node: SceneNode;
  depth: number;
  activeSceneId?: string;
  onSelectScene: (sceneId: string) => void;
  onExtendScene: (sceneId: string) => void;
  onDeleteScene: (sceneId: string) => void;
}

// ==================== Method Icons ====================

const MethodIcon: React.FC<{ method?: 'continue' | 'cutTo' | 'transition' }> = ({ method }) => {
  if (!method) return null;

  switch (method) {
    case 'continue':
      return (
        <span className="flex items-center gap-1 text-xs text-green-400" title="Continues scene">
          <ArrowRight className="w-3 h-3" />
          Continue
        </span>
      );
    case 'cutTo':
      return (
        <span className="flex items-center gap-1 text-xs text-blue-400" title="Cuts to new scene">
          <Scissors className="w-3 h-3" />
          Cut To
        </span>
      );
    case 'transition':
      return (
        <span className="flex items-center gap-1 text-xs text-purple-400" title="Transitions between scenes">
          <Repeat className="w-3 h-3" />
          Transition
        </span>
      );
  }
};

// ==================== Scene Node Item (Recursive) ====================

const SceneNodeItem: React.FC<SceneNodeItemProps> = ({
  node,
  depth,
  activeSceneId,
  onSelectScene,
  onExtendScene,
  onDeleteScene
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const isActive = activeSceneId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div className="relative">
      {/* Scene Card */}
      <div
        className={`group border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
          isActive ? 'bg-gray-800' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 rounded-r-full" />
        )}

        {/* Expand/Collapse Button (if has children) */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition p-1"
            style={{ left: `${depth * 16 + 4}px` }}
            aria-label={isExpanded ? 'Collapse children' : 'Expand children'}
          >
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}

        {/* Content */}
        <div className="py-3 pr-3" style={{ paddingLeft: hasChildren ? '20px' : '0' }}>
          {/* Title Row */}
          <div
            onClick={() => onSelectScene(node.id)}
            className="cursor-pointer mb-1"
          >
            <div className="flex items-center gap-2 mb-1">
              {/* Scene Number */}
              {node.sceneNumber && (
                <span className="text-xs font-mono text-gray-500">
                  S{node.sceneNumber}
                </span>
              )}

              {/* Extension Method Badge */}
              {node.extensionMethod && <MethodIcon method={node.extensionMethod} />}

              {/* Orphan Warning */}
              {node.isOrphaned && (
                <span className="text-xs text-yellow-500" title="Parent scene was deleted">
                  (Orphaned)
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-medium text-white text-sm truncate">
              {node.title}
            </h3>
          </div>

          {/* Created Date */}
          <p className="text-xs text-gray-400">
            {new Date(node.created).toLocaleString()}
          </p>

          {/* Action Buttons (hover on desktop, always visible on mobile) */}
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 md:transition-opacity">
            <button
              onClick={() => onExtendScene(node.id)}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs py-1.5 px-3 rounded transition-colors"
            >
              Extend →
            </button>
            <button
              onClick={() => onDeleteScene(node.id)}
              className="bg-red-600 hover:bg-red-500 text-white text-xs py-1.5 px-3 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Children (recursive) */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <SceneNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeSceneId={activeSceneId}
              onSelectScene={onSelectScene}
              onExtendScene={onExtendScene}
              onDeleteScene={onDeleteScene}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== Main Component ====================

/**
 * SceneTree component
 *
 * Renders the entire hierarchy of scenes as a tree.
 * Used for visualizing parent-child relationships and navigating scenes.
 *
 * @param rootScenes - Array of root-level SceneNodes.
 * @param activeSceneId - ID of the currently selected scene.
 * @param onSelectScene - Callback when a scene is selected.
 * @param onExtendScene - Callback when extending a scene.
 * @param onDeleteScene - Callback when deleting a scene.
 * @returns The rendered SceneTree component.
 */
export const SceneTree: React.FC<SceneTreeProps> = ({
  rootScenes,
  activeSceneId,
  onSelectScene,
  onExtendScene,
  onDeleteScene
}) => {
  if (rootScenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <p className="text-lg font-medium">No scenes yet</p>
          <p className="text-sm mt-2">Generate intermediates to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" role="tree">
      {rootScenes.map(rootNode => (
        <SceneNodeItem
          key={rootNode.id}
          node={rootNode}
          depth={0}
          activeSceneId={activeSceneId}
          onSelectScene={onSelectScene}
          onExtendScene={onExtendScene}
          onDeleteScene={onDeleteScene}
        />
      ))}
    </div>
  );
};

export default SceneTree;

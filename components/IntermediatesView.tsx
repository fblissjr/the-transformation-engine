import React, { useState, useEffect } from 'react';
import type { IntermediatePrompt } from '../types/intermediate';
import { getAllIntermediates } from '../services/db/intermediateService';
import { SceneExtensionDialog } from './SceneExtensionDialog';
import { DeleteWithChildrenDialog } from './DeleteWithChildrenDialog';
import { Toast } from './Toast';
import { getChildScenes, deleteSceneWithChildren } from '../services/sceneExtensionService';

interface IntermediatesViewProps {}

/**
 * IntermediatesView
 *
 * Library view for all saved intermediate prompts.
 * Shows list of intermediates with "Extend This Scene" action.
 */
export const IntermediatesView: React.FC<IntermediatesViewProps> = () => {
  const [intermediates, setIntermediates] = useState<IntermediatePrompt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [extensionDialogOpen, setExtensionDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState<IntermediatePrompt | null>(null);
  const [childrenToDelete, setChildrenToDelete] = useState<IntermediatePrompt[]>([]);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Load intermediates on mount
  useEffect(() => {
    loadIntermediates();
  }, []);

  const loadIntermediates = async () => {
    setIsLoading(true);
    try {
      const all = await getAllIntermediates();
      // Sort by created date desc (newest first)
      const sorted = all.sort((a, b) =>
        new Date(b.created).getTime() - new Date(a.created).getTime()
      );
      setIntermediates(sorted);
    } catch (error) {
      console.error('Failed to load intermediates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend = (intermediate: IntermediatePrompt) => {
    setSelectedId(intermediate.id);
    setExtensionDialogOpen(true);
  };

  const handleExtensionGenerated = async (newIntermediate: IntermediatePrompt) => {
    await loadIntermediates(); // Refresh list
    setExtensionDialogOpen(false);
    setToastMessage(`Scene extended: "${newIntermediate.title}"`);
    setToastType('success');
  };

  const handleDelete = async (id: string) => {
    const scene = intermediates.find(i => i.id === id);
    if (!scene) return;

    // Check if scene has children
    const children = await getChildScenes(id);

    if (children.length > 0) {
      // Show delete dialog with children info
      setSceneToDelete(scene);
      setChildrenToDelete(children);
      setDeleteDialogOpen(true);
    } else {
      // Delete directly (no children)
      try {
        await deleteSceneWithChildren(id, false);
        await loadIntermediates();
        setToastMessage(`Deleted: "${scene.title}"`);
        setToastType('success');
      } catch (error) {
        console.error('Failed to delete scene:', error);
        setToastMessage(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setToastType('error');
      }
    }
  };

  const handleDeleteConfirm = async (cascadeDelete: boolean) => {
    if (!sceneToDelete) return;

    try {
      await deleteSceneWithChildren(sceneToDelete.id, cascadeDelete);
      await loadIntermediates();

      const message = cascadeDelete
        ? `Deleted "${sceneToDelete.title}" and ${childrenToDelete.length} child scene(s)`
        : `Deleted "${sceneToDelete.title}" (${childrenToDelete.length} child scene(s) orphaned)`;

      setToastMessage(message);
      setToastType('success');
      setDeleteDialogOpen(false);
      setSceneToDelete(null);
      setChildrenToDelete([]);
    } catch (error) {
      console.error('Failed to delete scene:', error);
      setToastMessage(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setToastType('error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSceneToDelete(null);
    setChildrenToDelete([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading scenes...</div>
      </div>
    );
  }

  if (intermediates.length === 0) {
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

  const selectedIntermediate = selectedId
    ? intermediates.find(i => i.id === selectedId)
    : null;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {intermediates.map(intermediate => {
          const isChild = !!intermediate.extensionMetadata?.parentSceneId;
          const isOrphaned = intermediate.orphanMetadata?.isOrphaned;
          const sceneNumber = intermediate.extensionMetadata?.sceneNumber;

          // Get scene type from structure
          const sceneType = intermediate.structure && 'sceneType' in intermediate.structure
            ? intermediate.structure.sceneType
            : 'scene';

          // Get extension method badge
          const extensionMethod = intermediate.extensionMetadata?.method;
          const methodBadge = extensionMethod === 'continue' ? '→ continues'
            : extensionMethod === 'cutTo' ? '✂ cuts'
            : extensionMethod === 'transition' ? '⤻ transitions'
            : null;

          return (
            <div
              key={intermediate.id}
              className="group border-b border-gray-800 hover:bg-gray-800/50 p-3 transition-colors"
            >
              {/* Parent/child indicator */}
              {isChild && (
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                  <span>↳ {sceneNumber && `S${sceneNumber}`}</span>
                  {methodBadge && (
                    <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">
                      {methodBadge}
                    </span>
                  )}
                  {isOrphaned && (
                    <span className="text-yellow-500">
                      (Orphaned)
                    </span>
                  )}
                </div>
              )}

              {/* Title + scene type */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-white truncate flex-1">
                  {intermediate.title}
                </h3>
                <span className="text-xs text-gray-500 uppercase">
                  {sceneType}
                </span>
              </div>

              {/* Created date */}
              <p className="text-xs text-gray-400">
                {new Date(intermediate.created).toLocaleString()}
              </p>

              {/* Actions (visible on hover) */}
              <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleExtend(intermediate)}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-sm py-1.5 px-3 rounded transition-colors"
                >
                  Extend This Scene →
                </button>
                <button
                  onClick={() => handleDelete(intermediate.id)}
                  className="bg-red-600 hover:bg-red-500 text-white text-sm py-1.5 px-3 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {extensionDialogOpen && selectedIntermediate && (
        <SceneExtensionDialog
          parentIntermediate={selectedIntermediate}
          onClose={() => setExtensionDialogOpen(false)}
          onGenerated={handleExtensionGenerated}
        />
      )}

      {deleteDialogOpen && sceneToDelete && (
        <DeleteWithChildrenDialog
          scene={sceneToDelete}
          children={childrenToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
};

export default IntermediatesView;

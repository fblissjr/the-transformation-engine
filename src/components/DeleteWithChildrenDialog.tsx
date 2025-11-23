import React from 'react';
import type { IntermediatePrompt } from '../../types/intermediate';

interface DeleteWithChildrenDialogProps {
  scene: IntermediatePrompt;
  children: IntermediatePrompt[];
  onConfirm: (cascadeDelete: boolean) => void;
  onCancel: () => void;
}

/**
 * DeleteWithChildrenDialog component
 *
 * Modal dialog for deleting a scene that has children (derived scenes).
 * Offers two options:
 * 1. Delete only this scene (orphan children)
 * 2. Delete this + all children (cascade delete)
 *
 * @param scene - The intermediate prompt scene being deleted.
 * @param children - The array of child scenes derived from the scene.
 * @param onConfirm - Callback function executed on confirmation, accepting a boolean for cascade delete.
 * @param onCancel - Callback function executed on cancellation.
 * @returns The rendered DeleteWithChildrenDialog component.
 */
export const DeleteWithChildrenDialog: React.FC<DeleteWithChildrenDialogProps> = ({
  scene,
  children,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          Delete Scene with Children?
        </h2>

        <p className="text-gray-300 mb-4">
          "{scene.title}" has <span className="font-semibold text-amber-500">{children.length}</span> child scene{children.length > 1 ? 's' : ''}:
        </p>

        <ul className="list-disc list-inside text-gray-400 mb-6 max-h-40 overflow-y-auto bg-gray-800/50 p-3 rounded border border-gray-700">
          {children.map(child => (
            <li key={child.id} className="truncate">
              {child.title}
            </li>
          ))}
        </ul>

        <p className="text-sm text-gray-500 mb-6">
          What should happen to the child scenes?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onConfirm(false)}
            className="bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 px-4 rounded transition-colors font-medium"
          >
            Delete Only This Scene (orphan children)
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="bg-red-600 hover:bg-red-500 text-white py-2.5 px-4 rounded transition-colors font-medium"
          >
            Delete This + All Children (cascade)
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded transition-colors font-medium"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-yellow-500">Orphaning:</span> Child scenes will remain but marked as orphaned (parent reference preserved)
          </p>
          <p className="text-xs text-gray-400 mt-2">
            <span className="font-semibold text-red-500">Cascade:</span> All child scenes will be permanently deleted (irreversible)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteWithChildrenDialog;

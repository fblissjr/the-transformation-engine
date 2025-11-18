import React, { useEffect, useState } from 'react';
import { useObjectLibrary } from '../../contexts/ObjectLibraryContext';
import type { ObjectStoreRecord } from '../../../types/objectTypes';
import { ObjectHeader } from './ObjectHeader';
import { ObjectDataDisplay } from './ObjectDataDisplay';
import { VersionHistoryDropdown } from './VersionHistoryDropdown';
import { LinkedScenesList } from './LinkedScenesList';
import { ObjectEditDialog } from './ObjectEditDialog';

interface ObjectDetailViewProps {
  objectId: string;
  objectType: string;
}

export const ObjectDetailView: React.FC<ObjectDetailViewProps> = ({
  objectId,
  objectType
}) => {
  const { getObjectById, deleteObject, duplicateObject, refreshObjects } = useObjectLibrary();
  const [object, setObject] = useState<ObjectStoreRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Load object data
  useEffect(() => {
    loadObject();
  }, [objectId, objectType]);

  const loadObject = async () => {
    setLoading(true);
    setError(null);
    try {
      const obj = getObjectById(objectId, objectType);
      if (!obj) {
        setError('Object not found');
      } else {
        setObject(obj);
      }
    } catch (err) {
      console.error('Failed to load object:', err);
      setError(err instanceof Error ? err.message : 'Failed to load object');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await deleteObject(objectId, objectType, true);
      // Context will handle clearing selection
    } catch (err) {
      console.error('Failed to delete object:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete object');
      setShowDeleteConfirm(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateObject(objectId, objectType);
      await refreshObjects();
    } catch (err) {
      console.error('Failed to duplicate object:', err);
      setError(err instanceof Error ? err.message : 'Failed to duplicate object');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading object...</div>
      </div>
    );
  }

  if (error || !object) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400">
          {error || 'Object not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <ObjectHeader
        object={object}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="p-4 bg-red-900/30 border-b border-red-700">
          <p className="text-red-400 text-sm mb-3">
            Delete "{object.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Object Data */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Object Data
          </h3>
          <ObjectDataDisplay data={object.data} />
        </div>

        {/* Version History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Version History
          </h3>
          <VersionHistoryDropdown
            objectId={objectId}
            objectType={objectType}
            currentVersion={object.version}
            onRevert={async () => {
              await loadObject();
              await refreshObjects();
            }}
          />
        </div>

        {/* Linked Scenes */}
        {object.linkedScenes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Used in Scenes
            </h3>
            <LinkedScenesList sceneIds={object.linkedScenes} />
          </div>
        )}

        {/* Metadata */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Metadata
          </h3>
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">ID:</span>
              <span className="text-gray-300 font-mono text-xs">{object.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-gray-300">{object.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="text-gray-300">v{object.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span className="text-gray-300">{new Date(object.created).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Modified:</span>
              <span className="text-gray-300">{new Date(object.modified).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {object && (
        <ObjectEditDialog
          isOpen={showEditDialog}
          object={object}
          onClose={() => setShowEditDialog(false)}
          onSaved={async () => {
            await loadObject();
            await refreshObjects();
          }}
        />
      )}
    </div>
  );
};

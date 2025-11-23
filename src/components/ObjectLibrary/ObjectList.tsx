import React from 'react';
import type { ObjectStoreRecord } from '../../../types/objectTypes';

interface ObjectListProps {
  objects: ObjectStoreRecord[];
  selectedObjectId: string | null;
  onSelectObject: (id: string, type: string) => void;
}

// Type colors matching ObjectTypeSelector
const TYPE_COLORS: Record<string, string> = {
  character: 'bg-blue-600',
  location: 'bg-green-600',
  camera: 'bg-purple-600',
  prop: 'bg-yellow-600',
  audio: 'bg-pink-600',
  concept: 'bg-orange-600',
  custom: 'bg-gray-600'
};

/**
 * ObjectList component
 *
 * Renders a list of objects in the library.
 * Each object is displayed as a card with its details, including type badge, name, description, metadata, and tags.
 * Supports selection of an object.
 *
 * @param objects - Array of objects to display.
 * @param selectedObjectId - ID of the currently selected object.
 * @param onSelectObject - Callback when an object is selected.
 * @returns The rendered ObjectList component.
 */
export const ObjectList: React.FC<ObjectListProps> = ({
  objects,
  selectedObjectId,
  onSelectObject
}) => {
  if (objects.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No objects found</p>
        <p className="text-sm mt-1">Create a new object to get started</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {objects.map(obj => {
        const isSelected = obj.id === selectedObjectId;
        const typeColor = TYPE_COLORS[obj.type] || 'bg-gray-600';

        return (
          <button
            key={`${obj.type}-${obj.id}`}
            onClick={() => onSelectObject(obj.id, obj.type)}
            className={`
              w-full text-left p-3 rounded-lg transition-all border
              ${isSelected
                ? 'bg-blue-900/30 border-blue-500 shadow-lg'
                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
              }
            `}
          >
            <div className="flex items-start gap-3">
              {/* Type badge */}
              <div className={`${typeColor} px-2 py-1 rounded text-xs font-medium text-white shrink-0`}>
                {obj.type}
              </div>

              {/* Object info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{obj.name}</h4>

                {obj.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{obj.description}</p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>v{obj.version}</span>
                  <span>•</span>
                  <span>{new Date(obj.modified).toLocaleDateString()}</span>
                  {obj.linkedScenes.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{obj.linkedScenes.length} scene{obj.linkedScenes.length > 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>

                {/* Tags */}
                {obj.tags && obj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {obj.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {obj.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-500 text-xs">
                        +{obj.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

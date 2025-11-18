import React from 'react';
import type { ObjectStoreRecord } from '../../../types/objectTypes';

interface ObjectHeaderProps {
  object: ObjectStoreRecord;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

// Type colors matching ObjectList
const TYPE_COLORS: Record<string, string> = {
  character: 'bg-blue-600',
  location: 'bg-green-600',
  camera: 'bg-purple-600',
  prop: 'bg-yellow-600',
  audio: 'bg-pink-600',
  concept: 'bg-orange-600',
  custom: 'bg-gray-600'
};

export const ObjectHeader: React.FC<ObjectHeaderProps> = ({
  object,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const typeColor = TYPE_COLORS[object.type] || 'bg-gray-600';

  return (
    <div className="p-6 border-b border-gray-800">
      {/* Type Badge */}
      <div className={`${typeColor} inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3`}>
        {object.type}
      </div>

      {/* Name */}
      <h2 className="text-2xl font-bold text-white mb-2">{object.name}</h2>

      {/* Description */}
      {object.description && (
        <p className="text-gray-400 text-sm mb-4">{object.description}</p>
      )}

      {/* Tags */}
      {object.tags && object.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {object.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>

        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate
          </button>
        )}

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium ml-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

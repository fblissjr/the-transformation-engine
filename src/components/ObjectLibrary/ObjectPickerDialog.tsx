import React, { useState, useEffect } from 'react';
import { useObjectLibrary } from '../../contexts/ObjectLibraryContext';
import { ObjectTypeSelector } from './ObjectTypeSelector';
import { ObjectSearchBar } from './ObjectSearchBar';
import type { ObjectStoreRecord } from '../../../types/objectTypes';

interface ObjectPickerDialogProps {
  isOpen: boolean;
  objectType?: string; // Filter to specific type (if provided, type selector is hidden)
  onSelect: (objectId: string, objectType: string) => void;
  onClose: () => void;
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

/**
 * ObjectPickerDialog component
 *
 * A modal dialog for selecting an object from the library.
 * Supports filtering by object type (optionally fixed) and searching by name/description/tags.
 *
 * @param isOpen - Boolean indicating if the dialog is visible.
 * @param objectType - (Optional) Pre-filter to a specific object type. If provided, type selector is hidden.
 * @param onSelect - Callback when an object is selected.
 * @param onClose - Callback to close the dialog.
 * @returns The rendered ObjectPickerDialog component.
 */
export const ObjectPickerDialog: React.FC<ObjectPickerDialogProps> = ({
  isOpen,
  objectType: fixedType,
  onSelect,
  onClose
}) => {
  const { objects, getObjectsByType } = useObjectLibrary();
  const [selectedType, setSelectedType] = useState(fixedType || 'character');
  const [searchQuery, setSearchQuery] = useState('');

  // Update selected type if fixedType prop changes
  useEffect(() => {
    if (fixedType) {
      setSelectedType(fixedType);
    }
  }, [fixedType]);

  // Filter objects by type and search
  const filteredObjects = objects
    .filter(obj => obj.type === selectedType)
    .filter(obj => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        obj.name.toLowerCase().includes(query) ||
        obj.description?.toLowerCase().includes(query) ||
        obj.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });

  const handleSelect = (obj: ObjectStoreRecord) => {
    onSelect(obj.id, obj.type);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {fixedType ? `Select ${fixedType.charAt(0).toUpperCase() + fixedType.slice(1)}` : 'Select Object'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Choose an object from your library to use in your scene
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Type Selector (only if not fixed type) */}
          {!fixedType && (
            <ObjectTypeSelector
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          )}

          {/* Search Bar */}
          <ObjectSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Object List */}
          {filteredObjects.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400 text-sm">
                {searchQuery ? `No objects found matching "${searchQuery}"` : `No ${selectedType} objects yet`}
              </p>
              {!searchQuery && (
                <p className="text-gray-500 text-xs mt-1">
                  Create your first {selectedType} object to get started
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredObjects.map((obj) => {
                const typeColor = TYPE_COLORS[obj.type] || 'bg-gray-600';

                return (
                  <button
                    key={obj.id}
                    onClick={() => handleSelect(obj)}
                    className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg p-4 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`${typeColor} px-2 py-0.5 rounded text-xs font-medium text-white`}>
                        {obj.type}
                      </div>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="font-medium text-white mb-1">{obj.name}</div>
                    {obj.description && (
                      <p className="text-gray-400 text-xs line-clamp-2 mb-2">{obj.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>v{obj.version}</span>
                      <span>•</span>
                      <span>{new Date(obj.modified).toLocaleDateString()}</span>
                      {obj.linkedScenes.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{obj.linkedScenes.length} scene{obj.linkedScenes.length !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                    {obj.tags && obj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {obj.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {obj.tags.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                            +{obj.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {filteredObjects.length} object{filteredObjects.length !== 1 ? 's' : ''} available
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

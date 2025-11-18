import React, { useState } from 'react';
import { useObjectLibrary } from '../../contexts/ObjectLibraryContext';
import { ObjectTypeSelector } from './ObjectTypeSelector';
import { ObjectSearchBar } from './ObjectSearchBar';
import { ObjectList } from './ObjectList';
import { ObjectCreatorDialog } from './ObjectCreatorDialog';

export const ObjectLibraryPanel: React.FC = () => {
  const {
    objects,
    selectedObjectId,
    setSelectedObject,
    isLoading,
    error
  } = useObjectLibrary();

  const [selectedType, setSelectedType] = useState<string>('character');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [creatorDialogOpen, setCreatorDialogOpen] = useState(false);

  // Filter objects by type and search query
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

  const handleObjectSelect = (id: string, type: string) => {
    setSelectedObject(id, type);
  };

  const handleObjectCreated = (objectId: string, objectType: string) => {
    setCreatorDialogOpen(false);
    // Switch to the type of the created object and select it
    setSelectedType(objectType);
    setSelectedObject(objectId, objectType);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Object Library</h2>

        {/* Type Selector */}
        <ObjectTypeSelector
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-800">
        <ObjectSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">
            Loading objects...
          </div>
        ) : (
          <ObjectList
            objects={filteredObjects}
            selectedObjectId={selectedObjectId}
            onSelectObject={handleObjectSelect}
          />
        )}
      </div>

      {/* Create New Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => setCreatorDialogOpen(true)}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Create New Object</span>
        </button>
      </div>

      {/* Object Creator Dialog */}
      <ObjectCreatorDialog
        isOpen={creatorDialogOpen}
        onClose={() => setCreatorDialogOpen(false)}
        onCreated={handleObjectCreated}
      />
    </div>
  );
};

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { objectLibraryService } from '../../src/services/objectLibraryService';
import type { ObjectStoreRecord } from '../../types/objectTypes';

// Object type constants
export const OBJECT_TYPES = [
  'character',
  'location',
  'camera',
  'prop',
  'audio',
  'concept',
  'custom'
] as const;

export type ObjectType = typeof OBJECT_TYPES[number];

interface ObjectLibraryContextType {
  // State
  objects: ObjectStoreRecord[];
  selectedObjectId: string | null;
  selectedObjectType: string | null;
  isLoading: boolean;
  error: string | null;

  // Selection
  setSelectedObject: (id: string | null, type: string | null) => void;
  clearSelection: () => void;

  // CRUD operations
  refreshObjects: () => Promise<void>;
  createObject: (type: string, data: any, metadata: { name: string; tags?: string[] }) => Promise<string>;
  updateObject: (id: string, type: string, data: any, metadata?: Partial<{ name: string; tags: string[] }>) => Promise<void>;
  deleteObject: (id: string, type: string, force?: boolean) => Promise<void>;
  duplicateObject: (id: string, type: string) => Promise<string>;

  // Filtering helpers
  getObjectsByType: (type: string) => ObjectStoreRecord[];
  getObjectById: (id: string, type: string) => ObjectStoreRecord | undefined;
}

const ObjectLibraryContext = createContext<ObjectLibraryContextType | undefined>(undefined);

export const ObjectLibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [objects, setObjects] = useState<ObjectStoreRecord[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all objects on mount
  useEffect(() => {
    loadAllObjects();
  }, []);

  const loadAllObjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allObjects: ObjectStoreRecord[] = [];

      // Load objects from all 7 types
      for (const type of OBJECT_TYPES) {
        try {
          const typeObjects = await objectLibraryService.getObjectsByType(type);
          allObjects.push(...typeObjects);
        } catch (err) {
          console.error(`Failed to load ${type} objects:`, err);
          // Continue loading other types even if one fails
        }
      }

      setObjects(allObjects);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load objects';
      setError(message);
      console.error('Failed to load objects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedObject = (id: string | null, type: string | null) => {
    setSelectedObjectId(id);
    setSelectedObjectType(type);
  };

  const clearSelection = () => {
    setSelectedObjectId(null);
    setSelectedObjectType(null);
  };

  const createObject = async (
    type: string,
    data: any,
    metadata: { name: string; tags?: string[] }
  ): Promise<string> => {
    try {
      const id = await objectLibraryService.createObject(type, data, metadata);
      await loadAllObjects(); // Refresh list
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create object';
      setError(message);
      throw err;
    }
  };

  const updateObject = async (
    id: string,
    type: string,
    data: any,
    metadata?: Partial<{ name: string; tags: string[] }>
  ): Promise<void> => {
    try {
      await objectLibraryService.updateObject(id, type, data, metadata);
      await loadAllObjects(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update object';
      setError(message);
      throw err;
    }
  };

  const deleteObject = async (id: string, type: string, force = false): Promise<void> => {
    try {
      await objectLibraryService.deleteObject(id, type, { force });

      // Clear selection if deleted object was selected
      if (selectedObjectId === id) {
        clearSelection();
      }

      await loadAllObjects(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete object';
      setError(message);
      throw err;
    }
  };

  const duplicateObject = async (id: string, type: string): Promise<string> => {
    try {
      const original = await objectLibraryService.getObject(id, type);
      if (!original) {
        throw new Error('Object not found');
      }

      const newId = await objectLibraryService.createObject(
        type,
        original.data,
        {
          name: `${original.name} (Copy)`,
          tags: original.tags || [],
          description: original.description
        }
      );

      await loadAllObjects(); // Refresh list
      return newId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate object';
      setError(message);
      throw err;
    }
  };

  const getObjectsByType = (type: string): ObjectStoreRecord[] => {
    return objects.filter(obj => obj.type === type);
  };

  const getObjectById = (id: string, type: string): ObjectStoreRecord | undefined => {
    return objects.find(obj => obj.id === id && obj.type === type);
  };

  const value: ObjectLibraryContextType = {
    objects,
    selectedObjectId,
    selectedObjectType,
    isLoading,
    error,
    setSelectedObject,
    clearSelection,
    refreshObjects: loadAllObjects,
    createObject,
    updateObject,
    deleteObject,
    duplicateObject,
    getObjectsByType,
    getObjectById
  };

  return (
    <ObjectLibraryContext.Provider value={value}>
      {children}
    </ObjectLibraryContext.Provider>
  );
};

export const useObjectLibrary = () => {
  const context = useContext(ObjectLibraryContext);
  if (!context) {
    throw new Error('useObjectLibrary must be used within ObjectLibraryProvider');
  }
  return context;
};

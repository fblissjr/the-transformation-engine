/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { IntermediatePrompt, IntermediateStructure, StructuredFormat, TemporalSegment } from '../types/intermediate';
import * as intermediateService from '../services/db/intermediateService';

interface IntermediateContextState {
  activeIntermediate: IntermediatePrompt | null;
  isEditing: boolean;
  isDirty: boolean;

  // CRUD operations
  loadIntermediate: (id: string) => Promise<void>;
  createNew: () => void;
  saveIntermediate: () => Promise<void>;
  discardChanges: () => void;

  // Update operations
  updateMetadata: (updates: Partial<Pick<IntermediatePrompt, 'title' | 'description' | 'tags'>>) => void;
  updateStructure: (updates: Partial<IntermediateStructure>) => void;
  updateTemporal: (segments: TemporalSegment[]) => void;
  updateVisual: (updates: Partial<StructuredFormat['visual']>) => void;
  updateAudio: (updates: Partial<StructuredFormat['audio']>) => void;
  updateCamera: (updates: Partial<StructuredFormat['camera']>) => void;

  // Temporal segment operations
  addTemporalSegment: () => void;
  removeTemporalSegment: (index: number) => void;
  updateTemporalSegment: (index: number, updates: Partial<TemporalSegment>) => void;
}

const IntermediateContext = createContext<IntermediateContextState | undefined>(undefined);

export const IntermediateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeIntermediate, setActiveIntermediate] = useState<IntermediatePrompt | null>(null);
  const [originalIntermediate, setOriginalIntermediate] = useState<IntermediatePrompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load existing intermediate
  const loadIntermediate = useCallback(async (id: string) => {
    try {
      const intermediate = await intermediateService.getIntermediate(id);
      if (intermediate) {
        setActiveIntermediate(intermediate);
        setOriginalIntermediate(JSON.parse(JSON.stringify(intermediate))); // Deep clone
        setIsEditing(true);
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Failed to load intermediate:', error);
    }
  }, []);

  // Create new intermediate
  const createNew = useCallback(() => {
    const newIntermediate: IntermediatePrompt = {
      id: `intermediate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: '1.0.0',
      created: new Date(),
      modified: new Date(),
      title: 'Untitled Prompt',
      description: '',
      tags: [],
      sources: {},
      structure: {
        temporal: undefined,
        visual: undefined,
        audio: undefined,
        camera: undefined,
        narrative: undefined,
      },
      relationships: undefined,
    };

    setActiveIntermediate(newIntermediate);
    setOriginalIntermediate(JSON.parse(JSON.stringify(newIntermediate)));
    setIsEditing(true);
    setIsDirty(false);
  }, []);

  // Save intermediate
  const saveIntermediate = useCallback(async () => {
    if (!activeIntermediate) return;

    try {
      const updated = {
        ...activeIntermediate,
        modified: new Date(),
      };

      if (originalIntermediate?.id === activeIntermediate.id) {
        // Update existing
        await intermediateService.updateIntermediate(activeIntermediate.id, updated);
      } else {
        // Create new
        await intermediateService.createIntermediate(updated);
      }

      setOriginalIntermediate(JSON.parse(JSON.stringify(updated)));
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save intermediate:', error);
      throw error;
    }
  }, [activeIntermediate, originalIntermediate]);

  // Discard changes
  const discardChanges = useCallback(() => {
    if (originalIntermediate) {
      setActiveIntermediate(JSON.parse(JSON.stringify(originalIntermediate)));
      setIsDirty(false);
    } else {
      setActiveIntermediate(null);
      setIsEditing(false);
    }
  }, [originalIntermediate]);

  // Update metadata
  const updateMetadata = useCallback((updates: Partial<Pick<IntermediatePrompt, 'title' | 'description' | 'tags'>>) => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
    setIsDirty(true);
  }, []);

  // Update structure
  const updateStructure = useCallback((updates: Partial<IntermediateStructure>) => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        structure: {
          ...prev.structure,
          ...updates,
        },
      };
    });
    setIsDirty(true);
  }, []);

  // Update temporal segments
  const updateTemporal = useCallback((segments: TemporalSegment[]) => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        structure: {
          ...prev.structure,
          temporal: { segments },
        },
      };
    });
    setIsDirty(true);
  }, []);

  // Update visual structure
  const updateVisual = useCallback((updates: Partial<StructuredFormat['visual']>) => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;
      // TODO: Handle markdown format when editing UI is implemented
      if ('format' in prev.structure && prev.structure.format === 'markdown') {
        console.warn('Cannot edit markdown intermediate directly yet');
        return prev;
      }
      return {
        ...prev,
        structure: {
          ...prev.structure as StructuredFormat,
          visual: {
            ...(prev.structure as StructuredFormat).visual,
            ...updates,
          },
        },
      };
    });
    setIsDirty(true);
  }, []);

  // Update audio structure
  const updateAudio = useCallback((updates: Partial<StructuredFormat['audio']>) => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;
      // TODO: Handle markdown format when editing UI is implemented
      if ('format' in prev.structure && prev.structure.format === 'markdown') {
        console.warn('Cannot edit markdown intermediate directly yet');
        return prev;
      }
      return {
        ...prev,
        structure: {
          ...prev.structure as StructuredFormat,
          audio: {
            ...(prev.structure as StructuredFormat).audio,
            ...updates,
          },
        },
      };
    });
    setIsDirty(true);
  }, []);

  // Update camera structure
  const updateCamera = useCallback((updates: Partial<StructuredFormat['camera']>) => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;
      // TODO: Handle markdown format when editing UI is implemented
      if ('format' in prev.structure && prev.structure.format === 'markdown') {
        console.warn('Cannot edit markdown intermediate directly yet');
        return prev;
      }
      return {
        ...prev,
        structure: {
          ...prev.structure as StructuredFormat,
          camera: {
            ...(prev.structure as StructuredFormat).camera,
            ...updates,
          },
        },
      };
    });
    setIsDirty(true);
  }, []);

  // Add temporal segment
  const addTemporalSegment = useCallback(() => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;

      const existingSegments = prev.structure.temporal?.segments || [];
      const lastSegment = existingSegments[existingSegments.length - 1];
      const startTime = lastSegment ? lastSegment.endTime : 0;
      const endTime = startTime + 3; // Default 3 second segment

      const newSegment: TemporalSegment = {
        startTime,
        endTime,
        description: '',
        camera: '',
        visual: '',
        audio: '',
      };

      return {
        ...prev,
        structure: {
          ...prev.structure,
          temporal: {
            segments: [...existingSegments, newSegment],
          },
        },
      };
    });
    setIsDirty(true);
  }, []);

  // Remove temporal segment
  const removeTemporalSegment = useCallback((index: number) => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;

      const existingSegments = prev.structure.temporal?.segments || [];
      const newSegments = existingSegments.filter((_, i) => i !== index);

      return {
        ...prev,
        structure: {
          ...prev.structure,
          temporal: newSegments.length > 0 ? { segments: newSegments } : undefined,
        },
      };
    });
    setIsDirty(true);
  }, []);

  // Update temporal segment
  const updateTemporalSegment = useCallback((index: number, updates: Partial<TemporalSegment>) => {
    setActiveIntermediate(prev => {
      if (!prev) return prev;

      const existingSegments = prev.structure.temporal?.segments || [];
      const newSegments = existingSegments.map((seg, i) =>
        i === index ? { ...seg, ...updates } : seg
      );

      return {
        ...prev,
        structure: {
          ...prev.structure,
          temporal: { segments: newSegments },
        },
      };
    });
    setIsDirty(true);
  }, []);

  const value: IntermediateContextState = {
    activeIntermediate,
    isEditing,
    isDirty,
    loadIntermediate,
    createNew,
    saveIntermediate,
    discardChanges,
    updateMetadata,
    updateStructure,
    updateTemporal,
    updateVisual,
    updateAudio,
    updateCamera,
    addTemporalSegment,
    removeTemporalSegment,
    updateTemporalSegment,
  };

  return (
    <IntermediateContext.Provider value={value}>
      {children}
    </IntermediateContext.Provider>
  );
};

export const useIntermediate = () => {
  const context = useContext(IntermediateContext);
  if (context === undefined) {
    throw new Error('useIntermediate must be used within an IntermediateProvider');
  }
  return context;
};

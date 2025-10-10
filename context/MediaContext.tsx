/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MediaReference } from '../types';
import * as geminiService from '../services/geminiService';
import * as dbService from '../services/dbService';
import { useApiKey } from './ApiKeyContext';

interface MediaContextType {
  mediaReferences: MediaReference[];
  isDescribing: boolean;
  setMediaReferences: (value: React.SetStateAction<MediaReference[]>) => void;
  addMediaReference: (file: File) => Promise<void>;
  removeMediaReference: (id: string) => void;
  describeMedia: () => Promise<string | null>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { apiKey, openModal } = useApiKey();
  const [mediaReferences, setMediaReferences] = useState<MediaReference[]>([]);
  const [isDescribing, setIsDescribing] = useState(false);

  const addMediaReference = async (file: File): Promise<void> => {
    try {
      // Save the blob to IndexedDB
      const blobId = await dbService.saveMediaBlob(file, file.type);

      // Generate thumbnail (small base64 for quick display)
      const thumbnail = await dbService.generateThumbnail(file);

      // Create media reference
      const mediaRef: MediaReference = {
        id: crypto.randomUUID(),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        blobId,
        thumbnail,
        filename: file.name,
        mimeType: file.type,
      };

      setMediaReferences(prev => [...prev, mediaRef]);
    } catch (error) {
      throw new Error(`Failed to add media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const removeMediaReference = (id: string) => {
    setMediaReferences(prev => prev.filter(m => m.id !== id));
  };

  const describeMedia = async (): Promise<string | null> => {
    if (mediaReferences.length === 0) {
      throw new Error("No media to describe.");
    }
    if (!apiKey) {
      openModal();
      throw new Error("Please set your Gemini API key.");
    }

    setIsDescribing(true);
    try {
      // Convert blob references to data URLs for API call
      const referencesWithDataUrls = await Promise.all(
        mediaReferences.map(async (ref) => {
          if (ref.dataUrl) {
            // Legacy reference already has dataUrl
            return ref;
          } else if (ref.blobId) {
            // Convert blob to dataUrl for API
            const blob = await dbService.getMediaBlob(ref.blobId);
            if (blob) {
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
              return { ...ref, dataUrl };
            }
          }
          return ref;
        })
      );

      const description = await geminiService.describeMedia(apiKey, referencesWithDataUrls);
      return description;
    } catch (e: any) {
      throw new Error(`Failed to describe media: ${e.message}`);
    } finally {
      setIsDescribing(false);
    }
  };

  const value = {
    mediaReferences,
    isDescribing,
    setMediaReferences,
    addMediaReference,
    removeMediaReference,
    describeMedia,
  };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

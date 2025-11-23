/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MediaReference } from '../../types';
import * as dbService from '../services/dbService';
import { taskRouter } from '../services/taskRouter';
import { TASK_IDS } from '../../types/providers';

interface MediaContextType {
  mediaReferences: MediaReference[];
  isDescribing: boolean;
  describingMessage: string;
  mediaDescription: string | null; // Auto-generated description for prompt integration
  setMediaReferences: (value: React.SetStateAction<MediaReference[]>) => void;
  addMediaReference: (file: File) => Promise<void>;
  removeMediaReference: (id: string) => void;
  describeMedia: () => Promise<string | null>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

/**
 * MediaProvider
 *
 * Manages media references (images/videos) and their AI-powered analysis.
 * Supports adding, removing, and describing media files.
 * Automatically analyzes uploaded media to provide context for prompts.
 *
 * @param children - Child components to wrap.
 * @returns The context provider.
 */
export const MediaProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [mediaReferences, setMediaReferences] = useState<MediaReference[]>([]);
  const [isDescribing, setIsDescribing] = useState(false);
  const [describingMessage, setDescribingMessage] = useState('');
  const [mediaDescription, setMediaDescription] = useState<string | null>(null);

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

      // Auto-analyze media after upload
      setIsDescribing(true);
      setDescribingMessage('Analyzing media automatically...');
      try {
        const description = await analyzeMediaFile(file);
        setMediaDescription(description);
        setDescribingMessage('');
      } catch (error) {
        console.error('Auto-analysis failed:', error);
        // Don't block upload on analysis failure
        setMediaDescription(null);
        setDescribingMessage('');
      } finally {
        setIsDescribing(false);
      }
    } catch (error) {
      throw new Error(`Failed to add media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Internal helper: Analyze a media file and return description
   */
  const analyzeMediaFile = async (file: File): Promise<string> => {
    // Convert file to data URL for vision API
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const mediaData = [{
      data: dataUrl,
      mimeType: file.type
    }];

    // Build vision prompt
    const visionPrompt = `Analyze this ${file.type.startsWith('video/') ? 'video' : 'image'} and provide a detailed, vivid description suitable for a text-to-video model prompt. Focus on:
- Visual style, composition, and mood
- Key subjects, characters, or objects
- Lighting, color palette, and atmosphere
- Motion or action (if video)
- Sound or audio that would match the scene

Be specific and cinematic in your description. This will be used to generate similar video content.`;

    // Use taskRouter with MEDIA_DESCRIPTION task
    const turn = await taskRouter.executeVisionTask(
      TASK_IDS.MEDIA_DESCRIPTION,
      visionPrompt,
      mediaData
    );

    return turn.response;
  };

  const removeMediaReference = (id: string) => {
    setMediaReferences(prev => prev.filter(m => m.id !== id));
    // Clear description if all media is removed
    setMediaReferences(prevRefs => {
      const newRefs = prevRefs.filter(m => m.id !== id);
      if (newRefs.length === 0) {
        setMediaDescription(null);
      }
      return newRefs;
    });
  };

  const describeMedia = async (): Promise<string | null> => {
    if (mediaReferences.length === 0) {
      throw new Error("No media to describe.");
    }

    setIsDescribing(true);
    setDescribingMessage('Loading media files...');
    try {
      // Convert blob references to data URLs for vision API
      const mediaData: Array<{ data: string; mimeType: string }> = [];

      for (const ref of mediaReferences) {
        let dataUrl: string;

        if (ref.dataUrl) {
          // Legacy reference already has dataUrl
          dataUrl = ref.dataUrl;
        } else if (ref.blobId) {
          // Convert blob to dataUrl
          const blob = await dbService.getMediaBlob(ref.blobId);
          if (blob) {
            dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } else {
            throw new Error(`Failed to load media blob: ${ref.blobId}`);
          }
        } else {
          throw new Error('Media reference has no dataUrl or blobId');
        }

        mediaData.push({
          data: dataUrl,
          mimeType: ref.mimeType
        });
      }

      setDescribingMessage(`Analyzing ${mediaReferences.length} media file${mediaReferences.length > 1 ? 's' : ''} with AI...`);

      // Build vision prompt
      const visionPrompt = `Analyze this ${mediaData.length === 1 ? mediaReferences[0].type : 'media'} and provide a detailed, vivid description suitable for a text-to-video model prompt. Focus on:
- Visual style, composition, and mood
- Key subjects, characters, or objects
- Lighting, color palette, and atmosphere
- Motion or action (if video)
- Sound or audio that would match the scene

Be specific and cinematic in your description. This will be used to generate similar video content.`;

      // Use taskRouter with MEDIA_DESCRIPTION task
      const turn = await taskRouter.executeVisionTask(
        TASK_IDS.MEDIA_DESCRIPTION,
        visionPrompt,
        mediaData
      );

      setDescribingMessage('Complete!');
      setTimeout(() => setDescribingMessage(''), 500);
      return turn.response;
    } catch (e: any) {
      throw new Error(`Failed to describe media: ${e.message}`);
    } finally {
      setIsDescribing(false);
    }
  };

  const value = {
    mediaReferences,
    isDescribing,
    describingMessage,
    mediaDescription,
    setMediaReferences,
    addMediaReference,
    removeMediaReference,
    describeMedia,
  };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

/**
 * useMedia hook
 *
 * Custom hook to access the MediaContext.
 *
 * @returns The context value containing media state and functions.
 * @throws Error if used outside of a MediaProvider.
 */
export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

import { useState, useEffect, useRef } from 'react';
import { MediaReference } from '../types';
import * as dbService from '../src/services/dbService';

/**
 * Custom hook to manage blob URLs for media references
 * Handles loading from IndexedDB and cleanup on unmount
 *
 * @param mediaReferences - Array of media references to load
 * @returns Map of media reference IDs to blob URLs
 */
export function useMediaBlobUrls(mediaReferences: MediaReference[]): Map<string, string> {
  const [blobUrls, setBlobUrls] = useState<Map<string, string>>(new Map());
  const blobUrlsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const loadBlobUrls = async () => {
      const newBlobUrls = new Map<string, string>();

      for (const ref of mediaReferences) {
        if (ref.blobId) {
          const url = await dbService.getMediaBlobUrl(ref.blobId);
          if (url) {
            newBlobUrls.set(ref.id, url);
          }
        } else if (ref.dataUrl) {
          // Legacy: use dataUrl directly
          newBlobUrls.set(ref.id, ref.dataUrl);
        }
      }

      setBlobUrls(newBlobUrls);
      blobUrlsRef.current = newBlobUrls;
    };

    loadBlobUrls();

    // Cleanup: revoke blob URLs on unmount or when mediaReferences change
    return () => {
      blobUrlsRef.current.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mediaReferences]);

  return blobUrls;
}

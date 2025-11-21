import React, { useEffect, useState } from 'react';
import { SecondaryButton } from './FormPrimitives';
import { getImageGeneration, getImageGenerationsByProject } from '../../services/imageDbService';
import type { ImageGeneration } from '../../types/imageTypes';

/**
 * ImageOutputPanel
 *
 * Displays generated images in RightPanel:
 * - Current image preview (large)
 * - Metadata (model, aspect ratio, timestamp)
 * - Actions (download, use as first frame)
 * - Generation history (recent generations)
 */

interface ImageOutputPanelProps {
  projectId: string;
  currentImageId?: string;
  onUseAsFirstFrame?: (imageId: string) => void;
}

export const ImageOutputPanel: React.FC<ImageOutputPanelProps> = ({
  projectId,
  currentImageId,
  onUseAsFirstFrame,
}) => {
  const [currentImage, setCurrentImage] = useState<ImageGeneration | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<ImageGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current image
  useEffect(() => {
    if (!currentImageId) {
      setCurrentImage(null);
      setImageUrl(null);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const image = await getImageGeneration(currentImageId);

        if (!isMounted) return;

        if (!image) {
          setError('Image not found');
          return;
        }

        setCurrentImage(image);

        // Convert Blob to URL for display
        if (image.imageData && image.imageData.size > 0) {
          objectUrl = URL.createObjectURL(image.imageData);
          setImageUrl(objectUrl);
        } else {
          setImageUrl(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load image');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup: revoke object URL to prevent memory leaks
    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [currentImageId]);

  // Load recent images for history
  useEffect(() => {
    let isMounted = true;

    const loadRecent = async () => {
      try {
        const images = await getImageGenerationsByProject(projectId);

        if (!isMounted) return;

        // Sort by created date (newest first), limit to 10
        const sorted = images
          .filter((img) => img.status === 'ready')
          .sort((a, b) => b.created.getTime() - a.created.getTime())
          .slice(0, 10);

        setRecentImages(sorted);
      } catch (err) {
        console.error('Failed to load recent images:', err);
      }
    };

    loadRecent();

    return () => {
      isMounted = false;
    };
  }, [projectId, currentImageId]); // Reload when currentImageId changes (new generation)

  const handleDownload = () => {
    if (!currentImage || !imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${currentImage.id}.png`;
    link.click();
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="right-panel w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100">Generated Image</h2>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border-b border-red-900/50">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!isLoading && !error && !currentImage && (
        <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
          <svg
            className="w-16 h-16 text-zinc-700 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">No image generated yet</h3>
          <p className="text-xs text-zinc-600">
            Enter a prompt and click Generate to create your first image
          </p>
        </div>
      )}

      {!isLoading && !error && currentImage && (
        <>
          {/* Image Preview */}
          <div className="p-4 border-b border-zinc-800">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={currentImage.prompt}
                className="w-full rounded-lg border border-zinc-700"
              />
            ) : currentImage.status === 'generating' ? (
              <div className="w-full aspect-square bg-zinc-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                  <p className="text-xs text-zinc-500">Generating...</p>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square bg-zinc-800 rounded-lg flex items-center justify-center">
                <p className="text-xs text-zinc-500">Image data not available</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="p-4 border-b border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Model:</span>
              <span className="text-zinc-200">{currentImage.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span
                className={`font-medium ${
                  currentImage.status === 'ready'
                    ? 'text-green-400'
                    : currentImage.status === 'generating'
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {currentImage.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Generated:</span>
              <span className="text-zinc-200">{formatTimestamp(currentImage.created)}</span>
            </div>
            {currentImage.prompt && (
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-zinc-500 block mb-1">Prompt:</span>
                <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3">
                  {currentImage.prompt}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {currentImage.status === 'ready' && (
            <div className="p-4 flex gap-2">
              <button
                onClick={() => onUseAsFirstFrame?.(currentImage.id)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-sm py-2 rounded transition-colors"
              >
                Use as First Frame
              </button>
              <button
                onClick={handleDownload}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm px-3 py-2 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* Generation History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Recent Generations</h3>
        {recentImages.length === 0 ? (
          <p className="text-xs text-zinc-600">No generations yet</p>
        ) : (
          <div className="space-y-2">
            {recentImages.map((img) => (
              <button
                key={img.id}
                onClick={() => {
                  /* Will wire up in Week 2 - set as current image */
                }}
                className={`w-full bg-zinc-800 border rounded-lg p-2 text-left hover:bg-zinc-700 transition-colors ${
                  img.id === currentImageId ? 'border-amber-500' : 'border-zinc-700'
                }`}
              >
                <p className="text-xs text-zinc-300 line-clamp-2 mb-1">{img.prompt}</p>
                <p className="text-xs text-zinc-600">{formatTimestamp(img.created)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

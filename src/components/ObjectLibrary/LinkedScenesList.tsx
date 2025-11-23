import React from 'react';

interface LinkedScenesListProps {
  sceneIds: string[];
  onNavigateToScene?: (sceneId: string) => void;
  onUnlink?: (sceneId: string) => void;
}

/**
 * LinkedScenesList component
 *
 * Displays a list of scenes linked to a specific object.
 * Provides actions to navigate to a scene or unlink it from the object.
 *
 * @param sceneIds - Array of IDs for the linked scenes.
 * @param onNavigateToScene - Optional callback to navigate to a scene.
 * @param onUnlink - Optional callback to unlink a scene.
 * @returns The rendered LinkedScenesList component.
 */
export const LinkedScenesList: React.FC<LinkedScenesListProps> = ({
  sceneIds,
  onNavigateToScene,
  onUnlink
}) => {
  if (sceneIds.length === 0) {
    return (
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-500 text-sm text-center">
        Not used in any scenes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sceneIds.map((sceneId) => (
        <div
          key={sceneId}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between hover:border-gray-600 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">Scene</div>
            <div className="text-gray-400 text-xs font-mono truncate">{sceneId}</div>
          </div>

          <div className="flex gap-2 ml-3">
            {onNavigateToScene && (
              <button
                onClick={() => onNavigateToScene(sceneId)}
                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-600/10 rounded transition-colors"
                title="Navigate to scene"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}

            {onUnlink && (
              <button
                onClick={() => onUnlink(sceneId)}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded transition-colors"
                title="Unlink from scene"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

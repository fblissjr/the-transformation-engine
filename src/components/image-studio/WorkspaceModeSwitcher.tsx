import React from 'react';

/**
 * WorkspaceModeSwitcher
 *
 * Top-level mode switcher for Video | Image workspaces.
 * Clean, prominent toggle that maintains consistent aesthetic.
 */

export type WorkspaceMode = 'video' | 'image';

interface WorkspaceModeSwitcherProps {
  currentMode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
}

export const WorkspaceModeSwitcher: React.FC<WorkspaceModeSwitcherProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
      <button
        onClick={() => onModeChange('video')}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-all
          ${
            currentMode === 'video'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Video
        </div>
      </button>
      <button
        onClick={() => onModeChange('image')}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-all
          ${
            currentMode === 'image'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Image
        </div>
      </button>
    </div>
  );
};

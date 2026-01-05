import React, { useState, useEffect } from 'react';
import { ImageGenerateForm } from './ImageGenerateForm';
import { ImageOutputPanel } from './ImageOutputPanel';
import {
  createImageProject,
  getAllImageProjects,
} from '../../services/imageDbService';
import type { ImageProject } from '../../types/imageTypes';

/**
 * ImageWorkspace component
 *
 * The main layout for the Image Studio workspace.
 * Implements a 3-panel layout:
 * - Left: Project selector
 * - Center: Prompt generation form
 * - Right: Prompt output and formatting
 *
 * NOTE: This workspace creates PROMPTS, not images. The output panel
 * displays formatted prompt text that can be copied to any image generation platform.
 *
 * @returns The rendered ImageWorkspace component.
 */

interface IntermediateData {
  yaml: string;
  originalPrompt: string;
  aspectRatio: string;
}

export const ImageWorkspace: React.FC = () => {
  const [projects, setProjects] = useState<ImageProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [intermediate, setIntermediate] = useState<IntermediateData | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    setError(null);

    try {
      const allProjects = await getAllImageProjects();

      if (allProjects.length === 0) {
        // Create default project
        const defaultProject = await createImageProject('Default Project', 'Default image workspace');
        setProjects([defaultProject]);
        setCurrentProjectId(defaultProject.id);
      } else {
        setProjects(allProjects);
        setCurrentProjectId(allProjects[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleIntermediateGenerated = (data: IntermediateData) => {
    setIntermediate(data);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  if (isLoadingProjects) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-sm text-zinc-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!currentProjectId) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <p className="text-sm text-red-400">Failed to load workspace</p>
          {error && <p className="text-xs text-zinc-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="image-workspace h-screen flex flex-col bg-zinc-950">
      {/* Error notification (fixed at top) */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 border border-red-700 text-red-200 px-4 py-2 rounded-lg shadow-lg max-w-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Simplified Project Selector (Week 1) */}
        <div className="left-panel w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <h1 className="text-lg font-semibold text-zinc-100">Image Projects</h1>
          </div>

          {/* Project List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setCurrentProjectId(project.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    project.id === currentProjectId
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <h3 className="text-sm font-medium mb-1">{project.title}</h3>
                  {project.description && (
                    <p className="text-xs opacity-80 line-clamp-2">{project.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer - New Project Button */}
          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={async () => {
                const newProject = await createImageProject(
                  `Project ${projects.length + 1}`,
                  'New image project'
                );
                setProjects([...projects, newProject]);
                setCurrentProjectId(newProject.id);
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Project
            </button>
          </div>
        </div>

        {/* Center Panel - Prompt Generation Form */}
        <div className="center-panel flex-1 bg-zinc-950 p-6 overflow-y-auto">
          <ImageGenerateForm
            projectId={currentProjectId}
            onIntermediateGenerated={handleIntermediateGenerated}
            onError={handleError}
          />
        </div>

        {/* Right Panel - Prompt Output */}
        <ImageOutputPanel
          intermediate={intermediate || undefined}
        />
      </div>
    </div>
  );
};

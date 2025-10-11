import React, { useState, useEffect } from 'react';
import { PromptVersion } from '../types';
import * as versionService from '../services/versionService';

interface VersionTreeProps {
  promptId: string;
  currentVersionId?: string;
  onRestoreVersion: (versionId: string) => void;
  onCreateBranch?: (sourceVersionId: string, branchName: string) => void;
}

interface VersionNode {
  version: PromptVersion;
  children: VersionNode[];
}

export const VersionTree: React.FC<VersionTreeProps> = ({
  promptId,
  currentVersionId,
  onRestoreVersion,
  onCreateBranch,
}) => {
  const [treeData, setTreeData] = useState<{
    branches: { [branchName: string]: PromptVersion[] };
    rootVersions: PromptVersion[];
  }>({ branches: {}, rootVersions: [] });
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set(['main']));
  const [creatingBranchFrom, setCreatingBranchFrom] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    loadVersionTree();
  }, [promptId]);

  const loadVersionTree = async () => {
    const data = await versionService.getVersionTree(promptId);
    setTreeData(data);
  };

  const toggleBranch = (branchName: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchName)) {
      newExpanded.delete(branchName);
    } else {
      newExpanded.add(branchName);
    }
    setExpandedBranches(newExpanded);
  };

  const handleCreateBranch = async (sourceVersionId: string) => {
    if (!newBranchName.trim()) {
      alert('Please enter a branch name');
      return;
    }

    if (onCreateBranch) {
      onCreateBranch(sourceVersionId, newBranchName.trim());
    } else {
      // Fallback: create branch directly
      await versionService.createBranch(promptId, sourceVersionId, newBranchName.trim());
      await loadVersionTree();
    }

    setCreatingBranchFrom(null);
    setNewBranchName('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Build parent-child map
  const buildTree = (versions: PromptVersion[]): VersionNode[] => {
    const nodeMap = new Map<string, VersionNode>();
    const roots: VersionNode[] = [];

    // Create nodes
    versions.forEach(version => {
      nodeMap.set(version.versionId, { version, children: [] });
    });

    // Build tree structure
    versions.forEach(version => {
      const node = nodeMap.get(version.versionId)!;
      if (version.parentVersionId && nodeMap.has(version.parentVersionId)) {
        const parent = nodeMap.get(version.parentVersionId)!;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const renderVersionNode = (node: VersionNode, depth = 0): React.ReactNode => {
    const { version } = node;
    const isCurrent = version.versionId === currentVersionId;
    const hasChildren = node.children.length > 0;

    return (
      <div key={version.versionId} className="relative">
        {/* Connecting line */}
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 w-4 h-1/2 border-l-2 border-b-2 border-gray-700 rounded-bl"
            style={{ left: `${(depth - 1) * 24}px` }}
          />
        )}

        {/* Version card */}
        <div
          className={`ml-${depth * 6} mb-2 p-3 rounded-lg border ${
            isCurrent
              ? 'bg-amber-500/20 border-amber-500'
              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
          } transition-colors`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Branch badge */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    version.branchName === 'main'
                      ? 'bg-blue-600/30 text-blue-300'
                      : 'bg-purple-600/30 text-purple-300'
                  }`}
                >
                  {version.branchName || 'main'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(version.savedAt)}
                </span>
                {isCurrent && (
                  <span className="text-xs font-bold text-amber-400">CURRENT</span>
                )}
              </div>

              {/* Fragment badges */}
              {version.fragmentsUsed && version.fragmentsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {version.fragmentsUsed.slice(0, 3).map((fragment, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded bg-gray-700/50 text-gray-400"
                      title={fragment}
                    >
                      {fragment.split('/').pop()?.replace('.md', '')}
                    </span>
                  ))}
                  {version.fragmentsUsed.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{version.fragmentsUsed.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isCurrent && (
                <button
                  onClick={() => onRestoreVersion(version.versionId)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition"
                  title="Restore this version"
                >
                  Restore
                </button>
              )}
              <button
                onClick={() => setCreatingBranchFrom(version.versionId)}
                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded transition"
                title="Create a new branch from this version"
              >
                Branch
              </button>
            </div>
          </div>

          {/* Branch creation UI */}
          {creatingBranchFrom === version.versionId && (
            <div className="mt-3 p-2 bg-gray-900/50 rounded border border-gray-700">
              <input
                type="text"
                value={newBranchName}
                onChange={e => setNewBranchName(e.target.value)}
                placeholder="new-branch-name"
                className="w-full bg-gray-800 text-white text-sm border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleCreateBranch(version.versionId);
                  } else if (e.key === 'Escape') {
                    setCreatingBranchFrom(null);
                    setNewBranchName('');
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleCreateBranch(version.versionId)}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setCreatingBranchFrom(null);
                    setNewBranchName('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Render children */}
        {hasChildren && (
          <div className="relative">
            {node.children.map(child => renderVersionNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (Object.keys(treeData.branches).length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No version history yet</p>
        <p className="text-xs mt-1">Versions will appear here as you edit this prompt</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Branch list */}
      {Object.entries(treeData.branches).map(([branchName, versions]: [string, PromptVersion[]]) => {
        const isExpanded = expandedBranches.has(branchName);
        const tree = buildTree(versions as PromptVersion[]);

        return (
          <div key={branchName} className="border border-gray-800 rounded-lg overflow-hidden">
            {/* Branch header */}
            <button
              onClick={() => toggleBranch(branchName)}
              className="w-full flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="font-semibold text-white">{branchName}</span>
                <span className="text-xs text-gray-500">
                  {versions.length} version{versions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>

            {/* Branch content */}
            {isExpanded && (
              <div className="p-4 bg-gray-950/30">
                {tree.map(node => renderVersionNode(node))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

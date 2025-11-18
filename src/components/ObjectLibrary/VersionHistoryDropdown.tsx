import React, { useEffect, useState } from 'react';
import { objectLibraryService } from '../../services/objectLibraryService';
import type { ObjectVersionRecord, ObjectChangelogRecord } from '../../../types/objectTypes';

interface VersionHistoryDropdownProps {
  objectId: string;
  objectType: string;
  currentVersion: number;
  onRevert?: (versionNumber: number) => void;
}

export const VersionHistoryDropdown: React.FC<VersionHistoryDropdownProps> = ({
  objectId,
  objectType,
  currentVersion,
  onRevert
}) => {
  const [versions, setVersions] = useState<ObjectVersionRecord[]>([]);
  const [changelogs, setChangelogs] = useState<ObjectChangelogRecord[]>([]);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reverting, setReverting] = useState<number | null>(null);

  // Load version history and changelogs
  useEffect(() => {
    loadVersionHistory();
  }, [objectId]);

  const loadVersionHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const [versionHistory, changelogHistory] = await Promise.all([
        objectLibraryService.getVersionHistory(objectId),
        objectLibraryService.getChangelogs(objectId)
      ]);

      setVersions(versionHistory);
      setChangelogs(changelogHistory);
    } catch (err) {
      console.error('Failed to load version history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (version: number) => {
    if (!onRevert) return;

    setReverting(version);
    try {
      await objectLibraryService.revertToVersion(objectId, objectType, version);
      onRevert(version);
      await loadVersionHistory(); // Refresh history
    } catch (err) {
      console.error('Failed to revert to version:', err);
      setError(err instanceof Error ? err.message : 'Failed to revert');
    } finally {
      setReverting(null);
    }
  };

  const getChangelogForVersion = (version: number): ObjectChangelogRecord | null => {
    // Find changelog that transitioned TO this version
    return changelogs.find(log => log.toVersion === version) || null;
  };

  if (loading) {
    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading version history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/30 border border-red-700 rounded-lg p-4">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-medium">Version {currentVersion}</div>
            <div className="text-gray-400 text-sm mt-1">Current version</div>
          </div>
          <div className="px-3 py-1 bg-green-600/20 border border-green-600 rounded text-green-400 text-xs font-medium">
            Latest
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="text-sm font-medium text-white">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Version List */}
      <div className="max-h-96 overflow-y-auto">
        {versions.map((version) => {
          const isExpanded = expandedVersion === version.version;
          const isCurrent = version.version === currentVersion;
          const changelog = getChangelogForVersion(version.version);
          const isReverting = reverting === version.version;

          return (
            <div key={version.versionId} className="border-b border-gray-700/50 last:border-b-0">
              {/* Version Header */}
              <div className="p-4 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">Version {version.version}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-green-600/20 border border-green-600 rounded text-green-400 text-xs font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(version.created).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Expand/Collapse Button */}
                    {changelog && (
                      <button
                        onClick={() => setExpandedVersion(isExpanded ? null : version.version)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-600/10 rounded transition-colors"
                        title={isExpanded ? 'Hide changes' : 'Show changes'}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Revert Button */}
                    {!isCurrent && onRevert && (
                      <button
                        onClick={() => handleRevert(version.version)}
                        disabled={isReverting}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-xs font-medium transition-colors"
                        title="Revert to this version"
                      >
                        {isReverting ? (
                          <>
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Reverting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span>Revert</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Changelog Summary */}
                {changelog && !isExpanded && (
                  <div className="mt-2 text-xs text-gray-500">
                    {changelog.changes.length} change{changelog.changes.length !== 1 ? 's' : ''}
                    {changelog.editInstructions && ` • ${changelog.editInstructions.substring(0, 50)}${changelog.editInstructions.length > 50 ? '...' : ''}`}
                  </div>
                )}
              </div>

              {/* Expanded Changelog Details */}
              {isExpanded && changelog && (
                <div className="px-4 pb-4 space-y-3 bg-gray-900/30">
                  {/* Edit Instructions */}
                  {changelog.editInstructions && (
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-1">Instructions</div>
                      <p className="text-sm text-gray-300 bg-gray-800/50 rounded p-2">
                        {changelog.editInstructions}
                      </p>
                    </div>
                  )}

                  {/* LLM Reasoning */}
                  {changelog.llmReasoning && (
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-1">Reasoning</div>
                      <p className="text-sm text-gray-300 bg-gray-800/50 rounded p-2">
                        {changelog.llmReasoning}
                      </p>
                    </div>
                  )}

                  {/* Changes */}
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-2">Changes ({changelog.changes.length})</div>
                    <div className="space-y-2">
                      {changelog.changes.map((change, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded p-2 text-xs">
                          <div className="font-medium text-blue-400 mb-1">{change.field}</div>
                          <div className="flex gap-2 items-start mb-1">
                            <span className="text-red-400 line-through shrink-0 text-xs">Old:</span>
                            <span className="text-gray-400 break-all">{JSON.stringify(change.oldValue)}</span>
                          </div>
                          <div className="flex gap-2 items-start mb-1">
                            <span className="text-green-400 shrink-0 text-xs">New:</span>
                            <span className="text-gray-200 break-all">{JSON.stringify(change.newValue)}</span>
                          </div>
                          <div className="text-gray-500 mt-1 italic">{change.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preserved Fields */}
                  {changelog.preserveRules && changelog.preserveRules.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-1">Preserved Fields</div>
                      <div className="flex flex-wrap gap-1">
                        {changelog.preserveRules.map((field) => (
                          <span key={field} className="px-2 py-0.5 bg-green-900/30 border border-green-700 rounded text-green-400 text-xs">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

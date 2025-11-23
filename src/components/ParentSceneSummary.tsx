/**
 * ParentSceneSummary Component
 *
 * Displays a collapsible summary of the parent scene for extension context.
 * Part of Scene Extension Phase 1 MVP.
 */

import React, { useState, useEffect } from 'react';
import { IntermediatePrompt, ParentSceneSummary as ParentSceneSummaryType } from '../../types/intermediate';
import { getParentSummary } from '../services/sceneExtensionService';

interface ParentSceneSummaryProps {
  parentIntermediate: IntermediatePrompt;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/**
 * ParentSceneSummary component
 *
 * Renders a summary of a parent scene, useful for providing context when extending a scene.
 * The summary is collapsible and fetches data asynchronously.
 *
 * @param parentIntermediate - The intermediate prompt of the parent scene.
 * @returns The rendered ParentSceneSummary component.
 */
export const ParentSceneSummary: React.FC<ParentSceneSummaryProps> = ({ parentIntermediate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<ParentSceneSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, [parentIntermediate.id]);

  const loadSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sum = await getParentSummary(parentIntermediate);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load parent summary:', err);
      setError('Could not load parent scene summary');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2 mt-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={loadSummary}
          className="mt-2 text-sm text-red-300 underline hover:text-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const sceneType = parentIntermediate.structure && 'sceneType' in parentIntermediate.structure
    ? parentIntermediate.structure.sceneType
    : 'scene';

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-750 transition"
      >
        <div className="text-left flex-1">
          <h3 className="text-sm font-semibold text-white">
            Parent Scene Context
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            "{parentIntermediate.title}" - {sceneType}
          </p>
          {!isExpanded && (
            <p className="text-xs text-gray-500 mt-1">
              {summary.characters.length > 0 && `Characters: ${summary.characters.join(', ')}`}
              {summary.characters.length > 0 && summary.location && ' • '}
              {summary.location}
            </p>
          )}
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 text-sm border-t border-gray-700 pt-3">
          {summary.characters.length > 0 && (
            <div>
              <span className="font-medium text-gray-300">Characters Present:</span>
              <ul className="list-disc list-inside text-gray-400 mt-1">
                {summary.characters.map((char, i) => (
                  <li key={i}>{char}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <span className="font-medium text-gray-300">Location:</span>
            <p className="text-gray-400 mt-1">{summary.location}</p>
          </div>

          <div>
            <span className="font-medium text-gray-300">Last Moment:</span>
            <p className="text-gray-400 mt-1">{summary.lastMoment}</p>
          </div>

          <div>
            <span className="font-medium text-gray-300">Visual Style:</span>
            <p className="text-gray-400 mt-1">{summary.visualStyle}</p>
          </div>

          <div>
            <span className="font-medium text-gray-300">Audio State:</span>
            <p className="text-gray-400 mt-1">{summary.audioState}</p>
          </div>
        </div>
      )}
    </div>
  );
};

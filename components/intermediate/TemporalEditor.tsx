import React from 'react';
import { useIntermediate } from '../../context/IntermediateContext';
import type { TemporalSegment } from '../../types/intermediate';

const TemporalEditor: React.FC = () => {
  const {
    activeIntermediate,
    addTemporalSegment,
    removeTemporalSegment,
    updateTemporalSegment,
  } = useIntermediate();

  if (!activeIntermediate) return null;

  const segments = activeIntermediate.structure.temporal?.segments || [];

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-200">Timeline Segments</h3>
        <button
          onClick={addTemporalSegment}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          + Add Segment
        </button>
      </div>

      {segments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No temporal segments yet. Click "Add Segment" to create one.
        </div>
      ) : (
        <>
          {/* Visual timeline */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center h-12 relative">
              {segments.map((segment, index) => {
                const totalDuration = segments[segments.length - 1]?.endTime || 10;
                const leftPercent = (segment.startTime / totalDuration) * 100;
                const widthPercent = ((segment.endTime - segment.startTime) / totalDuration) * 100;

                return (
                  <div
                    key={index}
                    className="absolute h-8 bg-amber-600/50 border border-amber-500 rounded flex items-center justify-center text-xs text-white"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  >
                    Seg {index + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0s</span>
              <span>{formatTime(segments[segments.length - 1]?.endTime || 10)}</span>
            </div>
          </div>

          {/* Segment editors */}
          <div className="space-y-4">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-200">
                    Segment {index + 1} ({formatTime(segment.startTime)} - {formatTime(segment.endTime)})
                  </h4>
                  <button
                    onClick={() => removeTemporalSegment(index)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start (seconds)</label>
                    <input
                      type="number"
                      value={segment.startTime}
                      onChange={e => updateTemporalSegment(index, { startTime: parseFloat(e.target.value) || 0 })}
                      step="0.1"
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End (seconds)</label>
                    <input
                      type="number"
                      value={segment.endTime}
                      onChange={e => updateTemporalSegment(index, { endTime: parseFloat(e.target.value) || 0 })}
                      step="0.1"
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description (what happens)</label>
                  <textarea
                    value={segment.description}
                    onChange={e => updateTemporalSegment(index, { description: e.target.value })}
                    placeholder="Describe what happens in this segment..."
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Camera (optional)</label>
                  <input
                    type="text"
                    value={segment.camera || ''}
                    onChange={e => updateTemporalSegment(index, { camera: e.target.value })}
                    placeholder="Camera movement for this segment..."
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Visual (optional)</label>
                  <input
                    type="text"
                    value={segment.visual || ''}
                    onChange={e => updateTemporalSegment(index, { visual: e.target.value })}
                    placeholder="Visual changes for this segment..."
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Audio (optional)</label>
                  <input
                    type="text"
                    value={segment.audio || ''}
                    onChange={e => updateTemporalSegment(index, { audio: e.target.value })}
                    placeholder="Audio changes for this segment..."
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TemporalEditor;

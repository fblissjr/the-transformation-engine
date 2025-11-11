/**
 * TimestampPromptToggle Component
 *
 * UI/UX Design Rationale:
 * - Simple toggle switch for timestamp vs continuous prompting strategy
 * - Inline tooltip explains the difference between strategies
 * - Word count guidance helps users understand optimal prompt length
 * - Disabled state when preset enforces a specific strategy
 * - Visual feedback: Blue for timestamp, green for continuous
 *
 * Technical Implementation:
 * - Controlled component receiving strategy from parent
 * - Disabled state with reason tooltip
 * - Mobile responsive: Full-width on small screens
 * - Keyboard accessible (Space/Enter toggles)
 *
 * Accessibility:
 * - ARIA labels for toggle state
 * - Tooltip on hover/focus
 * - Visual + text indicators for state
 * - Disabled state clearly communicated
 */

import React, { useState } from 'react';
import { Info, Clock, FileText } from 'lucide-react';

// ==================== Type Definitions ====================

interface TimestampPromptToggleProps {
  strategy: 'timestamp' | 'continuous';
  onStrategyChange: (strategy: 'timestamp' | 'continuous') => void;
  disabled?: boolean;
  disabledReason?: string;
}

// ==================== Component ====================

export const TimestampPromptToggle: React.FC<TimestampPromptToggleProps> = ({
  strategy,
  onStrategyChange,
  disabled = false,
  disabledReason
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggle = () => {
    if (!disabled) {
      onStrategyChange(strategy === 'timestamp' ? 'continuous' : 'timestamp');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prompting Strategy:
          </label>
          <p className="text-xs text-gray-500">
            Choose between time-segmented (timestamp) or flowing narrative (continuous) structure.
          </p>
        </div>

        {/* Info Icon with Tooltip */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            className="text-gray-500 hover:text-gray-300 transition p-1"
            aria-label="More information about prompting strategies"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg z-10 text-xs">
              <div className="space-y-2">
                <div>
                  <div className="font-semibold text-blue-400 mb-1">Timestamp (0-2s, 2-5s, etc.)</div>
                  <p className="text-gray-400">
                    Precise moment-by-moment control. Best for action sequences, complex choreography, or when timing is critical.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-green-400 mb-1">Continuous (flowing narrative)</div>
                  <p className="text-gray-400">
                    Natural storytelling flow. Best for dialogue, establishing shots, or when you want the model to interpret pacing naturally.
                  </p>
                </div>
              </div>
              <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Switch Container */}
      <div className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        {/* Timestamp Option */}
        <button
          onClick={() => !disabled && onStrategyChange('timestamp')}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            strategy === 'timestamp'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label="Select timestamp prompting strategy"
          aria-pressed={strategy === 'timestamp'}
        >
          <Clock className="w-4 h-4" />
          <span>Timestamp</span>
        </button>

        {/* Continuous Option */}
        <button
          onClick={() => !disabled && onStrategyChange('continuous')}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            strategy === 'continuous'
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label="Select continuous prompting strategy"
          aria-pressed={strategy === 'continuous'}
        >
          <FileText className="w-4 h-4" />
          <span>Continuous</span>
        </button>
      </div>

      {/* Word Count Guidance */}
      <div className="flex items-start gap-2 p-3 bg-gray-900/50 rounded border border-gray-700">
        <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs text-gray-400">
          {strategy === 'timestamp' ? (
            <p>
              <span className="font-semibold text-blue-400">Timestamp prompting:</span> Aim for 250-350 words. Break scene into clear time segments (0-2s, 2-5s, 5-8s). Describe what happens during each segment.
            </p>
          ) : (
            <p>
              <span className="font-semibold text-green-400">Continuous prompting:</span> Aim for 200-300 words. Write a flowing narrative describing how the scene unfolds naturally from start to finish.
            </p>
          )}
        </div>
      </div>

      {/* Disabled Reason (if applicable) */}
      {disabled && disabledReason && (
        <div className="flex items-start gap-2 p-3 bg-yellow-900/20 border border-yellow-600/50 rounded">
          <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">{disabledReason}</p>
        </div>
      )}
    </div>
  );
};

export default TimestampPromptToggle;

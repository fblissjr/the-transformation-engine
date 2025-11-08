import React from 'react';

interface StreamingProgressProps {
  accumulatedContent: string;
  currentTokenCount: number;
  tokensPerSecond: number;
  onCancel?: () => void;
}

/**
 * Live streaming progress display
 * Shows accumulated tokens, tokens/second, and optional cancel button
 */
export const StreamingProgress: React.FC<StreamingProgressProps> = ({
  accumulatedContent,
  currentTokenCount,
  tokensPerSecond,
  onCancel,
}) => {
  return (
    <div className="border border-blue-500 rounded-lg p-4 bg-blue-900/10">
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-blue-400 font-medium">Streaming...</span>
          <span className="text-gray-400">
            {currentTokenCount} tokens | {tokensPerSecond.toFixed(1)} tok/s
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 animate-pulse"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Accumulated content preview */}
      <div className="relative">
        <div className="max-h-48 overflow-y-auto bg-gray-800 rounded p-3 font-mono text-sm text-gray-300">
          {accumulatedContent}
          <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
        </div>
      </div>

      {/* Cancel button */}
      {onCancel && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

interface StreamingToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle control for enabling/disabling streaming
 */
export const StreamingToggle: React.FC<StreamingToggleProps> = ({
  enabled,
  onToggle,
  disabled = false,
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
      />
      <span className={`text-sm ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>
        Stream tokens live
      </span>
    </label>
  );
};

interface TokenCounterProps {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost?: number;
  showDetails?: boolean;
}

/**
 * Token usage display (compact or detailed)
 */
export const TokenCounter: React.FC<TokenCounterProps> = ({
  inputTokens,
  outputTokens,
  totalTokens,
  cost,
  showDetails = false,
}) => {
  if (!showDetails) {
    // Compact mode
    return (
      <div className="text-xs text-gray-400">
        {totalTokens.toLocaleString()} tokens
        {cost !== undefined && ` | $${cost.toFixed(4)}`}
      </div>
    );
  }

  // Detailed mode
  return (
    <div className="text-xs text-gray-400 space-y-1">
      <div className="flex justify-between">
        <span>Input:</span>
        <span className="font-mono">{inputTokens.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Output:</span>
        <span className="font-mono">{outputTokens.toLocaleString()}</span>
      </div>
      <div className="flex justify-between font-semibold">
        <span>Total:</span>
        <span className="font-mono">{totalTokens.toLocaleString()}</span>
      </div>
      {cost !== undefined && (
        <div className="flex justify-between text-green-400">
          <span>Cost:</span>
          <span className="font-mono">${cost.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
};

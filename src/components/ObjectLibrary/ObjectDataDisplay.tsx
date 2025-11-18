import React, { useState } from 'react';

interface ObjectDataDisplayProps {
  data: Record<string, any>;
  schema?: any;
}

// Recursive component for nested data
const DataNode: React.FC<{ label: string; value: any; depth?: number }> = ({ label, value, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels

  const isObject = value && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const renderValue = () => {
    if (value === null) return <span className="text-gray-500">null</span>;
    if (value === undefined) return <span className="text-gray-500">undefined</span>;
    if (typeof value === 'boolean') return <span className="text-blue-400">{String(value)}</span>;
    if (typeof value === 'number') return <span className="text-green-400">{value}</span>;
    if (typeof value === 'string') {
      // Truncate long strings
      const displayValue = value.length > 100 ? `${value.substring(0, 100)}...` : value;
      return <span className="text-yellow-400">"{displayValue}"</span>;
    }
    return <span className="text-gray-300">{String(value)}</span>;
  };

  const getPreview = () => {
    if (isArray) return `Array(${value.length})`;
    if (isObject) return `Object(${Object.keys(value).length})`;
    return '';
  };

  return (
    <div style={{ marginLeft: depth > 0 ? '1rem' : 0 }}>
      <div className="flex items-start gap-2 py-1">
        {/* Expand/collapse button */}
        {isExpandable && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 mt-0.5"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Label */}
        <div className="flex-1 min-w-0">
          <span className="text-cyan-400 font-medium">{label}</span>
          <span className="text-gray-500">: </span>

          {/* Value or preview */}
          {isExpandable ? (
            <span className="text-gray-400 text-sm">{getPreview()}</span>
          ) : (
            renderValue()
          )}
        </div>
      </div>

      {/* Nested content */}
      {isExpandable && isExpanded && (
        <div className="border-l border-gray-700 ml-2">
          {isArray ? (
            value.map((item: any, index: number) => (
              <DataNode key={index} label={`[${index}]`} value={item} depth={depth + 1} />
            ))
          ) : (
            Object.entries(value).map(([key, val]) => (
              <DataNode key={key} label={key} value={val} depth={depth + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const ObjectDataDisplay: React.FC<ObjectDataDisplayProps> = ({
  data
}) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-500 text-sm text-center">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 font-mono text-sm overflow-x-auto">
      {Object.entries(data).map(([key, value]) => (
        <DataNode key={key} label={key} value={value} />
      ))}
    </div>
  );
};

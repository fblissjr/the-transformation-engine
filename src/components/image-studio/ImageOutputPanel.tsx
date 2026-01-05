import React, { useState, useMemo } from 'react';

/**
 * ImageOutputPanel component
 *
 * Displays the generated structured intermediate and formatted output.
 * Supports multiple output templates: Natural Language, YAML, JSON, Tag List.
 *
 * NOTE: This does NOT display images - it displays structured prompt text.
 *
 * @param intermediate - The generated intermediate data (YAML, original prompt, aspect ratio).
 * @returns The rendered ImageOutputPanel component.
 */

type OutputFormat = 'natural' | 'yaml' | 'json' | 'tags';

interface ImageOutputPanelProps {
  intermediate?: {
    yaml: string;
    originalPrompt: string;
    aspectRatio: string;
  };
}

/**
 * Parse YAML-like intermediate to a structured object for formatting.
 */
function parseIntermediate(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Section header (no indent, ends with colon)
    if (!line.startsWith(' ') && !line.startsWith('\t') && trimmed.endsWith(':')) {
      currentSection = trimmed.slice(0, -1).toLowerCase();
      result[currentSection] = {};
      continue;
    }

    // Key-value pair
    const keyMatch = trimmed.match(/^(\w+):\s*(.*)$/);
    if (keyMatch && currentSection) {
      const [, key, value] = keyMatch;
      const section = result[currentSection] as Record<string, unknown>;
      if (section) {
        section[key.toLowerCase()] = value || '';
      }
    }

    // Array item
    if (trimmed.startsWith('- ') && currentSection) {
      const value = trimmed.slice(2);
      const section = result[currentSection] as Record<string, unknown>;
      if (section) {
        const lastKey = Object.keys(section).pop();
        if (lastKey) {
          const existing = section[lastKey];
          if (Array.isArray(existing)) {
            existing.push(value);
          } else if (typeof existing === 'string' && !existing) {
            section[lastKey] = [value];
          }
        }
      }
    }
  }

  return result;
}

/**
 * Format intermediate to natural language.
 */
function formatAsNaturalLanguage(yaml: string): string {
  const parsed = parseIntermediate(yaml);
  const parts: string[] = [];

  // Visual section
  const visual = parsed.visual as Record<string, string> | undefined;
  if (visual) {
    if (visual.subject) parts.push(visual.subject);
    if (visual.setting) parts.push(`in ${visual.setting}`);
    if (visual.environment) parts.push(`with ${visual.environment}`);
    if (visual.lighting) parts.push(`${visual.lighting} lighting`);
    if (visual.composition) parts.push(`${visual.composition} composition`);
    if (visual.style) parts.push(`${visual.style} style`);
    if (visual.colors) parts.push(`${visual.colors} color palette`);
  }

  // Camera section
  const camera = parsed.camera as Record<string, string> | undefined;
  if (camera) {
    const cameraParts: string[] = [];
    if (camera.lens) cameraParts.push(`${camera.lens} lens`);
    if (camera.aperture) cameraParts.push(`at ${camera.aperture}`);
    if (camera.angle) cameraParts.push(`${camera.angle} angle`);
    if (cameraParts.length > 0) {
      parts.push(`Shot with ${cameraParts.join(', ')}`);
    }
  }

  return parts.join('. ').replace(/\.\./g, '.').trim() || yaml;
}

/**
 * Format intermediate as JSON.
 */
function formatAsJson(yaml: string): string {
  const parsed = parseIntermediate(yaml);
  return JSON.stringify(parsed, null, 2);
}

/**
 * Format intermediate as comma-separated tags.
 */
function formatAsTags(yaml: string): string {
  const parsed = parseIntermediate(yaml);
  const tags: string[] = [];

  // Extract all string values
  const extractTags = (obj: Record<string, unknown>) => {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && value) {
        // Split on commas if present
        const subTags = value.split(',').map(t => t.trim()).filter(Boolean);
        tags.push(...subTags);
      } else if (Array.isArray(value)) {
        tags.push(...value.filter(v => typeof v === 'string'));
      } else if (typeof value === 'object' && value) {
        extractTags(value as Record<string, unknown>);
      }
    }
  };

  extractTags(parsed);
  return tags.join(', ');
}

const FORMAT_OPTIONS: { value: OutputFormat; label: string; description: string }[] = [
  { value: 'natural', label: 'Natural Language', description: 'Prose description for most platforms' },
  { value: 'yaml', label: 'Structured YAML', description: 'Original structured format' },
  { value: 'json', label: 'JSON', description: 'Machine-readable export' },
  { value: 'tags', label: 'Tag List', description: 'Comma-separated tags' },
];

export const ImageOutputPanel: React.FC<ImageOutputPanelProps> = ({
  intermediate,
}) => {
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('natural');
  const [showRawYaml, setShowRawYaml] = useState(false);
  const [copied, setCopied] = useState(false);

  // Format the output based on selected format
  const formattedOutput = useMemo(() => {
    if (!intermediate?.yaml) return '';

    switch (outputFormat) {
      case 'natural':
        return formatAsNaturalLanguage(intermediate.yaml);
      case 'yaml':
        return intermediate.yaml;
      case 'json':
        return formatAsJson(intermediate.yaml);
      case 'tags':
        return formatAsTags(intermediate.yaml);
      default:
        return intermediate.yaml;
    }
  }, [intermediate?.yaml, outputFormat]);

  const handleCopy = async () => {
    if (!formattedOutput) return;

    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="right-panel w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100">Prompt Output</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Copy and use in any image generation platform
        </p>
      </div>

      {/* Empty State */}
      {!intermediate && (
        <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
          <svg
            className="w-16 h-16 text-zinc-700 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">No prompt generated yet</h3>
          <p className="text-xs text-zinc-600">
            Enter a description and click Generate to create a structured prompt
          </p>
        </div>
      )}

      {/* Output Content */}
      {intermediate && (
        <>
          {/* Format Selector */}
          <div className="p-4 border-b border-zinc-800">
            <label className="text-xs font-medium text-zinc-400 block mb-2">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-600 mt-1">
              {FORMAT_OPTIONS.find(o => o.value === outputFormat)?.description}
            </p>
          </div>

          {/* Formatted Output */}
          <div className="p-4 border-b border-zinc-800 flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-400">
                Formatted Prompt
              </span>
              <span className="text-xs text-zinc-600">
                {formattedOutput.length} chars
              </span>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
              <pre className="text-sm text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
                {formattedOutput}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-b border-zinc-800 flex gap-2">
            <button
              onClick={handleCopy}
              className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
            <button
              onClick={() => setShowRawYaml(!showRawYaml)}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm px-3 py-2 rounded transition-colors"
            >
              {showRawYaml ? 'Hide' : 'View'} Raw
            </button>
          </div>

          {/* Raw YAML (Collapsible) */}
          {showRawYaml && (
            <div className="p-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">
                  Structured Intermediate (YAML)
                </span>
              </div>
              <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono overflow-auto max-h-64">
                {intermediate.yaml}
              </pre>
            </div>
          )}

          {/* Metadata */}
          <div className="p-4 text-xs text-zinc-500 space-y-1">
            <div className="flex justify-between">
              <span>Aspect Ratio:</span>
              <span className="text-zinc-300">{intermediate.aspectRatio}</span>
            </div>
            <div className="flex justify-between">
              <span>Original Prompt:</span>
              <span className="text-zinc-300 truncate max-w-48" title={intermediate.originalPrompt}>
                {intermediate.originalPrompt.substring(0, 50)}...
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageOutputPanel;

import React, { useState, useEffect, useCallback } from 'react';
import { wildcardService, ExperimentMatrix } from '../../services/wildcardService';

interface WildcardExperimenterProps {
  initialTemplate?: string;
  onSelectResult?: (result: string) => void;
}

interface MatrixConfig {
  category: string;
  selectedValues: string[];
  allValues: string[];
}

/**
 * WildcardExperimenter component
 *
 * A/B testing UI for wildcard templates.
 * Generates all combinations of selected wildcard values
 * for side-by-side comparison.
 */
export const WildcardExperimenter: React.FC<WildcardExperimenterProps> = ({
  initialTemplate = '',
  onSelectResult,
}) => {
  const [template, setTemplate] = useState(initialTemplate);
  const [matrixConfigs, setMatrixConfigs] = useState<MatrixConfig[]>([]);
  const [experimentResults, setExperimentResults] = useState<ExperimentMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

  // Load available categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      await wildcardService.load();
      const categories = wildcardService.getCategories();
      setAvailableCategories(categories);
    };
    loadCategories();
  }, []);

  // Detect wildcards in template and update matrix configs
  useEffect(() => {
    const wildcards = wildcardService.extractWildcards(template);
    const uniqueCategories = [...new Set(wildcards.map(w => w.category))];

    setMatrixConfigs(prev => {
      // Preserve existing configs, add new ones
      const newConfigs: MatrixConfig[] = [];

      for (const category of uniqueCategories) {
        const existing = prev.find(c => c.category === category);
        const allValues = wildcardService.getValues(category);

        if (existing) {
          // Keep existing selection
          newConfigs.push({
            ...existing,
            allValues,
          });
        } else {
          // New category - select first 2 values by default
          newConfigs.push({
            category,
            allValues,
            selectedValues: allValues.slice(0, 2),
          });
        }
      }

      return newConfigs;
    });
  }, [template]);

  // Toggle a value in a matrix config
  const toggleValue = useCallback((categoryIndex: number, value: string) => {
    setMatrixConfigs(prev => {
      const updated = [...prev];
      const config = { ...updated[categoryIndex] };

      if (config.selectedValues.includes(value)) {
        config.selectedValues = config.selectedValues.filter(v => v !== value);
      } else {
        config.selectedValues = [...config.selectedValues, value];
      }

      updated[categoryIndex] = config;
      return updated;
    });

    // Clear previous results when config changes
    setExperimentResults(null);
  }, []);

  // Generate experiment matrix
  const generateMatrix = useCallback(async () => {
    if (matrixConfigs.length === 0) return;

    setIsLoading(true);
    try {
      const matrixConfig: Record<string, string[]> = {};
      for (const config of matrixConfigs) {
        if (config.selectedValues.length > 0) {
          matrixConfig[config.category] = config.selectedValues;
        }
      }

      const results = wildcardService.createExperimentMatrix(template, matrixConfig);
      setExperimentResults(results);
      setSelectedResultIndex(null);
    } finally {
      setIsLoading(false);
    }
  }, [template, matrixConfigs]);

  // Calculate total combinations
  const totalCombinations = matrixConfigs.reduce((total, config) => {
    const count = config.selectedValues.length;
    return total * (count > 0 ? count : 1);
  }, 1);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Wildcard Experimenter</h2>
        <p className="text-sm text-gray-400 mt-1">
          Generate all combinations for A/B testing
        </p>
      </div>

      {/* Template Input */}
      <div className="p-4 border-b border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Template with Wildcards
        </label>
        <textarea
          value={template}
          onChange={e => setTemplate(e.target.value)}
          placeholder="A {style} photograph of a {subject} in {lighting} lighting..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />

        {/* Detected wildcards */}
        {matrixConfigs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {matrixConfigs.map(config => (
              <span
                key={config.category}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-900/30 text-purple-300 border border-purple-700/50"
              >
                {`{${config.category}}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Matrix Configuration */}
      {matrixConfigs.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">
              Select Values for Each Category
            </h3>
            <span className="text-xs text-gray-500">
              {totalCombinations} combination{totalCombinations !== 1 ? 's' : ''}
            </span>
          </div>

          {matrixConfigs.map((config, configIndex) => (
            <div
              key={config.category}
              className="bg-gray-800 rounded-lg p-3 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white font-mono">
                  {`{${config.category}}`}
                </span>
                <span className="text-xs text-gray-500">
                  {config.selectedValues.length} / {config.allValues.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {config.allValues.slice(0, 20).map(value => {
                  const isSelected = config.selectedValues.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleValue(configIndex, value)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
                {config.allValues.length > 20 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{config.allValues.length - 20} more
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Generate Button */}
          <button
            onClick={generateMatrix}
            disabled={isLoading || totalCombinations === 0}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading
              ? 'Generating...'
              : `Generate ${totalCombinations} Combination${totalCombinations !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Empty State */}
      {matrixConfigs.length === 0 && template.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">Enter a template with wildcards to start experimenting</p>
            <p className="text-sm">
              Use {'{category}'} syntax, e.g., {'{style}'}, {'{lighting}'}
            </p>
          </div>
        </div>
      )}

      {/* Results Panel */}
      {experimentResults && experimentResults.combinations.length > 0 && (
        <div className="border-t border-gray-700">
          <div className="p-3 bg-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              Results ({experimentResults.totalCombinations})
            </span>
            {selectedResultIndex !== null && onSelectResult && (
              <button
                onClick={() => {
                  onSelectResult(experimentResults.combinations[selectedResultIndex].resolved);
                }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                Use Selected
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {experimentResults.combinations.map((result, index) => (
              <div
                key={result.seed}
                onClick={() => setSelectedResultIndex(index)}
                className={`p-3 border-b border-gray-800 cursor-pointer transition-colors ${
                  selectedResultIndex === index
                    ? 'bg-purple-900/30 border-l-2 border-l-purple-500'
                    : 'hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white flex-1">{result.resolved}</p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    #{index + 1}
                  </span>
                </div>

                {/* Show which values were used */}
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(result.values).map(([category, value]) => (
                    <span
                      key={category}
                      className="text-xs text-gray-500"
                    >
                      {category}: <span className="text-purple-400">{value}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WildcardExperimenter;

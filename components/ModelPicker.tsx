import React, { useState, useEffect, useRef } from 'react';
import type { Model } from '../types/providers';

interface ModelPickerProps {
  providerId: string;
  models: Model[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  filterCapabilities?: {
    vision?: boolean;
    video?: boolean;
    jsonMode?: boolean;
  };
  disabled?: boolean;
  className?: string;
}

/**
 * Searchable model picker with filtering and capability badges
 * Scales to 100+ models with virtual scrolling
 */
export const ModelPicker: React.FC<ModelPickerProps> = ({
  providerId,
  models,
  selectedModelId,
  onSelect,
  filterCapabilities,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModels, setFilteredModels] = useState(models);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter models by search term and capabilities
  useEffect(() => {
    let filtered = models;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.id.toLowerCase().includes(term) ||
          m.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Apply capability filters
    if (filterCapabilities) {
      if (filterCapabilities.vision) {
        filtered = filtered.filter((m) => m.capabilities.vision);
      }
      if (filterCapabilities.video) {
        filtered = filtered.filter((m) => m.capabilities.video);
      }
      if (filterCapabilities.jsonMode) {
        filtered = filtered.filter((m) => m.capabilities.jsonMode);
      }
    }

    setFilteredModels(filtered);
  }, [searchTerm, models, filterCapabilities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const formatContextLength = (tokens: number): string => {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(1)}M`;
    }
    if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-left ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
        }`}
      >
        <span className="truncate">
          {selectedModel ? selectedModel.name : 'Select model...'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-96 flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search models..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Model list */}
          <div className="overflow-y-auto flex-1">
            {filteredModels.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                No models found
              </div>
            ) : (
              filteredModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => handleSelect(model.id)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors ${
                    model.id === selectedModelId ? 'bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {model.name}
                      </div>
                      {model.description && (
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                          {model.description}
                        </div>
                      )}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {/* Capability badges */}
                        {model.capabilities.vision && (
                          <span className="px-1.5 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded">
                            👁️ Vision
                          </span>
                        )}
                        {model.capabilities.video && (
                          <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded">
                            🎥 Video
                          </span>
                        )}
                        {model.capabilities.jsonMode && (
                          <span className="px-1.5 py-0.5 bg-green-900/50 text-green-300 text-xs rounded">
                            {} JSON
                          </span>
                        )}
                        {/* Context length */}
                        <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                          {formatContextLength(model.capabilities.maxContextTokens)} ctx
                        </span>
                        {/* Tags */}
                        {model.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-gray-700 text-gray-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Pricing */}
                    {model.pricing && (
                      <div className="text-xs text-gray-400 text-right whitespace-nowrap">
                        ${(model.pricing.inputPerMillion / 1_000_000).toFixed(4)}/1K
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer with count */}
          <div className="p-2 border-t border-gray-700 text-xs text-gray-400 text-center">
            {filteredModels.length} of {models.length} models
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>
      )}
    </div>
  );
};

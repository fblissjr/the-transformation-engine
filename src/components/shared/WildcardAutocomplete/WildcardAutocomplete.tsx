/**
 * WildcardAutocomplete - Shared Textarea with Wildcard Support
 *
 * A textarea with autocomplete for wildcard categories.
 * Triggered by typing '{' character.
 * Shows available categories and modifiers.
 *
 * Used in:
 * - Video workspace (CenterPanel.tsx) - main prompt input
 * - Image Studio (ImageGenerateForm.tsx) - prompt input with fragment insertion
 */

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { wildcardService } from '../../../services/wildcardService';

export interface WildcardAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

export interface WildcardAutocompleteRef {
  textarea: HTMLTextAreaElement | null;
  focus: () => void;
  getSelectionRange: () => { start: number; end: number };
  setSelectionRange: (start: number, end: number) => void;
}

interface AutocompleteState {
  isOpen: boolean;
  categories: string[];
  filteredCategories: string[];
  selectedIndex: number;
  cursorPosition: number;
  searchTerm: string;
}

export const WildcardAutocomplete = forwardRef<WildcardAutocompleteRef, WildcardAutocompleteProps>(({
  value,
  onChange,
  placeholder = 'Type your prompt... Use {category} for wildcards',
  className = '',
  rows = 4,
  disabled = false,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Expose ref methods to parent components
  useImperativeHandle(ref, () => ({
    textarea: textareaRef.current,
    focus: () => textareaRef.current?.focus(),
    getSelectionRange: () => {
      if (!textareaRef.current) {
        return { start: 0, end: 0 };
      }
      return {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      };
    },
    setSelectionRange: (start: number, end: number) => {
      if (!textareaRef.current) {
        return;
      }
      textareaRef.current.setSelectionRange(start, end);
    },
  }));

  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    isOpen: false,
    categories: [],
    filteredCategories: [],
    selectedIndex: 0,
    cursorPosition: 0,
    searchTerm: '',
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      await wildcardService.load();
      const categories = wildcardService.getCategories();
      setAutocomplete(prev => ({ ...prev, categories }));
    };
    loadCategories();
  }, []);

  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    onChange(newValue);

    // Check if we should show autocomplete
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{');
    const lastCloseBrace = textBeforeCursor.lastIndexOf('}');

    // Show autocomplete if we're inside an unclosed brace
    if (lastOpenBrace > lastCloseBrace) {
      const searchTerm = textBeforeCursor.slice(lastOpenBrace + 1).toLowerCase();
      // Filter out double braces ({{variable}})
      if (!searchTerm.startsWith('{')) {
        const filtered = autocomplete.categories.filter(cat =>
          cat.toLowerCase().includes(searchTerm.split(':')[0])
        );

        setAutocomplete(prev => ({
          ...prev,
          isOpen: true,
          filteredCategories: filtered.slice(0, 10),
          selectedIndex: 0,
          cursorPosition: cursorPos,
          searchTerm,
        }));
        return;
      }
    }

    // Close autocomplete
    setAutocomplete(prev => ({ ...prev, isOpen: false }));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!autocomplete.isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, prev.filteredCategories.length - 1),
        }));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setAutocomplete(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        break;

      case 'Tab':
      case 'Enter':
        if (autocomplete.filteredCategories.length > 0) {
          e.preventDefault();
          insertCategory(autocomplete.filteredCategories[autocomplete.selectedIndex]);
        }
        break;

      case 'Escape':
        setAutocomplete(prev => ({ ...prev, isOpen: false }));
        break;
    }
  };

  // Insert selected category
  const insertCategory = useCallback((category: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);

    // Find the opening brace
    const lastOpenBrace = textBeforeCursor.lastIndexOf('{');

    // Replace from the brace to cursor with the full wildcard
    const newValue =
      value.slice(0, lastOpenBrace) +
      `{${category}}` +
      textAfterCursor;

    onChange(newValue);
    setAutocomplete(prev => ({ ...prev, isOpen: false }));

    // Set cursor position after the closing brace
    setTimeout(() => {
      const newPos = lastOpenBrace + category.length + 2;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // Get sample values for preview
  const getSampleValues = (category: string): string[] => {
    const values = wildcardService.getValues(category);
    return values.slice(0, 3);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setAutocomplete(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      />

      {/* Autocomplete dropdown */}
      {autocomplete.isOpen && autocomplete.filteredCategories.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-2 border-b border-gray-700">
            <span className="text-xs text-gray-400">Wildcard Categories</span>
            <span className="text-xs text-gray-500 ml-2">
              (Use :random, :3random, or :all as modifiers)
            </span>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {autocomplete.filteredCategories.map((category, index) => {
              const samples = getSampleValues(category);
              const isSelected = index === autocomplete.selectedIndex;

              return (
                <li
                  key={category}
                  onClick={() => insertCategory(category)}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-600/30 border-l-2 border-purple-500'
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-sm">{`{${category}}`}</span>
                    <span className="text-xs text-gray-500">
                      {wildcardService.getValues(category).length} values
                    </span>
                  </div>
                  {samples.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      e.g., {samples.join(', ')}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="p-2 border-t border-gray-700 bg-gray-900/50">
            <div className="flex gap-2 text-xs text-gray-500">
              <span><kbd className="px-1 bg-gray-700 rounded">Tab</kbd> or <kbd className="px-1 bg-gray-700 rounded">Enter</kbd> to insert</span>
              <span><kbd className="px-1 bg-gray-700 rounded">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Wildcard hints */}
      {wildcardService.hasWildcards(value) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {wildcardService.extractWildcards(value).map((wc, idx) => (
            <span
              key={`${wc.category}-${idx}`}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-900/30 text-purple-300 border border-purple-700/50"
            >
              {`{${wc.category}${wc.modifier ? ':' + wc.modifier : ''}}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

WildcardAutocomplete.displayName = 'WildcardAutocomplete';

export default WildcardAutocomplete;

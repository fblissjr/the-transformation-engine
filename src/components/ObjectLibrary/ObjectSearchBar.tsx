import React from 'react';

interface ObjectSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * ObjectSearchBar component
 *
 * A search input field for filtering objects in the library.
 * Supports searching by name, description, or tags.
 * Includes a clear button to reset the search query.
 *
 * @param searchQuery - The current search query string.
 * @param onSearchChange - Callback when the search query changes.
 * @returns The rendered ObjectSearchBar component.
 */
export const ObjectSearchBar: React.FC<ObjectSearchBarProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search objects by name, description, or tags..."
        className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />

      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Clear button */}
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

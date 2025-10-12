import React, { useState } from 'react';
import { useIntermediate } from '../../context/IntermediateContext';

const IntermediateMetadataForm: React.FC = () => {
  const { activeIntermediate, updateMetadata } = useIntermediate();
  const [tagInput, setTagInput] = useState('');

  if (!activeIntermediate) return null;

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !activeIntermediate.tags.includes(trimmedTag)) {
      updateMetadata({
        tags: [...activeIntermediate.tags, trimmedTag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateMetadata({
      tags: activeIntermediate.tags.filter(t => t !== tag),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-900 border border-gray-800 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={activeIntermediate.title}
          onChange={e => updateMetadata({ title: e.target.value })}
          placeholder="Prompt title..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          value={activeIntermediate.description || ''}
          onChange={e => updateMetadata({ description: e.target.value })}
          placeholder="Describe this prompt..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        {activeIntermediate.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeIntermediate.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-300"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntermediateMetadataForm;

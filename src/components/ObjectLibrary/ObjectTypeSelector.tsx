import React from 'react';
import { useObjectLibrary, OBJECT_TYPES } from '../../contexts/ObjectLibraryContext';

interface ObjectTypeSelectorProps {
  selectedType: string;
  onTypeChange?: (type: string) => void;
  onTypeSelect?: (type: string) => void; // Add support for onTypeSelect prop
}

// Icons and labels for each object type
const OBJECT_TYPE_CONFIG = {
  character: { label: 'Characters', icon: '👤', color: 'text-blue-400' },
  location: { label: 'Locations', icon: '📍', color: 'text-green-400' },
  camera: { label: 'Cameras', icon: '📷', color: 'text-purple-400' },
  prop: { label: 'Props', icon: '🎁', color: 'text-yellow-400' },
  audio: { label: 'Audio', icon: '🔊', color: 'text-pink-400' },
  concept: { label: 'Concepts', icon: '💡', color: 'text-orange-400' },
  custom: { label: 'Custom', icon: '⚙️', color: 'text-gray-400' }
} as const;

/**
 * ObjectTypeSelector component
 *
 * A grid of buttons for selecting an object type.
 * Each button displays an icon, label, and item count for that type.
 *
 * @param selectedType - The currently selected object type.
 * @param onTypeChange - Callback when the type is changed.
 * @param onTypeSelect - Alias for onTypeChange (for compatibility).
 * @returns The rendered ObjectTypeSelector component.
 */
export const ObjectTypeSelector: React.FC<ObjectTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  onTypeSelect
}) => {
  const { getObjectsByType } = useObjectLibrary();

  const handleChange = (type: string) => {
    if (onTypeChange) {
      onTypeChange(type);
    } else if (onTypeSelect) {
      onTypeSelect(type);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {OBJECT_TYPES.map(type => {
        const config = OBJECT_TYPE_CONFIG[type];
        const count = getObjectsByType(type).length;
        const isSelected = selectedType === type;

        return (
          <button
            key={type}
            onClick={() => handleChange(type)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm
              ${isSelected
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            <span className="text-lg">{config.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{config.label}</div>
              <div className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                {count} {count === 1 ? 'item' : 'items'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

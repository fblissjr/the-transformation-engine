import React, { useState } from 'react';
import { useObjectLibrary, OBJECT_TYPES } from '../../contexts/ObjectLibraryContext';

interface ObjectCreatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (objectId: string, objectType: string) => void;
}

// Type config matching ObjectTypeSelector
const OBJECT_TYPE_CONFIG = {
  character: { label: 'Character', icon: '👤', description: 'People, animals, or entities in your scenes' },
  location: { label: 'Location', icon: '📍', description: 'Settings, places, and environments' },
  camera: { label: 'Camera Setup', icon: '📷', description: 'Camera angles, movements, and shot types' },
  prop: { label: 'Prop', icon: '🎁', description: 'Objects and items in your scenes' },
  audio: { label: 'Audio Element', icon: '🔊', description: 'Sound effects, music, and ambient audio' },
  concept: { label: 'Concept', icon: '💡', description: 'Moods, themes, and abstract ideas' },
  custom: { label: 'Custom Object', icon: '⚙️', description: 'Any other type of object' }
} as const;

/**
 * ObjectCreatorDialog component
 *
 * A modal dialog for creating new objects in the object library.
 * Provides a two-step process: selecting the object type and then entering details.
 *
 * @param isOpen - Boolean indicating if the dialog is visible.
 * @param onClose - Callback to close the dialog.
 * @param onCreated - Callback executed when an object is successfully created.
 * @returns The rendered ObjectCreatorDialog component.
 */
export const ObjectCreatorDialog: React.FC<ObjectCreatorDialogProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { createObject } = useObjectLibrary();
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<string>('character');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setStep('type');
    setSelectedType('character');
    setName('');
    setDescription('');
    setTags('');
    setError(null);
    setIsCreating(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setStep('details');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create object with basic data structure
      const basicData = {
        description: description.trim(),
        createdBy: 'user',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const objectId = await createObject(
        selectedType,
        basicData,
        {
          name: name.trim(),
          description: description.trim() || undefined,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        }
      );

      onCreated(objectId, selectedType);
      handleClose();
    } catch (err) {
      console.error('Failed to create object:', err);
      setError(err instanceof Error ? err.message : 'Failed to create object');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {step === 'type' ? 'Create Object' : `Create ${OBJECT_TYPE_CONFIG[selectedType as keyof typeof OBJECT_TYPE_CONFIG]?.label}`}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isCreating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {step === 'details' && (
            <p className="text-gray-400 text-sm mt-2">
              {OBJECT_TYPE_CONFIG[selectedType as keyof typeof OBJECT_TYPE_CONFIG]?.description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'type' ? (
            // Step 1: Type Selection
            <div className="grid grid-cols-2 gap-3">
              {OBJECT_TYPES.map(type => {
                const config = OBJECT_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    className="flex flex-col items-start gap-2 p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-lg transition-all text-left"
                  >
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <div className="font-medium text-white">{config.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{config.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Step 2: Details Input
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`e.g., ${selectedType === 'character' ? 'Detective Sarah Chen' : selectedType === 'location' ? 'Cyberpunk Alleyway' : 'My ' + OBJECT_TYPE_CONFIG[selectedType as keyof typeof OBJECT_TYPE_CONFIG]?.label}`}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this object in detail..."
                  rows={4}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., sci-fi, protagonist, detective"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex gap-3 justify-end">
          {step === 'details' && (
            <button
              onClick={() => setStep('type')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={isCreating}
            >
              Back
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          {step === 'details' && (
            <button
              onClick={handleCreate}
              disabled={isCreating || !name.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors font-medium"
            >
              {isCreating ? 'Creating...' : 'Create Object'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

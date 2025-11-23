import React, { useState } from 'react';
import { useObjectLibrary } from '../../contexts/ObjectLibraryContext';
import { taskRouter } from '../../services/taskRouter';
import { executeEditObjectTask } from '../../services/llm/editObjectTask';
import type { ObjectStoreRecord } from '../../../types/objectTypes';
import type { EditObjectOutput } from '../../services/llm/editObjectTask';

interface ObjectEditDialogProps {
  isOpen: boolean;
  object: ObjectStoreRecord;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * ObjectEditDialog component
 *
 * A modal dialog for editing an existing object using LLM-powered instructions.
 * Provides an interface to input edit instructions, preview changes, and apply them.
 *
 * @param isOpen - Boolean indicating if the dialog is visible.
 * @param object - The object record to edit.
 * @param onClose - Callback to close the dialog.
 * @param onSaved - Callback executed when changes are successfully saved.
 * @returns The rendered ObjectEditDialog component.
 */
export const ObjectEditDialog: React.FC<ObjectEditDialogProps> = ({
  isOpen,
  object,
  onClose,
  onSaved
}) => {
  const { updateObject } = useObjectLibrary();
  const [editInstructions, setEditInstructions] = useState('');
  const [preserveName, setPreserveName] = useState(true);
  const [preserveTags, setPreserveTags] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<EditObjectOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setEditInstructions('');
    setPreserveName(true);
    setPreserveTags(false);
    setIsProcessing(false);
    setPreview(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePreview = async () => {
    if (!editInstructions.trim()) {
      setError('Please enter edit instructions');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const preserveFields: string[] = [];
      if (preserveName) preserveFields.push('name');
      if (preserveTags) preserveFields.push('tags');

      const result = await executeEditObjectTask(
        {
          objectType: object.type,
          currentData: object.data,
          editInstructions: editInstructions.trim(),
          preserveFields,
          context: `Object: ${object.name}\nDescription: ${object.description || 'None'}`
        },
        taskRouter
      );

      setPreview(result);
    } catch (err) {
      console.error('Failed to generate preview:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!preview) {
      setError('No preview available. Generate preview first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await updateObject(object.id, object.type, preview.editedData, {
        description: `Edited: ${editInstructions.substring(0, 100)}`,
        changelog: preview.changelog
      });

      onSaved();
      handleClose();
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Edit: {object.name}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Type: {object.type} • Version: {object.version}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Edit Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Edit Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              placeholder="e.g., Make him younger, change location to nighttime, add cyberpunk elements..."
              rows={3}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isProcessing}
            />
          </div>

          {/* Preserve Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preserve Fields (optional)
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveName}
                  onChange={(e) => setPreserveName(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
                <span>Name</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveTags}
                  onChange={(e) => setPreserveTags(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
                <span>Tags</span>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-white">Preview Changes</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Reasoning */}
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">LLM Reasoning</div>
                  <p className="text-sm text-gray-300 bg-gray-800/50 rounded p-2">{preview.reasoning}</p>
                </div>

                {/* Changelog */}
                {preview.changelog.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-2">Changes ({preview.changelog.length})</div>
                    <div className="space-y-2">
                      {preview.changelog.map((change, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded p-3 text-sm">
                          <div className="font-medium text-blue-400 mb-1">{change.field}</div>
                          <div className="flex gap-2 items-start mb-1">
                            <span className="text-red-400 line-through shrink-0">Old:</span>
                            <span className="text-gray-400 break-all">{JSON.stringify(change.oldValue)}</span>
                          </div>
                          <div className="flex gap-2 items-start mb-1">
                            <span className="text-green-400 shrink-0">New:</span>
                            <span className="text-gray-200 break-all">{JSON.stringify(change.newValue)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 italic">{change.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preserved Fields */}
                {preview.preserved.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-1">Preserved Fields</div>
                    <div className="flex flex-wrap gap-2">
                      {preview.preserved.map((field) => (
                        <span key={field} className="px-2 py-1 bg-green-900/30 border border-green-700 rounded text-green-400 text-xs">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          {!preview ? (
            <button
              onClick={handlePreview}
              disabled={isProcessing || !editInstructions.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                'Preview Changes'
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setPreview(null);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={isProcessing}
              >
                Edit Again
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

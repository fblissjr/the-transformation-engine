import React, { useState, useEffect } from 'react';
import { useIntermediate } from '../../context/IntermediateContext';
import IntermediateMetadataForm from './IntermediateMetadataForm';
import TemporalEditor from './TemporalEditor';
import VisualEditor from './VisualEditor';
import AudioEditor from './AudioEditor';
import CameraEditor from './CameraEditor';
import FormatExportPanel from './FormatExportPanel';

interface IntermediateEditorProps {
  intermediateId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

type Tab = 'timeline' | 'visual' | 'audio' | 'camera';

const IntermediateEditor: React.FC<IntermediateEditorProps> = ({
  intermediateId,
  onSave,
  onCancel,
}) => {
  const {
    activeIntermediate,
    isDirty,
    loadIntermediate,
    createNew,
    saveIntermediate,
    discardChanges,
  } = useIntermediate();

  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [isSaving, setIsSaving] = useState(false);

  // Load or create on mount
  useEffect(() => {
    if (intermediateId) {
      loadIntermediate(intermediateId);
    } else {
      createNew();
    }
  }, [intermediateId, loadIntermediate, createNew]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveIntermediate();
      if (onSave) onSave();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save intermediate');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmed) return;
      discardChanges();
    }
    if (onCancel) onCancel();
  };

  if (!activeIntermediate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-200">
            {intermediateId ? 'Edit' : 'Create'} Intermediate Prompt
          </h2>
          {isDirty && (
            <span className="text-xs text-amber-500 bg-amber-900/20 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4 border-b border-gray-800">
        <IntermediateMetadataForm />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('visual')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'visual'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Visual
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'audio'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Audio
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'camera'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Camera
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'timeline' && <TemporalEditor />}
        {activeTab === 'visual' && <VisualEditor />}
        {activeTab === 'audio' && <AudioEditor />}
        {activeTab === 'camera' && <CameraEditor />}
      </div>

      {/* Export panel - always visible at bottom */}
      <FormatExportPanel />
    </div>
  );
};

export default IntermediateEditor;

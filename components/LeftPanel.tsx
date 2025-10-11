import React, { useState, useMemo, useEffect } from 'react';
import { usePrompts } from '../context/PromptContext';
import { useApiKey } from '../context/ApiKeyContext';
import { LogoIcon, PlusIcon, ImportIcon, ExportIcon, SettingsIcon, MixIcon, TrashIcon, StarIconFilled, StarIconOutline, CopyIcon, ShareIcon } from './icons';
import * as dbService from '../services/dbService';
import ShareModal from './ShareModal';
import SettingsModal from './SettingsModal';
import { PrivacyDashboard } from './PrivacyDashboard';
import { Prompt } from '../types';

interface LeftPanelProps {
  onDeleteRequest?: (promptId: string, promptTitle: string) => void; // Now optional
}

const LeftPanel: React.FC<LeftPanelProps> = ({ onDeleteRequest }) => {
  const {
    prompts,
    activePrompt,
    selectedPromptIds,
    settings,
    setSettings,
    selectPrompt,
    toggleSelectPrompt,
    newPrompt,
    mixPrompts,
    loadPrompts,
    toggleFavorite,
    searchPrompts,
    deletePrompts,
    duplicatePrompts,
    clearSelection,
  } = usePrompts();

  const [searchTerm, setSearchTerm] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrivacyDashboardOpen, setIsPrivacyDashboardOpen] = useState(false);
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
        searchPrompts(searchTerm);
    }, 300); // 300ms debounce

    return () => {
        clearTimeout(handler);
    };
  }, [searchTerm, searchPrompts]);

  const sortedPrompts = useMemo(() => {
    return [...prompts].sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
            return a.isFavorite ? -1 : 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [prompts]);

  const handleExport = async () => {
    const promptsToExport = selectedPromptIds.length > 0
        ? prompts.filter(p => selectedPromptIds.includes(p.id))
        : prompts;

    if (promptsToExport.length === 0) {
        alert("No prompts to export.");
        return;
    }

    const jsonString = JSON.stringify(promptsToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts_backup_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const text = await file.text();
            try {
                await dbService.importPrompts(text);
                loadPrompts();
            } catch (error) {
                console.error("Failed to import prompts:", error);
                alert("Import failed. Please check the file format.");
            }
        }
    };
    input.click();
  };

  const handleBulkDelete = async () => {
    if (selectedPromptIds.length === 0) return;
    setDeleteConfirmIds(selectedPromptIds);
  };

  const confirmBulkDelete = async () => {
    await deletePrompts(deleteConfirmIds);
    setDeleteConfirmIds([]);
  };

  const cancelBulkDelete = () => {
    setDeleteConfirmIds([]);
  };

  const handleBulkDuplicate = async () => {
    await duplicatePrompts(selectedPromptIds);
  };

  const handleBulkShare = () => {
    if (selectedPromptIds.length === 1) {
      setIsShareModalOpen(true);
    }
  };

  const handleSingleDelete = (promptId: string) => {
    setDeleteConfirmIds([promptId]);
  };

  const confirmSingleDelete = async () => {
    if (deleteConfirmIds.length === 1) {
      await deletePrompts(deleteConfirmIds);
    }
    setDeleteConfirmIds([]);
  };

  const getHeaderButton = () => {
    if (selectedPromptIds.length > 1) {
      return (
        <button onClick={mixPrompts} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-colors text-base">
          <MixIcon /> Mix ({selectedPromptIds.length})
        </button>
      );
    }
    if (selectedPromptIds.length === 1) {
        return (
            <button onClick={() => setIsShareModalOpen(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-colors text-base">
              <ShareIcon /> Share
            </button>
        );
    }
    return (
      <button onClick={newPrompt} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-colors text-base">
        <PlusIcon /> New Prompt
      </button>
    );
  };

  const selectedPromptForShare = useMemo(() => {
    if (selectedPromptIds.length === 1) {
        return prompts.find(p => p.id === selectedPromptIds[0]);
    }
    return undefined;
  }, [prompts, selectedPromptIds]);

  return (
    <aside className="w-1/4 max-w-[350px] h-full bg-gray-900 border-r border-gray-800 flex flex-col">
        {isShareModalOpen && selectedPromptForShare && (
            <ShareModal prompt={selectedPromptForShare} onClose={() => setIsShareModalOpen(false)} />
        )}
        {isSettingsModalOpen && (
            <SettingsModal
              onClose={() => setIsSettingsModalOpen(false)}
              settings={settings}
              onSettingsChange={setSettings}
            />
        )}
        <PrivacyDashboard
          isOpen={isPrivacyDashboardOpen}
          onClose={() => setIsPrivacyDashboardOpen(false)}
        />
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 shrink-0">
        <LogoIcon />
        <div>
          <h1 className="text-lg font-bold text-white">The Transformation Engine</h1>
          <p className="text-xs text-gray-400">Your Local Prompt IDE</p>
        </div>
      </div>
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 shrink-0">
        {getHeaderButton()}
      </div>

      <div className="p-4 shrink-0">
        <input
          type="text"
          placeholder="Search prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      </div>

      {/* Multi-action toolbar - shows when items are selected */}
      {selectedPromptIds.length > 0 && (
        <div className="px-4 pb-3 shrink-0">
          {deleteConfirmIds.length > 0 ? (
            <div className="bg-red-900/30 border border-red-600 rounded-md p-3 flex flex-col gap-2">
              <p className="text-red-400 text-sm font-medium">
                Delete {deleteConfirmIds.length} prompt{deleteConfirmIds.length > 1 ? 's' : ''}?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmBulkDelete}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded transition-colors text-sm"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={cancelBulkDelete}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-md p-2 flex gap-2">
              <button
                onClick={handleBulkDuplicate}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded transition-colors text-sm"
                title="Duplicate selected"
              >
                <CopyIcon /> Duplicate
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded transition-colors text-sm"
                title="Delete selected"
              >
                <TrashIcon /> Delete
              </button>
            </div>
          )}
          <button
            onClick={clearSelection}
            className="w-full mt-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear selection ({selectedPromptIds.length})
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {sortedPrompts.length > 0 ? (
          <ul>
            {sortedPrompts.map(prompt => {
              const isDeleteConfirm = deleteConfirmIds.includes(prompt.id) && deleteConfirmIds.length === 1;
              return (
              <li
                key={prompt.id}
                className={`group border-b border-gray-800 hover:bg-gray-800/50 transition-colors relative ${activePrompt?.id === prompt.id ? 'bg-gray-800' : ''}`}
              >
                {activePrompt?.id === prompt.id && <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 rounded-r-full"></div>}

                {isDeleteConfirm ? (
                  <div className="flex items-center gap-2 p-3 bg-red-900/30 border-l-4 border-red-600 animate-[slideIn_0.2s_ease-out]">
                    <div className="flex-1">
                      <p className="text-red-400 text-sm font-medium">Delete "{prompt.title}"?</p>
                    </div>
                    <button
                      onClick={confirmSingleDelete}
                      className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1.5 px-3 rounded transition-colors text-xs"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={cancelBulkDelete}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 rounded transition-colors text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-0">
                    <div className="pl-4 py-3 self-start mt-2.5">
                        <input
                            type="checkbox"
                            checked={selectedPromptIds.includes(prompt.id)}
                            onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectPrompt(prompt.id);
                            }}
                            className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 rounded text-amber-500 focus:ring-amber-600 focus:ring-offset-0 focus:ring-offset-gray-800"
                        />
                    </div>
                    <div onClick={() => selectPrompt(prompt)} className="flex-1 overflow-hidden py-3 pl-4 pr-4 cursor-pointer">
                      <div className="flex items-center gap-2">
                        {prompt.isFavorite && <StarIconFilled className="h-4 w-4 text-amber-400 shrink-0" />}
                        <h3 className="font-medium text-white truncate text-sm">{prompt.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(prompt.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center pr-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(prompt.id); }}
                            className="p-2 text-gray-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                            title={prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
                        >
                            {prompt.isFavorite ? <StarIconFilled className="h-5 w-5 text-amber-400" /> : <StarIconOutline className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSingleDelete(prompt.id); }}
                            className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                            title="Delete Prompt"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                  </div>
                )}
              </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center p-8 text-gray-500">
            <p>No prompts found.</p>
            <p className="text-sm mt-1">Create a new prompt to get started.</p>
          </div>
        )}
      </div>

      {/* Import/Export Section - Moved to bottom above Settings */}
      <div className="px-4 pt-3 pb-2 border-t border-gray-800 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-1.5 px-2 rounded transition-colors text-xs"
          >
            <ImportIcon />
            Import Prompts
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-1.5 px-2 rounded transition-colors text-xs relative"
          >
            <ExportIcon />
            Export Prompts
            {selectedPromptIds.length > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{selectedPromptIds.length}</span>}
          </button>
        </div>
      </div>

      {/* Privacy & Settings - At the very bottom */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-800 shrink-0 space-y-2">
        <button
          onClick={() => setIsPrivacyDashboardOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2.5 px-3 rounded transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Privacy
        </button>
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2.5 px-3 rounded transition-colors text-sm"
        >
          <SettingsIcon />
          Settings
        </button>
      </div>
    </aside>
  );
};

export default LeftPanel;

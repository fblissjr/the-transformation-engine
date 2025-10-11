/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { Prompt } from '../types';
import * as dbService from '../services/dbService';

interface PromptLibraryContextType {
  prompts: Prompt[];
  selectedPromptIds: string[];
  hasMore: boolean;
  total: number;
  isLoadingMore: boolean;
  loadPrompts: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchPrompts: (searchTerm: string) => Promise<void>;
  addPrompt: (promptData: Omit<Prompt, 'id' | 'createdAt'>) => Promise<Prompt>;
  deletePrompt: (promptId: string) => Promise<void>;
  deletePrompts: (promptIds: string[]) => Promise<void>;
  duplicatePrompts: (promptIds: string[]) => Promise<void>;
  toggleFavorite: (promptId: string) => Promise<void>;
  toggleSelectPrompt: (promptId: string) => void;
  clearSelection: () => void;
}

const PromptLibraryContext = createContext<PromptLibraryContextType | undefined>(undefined);

const PAGE_SIZE = 50;

export const PromptLibraryProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const loadPrompts = useCallback(async () => {
    try {
      const result = await dbService.getPromptsPaginated(PAGE_SIZE, 0);
      setPrompts(result.prompts);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setOffset(PAGE_SIZE);
    } catch (e) {
      console.error("Failed to load prompts:", e);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const result = await dbService.getPromptsPaginated(PAGE_SIZE, offset);
      setPrompts(prev => [...prev, ...result.prompts]);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setOffset(prev => prev + PAGE_SIZE);
    } catch (e) {
      console.error("Failed to load more prompts:", e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [offset, hasMore, isLoadingMore]);

  useEffect(() => {
    const initDb = async () => {
      await dbService.initDB();
      await dbService.ensureDefaultData();
      loadPrompts();
    };
    initDb();
  }, [loadPrompts]);

  const searchPrompts = useCallback(async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        // If search is cleared, reload with pagination
        await loadPrompts();
        return;
      }

      // Search returns all results (no pagination for search)
      const searchedPrompts = await dbService.searchPrompts(searchTerm);
      setPrompts(searchedPrompts);
      setHasMore(false); // Disable load more for search results
      setTotal(searchedPrompts.length);
    } catch (e) {
      console.error("Failed to search prompts:", e);
    }
  }, [loadPrompts]);

  const addPrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt> => {
    const savedPrompt = await dbService.addPrompt(promptData);
    await loadPrompts();
    return savedPrompt;
  };

  const deletePrompt = async (promptId: string) => {
    try {
      await dbService.deleteVersions(promptId);
      await dbService.deletePrompt(promptId);
      await loadPrompts();
    } catch (e: any) {
      console.error(`Failed to delete prompt: ${e.message}`);
      throw e;
    }
  };

  const toggleFavorite = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    const updatedPrompt = { ...prompt, isFavorite: !prompt.isFavorite };
    setPrompts(prompts.map(p => p.id === promptId ? updatedPrompt : p));
    try {
      await dbService.updatePrompt(updatedPrompt);
    } catch (e: any) {
      // Revert on error
      setPrompts(prompts.map(p => p.id === promptId ? prompt : p));
      console.error(`Failed to update favorite status: ${e.message}`);
    }
  };

  const toggleSelectPrompt = (promptId: string) => {
    setSelectedPromptIds(prev => {
      if (prev.includes(promptId)) {
        return prev.filter(id => id !== promptId);
      } else {
        return [...prev, promptId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedPromptIds([]);
  };

  const deletePrompts = async (promptIds: string[]) => {
    try {
      for (const promptId of promptIds) {
        await dbService.deleteVersions(promptId);
        await dbService.deletePrompt(promptId);
      }
      await loadPrompts();
      clearSelection();
    } catch (e: any) {
      console.error(`Failed to delete prompts: ${e.message}`);
      throw e;
    }
  };

  const duplicatePrompts = async (promptIds: string[]) => {
    try {
      for (const promptId of promptIds) {
        const prompt = prompts.find(p => p.id === promptId);
        if (prompt) {
          const { id, createdAt, ...promptData } = prompt;
          await dbService.addPrompt({
            ...promptData,
            title: `${prompt.title} (Copy)`,
          });
        }
      }
      await loadPrompts();
      clearSelection();
    } catch (e: any) {
      console.error(`Failed to duplicate prompts: ${e.message}`);
      throw e;
    }
  };

  const value = {
    prompts,
    selectedPromptIds,
    hasMore,
    total,
    isLoadingMore,
    loadPrompts,
    loadMore,
    searchPrompts,
    addPrompt,
    deletePrompt,
    deletePrompts,
    duplicatePrompts,
    toggleFavorite,
    toggleSelectPrompt,
    clearSelection,
  };

  return <PromptLibraryContext.Provider value={value}>{children}</PromptLibraryContext.Provider>;
};

export const usePromptLibrary = (): PromptLibraryContextType => {
  const context = useContext(PromptLibraryContext);
  if (context === undefined) {
    throw new Error('usePromptLibrary must be used within a PromptLibraryProvider');
  }
  return context;
};

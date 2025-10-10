/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Prompt, PromptSettings, PromptVersion } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import * as dbService from '../services/dbService';
import * as versionService from '../services/versionService';

interface ActivePromptContextType {
  activePrompt: Prompt | null;
  naturalLanguageInput: string;
  settings: PromptSettings;
  structuredOutput: string;
  normalizedOutput: string;
  promptVersions: PromptVersion[];
  setNaturalLanguageInput: (value: string) => void;
  setSettings: (value: React.SetStateAction<PromptSettings>) => void;
  selectPrompt: (prompt: Prompt) => Promise<void>;
  newPrompt: () => void;
  updatePrompt: (editedStructured: string, editedNormalized: string) => Promise<void>;
  restoreVersion: (version: PromptVersion) => void;
  setStructuredOutput: (value: string) => void;
  setNormalizedOutput: (value: string) => void;
  setActivePrompt: (prompt: Prompt | null) => void;
  setSelectedPromptIds: (ids: string[]) => void;
}

const ActivePromptContext = createContext<ActivePromptContextType | undefined>(undefined);

export const ActivePromptProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');
  const [settings, setSettings] = useState<PromptSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('aros-prompt-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return { ...DEFAULT_SETTINGS, ...parsed, advanced: { ...DEFAULT_SETTINGS.advanced, ...parsed.advanced } };
      }
    } catch (e) {
      console.error("Could not parse saved settings", e);
    }
    return DEFAULT_SETTINGS;
  });
  const [structuredOutput, setStructuredOutput] = useState<string>('');
  const [normalizedOutput, setNormalizedOutput] = useState<string>('');
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('aros-prompt-settings', JSON.stringify(settings));
  }, [settings]);

  const selectPrompt = async (prompt: Prompt) => {
    setActivePrompt(prompt);
    setNaturalLanguageInput(prompt.naturalLanguageInput);
    try {
      const parsedSettings = JSON.parse(prompt.settingsSnapshot);
      setSettings(parsedSettings);
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
    setStructuredOutput(prompt.structuredOutput);
    setNormalizedOutput(prompt.normalizedOutput);
    setSelectedPromptIds([prompt.id]);

    const versions = await versionService.getVersions(prompt.id);
    setPromptVersions(versions);
  };

  const newPrompt = () => {
    setActivePrompt(null);
    setNaturalLanguageInput('');
    setStructuredOutput('');
    setNormalizedOutput('');
    setSelectedPromptIds([]);
    setPromptVersions([]);
  };

  const updatePrompt = async (editedStructured: string, editedNormalized: string) => {
    if (!activePrompt) return;
    await versionService.addVersion(activePrompt);
    const updatedPrompt: Prompt = {
      ...activePrompt,
      structuredOutput: editedStructured,
      normalizedOutput: editedNormalized,
    };
    try {
      await dbService.updatePrompt(updatedPrompt);
      setActivePrompt(updatedPrompt);
      setStructuredOutput(editedStructured);
      setNormalizedOutput(editedNormalized);
      const versions = await versionService.getVersions(updatedPrompt.id);
      setPromptVersions(versions);
    } catch (e: any) {
      console.error(`Failed to update prompt: ${e.message}`);
      throw e;
    }
  };

  const restoreVersion = (version: PromptVersion) => {
    if (!activePrompt) return;
    const updatedPrompt = {
      ...activePrompt,
      structuredOutput: version.structuredOutput,
      normalizedOutput: version.normalizedOutput
    };
    setActivePrompt(updatedPrompt);
    setStructuredOutput(version.structuredOutput);
    setNormalizedOutput(version.normalizedOutput);
  };

  const value = {
    activePrompt,
    naturalLanguageInput,
    settings,
    structuredOutput,
    normalizedOutput,
    promptVersions,
    setNaturalLanguageInput,
    setSettings,
    selectPrompt,
    newPrompt,
    updatePrompt,
    restoreVersion,
    setStructuredOutput,
    setNormalizedOutput,
    setActivePrompt,
    setSelectedPromptIds,
  };

  return <ActivePromptContext.Provider value={value}>{children}</ActivePromptContext.Provider>;
};

export const useActivePrompt = (): ActivePromptContextType => {
  const context = useContext(ActivePromptContext);
  if (context === undefined) {
    throw new Error('useActivePrompt must be used within an ActivePromptProvider');
  }
  return context;
};

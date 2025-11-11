/**
 * Scene Classification Context
 *
 * Manages scene classification state (5D taxonomy) and schema preset selection.
 * Provides auto-suggestion logic and state persistence via localStorage.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SceneClassification, SchemaKeyPreset } from '../types/intermediate';
import { schemaKeyService } from '../services/schemaKeyService';

interface SceneClassificationContextType {
  // Scene Classification (5D taxonomy)
  classification: SceneClassification;
  setClassification: (classification: SceneClassification) => void;
  updateDimension: (dimension: keyof SceneClassification, tags: string[]) => void;
  clearClassification: () => void;

  // Schema Preset Selection
  selectedPresetId: string | null;
  selectPreset: (presetId: string) => void;
  globalPresets: SchemaKeyPreset[];
  customPresets: SchemaKeyPreset[];
  loadPresets: () => Promise<void>;

  // Auto-Suggestion
  autoSuggestedPresetId: string | null;
  suggestionReasoning: string | null;
  triggerAutoSuggestion: (outputFormat: 'veo3' | 'sora2' | 'generic') => Promise<void>;

  // Prompting Strategy
  promptingStrategy: 'timestamp' | 'continuous';
  setPromptingStrategy: (strategy: 'timestamp' | 'continuous') => void;

  // Preset Management
  saveCustomPreset: (preset: SchemaKeyPreset) => void;
  deleteCustomPreset: (id: string) => void;
}

const SceneClassificationContext = createContext<SceneClassificationContextType | undefined>(
  undefined
);

const STORAGE_KEY_CLASSIFICATION = 'sceneClassification';
const STORAGE_KEY_SELECTED_PRESET = 'selectedPresetId';
const STORAGE_KEY_PROMPTING_STRATEGY = 'promptingStrategy';

const DEFAULT_CLASSIFICATION: SceneClassification = {
  genre: [],
  format: [],
  visualStyle: [],
  camera: [],
  narrative: [],
};

interface SceneClassificationProviderProps {
  children: ReactNode;
}

export function SceneClassificationProvider({ children }: SceneClassificationProviderProps) {
  // Scene Classification State
  const [classification, setClassificationState] = useState<SceneClassification>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CLASSIFICATION);
      return stored ? JSON.parse(stored) : DEFAULT_CLASSIFICATION;
    } catch {
      return DEFAULT_CLASSIFICATION;
    }
  });

  // Schema Preset State
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_SELECTED_PRESET) || null;
  });

  const [globalPresets, setGlobalPresets] = useState<SchemaKeyPreset[]>([]);
  const [customPresets, setCustomPresets] = useState<SchemaKeyPreset[]>([]);

  // Auto-Suggestion State
  const [autoSuggestedPresetId, setAutoSuggestedPresetId] = useState<string | null>(null);
  const [suggestionReasoning, setSuggestionReasoning] = useState<string | null>(null);

  // Prompting Strategy State
  const [promptingStrategy, setPromptingStrategyState] = useState<'timestamp' | 'continuous'>(
    () => {
      const stored = localStorage.getItem(STORAGE_KEY_PROMPTING_STRATEGY);
      return (stored as 'timestamp' | 'continuous') || 'continuous';
    }
  );

  // Persist classification to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLASSIFICATION, JSON.stringify(classification));
  }, [classification]);

  // Persist selected preset to localStorage
  useEffect(() => {
    if (selectedPresetId) {
      localStorage.setItem(STORAGE_KEY_SELECTED_PRESET, selectedPresetId);
    } else {
      localStorage.removeItem(STORAGE_KEY_SELECTED_PRESET);
    }
  }, [selectedPresetId]);

  // Persist prompting strategy to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROMPTING_STRATEGY, promptingStrategy);
  }, [promptingStrategy]);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const setClassification = (newClassification: SceneClassification) => {
    setClassificationState(newClassification);
  };

  const updateDimension = (dimension: keyof SceneClassification, tags: string[]) => {
    setClassificationState(prev => ({
      ...prev,
      [dimension]: tags,
    }));
  };

  const clearClassification = () => {
    setClassificationState(DEFAULT_CLASSIFICATION);
    setAutoSuggestedPresetId(null);
    setSuggestionReasoning(null);
  };

  const selectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);

    // Check if preset enforces a prompting strategy
    const preset = [...globalPresets, ...customPresets].find(p => p.id === presetId);
    if (preset) {
      if (preset.promptingStrategy === 'timestamp') {
        setPromptingStrategyState('timestamp');
      } else if (preset.promptingStrategy === 'continuous') {
        setPromptingStrategyState('continuous');
      }
    }
  };

  const loadPresets = async () => {
    try {
      const global = await schemaKeyService.loadGlobalPresets();
      const custom = schemaKeyService.getCustomPresets();
      setGlobalPresets(global);
      setCustomPresets(custom);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const triggerAutoSuggestion = async (outputFormat: 'veo3' | 'sora2' | 'generic') => {
    try {
      const suggestion = await schemaKeyService.suggestPreset(classification, outputFormat);
      setAutoSuggestedPresetId(suggestion.presetId);
      setSuggestionReasoning(suggestion.reasoning);
    } catch (error) {
      console.error('Auto-suggestion failed:', error);
      setAutoSuggestedPresetId(null);
      setSuggestionReasoning(null);
    }
  };

  const setPromptingStrategy = (strategy: 'timestamp' | 'continuous') => {
    // Check if selected preset enforces a strategy
    const preset = [...globalPresets, ...customPresets].find(p => p.id === selectedPresetId);
    if (preset && preset.promptingStrategy === 'timestamp' && strategy === 'continuous') {
      console.warn('Cannot change strategy - selected preset enforces timestamp prompting');
      return;
    }
    setPromptingStrategyState(strategy);
  };

  const saveCustomPreset = (preset: SchemaKeyPreset) => {
    schemaKeyService.saveCustomPreset(preset);
    loadPresets(); // Reload to reflect changes
  };

  const deleteCustomPreset = (id: string) => {
    schemaKeyService.deleteCustomPreset(id);
    loadPresets(); // Reload to reflect changes

    // Clear selection if deleted preset was selected
    if (selectedPresetId === id) {
      setSelectedPresetId(null);
    }
  };

  const value: SceneClassificationContextType = {
    classification,
    setClassification,
    updateDimension,
    clearClassification,
    selectedPresetId,
    selectPreset,
    globalPresets,
    customPresets,
    loadPresets,
    autoSuggestedPresetId,
    suggestionReasoning,
    triggerAutoSuggestion,
    promptingStrategy,
    setPromptingStrategy,
    saveCustomPreset,
    deleteCustomPreset,
  };

  return (
    <SceneClassificationContext.Provider value={value}>
      {children}
    </SceneClassificationContext.Provider>
  );
}

export function useSceneClassification(): SceneClassificationContextType {
  const context = useContext(SceneClassificationContext);
  if (context === undefined) {
    throw new Error('useSceneClassification must be used within SceneClassificationProvider');
  }
  return context;
}

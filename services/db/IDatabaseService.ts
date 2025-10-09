import { Prompt, PromptVersion } from '../../types';

export interface IDatabaseService {
  initDB(): Promise<void>;
  addPrompt(promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt>;
  getPrompts(): Promise<Prompt[]>;
  searchPrompts(searchTerm: string): Promise<Prompt[]>;
  updatePrompt(prompt: Prompt): Promise<void>;
  deletePrompt(id: string): Promise<void>;
  exportPrompts(): Promise<string>;
  importPrompts(jsonContent: string): Promise<void>;
  addVersion(versionData: PromptVersion): Promise<void>;
  getVersions(promptId: string): Promise<PromptVersion[]>;
  deleteVersions(promptId: string): Promise<void>;
}

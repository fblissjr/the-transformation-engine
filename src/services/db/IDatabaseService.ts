import { Prompt, PromptVersion } from '../../types';

/**
 * IDatabaseService interface
 *
 * Defines the contract for database services managing prompts and their versions.
 * Any database implementation (e.g., IndexedDB, LocalStorage, Remote API) must adhere to this interface.
 */
export interface IDatabaseService {
  /**
   * Initializes the database connection and schema.
   * @returns A Promise that resolves when initialization is complete.
   */
  initDB(): Promise<void>;

  /**
   * Adds a new prompt to the database.
   * @param promptData - The prompt data without ID and creation timestamp.
   * @returns A Promise resolving to the created Prompt object.
   */
  addPrompt(promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt>;

  /**
   * Retrieves all prompts from the database.
   * @returns A Promise resolving to an array of Prompt objects.
   */
  getPrompts(): Promise<Prompt[]>;

  /**
   * Searches for prompts based on a search term.
   * @param searchTerm - The term to search for in prompt fields.
   * @returns A Promise resolving to an array of matching Prompt objects.
   */
  searchPrompts(searchTerm: string): Promise<Prompt[]>;

  /**
   * Updates an existing prompt in the database.
   * @param prompt - The updated Prompt object.
   * @returns A Promise that resolves when the update is complete.
   */
  updatePrompt(prompt: Prompt): Promise<void>;

  /**
   * Deletes a prompt by its ID.
   * @param id - The ID of the prompt to delete.
   * @returns A Promise that resolves when the deletion is complete.
   */
  deletePrompt(id: string): Promise<void>;

  /**
   * Exports all prompts as a JSON string.
   * @returns A Promise resolving to the JSON string representation of all prompts.
   */
  exportPrompts(): Promise<string>;

  /**
   * Imports prompts from a JSON string.
   * @param jsonContent - The JSON string containing prompts to import.
   * @returns A Promise that resolves when the import is complete.
   */
  importPrompts(jsonContent: string): Promise<void>;

  /**
   * Adds a new version for a prompt.
   * @param versionData - The version data to add.
   * @returns A Promise that resolves when the version is added.
   */
  addVersion(versionData: PromptVersion): Promise<void>;

  /**
   * Retrieves all versions associated with a prompt ID.
   * @param promptId - The ID of the prompt.
   * @returns A Promise resolving to an array of PromptVersion objects.
   */
  getVersions(promptId: string): Promise<PromptVersion[]>;

  /**
   * Deletes all versions associated with a prompt ID.
   * @param promptId - The ID of the prompt.
   * @returns A Promise that resolves when the versions are deleted.
   */
  deleteVersions(promptId: string): Promise<void>;
}

import * as indexedDbService from './db/indexedDbService';
import { createDefaultPromptConfig, createDefaultAppSettings, SETTINGS_ID } from '../constants';

export const {
  initDB,
  addPrompt,
  getPrompts,
  getPromptsPaginated,
  searchPrompts,
  updatePrompt,
  deletePrompt,
  exportPrompts,
  importPrompts,
  addVersion,
  getVersions,
  deleteVersions,
  addPromptConfig,
  getPromptConfigs,
  getDefaultPromptConfig,
  updatePromptConfig,
  deletePromptConfig,
  setDefaultPromptConfig,
  getAppSettings,
  saveAppSettings,
  saveMediaBlob,
  getMediaBlob,
  deleteMediaBlob,
  getMediaBlobUrl,
  cleanupOrphanedBlobs,
  generateThumbnail,
} = indexedDbService;

export async function ensureDefaultData() {
  // Ensure default prompt config exists
  const defaultConfig = await getDefaultPromptConfig();
  let configId: string;

  if (!defaultConfig) {
    const newConfig = await addPromptConfig(createDefaultPromptConfig());
    configId = newConfig.id;
  } else {
    configId = defaultConfig.id;
  }

  // Ensure app settings exist
  const settings = await getAppSettings();
  if (!settings) {
    const defaultSettings = createDefaultAppSettings(configId);
    await saveAppSettings({ ...defaultSettings, id: SETTINGS_ID });
  }
}

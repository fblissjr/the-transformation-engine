import { PromptSettings, ModelSettings, OutputFormat, CustomSlider, ExportedConfig } from '../types';

const CONFIG_VERSION = '1.0.0';

/**
 * Exports the application configuration to a JSON string.
 *
 * @param settings - The prompt settings to export.
 * @param modelSettings - The model settings to export.
 * @param outputFormats - The list of output formats to export.
 * @param customSliders - (Optional) Custom sliders to export.
 * @returns A JSON string representation of the configuration.
 */
export function exportConfig(
  settings: PromptSettings,
  modelSettings: ModelSettings,
  outputFormats: OutputFormat[],
  customSliders?: CustomSlider[]
): string {
  const config: ExportedConfig = {
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    settings: {
      format: settings.format,
      mixOptions: settings.mixOptions || [],
      schemaKeys: settings.schemaKeys,
      modelName: settings.modelName,
      customSliderValues: settings.customSliderValues,
      advanced: settings.advanced,
    },
    modelSettings,
    outputFormats,
    customSliders,
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Imports application configuration from a JSON string.
 *
 * @param jsonString - The JSON string containing the configuration.
 * @returns The parsed ExportedConfig object.
 * @throws Error if the JSON is invalid or missing required fields.
 */
export function importConfig(jsonString: string): ExportedConfig {
  try {
    const config = JSON.parse(jsonString) as ExportedConfig;

    // Validate version
    if (!config.version) {
      throw new Error('Invalid config: missing version');
    }

    // Validate required fields
    if (!config.settings || !config.modelSettings) {
      throw new Error('Invalid config: missing required fields');
    }

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse config: ${error.message}`);
    }
    throw new Error('Failed to parse config: Unknown error');
  }
}

/**
 * Downloads the configuration as a JSON file.
 *
 * @param jsonString - The JSON string to download.
 * @param filename - (Optional) The name of the file. Defaults to 'transformation-engine-config.json'.
 */
export function downloadConfig(jsonString: string, filename: string = 'transformation-engine-config.json') {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads the content of a configuration file.
 *
 * @param file - The File object to read.
 * @returns A Promise resolving to the file content as a string.
 */
export function readConfigFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

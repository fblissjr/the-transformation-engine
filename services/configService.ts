import { PromptSettings, ModelSettings, OutputFormat, CustomSlider, ExportedConfig } from '../types';

const CONFIG_VERSION = '1.0.0';

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

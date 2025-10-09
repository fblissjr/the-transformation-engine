import { Prompt, PromptSettings, SystemPromptConfig } from '../types';
import { PRIMARY_GENERATION_PROMPT, NORMALIZER_PROMPT, SYNESTHETIC_MIXER_PROMPT, SCHEMA_INFERENCE_PROMPT } from '../constants';

const getFormatGuidance = (format: string): string => {
  const formatLower = format.toLowerCase();

  if (formatLower.includes('yaml')) {
    return 'Use YAML syntax with keys followed by colon and value (e.g., "key: value").';
  } else if (formatLower.includes('xml')) {
    return 'Use XML syntax with opening and closing tags (e.g., "<key>value</key>").';
  } else if (formatLower.includes('json')) {
    return 'Use valid JSON object syntax with quoted keys and values (e.g., {"key": "value"}).';
  } else if (formatLower.includes('markdown')) {
    return 'Use Markdown syntax with headers (## for each key) and content below each header.';
  } else if (formatLower.includes('emoji')) {
    return 'Use emoji-based formatting where each key is represented by relevant emojis.';
  }

  return ''; // No additional guidance for unknown formats
};

export const generatePrimaryPrompt = (naturalLanguageInput: string, settings: PromptSettings, config?: SystemPromptConfig): string => {
  // Check for custom prompt in localStorage first
  const customPrompt = typeof window !== 'undefined' ? localStorage.getItem('custom_primary_prompt') : null;
  let prompt = config?.prompts.primary || customPrompt || PRIMARY_GENERATION_PROMPT;

  // Note: Advanced controls (dialogue, soundscape, pacing) removed in favor of mix options
  // UserDefinedCanonicalElements placeholder removed from system prompt
  prompt = prompt.replace('{{UserDefinedCanonicalElements}}',
    'No specific canonical elements were provided. You have full creative control over these details.');

  prompt = prompt.replace('{{naturalLanguageInput}}', naturalLanguageInput);
  prompt = prompt.replace('{{format}}', settings.format);
  prompt = prompt.replace('{{formatGuidance}}', getFormatGuidance(settings.format));
  prompt = prompt.replace('{{schemaKeys}}', settings.schemaKeys.join(', '));

  // Generate instructions based on mix options (or fall back to legacy textDirection)
  let textDirectionInstruction = 'Output the keys and content in normal, forward direction.';

  if (settings.mixOptions && settings.mixOptions.length > 0) {
    const enabledOptions = settings.mixOptions.filter(opt => opt.isEnabled);
    if (enabledOptions.length > 0) {
      textDirectionInstruction = 'Apply the following transformations:\n' +
        enabledOptions.map((opt, idx) => `${idx + 1}. ${opt.instruction}`).join('\n');
    }
  } else if (settings.textDirection === 'Backwards') {
    // Legacy fallback
    textDirectionInstruction = 'Apply reversal to both the keys and their content as specified by the format.';
  }

  prompt = prompt.replace('{{textDirectionInstruction}}', textDirectionInstruction);

  // Replace custom slider values
  if (config?.customSliders && settings.customSliderValues) {
    for (const slider of config.customSliders) {
      const value = settings.customSliderValues[slider.placeholder] ?? slider.defaultValue;
      prompt = prompt.replace(`{{${slider.placeholder}}}`, String(value));
    }
  }

  return prompt;
};

export const generateMixPrompt = (sourcePrompts: Prompt[], settings: PromptSettings, userGuidance: string, config?: SystemPromptConfig): string => {
    // Check for custom prompt in localStorage first
    const customPrompt = typeof window !== 'undefined' ? localStorage.getItem('custom_mixer_prompt') : null;
    let prompt = config?.prompts.mixer || customPrompt || SYNESTHETIC_MIXER_PROMPT;

    const sourcePromptsText = sourcePrompts.map((p, index) =>
        `*   **PROMPT ${String.fromCharCode(65 + index)}:**\n\`\`\`\n${p.structuredOutput}\n\`\`\``
    ).join('\n');

    prompt = prompt.replace('{{sourcePrompts}}', sourcePromptsText);
    prompt = prompt.replace('{{userGuidance}}', userGuidance || 'Find a surprising or interesting thematic link between the prompts.');
    prompt = prompt.replace('{{format}}', settings.format);
    prompt = prompt.replace('{{formatGuidance}}', getFormatGuidance(settings.format));
    prompt = prompt.replace('{{schemaKeys}}', settings.schemaKeys.join(', '));

    // Generate instructions based on mix options (or fall back to legacy textDirection)
    let textDirectionInstruction = 'Output the keys and content in normal, forward direction.';

    if (settings.mixOptions && settings.mixOptions.length > 0) {
      const enabledOptions = settings.mixOptions.filter(opt => opt.isEnabled);
      if (enabledOptions.length > 0) {
        textDirectionInstruction = 'Apply the following transformations:\n' +
          enabledOptions.map((opt, idx) => `${idx + 1}. ${opt.instruction}`).join('\n');
      }
    } else if (settings.textDirection === 'Backwards') {
      // Legacy fallback
      textDirectionInstruction = 'Apply reversal to both the keys and their content as specified by the format.';
    }

    prompt = prompt.replace('{{textDirectionInstruction}}', textDirectionInstruction);

    return prompt;
};

export const generateNormalizePrompt = (structuredOutput: string, language: string, config?: SystemPromptConfig): string => {
  // Check for custom prompt in localStorage first
  const customPrompt = typeof window !== 'undefined' ? localStorage.getItem('custom_normalizer_prompt') : null;
  let prompt = config?.prompts.normalizer || customPrompt || NORMALIZER_PROMPT;
  prompt = prompt.replace('{{language}}', language);
  prompt = prompt.replace('{{structuredOutput}}', structuredOutput);
  return prompt;
};

export const generateSchemaInferencePrompt = (naturalLanguageInput: string, existingKeys: string[], mode: 'additional' | 'full', config?: SystemPromptConfig): string => {
  // Check for custom prompt in localStorage first
  const customPrompt = typeof window !== 'undefined' ? localStorage.getItem('custom_schema_inference_prompt') : null;
  let prompt = config?.prompts.schemaInference || customPrompt || SCHEMA_INFERENCE_PROMPT;

  let instructions = '';
  if (mode === 'additional') {
    instructions = `**Existing Schema Keys:**
[\"${existingKeys.join('", "')}\"]

**Your Task:**
Based on the User's Creative Idea, suggest 1 to 3 *additional* keys that would enhance the existing schema. Do not include the existing keys in your response. Focus on what's missing.`;
  } else { // mode === 'full'
    instructions = `**Your Task:**
Generate a *complete* new schema that best represents the user's idea from scratch. This new schema should fully replace any existing one. Aim for 4-6 highly relevant keys.`;
  }

  prompt = prompt.replace('{{naturalLanguageInput}}', naturalLanguageInput);
  prompt = prompt.replace('{{instructions}}', instructions);

  return prompt;
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL_NAME } from '../constants';
import { ModelSettings, MediaReference } from '../types';
import { apiCache, APICache } from './apiCache';

export interface GeminiModel {
  name: string;
  displayName: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

// Validate API key by listing models (doesn't count against rate limits)
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // Use the models API endpoint which doesn't count against generation quotas
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    return response.ok;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
}

export async function listAvailableModels(apiKey: string): Promise<GeminiModel[]> {
  try {
    // Fetch models from the REST API since SDK doesn't expose listModels directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();

    // Filter to only models that support generateContent
    const models = (data.models || [])
      .filter((model: any) =>
        model.supportedGenerationMethods?.includes('generateContent')
      )
      .map((model: any) => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName || model.name,
        description: model.description,
        supportedGenerationMethods: model.supportedGenerationMethods,
      }));

    return models;
  } catch (error) {
    console.error("Failed to list models:", error);
    throw new Error("Failed to fetch available models. Check your API key.");
  }
}

export interface GenerationResult {
  text: string;
  tokensUsed?: number;
  modelUsed: string;
}

export async function generateContent(
  apiKey: string,
  prompt: string,
  modelSettings?: ModelSettings
): Promise<string> {
  const result = await generateContentWithMetadata(apiKey, prompt, modelSettings);
  return result.text;
}

export async function generateContentWithMetadata(
  apiKey: string,
  prompt: string,
  modelSettings?: ModelSettings
): Promise<GenerationResult> {
  // Generate cache key
  const cacheKey = APICache.generateKey(prompt, modelSettings);

  // Check cache (only cache the text)
  const cached = apiCache.get(cacheKey);
  if (cached !== null) {
    return {
      text: cached,
      modelUsed: modelSettings?.modelName || GEMINI_MODEL_NAME,
    };
  }

  // Cache miss - call API
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = modelSettings?.modelName || GEMINI_MODEL_NAME;
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: modelSettings?.maxTokens,
      temperature: modelSettings?.temperature,
      topP: modelSettings?.topP,
    },
  });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Extract usage metadata if available
  const usageMetadata = (response as any).usageMetadata;
  const tokensUsed = usageMetadata?.totalTokenCount;

  // Cache the result (5 minutes TTL for generation)
  apiCache.set(cacheKey, text, 300000);

  return {
    text,
    tokensUsed,
    modelUsed: modelName,
  };
}

export async function generateJsonContent(
  apiKey: string,
  prompt: string,
  modelSettings?: ModelSettings
): Promise<any> {
  // Generate cache key (longer TTL for JSON responses like schema inference)
  const cacheKey = APICache.generateKey(`json:${prompt}`, modelSettings);

  // Check cache
  const cached = apiCache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - call API
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelSettings?.modelName || GEMINI_MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: modelSettings?.maxTokens,
      temperature: modelSettings?.temperature,
      topP: modelSettings?.topP,
    },
  });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const parsed = JSON.parse(text);

    // Cache the result (1 hour TTL for schema inference)
    apiCache.set(cacheKey, parsed, 3600000);

    return parsed;
  } catch (error) {
    console.error("Failed to parse JSON response from Gemini:", text, error);
    throw new Error("The AI returned an invalid or empty response. Please try again.");
  }
}

export async function generateContentWithMedia(
  apiKey: string,
  prompt: string,
  media: MediaReference[],
  modelSettings?: ModelSettings
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelSettings?.modelName || GEMINI_MODEL_NAME,
    generationConfig: {
      maxOutputTokens: modelSettings?.maxTokens,
      temperature: modelSettings?.temperature,
      topP: modelSettings?.topP,
    },
  });

  // Build multimodal parts
  const parts: any[] = [{ text: prompt }];

  for (const mediaRef of media) {
    // Extract base64 data from data URL
    const base64Data = mediaRef.dataUrl.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: mediaRef.mimeType,
        data: base64Data,
      },
    });
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  return response.text();
}

export async function describeMedia(
  apiKey: string,
  media: MediaReference[],
  customInstruction?: string,
  modelSettings?: ModelSettings
): Promise<string> {
  const defaultPrompt = `Analyze this ${media[0].type} and provide a detailed, vivid description suitable for a text-to-video model prompt. Focus on:
- Visual style, composition, and mood
- Key subjects, characters, or objects
- Lighting, color palette, and atmosphere
- Motion or action (if video)
- Sound or audio that would match the scene

Be specific and cinematic in your description. This will be used to generate similar video content.`;

  const prompt = customInstruction || defaultPrompt;
  return generateContentWithMedia(apiKey, prompt, media, modelSettings);
}
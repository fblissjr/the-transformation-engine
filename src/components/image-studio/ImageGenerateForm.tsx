import React, { useState } from 'react';
import {
  TextArea,
  CompactSelect,
  PrimaryButton,
  SparklesIcon,
} from './FormPrimitives';
import { taskRouter } from '../../../services/taskRouter';

/**
 * ImageGenerateForm
 *
 * Minimal image generation form (Week 1 MVP):
 * - Large prompt textarea
 * - Model selection (compact inline)
 * - Aspect ratio selection (compact inline)
 * - Generate button
 *
 * Progressive disclosure features (Week 2+) will add:
 * - Reference images
 * - Advanced settings
 * - Fragment browser
 * - Character selector
 */

interface ImageGenerateFormProps {
  projectId: string;
  onImageGenerated?: (imageId: string) => void;
  onError?: (error: string) => void;
}

export const ImageGenerateForm: React.FC<ImageGenerateFormProps> = ({
  projectId,
  onImageGenerated,
  onError,
}) => {
  // Form state
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Aspect ratio options
  const aspectRatioOptions = [
    { value: '1:1', label: '1:1 Square' },
    { value: '3:4', label: '3:4 Portrait' },
    { value: '4:3', label: '4:3 Landscape' },
    { value: '9:16', label: '9:16 Vertical' },
    { value: '16:9', label: '16:9 Widescreen' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onError?.('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await taskRouter.executeImageGeneration(
        projectId,
        prompt,
        '', // structuredYaml - empty for now, Phase 3 will use CharacterPromptTransformer
        {
          aspectRatio,
          numImages,
        }
      );

      if (result.success && result.imageId) {
        onImageGenerated?.(result.imageId);
      } else {
        onError?.(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = !prompt.trim() || isGenerating;

  return (
    <div className="image-generate-form space-y-4">
      {/* Prompt - Large and Prominent */}
      <TextArea
        label="Describe your image"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A cyberpunk samurai standing in neon-lit Tokyo alley, rain reflecting colors, cinematic lighting..."
        rows={6}
        icon={<SparklesIcon className="w-4 h-4 text-amber-500" />}
        helperText="Use wildcards like {character} or {style} (fragment browser coming in Week 3)"
        disabled={isGenerating}
      />

      {/* Compact Settings Row */}
      <div className="flex items-center gap-3">
        <CompactSelect
          label="Aspect"
          value={aspectRatio}
          onChange={(e) =>
            setAspectRatio(e.target.value as '1:1' | '3:4' | '4:3' | '9:16' | '16:9')
          }
          options={aspectRatioOptions}
          disabled={isGenerating}
          className="flex-1"
        />
        <CompactSelect
          label="Count"
          value={String(numImages)}
          onChange={(e) => setNumImages(Number(e.target.value))}
          options={[
            { value: '1', label: '1 image' },
            { value: '2', label: '2 images' },
            { value: '3', label: '3 images' },
            { value: '4', label: '4 images' },
          ]}
          disabled={isGenerating}
          className="flex-1"
        />
      </div>

      {/* Week 2 features will go here:
          - Badge buttons for Reference Images, Use Character, Advanced
          - Expandable sections for each feature
      */}

      {/* Generate Button - Prominent */}
      <PrimaryButton
        onClick={handleGenerate}
        disabled={isDisabled}
        loading={isGenerating}
        icon={<SparklesIcon className="w-5 h-5" />}
      >
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </PrimaryButton>
    </div>
  );
};

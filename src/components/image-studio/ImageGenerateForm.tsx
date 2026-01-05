import React, { useState, useRef } from 'react';
import {
  CompactSelect,
  PrimaryButton,
  BadgeButton,
  SparklesIcon,
  ImageIcon,
  UserIcon,
  WandIcon,
} from './FormPrimitives';
import { FragmentSelector, fileFragmentSource } from '../shared/FragmentSelector';
import { CharacterSelector } from './CharacterSelector';
import { WildcardAutocomplete, WildcardAutocompleteRef } from '../workspace/WildcardAutocomplete';
import { taskRouter } from '../../services/taskRouter';
import { TASK_IDS } from '../../../types/providers';
import { FragmentLoader } from '../../services/fragmentLoader';
import { createImageGeneration } from '../../services/imageDbService';

/**
 * ImageGenerateForm component
 *
 * Form for generating structured image prompts (intermediates).
 * Allows users to enter a prompt description and generates a structured
 * intermediate that can be formatted for any image generation platform.
 *
 * NOTE: This does NOT generate images - it creates structured prompt data.
 *
 * @param projectId - The current project ID.
 * @param onIntermediateGenerated - Callback with the generated intermediate YAML.
 * @param onError - Callback when an error occurs.
 * @returns The rendered ImageGenerateForm component.
 */

interface ImageGenerateFormProps {
  projectId: string;
  onIntermediateGenerated?: (intermediate: { yaml: string; originalPrompt: string; aspectRatio: string }) => void;
  onError?: (error: string) => void;
}

interface ReferenceImage {
  id: string;
  file: File;
  dataUrl: string;
}

export const ImageGenerateForm: React.FC<ImageGenerateFormProps> = ({
  projectId,
  onIntermediateGenerated,
  onError,
}) => {
  // Form state
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);

  // Progressive disclosure features
  const [showReferenceImages, setShowReferenceImages] = useState(false);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [showCharacter, setShowCharacter] = useState(false);
  const [showFragmentBrowser, setShowFragmentBrowser] = useState(false);

  // Ref for prompt textarea to track cursor position
  const promptTextareaRef = useRef<WildcardAutocompleteRef>(null);

  // Aspect ratio options
  const aspectRatioOptions = [
    { value: '1:1', label: '1:1 Square' },
    { value: '3:4', label: '3:4 Portrait' },
    { value: '4:3', label: '4:3 Landscape' },
    { value: '9:16', label: '9:16 Vertical' },
    { value: '16:9', label: '16:9 Widescreen' },
  ];

  // Reference image handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxFiles = 14;
    const remainingSlots = maxFiles - referenceImages.length;

    if (files.length > remainingSlots) {
      onError?.(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const newImages: ReferenceImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        onError?.(`${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        onError?.(`${file.name} exceeds 5MB limit`);
        continue;
      }

      // Convert to data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      newImages.push({
        id: `${Date.now()}-${i}`,
        file,
        dataUrl,
      });
    }

    setReferenceImages([...referenceImages, ...newImages]);

    // Reset input
    event.target.value = '';
  };

  const handleRemoveImage = (id: string) => {
    setReferenceImages(referenceImages.filter((img) => img.id !== id));
  };

  const handleClearAllImages = () => {
    setReferenceImages([]);
  };

  // Fragment insertion handler
  const handleInsertFragment = (fragmentContent: string) => {
    const autocompleteRef = promptTextareaRef.current;
    if (!autocompleteRef || !autocompleteRef.textarea) {
      // Fallback: just append to end
      setPrompt(prompt + '\n\n' + fragmentContent);
      return;
    }

    const { start, end } = autocompleteRef.getSelectionRange();
    const currentText = prompt;

    // Insert fragment at cursor position
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);

    // Add spacing if needed
    const needsSpaceBefore = before.length > 0 && !before.endsWith('\n\n');
    const needsSpaceAfter = after.length > 0 && !after.startsWith('\n\n');

    const newText =
      before +
      (needsSpaceBefore ? '\n\n' : '') +
      fragmentContent +
      (needsSpaceAfter ? '\n\n' : '') +
      after;

    setPrompt(newText);

    // Move cursor to end of inserted fragment
    setTimeout(() => {
      const newCursorPos = start + (needsSpaceBefore ? 2 : 0) + fragmentContent.length;
      autocompleteRef.setSelectionRange(newCursorPos, newCursorPos);
      autocompleteRef.focus();
    }, 0);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onError?.('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate structured intermediate from text prompt
      const fragmentLoader = new FragmentLoader();
      // Path starts with / for absolute path (file is at /public/image/, not /public/fragments/)
      const fragment = await fragmentLoader.loadFragment('/image/image_intermediate.md');
      const systemPrompt = fragment.content;

      let intermediateTurn;

      // If reference images are provided, use vision task
      if (referenceImages.length > 0) {
        // Convert dataUrls to the format taskRouter expects
        const media = referenceImages.map((img) => {
          // Parse data URL: "data:image/png;base64,..." -> extract mimeType and data
          const match = img.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (!match) {
            throw new Error(`Invalid image data URL for ${img.file.name}`);
          }
          return {
            mimeType: match[1],
            data: match[2],
          };
        });

        // Build enhanced prompt describing the reference images
        const enhancedPrompt = `${prompt}\n\nReference Images: ${referenceImages.length} image(s) have been provided for visual reference. Use them to inform the style, composition, and visual details of the generated intermediate.`;

        intermediateTurn = await taskRouter.executeVisionTask(
          TASK_IDS.IMAGE_INTERMEDIATE_GENERATION,
          enhancedPrompt,
          media,
          systemPrompt
        );
      } else {
        intermediateTurn = await taskRouter.executeTask(
          TASK_IDS.IMAGE_INTERMEDIATE_GENERATION,
          prompt,
          systemPrompt
        );
      }

      const structuredYaml = intermediateTurn.response;

      // Save to database for persistence
      if (projectId) {
        await createImageGeneration({
          projectId,
          prompt,
          model: intermediateTurn.modelId,
          providerId: intermediateTurn.providerId,
          structuredYaml,
          status: 'ready',
          metadata: {
            aspectRatio,
            generationType: 'intermediate',
            referenceImageCount: referenceImages.length,
          },
        });
      }

      // Pass the intermediate to the output panel (no image generation!)
      onIntermediateGenerated?.({
        yaml: structuredYaml,
        originalPrompt: prompt,
        aspectRatio,
      });
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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-amber-500" />
          Describe your image
        </label>
        <WildcardAutocomplete
          ref={promptTextareaRef}
          rows={6}
          value={prompt}
          onChange={setPrompt}
          placeholder="A cyberpunk samurai standing in neon-lit Tokyo alley... Use {category} for wildcards"
          disabled={isGenerating}
          className="bg-zinc-900 border-zinc-700 focus:ring-amber-500 text-zinc-100 placeholder:text-zinc-500 text-sm"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => setShowFragmentBrowser(true)}
            disabled={isGenerating}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <WandIcon className="w-3 h-3" />
            Browse Fragments
          </button>
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="flex items-center gap-3">
        <CompactSelect
          label="Aspect Ratio"
          value={aspectRatio}
          onChange={(e) =>
            setAspectRatio(e.target.value as '1:1' | '3:4' | '4:3' | '9:16' | '16:9')
          }
          options={aspectRatioOptions}
          disabled={isGenerating}
          className="flex-1 max-w-xs"
        />
      </div>

      {/* Progressive Disclosure Features */}
      <div className="flex items-center gap-2 flex-wrap">
        <BadgeButton
          icon={<ImageIcon className="w-3 h-3" />}
          label="Reference Images"
          count={referenceImages.length}
          active={showReferenceImages}
          onClick={() => setShowReferenceImages(!showReferenceImages)}
          disabled={isGenerating}
          badge="FUTURE"
          tooltip="Upload reference images to condition the intermediate structure."
        />
        <BadgeButton
          icon={<UserIcon className="w-3 h-3" />}
          label="Use Character"
          active={showCharacter}
          onClick={() => setShowCharacter(!showCharacter)}
          disabled={isGenerating}
          badge="FUTURE"
          tooltip="Select pre-made characters from library to inject into intermediate."
        />
      </div>

      {/* Reference Images - Expandable Section */}
      {showReferenceImages && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-slideDown">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-zinc-300">Reference Images</h4>
            {referenceImages.length > 0 && (
              <button
                onClick={handleClearAllImages}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Upload Area */}
          <label className="block border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-amber-500 transition-colors cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isGenerating || referenceImages.length >= 14}
            />
            <ImageIcon className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">Drop images or click to upload</p>
            <p className="text-xs text-zinc-600 mt-1">
              {referenceImages.length}/14 images • Max 5MB each
            </p>
          </label>

          {/* Image Grid */}
          {referenceImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
              {referenceImages.map((img) => (
                <div key={img.id} className="relative group aspect-square">
                  <img
                    src={img.dataUrl}
                    alt={img.file.name}
                    className="w-full h-full object-cover rounded border border-zinc-700"
                  />
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Phase 3 Notice */}
          {referenceImages.length > 0 && (
            <div className="mt-3 p-2 bg-amber-900/20 border border-amber-900/30 rounded text-xs text-amber-400">
              <span className="font-medium">Phase 3:</span> Reference images are UI-only. Backend integration will enable these images to influence generation.
            </div>
          )}
        </div>
      )}

      {/* Generate Button - Prominent */}
      <PrimaryButton
        onClick={handleGenerate}
        disabled={isDisabled}
        loading={isGenerating}
        icon={<SparklesIcon className="w-5 h-5" />}
      >
        {isGenerating ? 'Generating...' : 'Generate Prompt'}
      </PrimaryButton>

      {/* Fragment Browser Modal */}
      <FragmentSelector
        mode="modal"
        dataSource={fileFragmentSource}
        isOpen={showFragmentBrowser}
        onClose={() => setShowFragmentBrowser(false)}
        onSelectFragment={(fragment) => handleInsertFragment(fragment.content)}
      />

      {/* Character Selector Modal */}
      <CharacterSelector
        isOpen={showCharacter}
        onClose={() => setShowCharacter(false)}
        onSelectCharacter={handleInsertFragment}
      />
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  TextArea,
  CompactSelect,
  PrimaryButton,
  BadgeButton,
  RangeSlider,
  SparklesIcon,
  ImageIcon,
  UserIcon,
  SettingsIcon,
  WandIcon,
} from './FormPrimitives';
import { FragmentBrowser } from './FragmentBrowser';
import { CharacterSelector } from './CharacterSelector';
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

interface ReferenceImage {
  id: string;
  file: File;
  dataUrl: string;
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

  // Week 2 features - Progressive disclosure
  const [showReferenceImages, setShowReferenceImages] = useState(false);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);
  const [showFragmentBrowser, setShowFragmentBrowser] = useState(false);

  // Advanced settings
  const [guidanceScale, setGuidanceScale] = useState(7);
  const [inferenceSteps, setInferenceSteps] = useState(30);
  const [seed, setSeed] = useState<string>('');

  // Ref for prompt textarea to track cursor position
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

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
    const textarea = promptTextareaRef.current;
    if (!textarea) {
      // Fallback: just append to end
      setPrompt(prompt + '\n\n' + fragmentContent);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
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
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onError?.('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // Note: Reference images not yet integrated with backend
      // Will be added in Phase 3 when Gemini API supports it
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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-amber-500" />
          Describe your image
        </label>
        <textarea
          ref={promptTextareaRef}
          rows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A cyberpunk samurai standing in neon-lit Tokyo alley, rain reflecting colors, cinematic lighting..."
          disabled={isGenerating}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-100 placeholder:text-zinc-500 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
          <span className="text-xs text-zinc-500">Use wildcards like {"{character}"} or {"{style}"}</span>
        </div>
      </div>

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

      {/* Week 2 Features - Progressive Disclosure */}
      <div className="flex items-center gap-2 flex-wrap">
        <BadgeButton
          icon={<ImageIcon className="w-3 h-3" />}
          label="Reference Images"
          count={referenceImages.length}
          active={showReferenceImages}
          onClick={() => setShowReferenceImages(!showReferenceImages)}
          disabled={isGenerating}
          badge="PHASE 3"
          tooltip="Upload reference images to guide generation. Backend integration coming in Phase 3."
        />
        <BadgeButton
          icon={<UserIcon className="w-3 h-3" />}
          label="Use Character"
          active={showCharacter}
          onClick={() => setShowCharacter(!showCharacter)}
          disabled={isGenerating}
          badge="PHASE 3"
          tooltip="Select pre-made characters from library. Backend integration coming in Phase 3."
        />
        <BadgeButton
          icon={<SettingsIcon className="w-3 h-3" />}
          label="Advanced"
          active={showAdvanced}
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isGenerating}
          badge="PHASE 3"
          tooltip="Fine-tune generation with guidance scale, inference steps, and seed. Backend integration coming in Phase 3."
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

      {/* Advanced Settings - Expandable Section */}
      {showAdvanced && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-slideDown space-y-4">
          <h4 className="text-sm font-medium text-zinc-300 mb-3">Advanced Settings</h4>

          {/* Guidance Scale */}
          <RangeSlider
            label="Guidance Scale"
            value={guidanceScale}
            onChange={setGuidanceScale}
            min={1}
            max={20}
            step={0.5}
            leftLabel="More Creative"
            rightLabel="More Precise"
            showValue={true}
          />

          {/* Inference Steps */}
          <RangeSlider
            label="Inference Steps"
            value={inferenceSteps}
            onChange={setInferenceSteps}
            min={10}
            max={100}
            step={5}
            leftLabel="Faster"
            rightLabel="Higher Quality"
            showValue={true}
          />

          {/* Seed */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-2">Seed (Optional)</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Random"
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-zinc-600 mt-1">Use same seed for reproducible results</p>
          </div>

          {/* Phase 3 Notice */}
          <div className="p-2 bg-amber-900/20 border border-amber-900/30 rounded text-xs text-amber-400">
            <span className="font-medium">Phase 3:</span> Advanced settings are UI-only. Backend integration will enable these settings to affect generation quality.
          </div>
        </div>
      )}

      {/* Generate Button - Prominent */}
      <PrimaryButton
        onClick={handleGenerate}
        disabled={isDisabled}
        loading={isGenerating}
        icon={<SparklesIcon className="w-5 h-5" />}
      >
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </PrimaryButton>

      {/* Fragment Browser Modal */}
      <FragmentBrowser
        isOpen={showFragmentBrowser}
        onClose={() => setShowFragmentBrowser(false)}
        onInsertFragment={handleInsertFragment}
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

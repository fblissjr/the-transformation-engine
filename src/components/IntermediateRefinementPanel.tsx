import React, { useState } from 'react';
import type { IntermediatePrompt, IntermediateStructure } from '../../types/intermediate';
import { taskRouter } from '../services/taskRouter';
import { TASK_IDS } from '../../types/providers';
import { useProviders } from '../contexts/ProviderContext';
import { generateRefinementPrompt } from '../services/promptService';

interface IntermediateRefinementPanelProps {
  intermediate: IntermediatePrompt | null;
  onUpdate?: (updated: IntermediateStructure) => void;
}

/**
 * IntermediateRefinementPanel component
 *
 * UI for refining intermediate structures with AI assistance.
 * Shows structured fields (auto-populated from generation) and provides
 * "Refine" buttons to get AI suggestions for each field.
 *
 * @param intermediate - The intermediate prompt data to refine.
 * @param onUpdate - Callback when the structure is updated.
 * @returns The rendered IntermediateRefinementPanel component.
 */
export const IntermediateRefinementPanel: React.FC<IntermediateRefinementPanelProps> = ({
  intermediate,
  onUpdate,
}) => {
  const { providers } = useProviders();
  const [isRefining, setIsRefining] = useState(false);
  const [refiningField, setRefiningField] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  if (!intermediate) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Generate an intermediate to start refining.</p>
      </div>
    );
  }

  // Type guard for v2.0 format
  const isV2 = 'format' in intermediate.structure &&
               intermediate.structure.format === 'structured' &&
               'version' in intermediate.structure;

  if (!isV2) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>This intermediate uses an older format.</p>
        <p className="text-sm mt-2">Regenerate to use the new refinement UI.</p>
      </div>
    );
  }

  const structure = intermediate.structure as IntermediateStructure;
  const { sections } = structure;

  /**
   * Request AI suggestions for refining a specific field
   */
  const suggestRefinement = async (field: string, currentValue: string | string[]) => {
    setIsRefining(true);
    setRefiningField(field);
    setSuggestions([]);

    try {
      // Build refinement prompt using fragment composition
      const currentValueStr = Array.isArray(currentValue)
        ? currentValue.join(', ')
        : currentValue;

      // Generate system prompt from fragment template
      const systemPrompt = await generateRefinementPrompt(field, currentValueStr);

      // Use task router - it handles provider/API key lookup automatically
      // executeTaskJson returns already-parsed JSON, not a ConversationTurn
      const suggestions = await taskRouter.executeTaskJson(
        TASK_IDS.TRANSFORM,
        `Refine: ${currentValueStr}`,
        systemPrompt
      );

      if (Array.isArray(suggestions) && suggestions.length > 0) {
        setSuggestions(suggestions);
      } else {
        throw new Error('Invalid suggestions format');
      }
    } catch (error) {
      console.error('Failed to get refinement suggestions:', error);
      alert(`Failed to refine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefining(false);
      setRefiningField(null);
    }
  };

  /**
   * Apply a suggestion to the intermediate
   */
  const applySuggestion = (field: string, value: string) => {
    if (!onUpdate) return;

    // Deep clone structure
    const updated = JSON.parse(JSON.stringify(structure)) as IntermediateStructure;

    // Update the specific field
    const fieldPath = field.split('.');
    let target: any = updated.sections;

    for (let i = 1; i < fieldPath.length - 1; i++) {
      target = target[fieldPath[i]];
    }

    const finalKey = fieldPath[fieldPath.length - 1];
    target[finalKey] = value;

    onUpdate(updated);
    setSuggestions([]);
  };

  /**
   * Render a refinable field with suggestions
   */
  const RefinableField: React.FC<{
    label: string;
    field: string;
    value: string | string[];
    type?: 'text' | 'array';
  }> = ({ label, field, value, type = 'text' }) => {
    const valueStr = Array.isArray(value) ? value.join(', ') : value;
    const [currentValue, setCurrentValue] = useState(valueStr);
    const isCurrentlyRefining = isRefining && refiningField === field;

    // Sync local state with prop changes (when parent updates)
    React.useEffect(() => {
      const newValueStr = Array.isArray(value) ? value.join(', ') : value;
      setCurrentValue(newValueStr);
    }, [value]);

    /**
     * Handle manual field editing - updates local state only
     */
    const handleChange = (newValue: string) => {
      setCurrentValue(newValue);
    };

    /**
     * Handle blur - update parent only when focus leaves field
     */
    const handleBlur = () => {
      if (!onUpdate) return;

      // Only update if value changed
      const currentValueStr = Array.isArray(value) ? value.join(', ') : value;
      if (currentValue === currentValueStr) return;

      // Deep clone structure
      const updated = JSON.parse(JSON.stringify(structure)) as IntermediateStructure;

      // Update the specific field
      const fieldPath = field.split('.');
      let target: any = updated.sections;

      for (let i = 1; i < fieldPath.length - 1; i++) {
        target = target[fieldPath[i]];
      }

      const finalKey = fieldPath[fieldPath.length - 1];

      // Convert back to array if needed
      if (type === 'array') {
        target[finalKey] = currentValue.split(',').map(s => s.trim()).filter(s => s);
      } else {
        target[finalKey] = currentValue;
      }

      onUpdate(updated);
    };

    return (
      <div className="mb-4">
        <div className="flex items-start justify-between mb-1">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          <button
            onClick={() => suggestRefinement(field, value)}
            disabled={isRefining}
            className={`
              text-xs px-2 py-1 rounded transition-colors
              ${isCurrentlyRefining
                ? 'bg-blue-600 text-white cursor-wait'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isCurrentlyRefining ? 'Refining...' : 'Refine ↻'}
          </button>
        </div>

        <textarea
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className="
            w-full text-sm text-gray-300 mb-2 p-2
            bg-gray-900 rounded border border-gray-700
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
            resize-y min-h-[60px]
          "
          rows={3}
        />

        {suggestions.length > 0 && refiningField === field && (
          <div className="space-y-2 animate-fadeIn">
            <p className="text-xs text-gray-500">Suggestions:</p>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => applySuggestion(field, suggestion)}
                className="
                  w-full text-left text-sm p-2 rounded
                  bg-gray-800 hover:bg-gray-700 text-gray-300
                  border border-gray-600 hover:border-blue-500
                  transition-colors
                "
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render a section with fields
   */
  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Intermediate Refinement</h2>
        <p className="text-sm text-gray-400 mt-1">
          Scene Type: <span className="text-blue-400 font-medium">{structure.sceneType}</span>
        </p>
      </div>

      {/* Visual Section (REQUIRED) */}
      <Section title="Visual Elements">
        <RefinableField
          label="Subject"
          field="sections.visual.subject"
          value={sections.visual.subject}
          type="array"
        />
        <RefinableField
          label="Setting"
          field="sections.visual.setting"
          value={sections.visual.setting}
        />
        <RefinableField
          label="Environment"
          field="sections.visual.environment"
          value={sections.visual.environment}
        />
        <RefinableField
          label="Colors"
          field="sections.visual.colors"
          value={sections.visual.colors}
        />
        <RefinableField
          label="Lighting"
          field="sections.visual.lighting"
          value={sections.visual.lighting}
        />
        <RefinableField
          label="Composition"
          field="sections.visual.composition"
          value={sections.visual.composition}
        />
        <RefinableField
          label="Style"
          field="sections.visual.style"
          value={sections.visual.style}
        />
      </Section>

      {/* Temporal Section (OPTIONAL) */}
      {sections.temporal && sections.temporal.length > 0 && (
        <Section title="Temporal Progression">
          {sections.temporal.map((segment, idx) => (
            <div key={idx} className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Time: {segment.time}</p>
              <RefinableField
                label="Description"
                field={`sections.temporal.${idx}.description`}
                value={segment.description}
              />
              {segment.camera && (
                <RefinableField
                  label="Camera"
                  field={`sections.temporal.${idx}.camera`}
                  value={segment.camera}
                />
              )}
              {segment.visual && (
                <RefinableField
                  label="Visual Changes"
                  field={`sections.temporal.${idx}.visual`}
                  value={segment.visual}
                />
              )}
              {segment.audio && (
                <RefinableField
                  label="Audio Changes"
                  field={`sections.temporal.${idx}.audio`}
                  value={segment.audio}
                />
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Audio Section (OPTIONAL) */}
      {sections.audio && (
        <Section title="Audio Elements">
          {sections.audio.dialogue && sections.audio.dialogue.length > 0 && (
            <RefinableField
              label="Dialogue"
              field="sections.audio.dialogue"
              value={sections.audio.dialogue}
              type="array"
            />
          )}
          {sections.audio.ambient && sections.audio.ambient.length > 0 && (
            <RefinableField
              label="Ambient Sounds"
              field="sections.audio.ambient"
              value={sections.audio.ambient}
              type="array"
            />
          )}
          {sections.audio.soundEffects && sections.audio.soundEffects.length > 0 && (
            <RefinableField
              label="Sound Effects"
              field="sections.audio.soundEffects"
              value={sections.audio.soundEffects}
              type="array"
            />
          )}
          {sections.audio.music && (
            <RefinableField
              label="Music"
              field="sections.audio.music"
              value={sections.audio.music}
            />
          )}
        </Section>
      )}

      {/* Camera Section (OPTIONAL) */}
      {sections.camera && (
        <Section title="Camera Work">
          {sections.camera.movement && (
            <RefinableField
              label="Movement"
              field="sections.camera.movement"
              value={sections.camera.movement}
            />
          )}
          {sections.camera.angles && sections.camera.angles.length > 0 && (
            <RefinableField
              label="Angles"
              field="sections.camera.angles"
              value={sections.camera.angles}
              type="array"
            />
          )}
          {sections.camera.techniques && (
            <RefinableField
              label="Techniques"
              field="sections.camera.techniques"
              value={sections.camera.techniques}
            />
          )}
          {sections.camera.lensDetails && (
            <RefinableField
              label="Lens Details"
              field="sections.camera.lensDetails"
              value={sections.camera.lensDetails}
            />
          )}
        </Section>
      )}
    </div>
  );
};

export default IntermediateRefinementPanel;

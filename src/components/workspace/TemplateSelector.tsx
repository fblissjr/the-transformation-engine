import React from 'react';

type TemplateModel = 'sora2' | 'veo3' | 'generic';

interface TemplateSelectorProps {
  schemaKeys: string[];
  templateOverride: 'auto' | 'generic';
  onTemplateOverrideChange: (value: 'auto' | 'generic') => void;
}

/**
 * TemplateSelector component
 *
 * Displays the detected prompt template based on schema keys
 * and allows manual override to generic template.
 */
export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  schemaKeys,
  templateOverride,
  onTemplateOverrideChange,
}) => {
  const detectTemplateModel = (): TemplateModel => {
    if (templateOverride === 'generic') return 'generic';

    const keySet = new Set(schemaKeys.map(k => k.toLowerCase()));

    // Veo 3 indicators (audio-first model)
    const veo3Keys = ['audio_elements', 'dialogue', 'voiceover_script', 'ambient_audio', 'subject', 'veo3_specs'];
    const veo3Score = veo3Keys.filter(k => keySet.has(k)).length;

    // Sora 2 indicators (visual-first with temporal progression)
    const sora2Keys = ['temporal_progression', 'cinematography', 'visual_description', 'technical_specs'];
    const sora2Score = sora2Keys.filter(k => keySet.has(k)).length;

    // Decision: Use highest score, prefer Veo 3 on tie (audio is distinctive)
    if (veo3Score > sora2Score || (veo3Score === sora2Score && veo3Score > 0)) {
      return 'veo3';
    }
    if (sora2Score > 0) {
      return 'sora2';
    }

    return 'generic';
  };

  const detectedTemplate = detectTemplateModel();

  const templateInfo = {
    sora2: {
      icon: '🎬',
      label: 'Sora 2 (Video+Audio, 10s clips, 300-500 words)',
      description: 'Using research-backed Sora 2 template with spacetime coherence, temporal progression, comprehensive visual detail. Native video+audio generation (audio descriptions optional).',
      color: 'text-blue-400',
    },
    veo3: {
      icon: '🎵',
      label: 'Veo 3 (Audio-first, 8s clips, 200-400 words)',
      description: 'Using research-backed Veo 3 template with 9-element framework, native audio generation (V2A), character consistency, cinematic language.',
      color: 'text-purple-400',
    },
    generic: {
      icon: '📝',
      label: 'Generic (Model-agnostic, 8-10s clips)',
      description: 'Using generic template. For best results, use model-specific presets or schema keys.',
      color: 'text-gray-400',
    },
  };

  const info = templateInfo[detectedTemplate];

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Prompt Template System
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Active Template:</span>
              <span className={`text-sm font-bold ${info.color}`}>
                {info.icon} {info.label}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {info.description}
            </p>
            {templateOverride === 'auto' && detectedTemplate !== 'generic' && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Auto-detected from your schema keys
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={templateOverride === 'generic'}
              onChange={(e) => onTemplateOverrideChange(e.target.checked ? 'generic' : 'auto')}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
            />
            <span>Use Generic Template</span>
          </label>
          <p className="text-xs text-gray-500 italic">
            {templateOverride === 'auto' ? 'Auto-detection enabled' : 'Manual override active'}
          </p>
        </div>
      </div>
    </div>
  );
};

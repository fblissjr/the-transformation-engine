import React from 'react';
import { useIntermediate } from '../../context/IntermediateContext';

const VisualEditor: React.FC = () => {
  const { activeIntermediate, updateVisual } = useIntermediate();

  if (!activeIntermediate) return null;

  const visual = activeIntermediate.structure.visual || {};

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Setting
          <span className="text-gray-500 text-xs ml-2">Where does this scene take place?</span>
        </label>
        <textarea
          value={visual.setting || ''}
          onChange={e => updateVisual({ setting: e.target.value })}
          placeholder="e.g., A bustling coffee shop in downtown Manhattan, morning light streaming through large windows..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Subjects
          <span className="text-gray-500 text-xs ml-2">Who/what is in the scene? (one per line)</span>
        </label>
        <textarea
          value={visual.subjects?.join('\n') || ''}
          onChange={e => updateVisual({ subjects: e.target.value.split('\n').filter(s => s.trim()) })}
          placeholder="e.g.,&#10;Young woman in her 30s, wearing casual business attire&#10;Vintage espresso machine&#10;Barista preparing drinks"
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Environment
          <span className="text-gray-500 text-xs ml-2">Environmental details and atmosphere</span>
        </label>
        <textarea
          value={visual.environment || ''}
          onChange={e => updateVisual({ environment: e.target.value })}
          placeholder="e.g., Warm interior with exposed brick walls, wooden furniture, plants hanging from ceiling..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Colors
          <span className="text-gray-500 text-xs ml-2">Color palette and tones</span>
        </label>
        <input
          type="text"
          value={visual.colors || ''}
          onChange={e => updateVisual({ colors: e.target.value })}
          placeholder="e.g., Warm earth tones, golden morning light, rich browns and creams"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Lighting
          <span className="text-gray-500 text-xs ml-2">Lighting description and mood</span>
        </label>
        <textarea
          value={visual.lighting || ''}
          onChange={e => updateVisual({ lighting: e.target.value })}
          placeholder="e.g., Soft natural morning light from windows, warm overhead pendant lights, subtle shadows creating depth..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Composition
          <span className="text-gray-500 text-xs ml-2">Framing and composition</span>
        </label>
        <textarea
          value={visual.composition || ''}
          onChange={e => updateVisual({ composition: e.target.value })}
          placeholder="e.g., Rule of thirds, subject center frame, background elements frame the scene..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Style
          <span className="text-gray-500 text-xs ml-2">Visual aesthetic and style</span>
        </label>
        <textarea
          value={visual.style || ''}
          onChange={e => updateVisual({ style: e.target.value })}
          placeholder="e.g., Cinematic realism, shallow depth of field, film grain texture, naturalistic..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
};

export default VisualEditor;

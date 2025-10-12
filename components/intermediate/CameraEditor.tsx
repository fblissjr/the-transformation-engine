import React from 'react';
import { useIntermediate } from '../../context/IntermediateContext';

const CameraEditor: React.FC = () => {
  const { activeIntermediate, updateCamera } = useIntermediate();

  if (!activeIntermediate) return null;

  const camera = activeIntermediate.structure.camera || {};

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Camera Movement
          <span className="text-gray-500 text-xs ml-2">How the camera moves through the scene</span>
        </label>
        <textarea
          value={camera.movement || ''}
          onChange={e => updateCamera({ movement: e.target.value })}
          placeholder="e.g., Dolly forward smoothly from wide establishing shot to medium close-up of subject, slow pan left following character movement..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Camera Angles
          <span className="text-gray-500 text-xs ml-2">Shot angles and perspective</span>
        </label>
        <textarea
          value={camera.angles || ''}
          onChange={e => updateCamera({ angles: e.target.value })}
          placeholder="e.g., Eye-level perspective, slight low angle looking up at subject, over-the-shoulder shot during conversation..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cinematic Techniques
          <span className="text-gray-500 text-xs ml-2">Lens, aperture, and technical details</span>
        </label>
        <textarea
          value={camera.techniques || ''}
          onChange={e => updateCamera({ techniques: e.target.value })}
          placeholder="e.g., 35mm lens, f/2.8 aperture creating shallow depth of field, rack focus from foreground to background, handheld aesthetic with subtle shake..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 mt-4">
        <p className="text-sm text-gray-400">
          <strong>Common movements:</strong> Dolly (in/out), Pan (left/right), Tilt (up/down), Tracking shot, Crane shot, Static shot
        </p>
        <p className="text-sm text-gray-400 mt-2">
          <strong>Common angles:</strong> Eye-level, High angle, Low angle, Bird's eye, Worm's eye, Dutch angle, Over-the-shoulder
        </p>
      </div>
    </div>
  );
};

export default CameraEditor;

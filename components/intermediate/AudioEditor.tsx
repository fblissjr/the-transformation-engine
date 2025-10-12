import React from 'react';
import { useIntermediate } from '../../context/IntermediateContext';

const AudioEditor: React.FC = () => {
  const { activeIntermediate, updateAudio } = useIntermediate();

  if (!activeIntermediate) return null;

  const audio = activeIntermediate.structure.audio || {};

  return (
    <div className="space-y-4 p-4">
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-300">
          <strong>Veo 3 Tip:</strong> Audio is REQUIRED for Veo 3 exports. Include dialogue, ambient sounds, or music.
        </p>
        <p className="text-sm text-amber-300 mt-2">
          <strong>Sora 2 Tip:</strong> Audio descriptions are optional but can enhance the soundtrack.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Dialogue (quoted speech)
          <span className="text-gray-500 text-xs ml-2">Spoken words in quotes</span>
        </label>
        <textarea
          value={audio.dialogue || ''}
          onChange={e => updateAudio({ dialogue: e.target.value })}
          placeholder='e.g., "Welcome to our coffee shop," says the barista with a warm smile. The customer replies, "I&#39;ll have a cappuccino, please."'
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ambient Sounds
          <span className="text-gray-500 text-xs ml-2">Background environmental sounds</span>
        </label>
        <textarea
          value={audio.ambient || ''}
          onChange={e => updateAudio({ ambient: e.target.value })}
          placeholder="e.g., Gentle murmur of conversation, coffee machine hissing steam, clinking cups, soft jazz music playing in background..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sound Effects
          <span className="text-gray-500 text-xs ml-2">Foley and specific SFX</span>
        </label>
        <textarea
          value={audio.soundEffects || ''}
          onChange={e => updateAudio({ soundEffects: e.target.value })}
          placeholder="e.g., Coffee pouring into cup, spoon stirring sugar, footsteps on wooden floor, door chime as customer enters..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Music
          <span className="text-gray-500 text-xs ml-2">Musical elements and score</span>
        </label>
        <textarea
          value={audio.music || ''}
          onChange={e => updateAudio({ music: e.target.value })}
          placeholder="e.g., Soft acoustic jazz playing at low volume, instrumental with gentle piano and upright bass, creates relaxed morning atmosphere..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
};

export default AudioEditor;

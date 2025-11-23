import React, { useState } from 'react';
import { PromptSettings, DialogueLine } from '../../types';
import { TrashIcon } from './icons';

interface AdvancedControlsModalProps {
  settings: PromptSettings;
  setSettings: React.Dispatch<React.SetStateAction<PromptSettings>>;
  onClose: () => void;
}

type Tab = 'dialogue' | 'soundscape' | 'pacing';

/**
 * AdvancedControlsModal component
 *
 * A modal dialog for configuring advanced prompt settings, including dialogue, soundscape, and pacing.
 *
 * @param settings - Current prompt settings.
 * @param setSettings - State setter for prompt settings.
 * @param onClose - Callback to close the modal.
 * @returns The rendered AdvancedControlsModal component.
 */
const AdvancedControlsModal: React.FC<AdvancedControlsModalProps> = ({ settings, setSettings, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dialogue');
  
  const handleDialogueChange = (id: string, field: keyof Omit<DialogueLine, 'id'>, value: string) => {
    setSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        dialogue: prev.advanced.dialogue.map(d => d.id === id ? { ...d, [field]: value } : d)
      }
    }));
  };

  const addDialogueLine = () => {
    setSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        dialogue: [...prev.advanced.dialogue, { id: crypto.randomUUID(), character: '', line: '', delivery: '' }]
      }
    }));
  };

  const removeDialogueLine = (id: string) => {
     setSettings(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        dialogue: prev.advanced.dialogue.filter(d => d.id !== id)
      }
    }));
  };
  
  const handleSoundscapeChange = (field: 'soundEffects' | 'musicDirection', value: string) => {
    setSettings(prev => ({ ...prev, advanced: { ...prev.advanced, soundscape: { ...prev.advanced.soundscape, [field]: value } } }));
  };
  
  const handlePacingChange = (field: 'timingNotes', value: string) => {
    setSettings(prev => ({ ...prev, advanced: { ...prev.advanced, pacing: { ...prev.advanced.pacing, [field]: value } } }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full text-left flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4 shrink-0">Advanced Controls</h2>
        <div className="flex border-b border-gray-800 mb-4 shrink-0">
          <TabButton label="Dialogue" isActive={activeTab === 'dialogue'} onClick={() => setActiveTab('dialogue')} />
          <TabButton label="Soundscape" isActive={activeTab === 'soundscape'} onClick={() => setActiveTab('soundscape')} />
          <TabButton label="Pacing & Timing" isActive={activeTab === 'pacing'} onClick={() => setActiveTab('pacing')} />
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {activeTab === 'dialogue' && (
            <div>
              {settings.advanced.dialogue.map(d => (
                <div key={d.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 items-center">
                  <input type="text" placeholder="Character" value={d.character} onChange={e => handleDialogueChange(d.id, 'character', e.target.value)} className="bg-gray-800 p-2 rounded col-span-1 border border-gray-700 focus:ring-amber-500 focus:ring-1 focus:outline-none text-sm" />
                  <input type="text" placeholder="Line" value={d.line} onChange={e => handleDialogueChange(d.id, 'line', e.target.value)} className="bg-gray-800 p-2 rounded col-span-2 md:col-span-1 border border-gray-700 focus:ring-amber-500 focus:ring-1 focus:outline-none text-sm" />
                  <div className="flex gap-2 items-center col-span-2 md:col-span-1">
                    <input type="text" placeholder="Delivery Note" value={d.delivery} onChange={e => handleDialogueChange(d.id, 'delivery', e.target.value)} className="bg-gray-800 p-2 rounded flex-1 border border-gray-700 focus:ring-amber-500 focus:ring-1 focus:outline-none text-sm" />
                    <button onClick={() => removeDialogueLine(d.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><TrashIcon/></button>
                  </div>
                </div>
              ))}
              <button onClick={addDialogueLine} className="mt-2 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">+ Add Dialogue Line</button>
            </div>
          )}
          {activeTab === 'soundscape' && (
             <div className="flex flex-col gap-4">
                <TextareaControl label="Sound Effects" value={settings.advanced.soundscape.soundEffects} onChange={val => handleSoundscapeChange('soundEffects', val)} placeholder="e.g., A high-pitched error beep, non-rhythmic crinkle of a frozen peas bag." />
                <TextareaControl label="Music Direction" value={settings.advanced.soundscape.musicDirection} onChange={val => handleSoundscapeChange('musicDirection', val)} placeholder="e.g., A frantic, exciting orchestral piece that is abruptly interrupted by the self-checkout system's beeps." />
             </div>
          )}
          {activeTab === 'pacing' && (
            <TextareaControl label="Pacing & Timing Notes" value={settings.advanced.pacing.timingNotes} onChange={val => handlePacingChange('timingNotes', val)} placeholder="e.g., A frustrated close-up on the Queen's face as she struggles to scan a bag of frozen peas." />
          )}
        </div>
        
        <div className="mt-6 text-right shrink-0 pt-4 border-t border-gray-800">
          <button onClick={onClose} className="bg-amber-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-amber-500 transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
};

/**
 * TabButton component
 *
 * A simple button for switching tabs in the modal.
 *
 * @param label - The tab label.
 * @param isActive - Whether the tab is currently active.
 * @param onClick - Callback when the tab is clicked.
 * @returns The rendered TabButton component.
 */
const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold transition-colors outline-none ${isActive ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{label}</button>
);

/**
 * TextareaControl component
 *
 * A labeled textarea input for entering multi-line text settings.
 *
 * @param label - The input label.
 * @param value - The current value.
 * @param placeholder - Placeholder text.
 * @param onChange - Callback when the value changes.
 * @returns The rendered TextareaControl component.
 */
const TextareaControl: React.FC<{label: string, value: string, placeholder: string, onChange: (value: string) => void}> = ({ label, value, placeholder, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <textarea rows={4} className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:ring-amber-500 focus:ring-1 focus:outline-none text-sm placeholder:text-gray-500" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
);

export default AdvancedControlsModal;
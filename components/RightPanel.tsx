import React, { useState, useRef, useEffect } from 'react';
import { usePrompts } from '../context/PromptContext';
import { useGeneration } from '../context/GenerationContext';
import { CopyIcon, RestoreIcon } from './icons';
import { LogEntry, PromptVersion } from '../types';
import { VersionTree } from './VersionTree';
import { generateConversionPrompt } from '../services/promptService';
import IntermediateRefinementPanel from './IntermediateRefinementPanel';

interface RightPanelProps {
  logs: LogEntry[];
  isLoggingEnabled: boolean;
  setIsLoggingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onClearLogs: () => void;
}

type Tab = 'intermediate' | 'structured' | 'normalized' | 'history' | 'debug';

const RightPanel: React.FC<RightPanelProps> = ({ 
  logs,
  isLoggingEnabled,
  setIsLoggingEnabled,
  onClearLogs,
}) => {
  const {
    activePrompt,
    structuredOutput,
    normalizedOutput,
    promptVersions,
    settings,
    isLoading,
    isNormalizing,
    loadingMessage,
    normalize,
    updatePrompt,
    restoreVersion,
  } = usePrompts();

  const { generatedIntermediate } = useGeneration();
  const [activeTab, setActiveTab] = useState<Tab>('intermediate');
  const [editedStructuredOutput, setEditedStructuredOutput] = useState('');
  const [editedNormalizedOutput, setEditedNormalizedOutput] = useState('');
  const [showTransformInput, setShowTransformInput] = useState(false);
  const [customTransform, setCustomTransform] = useState('');
  const [useTreeView, setUseTreeView] = useState(true); // Toggle for tree view

  // Sync edited outputs only when activePrompt changes or when new content is generated
  useEffect(() => {
    if (activePrompt) {
      setEditedStructuredOutput(activePrompt.structuredOutput);
      setEditedNormalizedOutput(activePrompt.normalizedOutput);
    }
  }, [activePrompt]);

  // Sync with structuredOutput/normalizedOutput when there's no activePrompt
  // This ensures the Structured tab updates on every new generation
  useEffect(() => {
    if (!activePrompt && structuredOutput) {
      setEditedStructuredOutput(structuredOutput);
    }
    if (!activePrompt && normalizedOutput) {
      setEditedNormalizedOutput(normalizedOutput);
    }
  }, [structuredOutput, normalizedOutput, activePrompt]);

  const handleSaveChanges = () => {
    updatePrompt(editedStructuredOutput, editedNormalizedOutput);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const hasUnsavedChanges = activePrompt && (
      activePrompt.structuredOutput !== editedStructuredOutput || 
      activePrompt.normalizedOutput !== editedNormalizedOutput
  );

  const OutputDisplay: React.FC<{ 
    content: string;
    onEdit: (value: string) => void;
    onCopy: () => void;
    isLoading: boolean 
  }> = ({ content, onEdit, onCopy, isLoading }) => {
    if (isLoading && !content) {
        return (
            <div className="w-full h-full bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-center">
                <div className="text-gray-500">Generating...</div>
            </div>
        );
    }
    
    return (
        <div className="relative h-full group flex flex-col">
            <button onClick={onCopy} className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-all z-10 opacity-0 group-hover:opacity-100 focus:opacity-100">
                <CopyIcon />
            </button>
            <textarea
                value={content}
                onChange={(e) => onEdit(e.target.value)}
                placeholder="Output will appear here..."
                className="w-full flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4 whitespace-pre-wrap break-words overflow-y-auto font-mono text-sm text-gray-300 selection:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
        </div>
    );
  };
  
  const DebugLogDisplay: React.FC<{ logs: LogEntry[], isEnabled: boolean }> = ({ logs, isEnabled }) => {
    const logsEndRef = useRef<HTMLDivElement>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = logContainerRef.current;
            if (scrollHeight - scrollTop < clientHeight + 100) {
                 logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [logs]);

    const logColors = {
        info: 'text-gray-400',
        success: 'text-green-400',
        error: 'text-red-400',
    };

    return (
      <div ref={logContainerRef} className="w-full h-full bg-gray-900 border border-gray-800 rounded-lg p-4 whitespace-pre-wrap break-words overflow-y-auto font-mono text-xs flex-1 min-h-0">
        {!isEnabled ? (
            <span className="text-gray-500">Logging is disabled. Enable the toggle to start capturing events.</span>
        ) : logs.length === 0 ? (
            <span className="text-gray-500">Waiting for events...</span>
        ) : (
            <>
                {logs.map((log, index) => (
                    <div key={index} className="flex gap-3 leading-relaxed">
                        <span className="text-gray-500 shrink-0">{log.timestamp}</span>
                        <span className={`${logColors[log.type]} break-all`}>{log.message}</span>
                    </div>
                ))}
                <div ref={logsEndRef} />
            </>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full h-full bg-gray-900 border-l border-gray-800 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4">
      <div>
        <div className="flex flex-wrap border-b border-gray-800 overflow-x-auto">
          <TabButton
            label="Intermediate"
            isActive={activeTab === 'intermediate'}
            onClick={() => setActiveTab('intermediate')}
          />
          <TabButton
            label="Structured"
            isActive={activeTab === 'structured'}
            onClick={() => setActiveTab('structured')}
          />
          <TabButton
            label="Plain"
            isActive={activeTab === 'normalized'}
            onClick={() => setActiveTab('normalized')}
          />
          <TabButton
            label="History"
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
          <TabButton
            label="Debug"
            isActive={activeTab === 'debug'}
            onClick={() => setActiveTab('debug')}
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {/* Character Counter - Show on structured tab */}
        {activeTab === 'structured' && structuredOutput && (() => {
          const charCount = structuredOutput.length;
          const MODEL_PRESETS = {
            generic: { maxInputChars: 2000 },
            sora2: { maxInputChars: 2500 },
            veo3: { maxInputChars: 3000 },
            wan: { maxInputChars: 2000 }
          };

          // Detect model from schema keys
          const keySet = new Set(settings.schemaKeys);
          const veo3Keys = ['audio_elements', 'dialogue', 'voiceover_script', 'ambient_audio', 'subject'];
          const sora2Keys = ['temporal_progression', 'cinematography', 'visual_description'];
          const veo3Score = veo3Keys.filter(k => keySet.has(k)).length;
          const sora2Score = sora2Keys.filter(k => keySet.has(k)).length;

          let detectedModel = 'generic';
          if (veo3Score > sora2Score || (veo3Score === sora2Score && veo3Score > 0)) detectedModel = 'veo3';
          else if (sora2Score > 0) detectedModel = 'sora2';

          const maxChars = MODEL_PRESETS[detectedModel as keyof typeof MODEL_PRESETS]?.maxInputChars || 2000;
          const percentage = (charCount / maxChars) * 100;
          const isWarning = percentage > 80;
          const isDanger = percentage > 100;

          return (
            <div className={`bg-gray-800/50 border rounded-lg p-2 ${isDanger ? 'border-red-500' : isWarning ? 'border-yellow-500' : 'border-gray-700'}`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Character Count</span>
                <span className={`font-mono ${isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-gray-300'}`}>
                  {charCount.toLocaleString()} / {maxChars.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              {isDanger && (
                <p className="text-xs text-red-400 mt-1">
                  Prompt exceeds {detectedModel === 'sora2' ? 'Sora 2' : detectedModel === 'veo3' ? 'Veo 3' : 'model'} input limit. Will be truncated by API.
                </p>
              )}
              {isWarning && !isDanger && (
                <p className="text-xs text-yellow-400 mt-1">
                  Approaching {detectedModel === 'sora2' ? 'Sora 2' : detectedModel === 'veo3' ? 'Veo 3' : 'model'} input limit.
                </p>
              )}
            </div>
          );
        })()}

        {/* Transform Actions - Only show on structured tab */}
        {activeTab === 'structured' && structuredOutput && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-xs font-semibold text-white">Transform</span>
            </div>
            <div className="flex flex-col gap-2">
              {isNormalizing && loadingMessage && (
                <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse">
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{loadingMessage}</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {/* Format Conversions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => normalize()}
                    disabled={isNormalizing}
                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {isNormalizing ? 'Transforming...' : '→ Plain English'}
                  </button>
                  <button
                    onClick={() => normalize('Convert to YAML format')}
                    disabled={isNormalizing}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    → YAML
                  </button>
                  <button
                    onClick={() => normalize('Convert to XML format')}
                    disabled={isNormalizing}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    → XML
                  </button>
                  <button
                    onClick={() => normalize('Convert to JSON format')}
                    disabled={isNormalizing}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    → JSON
                  </button>
                  <button
                    onClick={() => normalize('Convert to Markdown format')}
                    disabled={isNormalizing}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    → Markdown
                  </button>
                </div>

                {/* Model-Specific Conversions */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-700/50">
                  <button
                    onClick={async () => {
                      const conversionPrompt = await generateConversionPrompt(structuredOutput, 'sora2');
                      normalize(conversionPrompt);
                    }}
                    disabled={isNormalizing}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    → Sora 2
                  </button>
                  <button
                    onClick={async () => {
                      const conversionPrompt = await generateConversionPrompt(structuredOutput, 'veo3');
                      normalize(conversionPrompt);
                    }}
                    disabled={isNormalizing}
                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    → Veo 3
                  </button>
                  <button
                    onClick={async () => {
                      const conversionPrompt = await generateConversionPrompt(structuredOutput, 'generic');
                      normalize(conversionPrompt);
                    }}
                    disabled={isNormalizing}
                    className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    → Generic
                  </button>
                </div>

                {/* Condense Option */}
                {structuredOutput.length > 2500 && (
                  <div className="flex pt-1 border-t border-gray-700/50">
                    <button
                      onClick={() => normalize(`Condense this prompt to under 2500 characters while preserving all essential visual, temporal, and stylistic details. Prioritize: (1) core scene concept, (2) temporal progression, (3) key visual elements, (4) camera movement, (5) lighting/style. Remove redundancy and use precise, efficient language. Maintain YAML format with the same schema keys.`)}
                      disabled={isNormalizing}
                      className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Condense (for Sora 2)
                    </button>
                  </div>
                )}
              </div>
              {/* Custom Transform Button */}
              <div className="flex pt-1 border-t border-gray-700/50">
                <button
                  onClick={() => setShowTransformInput(!showTransformInput)}
                  className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded transition-colors"
                >
                  ✨ Custom Transform...
                </button>
              </div>
            </div>
            {showTransformInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={customTransform}
                  onChange={e => setCustomTransform(e.target.value)}
                  placeholder="e.g., Make it more concise..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  onClick={() => {
                    if (customTransform.trim()) {
                      normalize(customTransform);
                      setCustomTransform('');
                      setShowTransformInput(false);
                    }
                  }}
                  disabled={!customTransform.trim() || isNormalizing}
                  className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'structured' && (
          <div className="flex-1 min-h-0">
            <OutputDisplay
              content={editedStructuredOutput}
              onEdit={setEditedStructuredOutput}
              onCopy={() => copyToClipboard(editedStructuredOutput)}
              isLoading={isLoading}
            />
          </div>
        )}
        {activeTab === 'normalized' && (
          <div className="flex-1 min-h-0">
            {normalizedOutput ? (
              <OutputDisplay
                content={editedNormalizedOutput}
                onEdit={setEditedNormalizedOutput}
                onCopy={() => copyToClipboard(editedNormalizedOutput)}
                isLoading={isNormalizing}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-4">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <div>
                  <p className="text-sm text-gray-400 mb-1">No transformation yet</p>
                  <p className="text-xs text-gray-600">Use the transform buttons on the Structured tab</p>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'history' && (
           <div className="flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">Version History</h3>
              <button
                onClick={() => setUseTreeView(!useTreeView)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition"
              >
                {useTreeView ? 'List View' : 'Tree View'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-900 border border-gray-800 rounded-lg p-3">
              {activePrompt ? (
                useTreeView ? (
                  <VersionTree
                    promptId={activePrompt.id}
                    currentVersionId={undefined}
                    onRestoreVersion={(versionId) => {
                      const version = promptVersions.find(v => v.versionId === versionId);
                      if (version) {
                        restoreVersion(version);
                        setActiveTab('structured');
                      }
                    }}
                  />
                ) : (
                  promptVersions.length > 0 ? (
                    <ul>
                      {promptVersions.map(version => (
                        <li key={version.versionId} className="group flex justify-between items-center p-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors">
                          <div>
                            <p className="text-sm text-gray-200">Saved on</p>
                            <p className="text-xs text-gray-400">{new Date(version.savedAt).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => {
                              restoreVersion(version);
                              setActiveTab('structured');
                            }}
                            className="flex items-center gap-2 text-sm bg-gray-700 text-gray-200 hover:bg-amber-600 hover:text-white font-semibold py-1 px-3 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Restore this version"
                          >
                            <RestoreIcon />
                            Restore
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">No version history for this prompt.</p>
                    </div>
                  )
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">No prompt selected.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'debug' && (
          <div className="flex flex-col h-full gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label htmlFor="logging-toggle" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                  Capture Debug Logs
                </label>
                <button
                    role="switch"
                    aria-checked={isLoggingEnabled}
                    id="logging-toggle"
                    onClick={() => setIsLoggingEnabled(prev => !prev)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-500 ${
                    isLoggingEnabled ? 'bg-amber-600' : 'bg-gray-700'
                    }`}
                >
                    <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        isLoggingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    />
                </button>
              </div>
              {isLoggingEnabled && (
                <button onClick={onClearLogs} className="text-sm text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-1 rounded-md transition-colors">
                  Clear
                </button>
              )}
            </div>
            <DebugLogDisplay logs={logs} isEnabled={isLoggingEnabled}/>
          </div>
        )}
      </div>
       {hasUnsavedChanges && (
        <div className="shrink-0 pt-4 border-t border-gray-800">
            <button
                onClick={handleSaveChanges}
                className="w-full bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-amber-500 hover:shadow-amber-500/30 transition-all duration-300"
            >
                Save Changes
            </button>
        </div>
      )}
    </aside>
  );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors outline-none whitespace-nowrap ${
        isActive
          ? 'text-amber-400 border-b-2 border-amber-400'
          : 'text-gray-400 hover:text-white border-b-2 border-transparent'
      }`}
    >
      {label}
    </button>
  );
};

export default RightPanel;
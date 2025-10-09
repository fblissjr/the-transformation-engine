import React, { useState, useRef, useEffect } from 'react';
import { usePrompts } from '../context/PromptContext';
import { CopyIcon, RestoreIcon } from './icons';
import { LogEntry, PromptVersion } from '../types';

interface RightPanelProps {
  logs: LogEntry[];
  isLoggingEnabled: boolean;
  setIsLoggingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onClearLogs: () => void;
}

type Tab = 'structured' | 'normalized' | 'history' | 'debug';

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
    isLoading,
    isNormalizing,
    normalize,
    updatePrompt,
    restoreVersion,
  } = usePrompts();

  const [activeTab, setActiveTab] = useState<Tab>('structured');
  const [editedStructuredOutput, setEditedStructuredOutput] = useState('');
  const [editedNormalizedOutput, setEditedNormalizedOutput] = useState('');
  const [showTransformInput, setShowTransformInput] = useState(false);
  const [customTransform, setCustomTransform] = useState('');

  // Sync edited outputs only when activePrompt changes or when new content is generated
  useEffect(() => {
    if (activePrompt) {
      setEditedStructuredOutput(activePrompt.structuredOutput);
      setEditedNormalizedOutput(activePrompt.normalizedOutput);
    }
  }, [activePrompt]);

  // Sync with structuredOutput/normalizedOutput only when there's no activePrompt
  // and only if the edited values are empty (initial load)
  useEffect(() => {
    if (!activePrompt && !editedStructuredOutput && structuredOutput) {
      setEditedStructuredOutput(structuredOutput);
    }
    if (!activePrompt && !editedNormalizedOutput && normalizedOutput) {
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
    <aside className="w-1/4 max-w-[450px] h-full bg-gray-900 border-l border-gray-800 flex flex-col p-4 gap-4">
      <div>
        <div className="flex border-b border-gray-800">
          <TabButton
            label="Structured Prompt"
            isActive={activeTab === 'structured'}
            onClick={() => setActiveTab('structured')}
          />
          <TabButton
            label="Plain Language"
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
        {/* Transform Actions - Only show on structured tab */}
        {activeTab === 'structured' && structuredOutput && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-xs font-semibold text-white">Transform</span>
            </div>
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
              <button
                onClick={() => setShowTransformInput(!showTransformInput)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors"
              >
                ✨ Custom...
              </button>
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
            <h3 className="text-sm font-medium text-gray-300">Version History</h3>
            <div className="flex-1 overflow-y-auto bg-gray-900 border border-gray-800 rounded-lg">
              {activePrompt && promptVersions.length > 0 ? (
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
      className={`px-4 py-2 text-sm font-semibold transition-colors outline-none ${
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
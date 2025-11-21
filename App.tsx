
import React, { useState, useEffect } from 'react';
import { PromptProvider, usePrompts } from './src/contexts/PromptContext';
import { ProviderProvider } from './src/contexts/ProviderContext';
import { SceneClassificationProvider } from './src/contexts/SceneClassificationContext';
import { ObjectLibraryProvider } from './src/contexts/ObjectLibraryContext';
import LeftPanel from './src/components/LeftPanel';
import CenterPanel from './src/components/CenterPanel';
import RightPanel from './src/components/RightPanel';
import SettingsPage from './src/components/SettingsPage';
import { logger } from './services/loggerService';
import { LogEntry } from './types';
import { STRINGS } from './constants';
import SharePage from './src/components/SharePage';
import { WorkspaceModeSwitcher, WorkspaceMode } from './src/components/image-studio/WorkspaceModeSwitcher';
import { ImageWorkspace } from './src/components/image-studio/ImageWorkspace';
import './services/networkMonitor'; // Initialize network monitor

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Render different pages based on route
  const renderRoute = () => {
    if (route === '/share') return <SharePage />;
    if (route === '/settings') return <SettingsPageWrapper />;
    return <Main />;
  };

  return (
    <ProviderProvider>
      <PromptProvider>
        <SceneClassificationProvider>
          <ObjectLibraryProvider>
            {renderRoute()}
          </ObjectLibraryProvider>
        </SceneClassificationProvider>
      </PromptProvider>
    </ProviderProvider>
  );
};

// Wrapper to connect SettingsPage to PromptContext
const SettingsPageWrapper: React.FC = () => {
  const { settings, setSettings } = usePrompts();
  return <SettingsPage settings={settings} onSettingsChange={setSettings} />;
};

const Main: React.FC = () => {
  const { error } = usePrompts();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('video');

  useEffect(() => {
    const listener = (newLogs: LogEntry[]) => setLogs(newLogs);
    logger.subscribe(listener);
    return () => logger.unsubscribe(listener);
  }, []);

  useEffect(() => {
    logger.setEnabled(isLoggingEnabled);
  }, [isLoggingEnabled]);

  const handleClearLogs = () => logger.clearLogs();

  return (
    <>
      <div className="flex flex-col h-screen w-full bg-zinc-950 font-sans relative overflow-hidden">
        {/* Workspace Mode Switcher - Fixed at top */}
        <div className="flex items-center justify-center p-4 border-b border-zinc-800 bg-zinc-900">
          <WorkspaceModeSwitcher currentMode={workspaceMode} onModeChange={setWorkspaceMode} />
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-hidden">
          {workspaceMode === 'image' ? (
            <ImageWorkspace />
          ) : (
            <div className="flex h-full">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Mobile Output Button */}
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="lg:hidden fixed top-20 right-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg transition-colors"
                aria-label="Toggle output"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              {/* Left Panel - Drawer on mobile */}
              <div className={`
                fixed lg:relative inset-y-0 left-0 z-40
                w-full sm:w-80 lg:w-1/4 lg:max-w-[350px]
                transform transition-transform duration-300 ease-in-out
                ${showLeftPanel ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}>
                <LeftPanel />
              </div>

              {/* Overlay for mobile */}
              {showLeftPanel && (
                <div
                  className="lg:hidden fixed inset-0 bg-black/50 z-30"
                  onClick={() => setShowLeftPanel(false)}
                />
              )}

              {/* Center Panel - Always visible, adjusts width */}
              <div className="flex-1 min-w-0">
                <CenterPanel />
              </div>

              {/* Right Panel - Drawer on mobile */}
              <div className={`
                fixed lg:relative inset-y-0 right-0 z-40
                w-full sm:w-96 lg:w-1/4 lg:max-w-[450px]
                transform transition-transform duration-300 ease-in-out
                ${showRightPanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              `}>
                <RightPanel
                  logs={logs}
                  isLoggingEnabled={isLoggingEnabled}
                  setIsLoggingEnabled={setIsLoggingEnabled}
                  onClearLogs={handleClearLogs}
                />
              </div>

              {/* Overlay for mobile right panel */}
              {showRightPanel && (
                <div
                  className="lg:hidden fixed inset-0 bg-black/50 z-30"
                  onClick={() => setShowRightPanel(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-800/90 backdrop-blur-sm border border-red-700 text-white p-4 rounded-lg shadow-2xl z-50 flex items-start gap-3 max-w-md">
           <div className="flex-shrink-0 pt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold">{STRINGS.ERROR_MODAL_TITLE}</p>
            <p className="text-sm text-red-200 mt-1">{error}</p>
          </div>
          <button onClick={() => {}} className="absolute top-2 right-2 text-red-200 hover:text-white p-1 rounded-full">&times;</button>
        </div>
      )}
    </>
  );
};

export default App;

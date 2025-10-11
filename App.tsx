
import React, { useState, useEffect } from 'react';
import { ApiKeyProvider, useApiKey } from './context/ApiKeyContext';
import { PromptProvider, usePrompts } from './context/PromptContext';
import ApiKeyModal from './components/ApiKeyModal';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import { logger } from './services/loggerService';
import { LogEntry } from './types';
import { STRINGS } from './constants';
import SharePage from './components/SharePage';
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

  return (
    <ApiKeyProvider>
      <PromptProvider>
        {route === '/share' ? <SharePage /> : <Main />}
      </PromptProvider>
    </ApiKeyProvider>
  );
};

const Main: React.FC = () => {
  const { isApiKeySet, isModalOpen, openModal, closeModal } = useApiKey();
  const { error } = usePrompts();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);

  useEffect(() => {
    const hasSkipped = sessionStorage.getItem('apiKeySkipped');
    if (!isApiKeySet && !hasSkipped) {
      openModal();
    }
  }, [isApiKeySet, openModal]);

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
      {isModalOpen && <ApiKeyModal onClose={closeModal} />}
      <div className="flex h-screen w-full bg-gray-950 font-sans">
        <LeftPanel />
        <CenterPanel />
        <RightPanel
          logs={logs}
          isLoggingEnabled={isLoggingEnabled}
          setIsLoggingEnabled={setIsLoggingEnabled}
          onClearLogs={handleClearLogs}
        />
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

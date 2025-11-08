
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { providerService } from '../services/providerService';
import { getDB } from '../services/db/indexedDbService';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null, ttl?: number) => Promise<void>;
  isApiKeySet: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  clearApiKey: () => Promise<void>;
  getApiKeyExpiration: () => Promise<number | null>;
  refreshApiKey: () => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (legacy)

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadApiKey = useCallback(async () => {
    try {
      // Wait for database to be initialized
      await getDB();

      // Get first enabled Gemini provider and its key
      const allProviders = await providerService.getAllProviders();
      const geminiProvider = allProviders.find(p => p.type === 'gemini' && p.enabled);

      if (geminiProvider) {
        const storedKey = await providerService.getFirstValidKey(geminiProvider.id);
        if (storedKey) {
          setApiKeyState(storedKey);
        } else {
          setApiKeyState(null);
        }
      } else {
        setApiKeyState(null);
      }
    } catch (error) {
      console.error('[ApiKeyContext] Failed to load API key:', error);
      setApiKeyState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load API key on mount
  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  // These are no-ops for backward compatibility
  const setApiKey = useCallback(async (_key: string | null, _ttl: number = DEFAULT_TTL) => {
    // No-op: Use ProviderContext to manage keys now
    console.warn('[ApiKeyContext] setApiKey is deprecated. Use ProviderContext.addApiKey instead');
  }, []);

  const clearApiKey = useCallback(async () => {
    // No-op: Use ProviderContext to manage keys now
    console.warn('[ApiKeyContext] clearApiKey is deprecated. Use ProviderContext.deleteApiKey instead');
  }, []);

  const getApiKeyExpiration = useCallback(async () => {
    // No-op: Keys are managed by provider system now
    return null;
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const contextValue = useMemo(() => ({
    apiKey: isLoading ? null : apiKey,
    setApiKey,
    isApiKeySet: !!apiKey,
    isModalOpen,
    openModal,
    closeModal,
    clearApiKey,
    getApiKeyExpiration,
    refreshApiKey: loadApiKey,
  }), [apiKey, isLoading, isModalOpen, openModal, closeModal, setApiKey, clearApiKey, getApiKeyExpiration, loadApiKey]);

  return (
    <ApiKeyContext.Provider value={contextValue}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};

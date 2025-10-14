
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { encryptedStorage } from '../services/encryptedStorage';
import { providerService } from '../services/providerService';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null, ttl?: number) => Promise<void>;
  isApiKeySet: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  clearApiKey: () => Promise<void>;
  getApiKeyExpiration: () => Promise<number | null>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const STORAGE_KEY = 'gemini_api_key';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load API key on mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        // First check old encrypted storage for backward compatibility
        let storedKey = await encryptedStorage.get(STORAGE_KEY);

        // If not found, check new provider system for Gemini provider
        if (!storedKey) {
          const geminiProvider = await providerService.getProvider('provider_gemini_default');
          if (geminiProvider) {
            storedKey = await providerService.getFirstValidKey(geminiProvider.id);
          }
        }

        if (storedKey) {
          setApiKeyState(storedKey);
        }
      } catch (error) {
        console.error('Failed to load API key:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, []);

  // Handle HMR in development: reload key if state is empty but storage has it
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((import.meta as any).hot && !isLoading && !apiKey) {
      const recheckApiKey = async () => {
        const storedKey = await encryptedStorage.get(STORAGE_KEY);
        if (storedKey && storedKey !== apiKey) {
          console.log('HMR: Restoring API key from encrypted storage');
          setApiKeyState(storedKey);
        }
      };
      recheckApiKey();
    }
  }, [apiKey, isLoading]);

  const setApiKey = useCallback(async (key: string | null, ttl: number = DEFAULT_TTL) => {
    if (key) {
      await encryptedStorage.set(STORAGE_KEY, key, { ttl });
      setApiKeyState(key);
    } else {
      await encryptedStorage.remove(STORAGE_KEY);
      setApiKeyState(null);
    }
  }, []);

  const clearApiKey = useCallback(async () => {
    await encryptedStorage.remove(STORAGE_KEY);
    setApiKeyState(null);
  }, []);

  const getApiKeyExpiration = useCallback(async () => {
    return await encryptedStorage.getExpiration(STORAGE_KEY);
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
  }), [apiKey, isLoading, isModalOpen, openModal, closeModal, setApiKey, clearApiKey, getApiKeyExpiration]);

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

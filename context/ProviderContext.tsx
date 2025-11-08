/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Provider, Model } from '../types/providers';
import { providerService } from '../services/providerService';
import { ProviderRegistry } from '../services/providerRegistry';
import { useApiKey } from './ApiKeyContext';

interface ProviderContextType {
  providers: Provider[];
  activeProviderId: string | null;
  isLoading: boolean;
  error: string | null;

  // Provider management
  addProvider: (name: string, type: Provider['type'], baseUrl: string) => Promise<Provider>;
  updateProvider: (id: string, updates: Partial<Provider>) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  setActiveProvider: (id: string) => void;

  // API key management
  addApiKey: (providerId: string, apiKey: string, label?: string, ttl?: number) => Promise<void>;
  deleteApiKey: (keyId: string) => Promise<void>;

  // Provider operations
  testConnection: (providerId: string) => Promise<{ success: boolean; error?: string; modelCount?: number }>;
  fetchModels: (providerId: string) => Promise<Model[]>;

  // Utility
  refreshProviders: () => Promise<void>;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const ProviderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const providerRegistry = new ProviderRegistry();
  const { refreshApiKey } = useApiKey();

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allProviders = await providerService.getAllProviders();
      setProviders(allProviders);

      // Set first enabled provider as active if none selected
      if (!activeProviderId && allProviders.length > 0) {
        const firstEnabled = allProviders.find((p) => p.enabled);
        if (firstEnabled) {
          setActiveProviderId(firstEnabled.id);
        }
      }
    } catch (e: any) {
      setError(`Failed to load providers: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addProvider = async (
    name: string,
    type: Provider['type'],
    baseUrl: string
  ): Promise<Provider> => {
    try {
      const provider = await providerService.addProvider(name, type, baseUrl);
      setProviders([...providers, provider]);
      return provider;
    } catch (e: any) {
      setError(`Failed to add provider: ${e.message}`);
      throw e;
    }
  };

  const updateProvider = async (
    id: string,
    updates: Partial<Provider>
  ): Promise<void> => {
    try {
      const updated = await providerService.updateProvider(id, updates);
      setProviders(providers.map((p) => (p.id === id ? updated : p)));

      // Clear cached instance (forces recreation with new settings)
      providerRegistry.clearProvider(id);
    } catch (e: any) {
      setError(`Failed to update provider: ${e.message}`);
      throw e;
    }
  };

  const deleteProvider = async (id: string): Promise<void> => {
    try {
      await providerService.deleteProvider(id);
      setProviders(providers.filter((p) => p.id !== id));

      // Clear cached instance
      providerRegistry.clearProvider(id);

      // If deleted provider was active, switch to first available
      if (activeProviderId === id) {
        const remaining = providers.filter((p) => p.id !== id);
        setActiveProviderId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (e: any) {
      setError(`Failed to delete provider: ${e.message}`);
      throw e;
    }
  };

  const setActiveProvider = (id: string) => {
    const provider = providers.find((p) => p.id === id);
    if (provider) {
      setActiveProviderId(id);
    } else {
      setError(`Provider ${id} not found`);
    }
  };

  const addApiKey = async (
    providerId: string,
    apiKey: string,
    label?: string,
    ttl?: number
  ): Promise<void> => {
    try {
      await providerService.addProviderKey(providerId, apiKey, label, ttl);

      // Clear cached instance (forces recreation with new key)
      providerRegistry.clearProvider(providerId);

      // Refresh ApiKeyContext so generation can use the new key
      await refreshApiKey();
    } catch (e: any) {
      setError(`Failed to add API key: ${e.message}`);
      throw e;
    }
  };

  const deleteApiKey = async (keyId: string): Promise<void> => {
    try {
      await providerService.deleteProviderKey(keyId);
    } catch (e: any) {
      setError(`Failed to delete API key: ${e.message}`);
      throw e;
    }
  };

  const testConnection = async (
    providerId: string
  ): Promise<{ success: boolean; error?: string; modelCount?: number }> => {
    try {
      return await providerService.testConnection(providerId);
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
      };
    }
  };

  const fetchModels = async (providerId: string): Promise<Model[]> => {
    try {
      const provider = await providerRegistry.getProvider(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      return await provider.listModels();
    } catch (e: any) {
      setError(`Failed to fetch models: ${e.message}`);
      throw e;
    }
  };

  const refreshProviders = async (): Promise<void> => {
    await loadProviders();
  };

  const value = {
    providers,
    activeProviderId,
    isLoading,
    error,
    addProvider,
    updateProvider,
    deleteProvider,
    setActiveProvider,
    addApiKey,
    deleteApiKey,
    testConnection,
    fetchModels,
    refreshProviders,
  };

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
};

export const useProviders = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProviders must be used within a ProviderProvider');
  }
  return context;
};

import { useState, useEffect, useCallback } from 'react';
import { apiKeyUtils, ApiKeyConfig } from '../utils/apiKeys';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load API keys from localStorage
  const loadApiKeys = useCallback(() => {
    if (typeof window !== 'undefined') {
      const keys = apiKeyUtils.loadApiKeys();
      setApiKeys(keys);
      setIsLoading(false);
    }
  }, []);

  // Save API keys to localStorage
  const saveApiKeys = useCallback((keys: ApiKeyConfig) => {
    apiKeyUtils.saveApiKeys(keys);
    setApiKeys(keys);
  }, []);

  // Remove a specific API key
  const removeApiKey = useCallback((provider: keyof ApiKeyConfig) => {
    apiKeyUtils.removeApiKey(provider);
    loadApiKeys(); // Reload to get updated state
  }, [loadApiKeys]);

  // Clear all API keys
  const clearAllApiKeys = useCallback(() => {
    apiKeyUtils.clearAllApiKeys();
    setApiKeys({});
  }, []);

  // Check if OpenRouter API key is configured
  const hasOpenRouterKey = useCallback((): boolean => {
    return apiKeyUtils.hasApiKey('openrouter');
  }, []);

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  // Listen for storage changes (when keys are updated in another tab/component)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'byok_api_keys') {
        loadApiKeys();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadApiKeys]);

  return {
    apiKeys,
    isLoading,
    saveApiKeys,
    removeApiKey,
    clearAllApiKeys,
    hasOpenRouterKey,
    refreshApiKeys: loadApiKeys,
  };
} 
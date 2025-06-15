"use client";

import React, { useState, useEffect } from 'react';
import { Palette, History, Brain, Key } from 'lucide-react';
import { SettingsTab, SettingsTabPanelProps } from '../../types/settings';
import { apiKeyUtils, ApiKeyConfig } from '../../utils/apiKeys';
import { useApiKeys } from '../../hooks/useApiKeys';

const tabs = [
  { id: 'customization', label: 'Customization', icon: Palette },
  { id: 'history', label: 'History & Sync', icon: History },
  { id: 'models', label: 'Models', icon: Brain },
  { id: 'api-keys', label: 'API Keys', icon: Key },
] as const;

export default function SettingsTabPanel({ activeTab, onTabChange }: SettingsTabPanelProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex border-b border-white/20 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as SettingsTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'customization' && <CustomizationContent />}
        {activeTab === 'history' && <HistoryContent />}
        {activeTab === 'models' && <ModelsContent />}
        {activeTab === 'api-keys' && <ApiKeysContent />}
      </div>
    </div>
  );
}

function CustomizationContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Customization</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            <button className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2"></div>
              <span className="text-xs text-white">Default</span>
            </button>
            <button className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-full h-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded mb-2"></div>
              <span className="text-xs text-white">Dark</span>
            </button>
            <button className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
              <div className="w-full h-8 bg-gradient-to-r from-white to-gray-100 rounded mb-2"></div>
              <span className="text-xs text-white">Light</span>
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">Chat Bubble Style</label>
          <select className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white">
            <option value="default">Default</option>
            <option value="minimal">Minimal</option>
            <option value="rounded">Rounded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Font Size</label>
          <input 
            type="range" 
            min="12" 
            max="20" 
            defaultValue="14"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

function HistoryContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">History & Sync</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
          <div>
            <h3 className="text-white font-medium">Auto-save conversations</h3>
            <p className="text-white/70 text-sm">Automatically save your chat history</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
          <div>
            <h3 className="text-white font-medium">Sync across devices</h3>
            <p className="text-white/70 text-sm">Keep conversations synced on all devices</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-4 bg-white/10 rounded-lg border border-white/20">
          <h3 className="text-white font-medium mb-3">Clear History</h3>
          <p className="text-white/70 text-sm mb-4">This will permanently delete all your conversation history.</p>
          <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-500/30">
            Clear All History
          </button>
        </div>
      </div>
    </div>
  );
}

function ModelsContent() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Models</h2>
      <div className="space-y-4">
        {[
          { name: 'GPT-4', description: 'Most capable model, best for complex tasks', status: 'active' },
          { name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most conversations', status: 'active' },
          { name: 'Claude', description: 'Great for analysis and writing tasks', status: 'inactive' },
          { name: 'Llama 2', description: 'Open source alternative', status: 'inactive' },
        ].map((model, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
            <div>
              <h3 className="text-white font-medium">{model.name}</h3>
              <p className="text-white/70 text-sm">{model.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs ${
                model.status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {model.status}
              </span>
              <button className="text-white/70 hover:text-white text-sm">Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiKeysContent() {
  const { apiKeys, saveApiKeys, removeApiKey, clearAllApiKeys } = useApiKeys();
  const [tempKeys, setTempKeys] = useState<ApiKeyConfig>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize temp keys when apiKeys change
  useEffect(() => {
    setTempKeys(apiKeys);
  }, [apiKeys]);

  const handleKeyChange = (provider: keyof ApiKeyConfig, value: string) => {
    setTempKeys(prev => ({ ...prev, [provider]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[provider]) {
      setValidationErrors(prev => ({ ...prev, [provider]: '' }));
    }
  };

  const handleSaveKey = (provider: keyof ApiKeyConfig) => {
    const key = tempKeys[provider];
    
    if (!key || !key.trim()) {
      // Remove the key if empty
      removeApiKey(provider);
      setValidationErrors(prev => ({ ...prev, [provider]: '' }));
      return;
    }

    if (!apiKeyUtils.validateApiKey(provider, key)) {
      let errorMessage = '';
      switch (provider) {
        case 'openrouter':
          errorMessage = 'Invalid OpenRouter API key format (should start with sk-or-)';
          break;
        case 'openai':
          errorMessage = 'Invalid OpenAI API key format (should start with sk-)';
          break;
        case 'gemini':
          errorMessage = 'Invalid Gemini API key format';
          break;
        default:
          errorMessage = 'Invalid API key format';
      }
      setValidationErrors(prev => ({ ...prev, [provider]: errorMessage }));
      return;
    }

    // Save the key
    saveApiKeys({ ...apiKeys, [provider]: key });
    setValidationErrors(prev => ({ ...prev, [provider]: '' }));
  };

  const handleRemoveKey = (provider: keyof ApiKeyConfig) => {
    removeApiKey(provider);
    setTempKeys(prev => ({ ...prev, [provider]: '' }));
    setValidationErrors(prev => ({ ...prev, [provider]: '' }));
  };

  const toggleShowKey = (provider: keyof ApiKeyConfig) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all your API keys? This action cannot be undone.')) {
      clearAllApiKeys();
      setTempKeys({});
      setValidationErrors({});
    }
  };

  const renderApiKeySection = (
    provider: keyof ApiKeyConfig,
    title: string,
    description: string,
    placeholder: string
  ) => {
    const hasKey = apiKeys[provider] && apiKeys[provider]!.trim();
    const currentValue = tempKeys[provider] || '';

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">{title}</h3>
            <p className="text-white/50 text-sm">{description}</p>
          </div>
          {hasKey && (
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-sm">✓ Configured</span>
              <button
                onClick={() => handleRemoveKey(provider)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type={showKeys[provider] ? "text" : "password"}
              value={hasKey && !showKeys[provider] ? apiKeyUtils.getMaskedApiKey(apiKeys[provider]!) : currentValue}
              onChange={(e) => handleKeyChange(provider, e.target.value)}
              onFocus={() => {
                if (hasKey) {
                  setTempKeys(prev => ({ ...prev, [provider]: apiKeys[provider] }));
                }
              }}
              placeholder={placeholder}
              className={`w-full p-3 bg-white/10 border rounded-lg text-white placeholder-white/50 pr-12 ${
                validationErrors[provider] ? 'border-red-500/50' : 'border-white/20'
              }`}
            />
            <button
              type="button"
              onClick={() => toggleShowKey(provider)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
            >
              {showKeys[provider] ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <button
            onClick={() => handleSaveKey(provider)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>

        {validationErrors[provider] && (
          <p className="text-red-400 text-sm">{validationErrors[provider]}</p>
        )}
      </div>
    );
  };

  const hasAnyKey = Object.values(apiKeys).some(key => key && key.trim());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">API Keys</h2>
        {hasAnyKey && (
          <button
            onClick={handleClearAll}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg transition-colors border border-red-500/30 text-sm"
          >
            Remove All Keys
          </button>
        )}
      </div>

      <div className="space-y-6">
        {renderApiKeySection(
          'openrouter',
          'OpenRouter API Key',
          'For access to multiple AI models via OpenRouter',
          'sk-or-...'
        )}

        {renderApiKeySection(
          'openai',
          'OpenAI API Key',
          'For direct access to OpenAI models including image generation',
          'sk-...'
        )}

        {renderApiKeySection(
          'gemini',
          'Gemini API Key',
          'For direct access to Google Gemini models',
          'AI...'
        )}

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <h4 className="text-amber-400 font-medium mb-2">🔒 Security Notice</h4>
          <ul className="text-amber-300/70 text-sm space-y-1">
            <li>• API keys are encrypted and stored locally in your browser</li>
            <li>• Keys are never sent to our servers - used directly with providers</li>
            <li>• Clearing browser data will remove stored keys</li>
            <li>• Never share your API keys with others</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-400 font-medium mb-2">💡 How it works</h4>
          <p className="text-blue-300/70 text-sm">
            When you provide API keys, requests are made directly to the respective providers using your keys. 
            This gives you full control over usage and billing, and provides access to all available models from each provider.
          </p>
        </div>
      </div>
    </div>
  );
} 
"use client";

import React from 'react';
import { Palette, History, Brain, Key } from 'lucide-react';
import { SettingsTab, SettingsTabPanelProps } from '../../types/settings';

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
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">API Keys</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-white font-medium mb-3">OpenAI API Key</h3>
          <div className="flex gap-3">
            <input
              type="password"
              placeholder="sk-..."
              className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
            />
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
              Save
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-white font-medium mb-3">Anthropic API Key</h3>
          <div className="flex gap-3">
            <input
              type="password"
              placeholder="sk-ant-..."
              className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
            />
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
              Save
            </button>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <h4 className="text-amber-400 font-medium mb-2">Security Notice</h4>
          <p className="text-amber-300/70 text-sm">
            API keys are encrypted and stored securely. Never share your API keys with others.
          </p>
        </div>
      </div>
    </div>
  );

} 
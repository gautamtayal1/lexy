import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import Image from 'next/image';

interface ModelDropdownProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const theme = useAppSelector((state) => state.theme.theme);

  const models = [
    { id: "openai/gpt-4.1-mini", name: "GPT-4.1", logo: "/openai.jpg", company: "OpenAI" },
    { id: "openai/o4-mini", name: "O4-mini", logo: "/openai.jpg", company: "OpenAI" },
    { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7", logo: "/claude.png", company: "Anthropic" },
    { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek", logo: "/deepseek.jpg", company: "DeepSeek" },
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3", logo: "/meta.png", company: "Meta" },
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0", logo: "/gemini.jpg", company: "Google" },
    { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5", logo: "/gemini.jpg", company: "Google" },
    { id: "openai/gpt-4o-2024-11-20", name: "GPT-4o", logo: "/openai.jpg", company: "OpenAI" },
    { id: "gpt-image-1", name: "GPT ImageGen", logo: "/openai.jpg", company: "OpenAI" },
    { id: "gemini-2.0-flash-preview-image-generation", name: "Gemini ImageGen", logo: "/gemini.jpg", company: "Google" },
  ];

  const selectedModelData = models.find(m => m.id === selectedModel);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-lg font-medium tracking-wide transition-colors ${
          theme === 'dark' 
            ? 'text-white hover:bg-white/10' 
            : 'text-black hover:bg-black/10'
        }`}
      >
        {selectedModelData?.logo && (
          <Image
            src={selectedModelData.logo}
            alt={selectedModelData.name}
            width={20}
            height={20}
            className="rounded-sm"
          />
        )}
        {selectedModelData?.name}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute bottom-full mb-2 right-0 w-64 backdrop-blur-xl rounded-lg shadow-lg border overflow-hidden ${
          theme === 'dark' 
            ? 'bg-slate-900 border-white/20' 
            : 'bg-white/90 border-black/20'
        }`}>
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
                theme === 'dark'
                  ? `text-white hover:bg-white/20 ${selectedModel === model.id ? 'bg-white/20' : ''}`
                  : `text-black hover:bg-black/10 ${selectedModel === model.id ? 'bg-black/10' : ''}`
              }`}
            >
              <div className="flex-shrink-0">
                {model.logo ? (
                  <Image
                    src={model.logo}
                    alt={model.name}
                    width={24}
                    height={24}
                    className="rounded-sm"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {model.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs truncate ${
                  theme === 'dark' ? 'text-white/60' : 'text-black/60'
                }`}>
                  {model.company}
                </div>
                <div className="text-sm font-medium tracking-wide truncate">
                  {model.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelDropdown;

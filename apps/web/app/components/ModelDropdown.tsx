import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ModelDropdownProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const models = [
    { id: "openai/gpt-4.1-mini", name: "GPT-4.1" },
    { id: "openai/o4-mini", name: "O4-mini" },
    { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7" },
    { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek" },
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3" },
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0" },
    { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5" },
    { id: "openai/gpt-4o-2024-11-20", name: "GPT-4o" },
    { id: "gpt-image-1", name: "ImageGen" },
  ];

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
        className="flex items-center gap-2 text-white rounded-lg px-3 py-1.5 text-lg font-medium tracking-wide hover:bg-white/10 transition-colors"
      >
        {models.find(m => m.id === selectedModel)?.name}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-48 bg-slate-900 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 overflow-hidden">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-medium tracking-wide text-white hover:bg-white/20 transition-colors ${
                selectedModel === model.id ? 'bg-white/20' : ''
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelDropdown;

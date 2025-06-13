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
    { id: "groq/llama-3.1-8b-instant", name: "Groq llama" },
    { id: "openai/gpt-4o", name: "GPT-4" },
    { id: "openai/gpt-3.5-turbo", name: "GPT-3.5" },
    { id: "anthropic/claude-3-5-sonnet-20240620", name: "Claude" },
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
        className="flex items-center gap-2 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
      >
        {models.find(m => m.id === selectedModel)?.name}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-48 bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 overflow-hidden">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors ${
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

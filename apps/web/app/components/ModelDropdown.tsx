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
        className={`group flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-base font-medium tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-slate-800/90 via-slate-700/50 to-slate-800/90 hover:from-slate-700/95 hover:via-slate-600/60 hover:to-slate-700/95 text-slate-200 border border-slate-500/50 hover:border-slate-400/70 shadow-md hover:shadow-slate-500/25' 
            : 'bg-gradient-to-r from-slate-200/95 via-slate-300/60 to-slate-200/95 hover:from-slate-300/95 hover:via-slate-400/70 hover:to-slate-300/95 text-slate-700 border border-slate-400/60 hover:border-slate-500/80 shadow-md hover:shadow-slate-500/25'
        } ${isOpen ? 'scale-105' : ''}`}
      >
        <div className="relative">
          {selectedModelData?.logo && (
            <Image
              src={selectedModelData.logo}
              alt={selectedModelData.name}
              width={20}
              height={20}
              className="rounded-md transition-transform duration-300 group-hover:rotate-3"
            />
          )}
          <div className={`absolute -inset-1 rounded-md transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          } ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-400/20'} blur-sm`}></div>
        </div>
        <span className="transition-all duration-300 group-hover:text-orange-300">
          {selectedModelData?.name}
        </span>
        <ChevronDown className={`h-4 w-4 transition-all duration-500 ease-out ${
          isOpen ? 'rotate-180 text-orange-400' : 'rotate-0'
        } group-hover:text-orange-400`} />
      </button>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Dropdown */}
      <div className={`absolute bottom-full mb-3 right-0 w-64 transform transition-all duration-500 ease-out ${
        isOpen 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}>
        <div className={`backdrop-blur-xl rounded-xl shadow-xl border-2 overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-orange-900/95 border-orange-500/30 shadow-orange-500/10' 
            : 'bg-gradient-to-br from-white/95 via-slate-100/95 to-orange-100/95 border-orange-400/30 shadow-orange-500/10'
        }`}>
          {/* Header */}
          <div className={`px-4 py-2.5 border-b ${
            theme === 'dark' ? 'border-orange-500/20' : 'border-orange-400/20'
          }`}>
            <h3 className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
            }`}>
              Select Model
            </h3>
          </div>

          {/* Models List */}
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {models.map((model, index) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`w-full text-left px-4 py-3 transition-all duration-300 flex items-center gap-3 group relative overflow-hidden ${
                  isOpen ? 'animate-slideInUp' : ''
                } ${
                  theme === 'dark'
                    ? `text-slate-200 hover:bg-gradient-to-r hover:from-slate-700/50 hover:via-orange-800/30 hover:to-slate-700/50 hover:shadow-md ${selectedModel === model.id ? 'bg-gradient-to-r from-slate-700/60 via-orange-800/40 to-slate-700/60 shadow-md' : ''}`
                    : `text-slate-700 hover:bg-gradient-to-r hover:from-slate-200/60 hover:via-orange-200/40 hover:to-slate-200/60 hover:shadow-md ${selectedModel === model.id ? 'bg-gradient-to-r from-slate-200/80 via-orange-200/50 to-slate-200/80 shadow-md' : ''}`
                }`}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-orange-600/10 to-slate-600/10' 
                    : 'bg-gradient-to-r from-orange-400/5 to-slate-400/5'
                }`}></div>

                {/* Logo */}
                <div className="relative flex-shrink-0 z-10">
                  {model.logo ? (
                    <div className="relative">
                      <Image
                        src={model.logo}
                        alt={model.name}
                        width={28}
                        height={28}
                        className="rounded-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-2"
                      />
                      <div className={`absolute -inset-1 rounded-md transition-opacity duration-300 group-hover:opacity-100 opacity-0 ${
                        theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-400/20'
                      } blur-sm`}></div>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-slate-600 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 shadow-md">
                      <span className="text-white text-sm font-bold">
                        {model.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 z-10">
                  <div className={`text-xs font-medium truncate transition-colors duration-300 ${
                    theme === 'dark' ? 'text-orange-300 group-hover:text-orange-200' : 'text-orange-600 group-hover:text-orange-700'
                  }`}>
                    {model.company}
                  </div>
                  <div className={`text-sm font-semibold tracking-wide truncate transition-colors duration-300 ${
                    theme === 'dark' ? 'group-hover:text-orange-200' : 'group-hover:text-orange-700'
                  }`}>
                    {model.name}
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedModel === model.id && (
                  <div className="flex-shrink-0 z-10">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  </div>
                )}

                {/* Hover line effect */}
                <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 group-hover:w-full w-0 ${
                  theme === 'dark' ? 'bg-gradient-to-r from-orange-400 to-slate-400' : 'bg-gradient-to-r from-orange-500 to-slate-500'
                }`}></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(255, 165, 0, 0.4)' : 'rgba(255, 165, 0, 0.5)'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(255, 165, 0, 0.6)' : 'rgba(255, 165, 0, 0.7)'};
        }
      `}</style>
    </div>
  );
};

export default ModelDropdown;

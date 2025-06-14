"use client";

import React from 'react';
import { ArrowBigUp, Sparkles } from 'lucide-react';
import { UploadButton } from '../../utils/uploadthing';
import ModelDropdown from '../ModelDropdown';
import { useAppSelector } from '../../store/hooks';

interface ChatControlsProps {
  isCreativeMode: boolean;
  onToggleCreativeMode: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onFileUpload: (files: any[]) => void;
  onFileUploadStart: (files: any[]) => void;
  onSubmit: () => void;
}

export default function ChatControls({
  isCreativeMode,
  onToggleCreativeMode,
  selectedModel,
  onModelChange,
  onFileUpload,
  onFileUploadStart,
  onSubmit
}: ChatControlsProps) {
  const theme = useAppSelector((state) => state.theme.theme);

  // Define button styles based on theme
  const buttonStyle = theme === 'dark' 
    ? {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '0.75rem',
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s',
        backdropFilter: 'blur(40px)',
      }
    : {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        color: 'black',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: '0.75rem',
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s',
        backdropFilter: 'blur(40px)',
      };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <button
          className={`border rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 backdrop-blur-xl flex items-center gap-2 ${
            theme === 'dark' 
              ? `bg-white/10 hover:bg-white/20 text-white border-white/20 ${isCreativeMode ? 'bg-white/20' : ''}`
              : `bg-black/10 hover:bg-black/20 text-black border-black/20 ${isCreativeMode ? 'bg-black/20' : ''}`
          }`}
          onClick={onToggleCreativeMode}
        >
          <Sparkles className="h-4 w-4" />
          Creative
        </button>
        
        <div className={`rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}>    
          <UploadButton
            endpoint="imageUploader"
            onUploadBegin={(name) => {
              // Create loading file object when upload starts
              const loadingFile = {
                name: name,
                isUploading: true,
                type: 'loading'
              };
              onFileUploadStart([loadingFile]);
            }}
            onClientUploadComplete={(res) => {
              onFileUpload(res);
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
            appearance={{
              button: buttonStyle,
              container: "flex items-center",
              allowedContent: "hidden"
            }}
            content={{
              button: "📎 Attach",
              allowedContent: ""
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <ModelDropdown selectedModel={selectedModel} onModelChange={onModelChange} />
        <button  
          className={`transition-all duration-200 p-3 rounded-xl ${
            theme === 'dark' 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-black/20 hover:bg-black/30 text-black'
          }`}
          onClick={onSubmit}
        >
          <ArrowBigUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 
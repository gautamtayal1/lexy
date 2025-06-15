"use client";

import React from 'react';
import { ArrowBigUp, Sparkles } from 'lucide-react';
import FileUpload from '../ui/FileUpload';
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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <button
          className={`border rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 backdrop-blur-xl flex items-center gap-2 ${
            theme === 'dark' 
              ? `bg-white/10 hover:bg-white/20 text-white border-white/20 ${isCreativeMode ? 'bg-white/20' : 'bg-pink-600'}`
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
          <FileUpload
            onUploadStart={(files) => {
              onFileUploadStart(files);
            }}
            onUploadComplete={(files) => {
              onFileUpload(files);
            }}
            onUploadError={(error) => {
              alert(`ERROR! ${error}`);
            }}
            maxFiles={5}
            maxFileSize={20}
            acceptedFileTypes={['image/*']}
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
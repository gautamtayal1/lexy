"use client";

import React from 'react';
import { ArrowBigUp, Sparkles } from 'lucide-react';
import { UploadButton } from '../../utils/uploadthing';
import ModelDropdown from '../ModelDropdown';

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
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <button className="text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-1 transition-colors">
          <button
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 backdrop-blur-xl flex items-center gap-2"
            onClick={onToggleCreativeMode}
          >
            <Sparkles className="h-4 w-4" />
            Creative
          </button>
        </button>
        
        <button className="text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 transition-colors">    
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
              button: "bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 backdrop-blur-xl",
              container: "flex items-center",
              allowedContent: "hidden"
            }}
            content={{
              button: "📎 Attach",
              allowedContent: ""
            }}
          />
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <ModelDropdown selectedModel={selectedModel} onModelChange={onModelChange} />
        <button  
          className="bg-white/20 hover:bg-white/30 text-white transition-all duration-200 p-3 rounded-xl" 
          onClick={onSubmit}
        >
          <ArrowBigUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 
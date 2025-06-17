"use client";

import React, { useRef } from 'react';
import { Sparkles, Paperclip, ArrowUp } from 'lucide-react';
import ModelDropdown from '../ModelDropdown';
import { useAppSelector } from '../../store/hooks';

interface ChatControlsProps {
  isCreativeMode: boolean;
  onToggleCreativeMode: () => void;
  isTheoMode: boolean;
  onToggleTheoMode: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onFileUpload: (files: any[]) => void;
  onFileUploadStart: (files: any[]) => void;
  onSubmit: () => void;
}

export default function ChatControls({
  isCreativeMode,
  onToggleCreativeMode,
  isTheoMode,
  onToggleTheoMode,
  selectedModel,
  onModelChange,
  onFileUpload,
  onFileUploadStart,
  onSubmit
}: ChatControlsProps) {
  const theme = useAppSelector((state) => state.theme.theme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (files.length > 5) {
      alert("You can only upload up to 5 files at once.");
      return;
    }

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 20MB.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an accepted file type.`);
        return;
      }
    }
    
    const loadingFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      isUploading: true,
    }));
    onFileUploadStart(loadingFiles);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      onFileUpload(result.files);

    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreativeToggle = () => {
    console.log('Creative mode before toggle:', isCreativeMode);
    onToggleCreativeMode();
    console.log('Creative mode after toggle:', !isCreativeMode);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={handleAttachClick}
          className={`p-2.5 rounded-3xl font-medium transition-colors ${
            theme === 'dark' 
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' 
              : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
          }`}
        >
          <Paperclip className="h-4 w-4" />
        </button>
        
        <button
          className={`px-3 py-2 rounded-3xl font-medium transition-colors flex items-center gap-2 text-sm ${
            isTheoMode
              ? theme === 'dark'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                : 'bg-blue-500/20 text-blue-700 border border-blue-400/50'
              : theme === 'dark' 
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
          }`}
          onClick={onToggleTheoMode}
        >
          <span>🧠</span>
          <span>Theo Mode</span>
        </button>
        
        <button
          className={`px-3 py-2 rounded-3xl font-medium transition-colors flex items-center gap-2 text-sm ${
            isCreativeMode
              ? theme === 'dark'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50'
                : 'bg-purple-500/20 text-purple-700 border border-purple-400/50'
              : theme === 'dark' 
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
          }`}
          onClick={handleCreativeToggle}
        >
          <Sparkles className="h-4 w-4" />
          <span>Creative</span>
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <ModelDropdown selectedModel={selectedModel} onModelChange={onModelChange} />
        <button  
          className={`p-3 rounded-3xl transition-colors ${
            theme === 'dark' 
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' 
              : 'bg-black/10 hover:bg-black/15 text-black border border-black/20'
          }`}
          onClick={onSubmit}
        >
          <ArrowUp className="h-4 w-4 " />
        </button>
      </div>
    </div>
  );
} 
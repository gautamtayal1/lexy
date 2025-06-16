"use client";

import React, { useRef } from 'react';
import { ArrowBigUp, Sparkles, Paperclip } from 'lucide-react';
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

    // Validate file count and size
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

    // Notify upload start
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
      // Reset the input
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
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Attach Button */}
        <button
          onClick={handleAttachClick}
          className={`group relative overflow-hidden rounded-4xl px-3 py-3 font-medium transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-slate-800/90 via-slate-700/40 to-slate-800/90 hover:from-slate-700/95 hover:via-slate-600/50 hover:to-slate-700/95 text-slate-300 border border-slate-500/50 hover:border-slate-400/70 shadow-md hover:shadow-slate-500/25' 
              : 'bg-gradient-to-r from-slate-200/95 via-slate-300/50 to-slate-200/95 hover:from-slate-300/95 hover:via-slate-400/60 hover:to-slate-300/95 text-slate-700 border border-slate-400/60 hover:border-slate-500/80 shadow-md hover:shadow-slate-500/25'
          }`}
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-slate-600/15 to-slate-500/15' 
              : 'bg-gradient-to-r from-slate-400/10 to-slate-500/10'
          }`}></div>
          <Paperclip className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
        </button>
        
        {/* Theo Mode Button */}
        <button
          className={`group relative overflow-hidden rounded-xl px-3 py-2.5 font-medium transition-all duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2 text-sm ${
            isTheoMode
              ? theme === 'dark'
                ? 'bg-gradient-to-r from-slate-700/90 via-slate-600/40 to-blue-800/50 text-white border border-slate-400/60 shadow-md shadow-slate-500/30'
                : 'bg-gradient-to-r from-slate-300/90 via-slate-400/50 to-blue-200/50 text-slate-800 border border-slate-500/70 shadow-md shadow-slate-500/30'
              : theme === 'dark' 
                ? 'bg-gradient-to-r from-slate-800/90 via-slate-700/40 to-slate-800/90 hover:from-slate-700/95 hover:via-slate-600/50 hover:to-blue-800/40 text-slate-200 border border-slate-600/70 hover:border-slate-400/60 shadow-md hover:shadow-slate-500/20'
                : 'bg-gradient-to-r from-slate-200/95 via-slate-300/50 to-slate-200/95 hover:from-slate-300/95 hover:via-slate-400/60 hover:to-blue-200/40 text-slate-700 border border-slate-400/70 hover:border-slate-500/70 shadow-md hover:shadow-slate-500/20'
          }`}
          onClick={onToggleTheoMode}
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            !isTheoMode && (theme === 'dark' 
              ? 'bg-gradient-to-r from-slate-600/15 to-blue-600/15' 
              : 'bg-gradient-to-r from-slate-400/10 to-blue-400/10')
          }`}></div>
          <span className="text-base relative z-10 transition-transform duration-300 group-hover:scale-110">🧠</span>
          <span className="relative z-10 tracking-wide">Theo Mode</span>
        </button>
        
        {/* Creative Mode Button */}
        <button
          className={`group relative overflow-hidden rounded-xl px-3 py-3 font-medium transition-all duration-300 ease-out hover:scale-105 active:scale-95 flex items-center gap-2 text-sm ${
            isCreativeMode
              ? theme === 'dark'
                ? 'bg-gradient-to-r from-purple-600/90 via-pink-700/80 to-purple-700/90 text-white border-2 border-purple-400/80 shadow-lg shadow-purple-500/40'
                : 'bg-gradient-to-r from-purple-400/90 via-pink-300/80 to-purple-500/90 text-white border-2 border-purple-600/80 shadow-lg shadow-purple-500/40'
              : theme === 'dark' 
                ? 'bg-gradient-to-r from-slate-800/90 via-slate-700/40 to-slate-800/90 hover:from-slate-700/95 hover:via-slate-600/50 hover:to-purple-800/40 text-slate-200 border border-slate-600/70 hover:border-purple-400/60 shadow-md hover:shadow-purple-500/20'
                : 'bg-gradient-to-r from-slate-200/95 via-slate-300/50 to-slate-200/95 hover:from-slate-300/95 hover:via-slate-400/60 hover:to-purple-200/40 text-slate-700 border border-slate-400/70 hover:border-purple-400/70 shadow-md hover:shadow-purple-500/20'
          }`}
          onClick={handleCreativeToggle}
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            !isCreativeMode && (theme === 'dark' 
              ? 'bg-gradient-to-r from-slate-600/15 to-purple-600/15' 
              : 'bg-gradient-to-r from-slate-400/10 to-purple-400/10')
          }`}></div>
          <Sparkles className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:scale-110" />
          <span className="relative z-10 tracking-wide">Creative</span>
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <ModelDropdown selectedModel={selectedModel} onModelChange={onModelChange} />
        <button  
          className={`group relative overflow-hidden transition-all duration-300 ease-out px-4 py-3 rounded-xl hover:scale-105 active:scale-95 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-slate-800/90 via-slate-700/50 to-slate-800/90 hover:from-slate-700/95 hover:via-slate-600/60 hover:to-emerald-800/40 text-slate-200 border border-slate-500/50 hover:border-slate-400/70 shadow-md hover:shadow-slate-500/25' 
              : 'bg-gradient-to-r from-slate-200/95 via-slate-300/60 to-slate-200/95 hover:from-slate-300/95 hover:via-slate-400/70 hover:to-emerald-200/40 text-slate-700 border border-slate-400/60 hover:border-slate-500/80 shadow-md hover:shadow-slate-500/25'
          }`}
          onClick={onSubmit}
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-slate-600/15 to-emerald-600/15' 
              : 'bg-gradient-to-r from-slate-400/10 to-emerald-400/10'
          }`}></div>
          <ArrowBigUp className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
} 
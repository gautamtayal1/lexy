"use client"

import React from 'react';
import { ArrowBigUp, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedModel, setIsCreativeMode, addAttachedFile, removeAttachedFile, AttachedFile } from '../store/chatSlice';
import { UploadButton } from '../utils/uploadthing';
import ModelDropdown from './ModelDropdown';

interface ChatControlsProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: React.FormEvent) => void;
  placeholder?: string;
}

const ChatControls = ({ 
  input, 
  onInputChange, 
  onSubmit, 
  placeholder = "Type your message..."
}: ChatControlsProps) => {
  const dispatch = useAppDispatch();
  const { selectedModel, isCreativeMode, attachedFiles } = useAppSelector((state) => state.chat);

  const handleModelChange = (model: string) => {
    dispatch(setSelectedModel(model));
  };

  const handleToggleCreativeMode = () => {
    dispatch(setIsCreativeMode(!isCreativeMode));
  };

  const handleFileUploadStart = (files: any[]) => {
    // Add loading file to preview immediately
    files.forEach(file => {
      const attachedFile: AttachedFile = {
        id: crypto.randomUUID(),
        name: file.name || file,
        size: 0,
        type: 'loading',
      };
      dispatch(addAttachedFile(attachedFile));
    });
  };

  const handleFileUpload = (files: any[]) => {
    // Replace loading files with actual uploaded files
    files.forEach(file => {
      const attachedFile: AttachedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
      };
      dispatch(addAttachedFile(attachedFile));
    });
  };

  const handleRemoveFile = (fileId: string) => {
    dispatch(removeAttachedFile(fileId));
  };

  return (
    <div className="backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-3 transition-all duration-300 ease-in-out">
      {/* File Preview */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map(file => (
            <div key={file.id} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1 text-sm text-white border border-white/20">
              <span className="truncate max-w-32">{file.name}</span>
              <button 
                onClick={() => handleRemoveFile(file.id)}
                className="hover:text-red-300 transition-colors text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area - Exact copy from ChatInput */}
      <div className="relative mb-2">
        <textarea
          value={input}
          onChange={(e) => {
            onInputChange(e);
            // Auto-resize textarea
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          placeholder={placeholder}
          className="w-full text-white placeholder-white/50 rounded-xl py-2 px-4 pr-12 text-base focus:outline-none resize-none overflow-hidden min-h-[48px]"
          rows={1}
          style={{ 
            minHeight: '48px',
            maxHeight: '240px'
          }}
        />
      </div>

      {/* Controls Row - Exact copy from ChatControls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            className={`bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 backdrop-blur-xl flex items-center gap-2 ${isCreativeMode ? 'bg-white/20' : ''}`}
            onClick={handleToggleCreativeMode}
          >
            <Sparkles className="h-4 w-4" />
            Creative
          </button>
          
          <button className="text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 transition-colors">    
            <UploadButton
              endpoint="imageUploader"
              onUploadBegin={(name) => {
                handleFileUploadStart([name]);
              }}
              onClientUploadComplete={(res) => {
                handleFileUpload(res);
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
          <ModelDropdown selectedModel={selectedModel} onModelChange={handleModelChange} />
          <button  
            className="bg-white/20 hover:bg-white/30 text-white transition-all duration-200 p-3 rounded-xl" 
            onClick={onSubmit}
          >
            <ArrowBigUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatControls; 
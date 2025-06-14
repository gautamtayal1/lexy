"use client";

import React from 'react';

interface UploadedFile {
  name: string;
  type?: string;
  url?: string;
  serverData?: {
    fileUrl: string;
  };
}

interface FilePreviewProps {
  uploadedFiles: UploadedFile[];
  onRemoveFile: (index: number) => void;
}

export default function FilePreview({ uploadedFiles, onRemoveFile }: FilePreviewProps) {
  if (uploadedFiles.length === 0) return null;

  return (
    <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-wrap gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
        {uploadedFiles.map((uploadedFile, index) => (
          <div 
            key={index}
            className="relative group animate-in fade-in-0 zoom-in-95 duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative bg-white/10 rounded-xl border border-white/20 p-2 hover:bg-white/20 transition-all duration-200">
              {uploadedFile.type?.startsWith('image/') ? (
                <img 
                  src={uploadedFile.serverData?.fileUrl || uploadedFile.url} 
                  alt={uploadedFile.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-white/10">
                  <span className="text-white text-xs font-medium">
                    {uploadedFile.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => onRemoveFile(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
            
            <p className="text-xs text-white/70 mt-1 text-center truncate max-w-16">
              {uploadedFile.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 
"use client";

import React from 'react';
import MessageList from './MessageList';
import FilePreview from './FilePreview';
import ChatInput from './ChatInput';
import ChatControls from './ChatControls';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  createdAt?: Date;
  messageId?: string;
}

interface UploadedFile {
  name: string;
  type?: string;
  url?: string;
  serverData?: {
    fileUrl: string;
  };
  isUploading?: boolean;
}

interface ChatContainerProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (index: number) => void;
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isCreativeMode: boolean;
  onToggleCreativeMode: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onFileUpload: (files: any[]) => void;
  onFileUploadStart: (files: any[]) => void;
  onQuote: (text: string) => void;
}

export default function ChatContainer({
  messages,
  messagesEndRef,
  uploadedFiles,
  onRemoveFile,
  input,
  onInputChange,
  onSubmit,
  isCreativeMode,
  onToggleCreativeMode,
  selectedModel,
  onModelChange,
  onFileUpload,
  onFileUploadStart,
  onQuote,
}: ChatContainerProps) {
  return (
    <>
      <MessageList messages={messages} messagesEndRef={messagesEndRef} onQuote={onQuote} />
      
      <div className="w-[95%] max-w-4xl mx-auto mb-6">
        <div className="backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-3 transition-all duration-300 ease-in-out">
          <FilePreview uploadedFiles={uploadedFiles} onRemoveFile={onRemoveFile} />
          
          <ChatInput 
            input={input} 
            onInputChange={onInputChange} 
            onSubmit={onSubmit} 
          />
          
          <ChatControls
            isCreativeMode={isCreativeMode}
            onToggleCreativeMode={onToggleCreativeMode}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            onFileUpload={onFileUpload}
            onFileUploadStart={onFileUploadStart}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </>
  );
} 
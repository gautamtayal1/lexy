"use client";

import React from 'react';

interface ChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

export default function ChatInput({ input, onInputChange, onSubmit }: ChatInputProps) {
  return (
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
        placeholder="Type your message..."
        className="w-full text-white placeholder-white/50 rounded-xl py-2 px-4 pr-12 text-base focus:outline-none resize-none overflow-hidden min-h-[48px]"
        rows={1}
        style={{ 
          minHeight: '48px',
          maxHeight: '240px'
        }}
      />
    </div>
  );
} 
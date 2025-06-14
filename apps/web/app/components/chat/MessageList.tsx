"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MessageFormatter from '../MessageFormatter';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  createdAt?: Date;
  messageId?: string;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function MessageList({ messages, messagesEndRef }: MessageListProps) {
  const [expandedReasonings, setExpandedReasonings] = useState<Record<string, boolean>>({});

  const toggleReasoning = (messageId: string) => {
    setExpandedReasonings(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-[95%] max-w-4xl mx-auto py-8">
        {messages.map(message => (
          <div key={message.id || message.messageId} className="space-y-2">
            {message.role === 'assistant' && message.reasoning && (
              <div className="mb-2">
                <button
                  onClick={() => toggleReasoning(message.id || message.messageId || '')}
                  className="flex items-center gap-2 text-white/70 hover:text-white text-base transition-colors"
                >
                  {expandedReasonings[message.id || message.messageId || ''] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                  Show Reasoning
                </button>
                {expandedReasonings[message.id || message.messageId || ''] && (
                  <div className="mt-3 p-4 bg-white/5 rounded-lg text-white/80 text-base leading-relaxed">
                    {message.reasoning}
                  </div>
                )}
              </div>
            )}
            <div 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-2xl px-6 py-3 text-white text-base leading-relaxed ${
                  message.role === 'user' 
                    ? 'bg-white/10 max-w-[70%]' 
                    : 'w-full'
                }`}
              >
                {message.role === 'assistant' ? (
                  <MessageFormatter content={message.content} />
                ) : (
                  message.content
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 
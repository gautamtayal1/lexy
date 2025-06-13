"use client"

import React, { useState, useRef, useEffect } from 'react';
import { ArrowBigUp, FileUp, Menu, ChevronDown, ChevronUp } from "lucide-react";
import { useChat } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useChatContext } from '../context/ChatContext';

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatArea = ({ isSidebarOpen, onToggleSidebar }: ChatAreaProps) => {
  const [expandedReasonings, setExpandedReasonings] = useState<Record<string, boolean>>({});
  const [selectedModel, setSelectedModel] = useState("groq/llama-3.1-8b-instant");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const { question } = useChatContext();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    setInput
  } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      userId: user?.id,
      threadId: pathname.split('/')[2],
      modelParams: {
        temperature: 0.5,
      },
    }
  })

  useEffect(() => {
    console.log('ChatArea useEffect running:', { isInitialized, question });
    if (!isInitialized) {
      if (question) {
        append({ role: 'user', content: question })
        setIsInitialized(true);
      }
    }
  }, [isInitialized, question]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      scrollToBottom();
    }
  }, [messages]);

  const toggleReasoning = (messageId: string) => {
    setExpandedReasonings(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  return (
    <div className={`fixed top-8 right-8 h-[calc(100vh-4rem)] backdrop-blur-xl shadow rounded-2xl border border-white/20 bg-white/5 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'left-[24rem]' : 'left-8'}`}>
      {!isSidebarOpen && (
        <button 
          onClick={onToggleSidebar}
          className="absolute -left-12 top-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="w-[95%] max-w-4xl mx-auto space-y-8 py-8">
          {messages.map(message => (
            <div key={message.id} className="space-y-3">
              {message.role === 'assistant' && message.reasoning && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleReasoning(message.id)}
                    className="flex items-center gap-2 text-white/70 hover:text-white text-base transition-colors"
                  >
                    {expandedReasonings[message.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                    Show Reasoning
                  </button>
                  {expandedReasonings[message.id] && (
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
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-[95%] max-w-4xl mx-auto mb-6">
        <div className="backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-3">
          <div className="relative mb-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="w-full text-white placeholder-white/50 rounded-xl py-4 px-5 pr-14 text-base focus:outline-none"
            />
            <button  
              className="absolute right-0 top-0 h-full px-5 text-white hover:text-white/80 transition-colors" 
              onClick={handleSubmit}
            >
              <ArrowBigUp className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={selectedModel}
              onChange={handleModelChange}
              className="text-white rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="groq/llama-3.1-8b-instant">Groq</option>
              <option value="openai/gpt-4o">GPT-4</option>
              <option value="openai/gpt-3.5-turbo">GPT-3.5</option>
              <option value="anthropic/claude-3-5-sonnet-20240620">Claude</option>
            </select>
            <button className="text-white rounded-lg px-4 py-2 text-base flex items-center gap-2 transition-colors">
              <FileUp className="h-5 w-5" />    
              Attach PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

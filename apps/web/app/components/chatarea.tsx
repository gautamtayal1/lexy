"use client"

import React from 'react';
import { ArrowBigUp, FileUp, Menu } from "lucide-react";
import { useChat } from '@ai-sdk/react';

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatArea = ({ isSidebarOpen, onToggleSidebar }: ChatAreaProps) => {

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: "/api/chat",
    experimental_throttle: 50,
    
    body: {
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      userId: "123",
      threadId: "demo thread",
      modelParams: {
        temperature: 0.5,
      },
    }
  })

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
        <div className="w-[90%] max-w-3xl mx-auto space-y-6 py-6">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-2xl px-4 py-2 text-white ${
                  message.role === 'user' 
                    ? 'bg-white/10 max-w-[70%]' 
                    : 'w-full'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[90%] max-w-3xl mx-auto mb-8">
        <div className="backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-4">
          <div className="flex items-center gap-4 mb-4">
            <select 
              className="text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5">GPT-3.5</option>
              <option value="claude">Claude</option>
            </select>
            <button className="text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 transition-colors">
              <FileUp className="h-4 w-4" />    
              Attach PDF
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="w-full text-white placeholder-white/50 rounded-xl py-3 px-4 pr-12 focus:outline-none"
            />
            <button  
              className="absolute right-0 top-0 h-full px-4 text-white hover:text-white/80 transition-colors" 
              onClick={handleSubmit}
            >
              <ArrowBigUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

"use client"

import React, { useState } from 'react';
import { ArrowBigUp, FileUp, Menu } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useChatContext } from '../context/ChatContext';

interface HomePageProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const HomePage = ({ isSidebarOpen, onToggleSidebar }: HomePageProps) => {
  const [input, setInput] = useState("");
  const router = useRouter();
  const { setQuestion } = useChatContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setQuestion(input);
    const id = crypto.randomUUID();
    router.push(`/chat/${id}`);
  };

  const handleQuestionClick = (question: string) => {
    const id = crypto.randomUUID();
    setQuestion(question);
    router.push(`/chat/${id}`);
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
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <h2 
              onClick={() => handleQuestionClick("What would you like to know about?")}
              className="text-xl text-white cursor-pointer hover:text-white/80 transition-colors"
            >
              What would you like to know about?
            </h2>
            <h2 
              onClick={() => handleQuestionClick("How can I help you today?")}
              className="text-xl text-white cursor-pointer hover:text-white/80 transition-colors"
            >
              How can I help you today?
            </h2>
            <h2 
              onClick={() => handleQuestionClick("What's on your mind?")}
              className="text-xl text-white cursor-pointer hover:text-white/80 transition-colors"
            >
              What's on your mind?
            </h2>
            <h2 
              onClick={() => handleQuestionClick("What can I assist you with?")}
              className="text-xl text-white cursor-pointer hover:text-white/80 transition-colors"
            >
              What can I assist you with?
            </h2>
          </div>
        </div>
      </div>

      <div className="w-[95%] max-w-4xl mx-auto mb-6">
        <div className="backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-3">
          <div className="relative mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
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

export default HomePage;

"use client"

import React, { useState } from 'react';
import { Menu } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setQuestion } from '../store/chatSlice';
import ChatControls from './ChatControls';

interface HomePageProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const HomePage = ({ isSidebarOpen, onToggleSidebar }: HomePageProps) => {
  const [input, setInput] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    dispatch(setQuestion(input));
    const id = crypto.randomUUID();
    router.push(`/chat/${id}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleQuestionClick = (question: string) => {
    const id = crypto.randomUUID();
    dispatch(setQuestion(question));
    router.push(`/chat/${id}`);
  };

  const questions = [
    "Explain quantum computing like I'm 5 years old",
    "Help me design a cool logo for my startup",
    "What's the future of AI and should I be worried?",
    "Build a simple game in JavaScript with me"
  ];

  return (
    <div className={`fixed top-8 right-8 h-[calc(100vh-4rem)] backdrop-blur-xl shadow-2xl rounded-3xl border flex flex-col transition-all duration-300 ${
      isSidebarOpen ? 'left-[24rem]' : 'left-8'
    } ${
      theme === 'dark' 
        ? 'border-white/20 bg-white/5' 
        : 'border-black/20 bg-black/5'
    }`}>
      {!isSidebarOpen && (
        <button 
          onClick={onToggleSidebar}
          className={`absolute -left-12 top-4 p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
            theme === 'dark' 
              ? 'hover:bg-white/20 text-white' 
              : 'hover:bg-black/10 text-black'
          }`}
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 text-center ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            Ask me anything
          </h1>
          
          <div className="space-y-4 mb-8">
            {questions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className={`w-full p-4 text-left rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/15 text-white'
                    : 'bg-black/10 hover:bg-black/15 text-black'
                }`}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[95%] max-w-4xl mx-auto mb-6">
        <ChatControls
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          placeholder="Ask me anything..."
        />
      </div>
    </div>
  );
};

export default HomePage;
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

  const suggestedQuestions = [
    "Explain the difference between REST and GraphQL in simple terms.",
    "Give me quick productivity tips for remote work.",
    "Write a haiku about sidewalks after rain.",
    "Summarise 'The Pragmatic Programmer' in 3 bullet-points."
  ];

  return (
    <div className={`fixed top-8 right-8 h-[calc(100vh-4rem)] overflow-hidden shadow rounded-2xl border border-white/20 bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#0e1025] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'left-[24rem]' : 'left-8'}`}>
      {!isSidebarOpen && (
        <button 
          onClick={onToggleSidebar}
          className="absolute -left-12 top-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="w-[95%] max-w-4xl mx-auto py-12 flex flex-col gap-12 items-center">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-200 text-5xl font-extrabold tracking-tight drop-shadow-md">
              Your AI Sidekick
            </h1>
            <p className="text-white/80 max-w-xl mx-auto text-lg">
              Ask anything, brainstorm ideas, or get instant explanations — all in one minimal chat.
            </p>
          </div>

          {/* Quick suggestions */}
          <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="bg-white/10 hover:bg-white/20 transition-colors backdrop-blur rounded-xl p-4 text-left text-white text-sm md:text-base shadow border border-white/20"
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
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default HomePage;

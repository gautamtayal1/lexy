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
    "What are the key differences between React and Vue.js?",
    "How can I implement authentication in a Next.js application?",
    "What are the best practices for state management in React?",
    "How do I optimize performance in a React application?"
  ];

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
            {suggestedQuestions.map((question, index) => (
              <h2 
                key={index}
                onClick={() => handleQuestionClick(question)}
                className="text-xl text-white cursor-pointer hover:text-white/80 transition-colors"
              >
                {question}
              </h2>
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

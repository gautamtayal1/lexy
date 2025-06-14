"use client"

import React, { useState } from 'react';
import { Menu, Sparkles, Brain, Palette, Globe, GamepadIcon } from "lucide-react";
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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

  const suggestedQuestions = [
    {
      question: "Explain quantum computing like I'm 5 years old",
      icon: Brain,
      gradient: "from-cyan-500 to-blue-600",
      shortTitle: "Quantum Computing",
      emoji: "🧠"
    },
    {
      question: "Help me design a cool logo for my startup",
      icon: Palette,
      gradient: "from-pink-500 to-rose-600",
      shortTitle: "Creative Design",
      emoji: "🎨"
    },
    {
      question: "What's the future of AI and should I be worried?",
      icon: Globe,
      gradient: "from-emerald-500 to-teal-600",
      shortTitle: "AI Future",
      emoji: "🤖"
    },
    {
      question: "Build a simple game in JavaScript with me",
      icon: GamepadIcon,
      gradient: "from-purple-500 to-indigo-600",
      shortTitle: "Code a Game",
      emoji: "🎮"
    }
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

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Question Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 justify-items-center">
            {suggestedQuestions.map((item, index) => {
              const IconComponent = item.icon;
              const isHovered = hoveredCard === index;
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleQuestionClick(item.question)}
                  className={`group relative cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 w-full max-w-md ${
                    isHovered ? 'z-10' : ''
                  }`}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 rounded-2xl transition-opacity duration-300 ${
                    isHovered ? 'opacity-30' : ''
                  }`} />
                  
                  {/* Card Content */}
                  <div className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'border-white/20 bg-white/10 hover:bg-white/15' 
                      : 'border-black/20 bg-black/10 hover:bg-black/15'
                  } ${isHovered ? 'shadow-2xl' : 'shadow-lg'}`}>
                    
                    {/* Icon and Emoji */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-white/20 group-hover:bg-white/30' 
                          : 'bg-black/20 group-hover:bg-black/30'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`} />
                      </div>
                      <span className="text-2xl animate-bounce">{item.emoji}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-3 text-center ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                      {item.shortTitle}
                    </h3>
                    
                    {/* Description */}
                    <p className={`text-sm leading-relaxed text-center ${
                      theme === 'dark' ? 'text-white/70' : 'text-black/70'
                    }`}>
                      {item.question}
                    </p>
                    
                    {/* Hover Arrow */}
                    <div className={`mt-4 flex items-center justify-center gap-2 transition-transform duration-300 ${
                      isHovered ? 'translate-x-2' : ''
                    }`}>
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white/80' : 'text-black/80'
                      }`}>
                        Ask me
                      </span>
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                  
                  {/* Floating particles effect */}
                  {isHovered && (
                    <div className="absolute -inset-2 pointer-events-none">
                      <div className={`absolute top-2 right-2 w-2 h-2 ${
                        theme === 'dark' ? 'bg-white' : 'bg-black'
                      } rounded-full opacity-60 animate-ping`} />
                      <div className={`absolute bottom-4 left-4 w-1 h-1 ${
                        theme === 'dark' ? 'bg-white' : 'bg-black'
                      } rounded-full opacity-40 animate-pulse`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          
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

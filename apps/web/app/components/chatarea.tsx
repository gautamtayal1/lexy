"use client"

import React, { useState } from 'react';

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatArea = ({ isSidebarOpen, onToggleSidebar }: ChatAreaProps) => {
  const [message, setMessage] = useState('');

  return (
    <div className={`fixed top-8 right-8 h-[calc(100vh-4rem)] bg-white/30 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'left-[24rem]' : 'left-8'}`}>
      {/* Toggle Sidebar Button - Only visible when sidebar is closed */}
      {!isSidebarOpen && (
        <button 
          onClick={onToggleSidebar}
          className="absolute -left-12 top-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[80%] mx-auto space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="bg-white/20 p-4 rounded-lg max-w-[80%] self-start">
              <p className="text-sm text-white">Hello! How can I help you today?</p>
              <p className="text-xs text-white/70 mt-2">2:30 PM</p>
            </div>
            <div className="bg-white/40 p-4 rounded-lg max-w-[80%] self-end">
              <p className="text-sm text-white">I have a question about the project.</p>
              <p className="text-xs text-white/70 mt-2">2:31 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="max-w-[80%] mx-auto">
          {/* Model Selection */}
          <div className="flex items-center gap-4 mb-4">
            <select className="bg-white/20 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5">GPT-3.5</option>
              <option value="claude">Claude</option>
            </select>
            <button className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
              Attach PDF
            </button>
          </div>

          {/* Message Input */}
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-white/20 text-white placeholder-white/50 rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button className="absolute right-0 top-0 h-full px-4 text-white hover:text-white/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

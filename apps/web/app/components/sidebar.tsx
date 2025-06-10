"use client"

import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  return (
    <div className={`fixed top-8 h-[calc(100vh-4rem)] w-80 bg-white/20 backdrop-blur-xl shadow-lg rounded-2xl border border-white/10 flex flex-col transition-all duration-300 ${isOpen ? 'left-8' : '-left-80'}`}>
      {/* Logo Area */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="h-12 w-12 bg-white/30 rounded-lg flex items-center justify-center">
          <span className="text-xl font-bold text-white">AI</span>
        </div>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-white/10">
        <button className="w-full bg-white/30 hover:bg-white/40 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Search Box */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full bg-white/20 text-white placeholder-white/50 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-white/50" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-sm font-medium text-white/70 mb-3">Recent Chats</h2>
        <div className="space-y-2">
          <div className="p-3 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
            <p className="text-sm font-medium text-white">Project Discussion</p>
            <p className="text-xs text-white/70">Last message: 2 hours ago</p>
          </div>
          <div className="p-3 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
            <p className="text-sm font-medium text-white">Code Review</p>
            <p className="text-xs text-white/70">Last message: 1 day ago</p>
          </div>
          <div className="p-3 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
            <p className="text-sm font-medium text-white">API Integration</p>
            <p className="text-xs text-white/70">Last message: 2 days ago</p>
          </div>
        </div>
      </div>

      {/* User Account */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center">
            <span className="text-sm font-medium text-white">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-white/70">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

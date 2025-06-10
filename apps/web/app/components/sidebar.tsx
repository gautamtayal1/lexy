"use client"

import React from 'react';
import { SignInButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from 'convex/react';
import { MenuIcon, PlusIcon } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user } = useUser();

  return (
    <div className={`fixed top-8 h-[calc(100vh-4rem)] w-80 bg-white/5 backdrop-blur-xl shadow-lg rounded-2xl border border-white/10 flex flex-col transition-all duration-300 ${isOpen ? 'left-8' : '-left-80'}`}>
      {/* Logo Area */}
      <div className="p-4 flex items-center justify-between">
        <div className="h-12 w-12 bg-white/30 rounded-lg flex items-center justify-center">
          <span className="text-xl font-bold text-white">lx</span>
        </div>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <MenuIcon className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button className="w-full bg-white/30 hover:bg-white/40 text-white font-medium py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
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
      <Unauthenticated>
        <div className="p-4 flex flex-col items-center justify-center">
          <SignInButton />
          <SignOutButton />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-sm font-medium text-white">{user?.firstName?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
              <SignOutButton />
            </div>
          </div>
        </div>
      </Authenticated>
      <div className="p-4">
        <UserButton />
      </div>
    </div>
  );
};

export default Sidebar;

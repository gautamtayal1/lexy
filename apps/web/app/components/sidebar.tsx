"use client"

import React from 'react';
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { Authenticated, Unauthenticated, useQuery } from 'convex/react';
import { MenuIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@repo/db/convex/_generated/api';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user } = useUser();
  const router = useRouter();
  const threads = useQuery(api.threads.getThread, {
    userId: user?.id || ""
  });

  const handleNewChat = () => {
    router.push('/');
  };

  const handleThreadClick = (threadId: string) => {
    router.push(`/chat/${threadId}`);
  };

  return (
    <div className={`fixed top-8 h-[calc(100vh-4rem)] w-80 bg-white/5 backdrop-blur-xl shadow-lg rounded-2xl border border-white/10 flex flex-col transition-all duration-300 ${isOpen ? 'left-8' : '-left-80'}`}>
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

      <div className="p-4">
        <button 
          onClick={handleNewChat}
          className="w-full bg-white/30 hover:bg-white/40 text-white font-medium py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-sm font-medium text-white/70 mb-3">Recent Chats</h2>
        <div>
          {threads?.slice().reverse().map((thread) => (
            <div 
              key={thread.threadId}
              onClick={() => handleThreadClick(thread.threadId)}
              className="p-3 hover:bg-white/20 rounded-lg cursor-pointer transition-colors"
            >
              <p className="text-sm font-medium text-white">{thread.title}</p>
            </div>
          ))}
        </div>
      </div>

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
    </div>
  );
};

export default Sidebar;

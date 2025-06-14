"use client"

import React from 'react';
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { Authenticated, Unauthenticated, useQuery } from 'convex/react';
import { MenuIcon, PlusIcon, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@repo/db/convex/_generated/api';
import { useAppSelector } from '../store/hooks';
import ThemeToggle from './ThemeToggle';

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
  const theme = useAppSelector((state) => state.theme.theme);

  const handleNewChat = () => {
    router.push('/');
  };

  const handleThreadClick = (threadId: string) => {
    router.push(`/chat/${threadId}`);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  return (
    <div className={`fixed top-8 h-[calc(100vh-4rem)] w-80 backdrop-blur-xl shadow-lg rounded-2xl border flex flex-col transition-all duration-300 ${
      isOpen ? 'left-8' : '-left-80'
    } ${
      theme === 'dark' 
        ? 'bg-white/5 border-white/10' 
        : 'bg-black/5 border-black/10'
    }`}>
      <div className="p-4 flex items-center justify-between">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
          theme === 'dark' ? 'bg-white/30' : 'bg-black/20'
        }`}>
          <span className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>lx</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-white/20 text-white' 
                : 'hover:bg-black/10 text-black'
            }`}
          >
            <MenuIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={handleNewChat}
          className={`w-full font-medium py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2 ${
            theme === 'dark' 
              ? 'bg-white/30 hover:bg-white/40 text-white' 
              : 'bg-black/20 hover:bg-black/30 text-black'
          }`}
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className={`text-sm font-medium mb-3 ${
          theme === 'dark' ? 'text-white/70' : 'text-black/70'
        }`}>Recent Chats</h2>
        <div>
          {threads?.slice().reverse().map((thread) => (
            <div 
              key={thread.threadId}
              onClick={() => handleThreadClick(thread.threadId)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-white/20' 
                  : 'hover:bg-black/10'
              }`}
            >
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>{thread.title}</p>
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
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-white/30' : 'bg-black/20'
            }`}>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>{user?.firstName?.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>{user?.firstName} {user?.lastName}</p>
                <button 
                  onClick={handleSettingsClick}
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-white/20' 
                      : 'hover:bg-black/10'
                  }`}
                >
                  <Settings className={`w-4 h-4 transition-colors ${
                    theme === 'dark' 
                      ? 'text-white/70 hover:text-white' 
                      : 'text-black/70 hover:text-black'
                  }`} />
                </button>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </Authenticated>
    </div>
  );
};

export default Sidebar;

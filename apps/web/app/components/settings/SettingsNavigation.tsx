"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function SettingsNavigation() {
  const router = useRouter();

  const handleBackToChat = () => {
    router.push('/');
  };

  return (
    <>
      {/* Back to Chat Button - Left Side */}
      <button
        onClick={handleBackToChat}
        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Chat</span>
      </button>

      {/* Sign Out Button - Right Side */}
      <SignOutButton>
        <button className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </SignOutButton>
    </>
  );
} 
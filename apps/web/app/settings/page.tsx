"use client";

import React, { useState } from 'react';
import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInButton } from '@clerk/nextjs';
import UserProfilePanel from '@/app/components/settings/UserProfilePanel';
import SettingsTabPanel from '@/app/components/settings/SettingsTabPanel';
import SettingsNavigation from '@/app/components/settings/SettingsNavigation';
import { SettingsTab } from '@/app/types/settings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('customization');

  return (
    <div className="min-h-screen bg-gradient-to-br relative">
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20">
            <h1 className="text-2xl font-bold text-white mb-4">Please sign in to access settings</h1>
            <SignInButton mode="modal">
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>

        <Authenticated>
          <div className="fixed top-0 left-0 right-0 h-[18vh] flex items-center justify-center">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-4 flex items-center justify-between w-full max-w-7xl mx-6">
              <SettingsNavigation />
            </div>
          </div>

          <div className="flex min-h-screen pt-[18vh] p-6 gap-6">
            <div className="w-[30%]">
              <UserProfilePanel />
            </div>

            <div className="w-[70%]">
              <SettingsTabPanel activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </Authenticated>
    </div>
  );
}

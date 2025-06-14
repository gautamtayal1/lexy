"use client";

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function UserProfilePanel() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.current);

  if (!user) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 h-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-3 bg-white/20 rounded mb-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 h-full flex flex-col">
      {/* Profile Picture */}
      <div className="text-center mb-6">
        {user.imageUrl ? (
          <img 
            src={user.imageUrl} 
            alt="Profile" 
            className="w-24 h-24 rounded-full mx-auto border-2 border-white/30 shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto flex items-center justify-center border-2 border-white/30">
            <User className="w-12 h-12 text-white" />
          </div>
        )}
      </div>

      {/* User Name */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-white/70 text-sm">
          @{user.username || user.firstName?.toLowerCase()}
        </p>
      </div>

      {/* User Details */}
      <div className="space-y-6 flex-1">
        <div className="flex items-center gap-3 text-white/80">
          <Mail className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wide">Email</p>
            <p className="text-sm font-medium">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-white/80">
          <Calendar className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wide">Member since</p>
            <p className="text-sm font-medium">
              {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-white/80">
          <Shield className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wide">Account Status</p>
            <p className="text-sm font-medium">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Active
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-white mb-1">
              {convexUser ? '12' : '0'}
            </p>
            <p className="text-xs text-white/50 uppercase tracking-wide">Conversations</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-white mb-1">
              {convexUser ? '48' : '0'}
            </p>
            <p className="text-xs text-white/50 uppercase tracking-wide">Messages</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
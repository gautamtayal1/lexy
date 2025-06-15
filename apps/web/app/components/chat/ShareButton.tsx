"use client";

import React, { useState } from 'react';
import { Share2, Copy, Check, Settings, Trash2, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';
import { useAppSelector } from '../../store/hooks';

interface ShareButtonProps {
  threadId: string;
  threadTitle: string;
}

export default function ShareButton({ threadId, threadTitle }: ShareButtonProps) {
  const { user } = useUser();
  const theme = useAppSelector((state) => state.theme.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const createSharedChat = useMutation(api.sharedChats.createSharedChat);
  const deleteSharedChat = useMutation(api.sharedChats.deleteSharedChat);

  const handleShare = async () => {
    if (!user?.id) return;
    
    setIsCreating(true);
    try {
      const result = await createSharedChat({
        threadId,
        ownerId: user.id,
        title: threadTitle,
        isPublic: true,
      });
      setShareId(result.shareId);
    } catch (error) {
      console.error('Failed to create shared chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareId) return;
    
    const shareUrl = `${window.location.origin}/shared/${shareId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDeleteShare = async () => {
    if (!shareId || !user?.id) return;
    
    try {
      await deleteSharedChat({
        shareId,
        ownerId: user.id,
      });
      setShareId(null);
    } catch (error) {
      console.error('Failed to delete shared chat:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-white/10 text-white/70 hover:text-white' 
            : 'hover:bg-black/10 text-black/70 hover:text-black'
        }`}
        title="Share chat"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-lg border p-4 z-50 ${
            theme === 'dark' 
              ? 'bg-gray-900 border-white/20' 
              : 'bg-white border-black/20'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                Share Chat
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-white/10 text-white/70' 
                    : 'hover:bg-black/10 text-black/70'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!shareId ? (
              <div className="space-y-4">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-white/60' : 'text-black/60'
                }`}>
                  Create a shareable link for this chat. Anyone with the link can view this conversation in read-only mode.
                </div>

                <button
                  onClick={handleShare}
                  disabled={isCreating}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isCreating 
                      ? 'opacity-50 cursor-not-allowed' 
                      : theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isCreating ? 'Creating...' : 'Create Share Link'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-white/80' : 'text-black/80'
                  }`}>
                    Share URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/shared/${shareId}`}
                      readOnly
                      className={`flex-1 p-2 rounded border text-sm ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-white/20 text-white' 
                          : 'bg-gray-100 border-black/20 text-black'
                      }`}
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-2 rounded border transition-colors ${
                        copied
                          ? theme === 'dark'
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-green-500 border-green-500 text-white'
                          : theme === 'dark'
                            ? 'border-white/20 hover:bg-white/10 text-white'
                            : 'border-black/20 hover:bg-black/10 text-black'
                      }`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className={`text-sm ${
                  theme === 'dark' ? 'text-white/60' : 'text-black/60'
                }`}>
                  Anyone with this link can view this chat in read-only mode.
                </div>

                <button
                  onClick={handleDeleteShare}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Share Link
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 
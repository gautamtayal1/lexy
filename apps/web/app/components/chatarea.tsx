"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Menu } from "lucide-react";
import { useChat } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetChatState, setSelectedModel, setIsTheoMode } from '../store/chatSlice';
import { useApiKeys } from '../hooks/useApiKeys';
import axios from 'axios';
import { useQuery } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';
import ChatContainer from './chat/ChatContainer';
import ShareModal from './chat/ShareModal';
import ErrorNotification from './ErrorNotification';

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  shareModalData?: { threadId: string; title: string } | null;
  onCloseShareModal?: () => void;
}

const ChatArea = ({ isSidebarOpen, onToggleSidebar, shareModalData, onCloseShareModal }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { question, selectedModel, isCreativeMode, isTheoMode, attachedFiles } = useAppSelector((state) => state.chat);
  const theme = useAppSelector((state) => state.theme.theme);
  const { apiKeys } = useApiKeys();
  const threadId = pathname.split('/')[2];
  const [file, setFile] = useState<any | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  // Use Redux state for creative mode
  const [localIsCreativeMode, setLocalIsCreativeMode] = useState(false);
  const finalIsCreativeMode = isCreativeMode !== undefined ? isCreativeMode : localIsCreativeMode;
  const [apiError, setApiError] = useState<string | null>(null);

  const isThreadExists = useQuery(api.threads.isThreadExists, {
    userId: user?.id || "",
    threadId: threadId!,
  });
  
  const storedMessages = useQuery(api.messages.listMessages, {
    threadId: threadId!,
  });

  const threadDetails = useQuery(api.threads.getThreadDetails, {
    userId: user?.id || "",
    threadId: threadId!,
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
    status,
  } = useChat({
    api: "/api/chat",
    id: threadId,
    body: {
      model: selectedModel,
      userId: user?.id,
      threadId,
      attachments: file ? file : null,
      apiKeys: apiKeys,
      isTheoMode: isTheoMode,
      modelParams: {
        temperature: finalIsCreativeMode ? 0.8 : 0.3,
        topK: finalIsCreativeMode ? 50 : 10,
      },
    },
    onError: async (error) => {
      console.error('Chat error:', error);
      
      try {
        // If error has a response property, it might be a fetch error
        if ((error as any).response) {
          const response = (error as any).response;
          if (response.status === 400 || response.status === 401) {
            try {
              const errorData = await response.json();
              if (errorData.error === "API_KEY_REQUIRED" || errorData.error === "INVALID_API_KEY") {
                setApiError(errorData.message || "Invalid or missing API key. Please check your API key configuration in settings.");
                return;
              }
            } catch (jsonError) {
              // If we can't parse JSON, fall through to generic handling
            }
          }
        }
        
        // Check error message for API key related issues
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('400') || 
            errorMessage.includes('401') || 
            errorMessage.includes('unauthorized') ||
            errorMessage.toLowerCase().includes('api key') ||
            errorMessage.toLowerCase().includes('authentication')) {
          setApiError("Invalid or missing API key. Please check your API key configuration in settings.");
        } else {
          setApiError("An error occurred while processing your request. Please try again.");
        }
      } catch (parseError) {
        setApiError("An unexpected error occurred. Please try again.");
      }
    }
  })

  const [hasHydratedHistory, setHasHydratedHistory] = useState(false);

  useEffect(() => {
    if (storedMessages) {
      console.log('Stored messages:', storedMessages);
      console.log(threadId)
      console.log('User ID:', user?.id);
      const ordered = [...storedMessages].sort(
        (a, b) => a.createdAt - b.createdAt
      );

      const history = ordered.map((m) => ({
        id: m.messageId,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        createdAt: new Date(m.createdAt),
        reasoning: (m as any).modelResponse || undefined,
      }));

      setMessages(history);
      setHasHydratedHistory(true);
    }
  }, [hasHydratedHistory, storedMessages, setMessages]);

  useEffect(() => {
    console.log('ChatArea useEffect running:', { isInitialized, question });
    if (!isInitialized) {
      if (question) {
        // Check for pending files from homepage
        const pendingFiles = sessionStorage.getItem('pendingFiles');
        if (pendingFiles) {
          try {
            const files = JSON.parse(pendingFiles);
            // Only set files for API, NOT for preview since they'll be sent immediately
            setFile(files);
            // Ensure uploadedFiles stays empty so no preview shows
            setUploadedFiles([]);
            // Clear the session storage
            sessionStorage.removeItem('pendingFiles');
          } catch (error) {
            console.error('Error parsing pending files:', error);
          }
        }

        append({ role: 'user', content: question })

        // Clear file state after initial message to prevent files from being sent with subsequent messages
        setTimeout(() => {
          setFile(null);
        }, 100);

        const setThreadTitle = async () => {
          await axios.post("/api/thread/title", {
            threadId,
            userId: user?.id,
            question
          })
        }
        setThreadTitle();
        setIsInitialized(true);
        dispatch(resetChatState());
      }
    }
  }, [isInitialized, question]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      scrollToBottom();
    }
  }, [messages]);

  // Handler functions for the modular components
  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    // Remove from preview
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Remove from API file state by matching URL and name
    setFile((prevFiles: any) => {
      if (!prevFiles) return null;
      const updatedFiles = prevFiles.filter((f: any) => 
        !(f.url === fileToRemove.url && f.name === fileToRemove.name)
      );
      return updatedFiles.length > 0 ? updatedFiles : null;
    });
  };

  const handleFileUploadStart = (files: any[]) => {
    // Add loading files to preview immediately
    setUploadedFiles(prev => [...prev, ...files]);
    console.log("Upload start, loading files:", files);
  };

  const handleFileUpload = (files: any[]) => {
    // Accumulate all uploaded files, not just replace with the latest batch
    setFile((prev: any) => {
      const currentFiles = prev || [];
      const newAllFiles = [...currentFiles, ...files];
      console.log("Accumulating files for API:", { currentFiles, newFiles: files, totalFiles: newAllFiles });
      return newAllFiles;
    });
  
    // Replace the loading files with the actual uploaded files
    setUploadedFiles(prev => {
      // Remove all loading files and add the actual uploaded files
      const nonLoadingFiles = prev.filter(f => !f.isUploading);
      console.log("Replacing loading files with uploaded files:", { nonLoadingFiles, files });
      return [...nonLoadingFiles, ...files];
    });
    console.log("Upload complete, new files:", files);
  };

  const handleSubmitWithCleanup = () => {
    handleSubmit();
    // Clear both file states immediately after sending to prevent them from being included in subsequent messages
    setFile(null);
    setUploadedFiles([]);
  };

  const handleToggleCreativeMode = () => {
    setLocalIsCreativeMode(!localIsCreativeMode);
  };

  const handleToggleTheoMode = () => {
    dispatch(setIsTheoMode(!isTheoMode));
  };

  const handleModelChange = (model: string) => {
    dispatch(setSelectedModel(model));
  };

  const handleCloseError = () => {
    setApiError(null);
  };

  // Get the appropriate messages to display
  const displayMessages = (messages || storedMessages?.map(message => ({
    id: message.messageId,
    role: message.role as 'user' | 'assistant' | 'system',
    content: message.content,
    messageId: message.messageId,
    createdAt: new Date(message.createdAt),
  })) || []).filter(msg => msg.role !== 'data');

  return (
    <div className="relative">
      <div 
        className={`fixed top-8 right-8 h-[calc(100vh-4rem)] backdrop-blur-xl shadow rounded-2xl border flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'left-[24rem]' : 'left-8'
        } ${
          theme === 'dark' 
            ? 'border-white/20 bg-white/5' 
            : 'border-black/20 bg-black/5'
        }`}
      >
        {!isSidebarOpen && (
          <button 
            onClick={onToggleSidebar}
            className={`absolute -left-12 top-4 p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-white/20 text-white' 
                : 'hover:bg-black/10 text-black'
            }`}
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

                    <ChatContainer
        messages={displayMessages as any}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
        uploadedFiles={uploadedFiles}
        onRemoveFile={handleRemoveFile}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmitWithCleanup}
        isCreativeMode={finalIsCreativeMode}
        onToggleCreativeMode={handleToggleCreativeMode}
        isTheoMode={isTheoMode}
        onToggleTheoMode={handleToggleTheoMode}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onFileUpload={handleFileUpload}
        onFileUploadStart={handleFileUploadStart}
        status={status}
      />


    </div>

      {/* Share Modal */}
      {shareModalData && onCloseShareModal && (
        <ShareModal
          threadId={shareModalData.threadId}
          threadTitle={shareModalData.title}
          onClose={onCloseShareModal}
        />
      )}
      
      {/* Error Notification */}
      <ErrorNotification 
        error={apiError}
        onClose={handleCloseError}
      />
    </div>
  );
};

export default ChatArea;
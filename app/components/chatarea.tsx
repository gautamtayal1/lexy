"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Menu } from "lucide-react";
import { useChat } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetChatState, setSelectedModel, setIsTheoMode, setIsCreativeMode } from '../store/chatSlice';
import { useApiKeys } from '../hooks/useApiKeys';
import axios from 'axios';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
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
  const { question, selectedModel, isCreativeMode, isTheoMode } = useAppSelector((state) => state.chat);
  const theme = useAppSelector((state) => state.theme.theme);
  const { apiKeys } = useApiKeys();
  const threadId = pathname.split('/')[2];
  const [file, setFile] = useState<any | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  // Use Redux state for creative mode instead of local state
  const [apiError, setApiError] = useState<string | null>(null);

  const isThreadExists = useQuery(api.threads.isThreadExists, {
    userId: user?.id || "",
    threadId: threadId!,
  });
  


  const threadDetails = useQuery(api.threads.getThreadDetails, {
    userId: user?.id || "",
    threadId: threadId!,
  });

  const storedMessages = useQuery(api.messages.listMessages, {
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
        temperature: isCreativeMode ? 0.8 : 0.3,
        topK: isCreativeMode ? 50 : 10,
      },
    },
    onFinish: async (message) => {
      // For image generation models, force refresh from database to get correct message IDs
      if (selectedModel === "gpt-image-1" || selectedModel === "gemini-2.0-flash-preview-image-generation") {
        setTimeout(() => {
          setHasHydratedHistory(false);
        }, 1500);
      }
    },
    onError: async (error) => {
      console.error('Chat error:', error);
      
      try {
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
            }
          }
        }
        
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
    if (storedMessages && !hasHydratedHistory) {
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
  }, [storedMessages, setMessages, hasHydratedHistory]);

  useEffect(() => {
    if (!isInitialized && hasHydratedHistory) {
      if (question) {
        const pendingFiles = sessionStorage.getItem('pendingFiles');
        if (pendingFiles) {
          try {
            const files = JSON.parse(pendingFiles);
            setFile(files);
            setUploadedFiles([]);
            sessionStorage.removeItem('pendingFiles');
          } catch (error) {
            console.error('Error parsing pending files:', error);
          }
        }

        append({ role: 'user', content: question })

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
  }, [isInitialized, question, user?.id, threadId, dispatch, hasHydratedHistory, append]);

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
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    setFile((prevFiles: any) => {
      if (!prevFiles) return null;
      const updatedFiles = prevFiles.filter((f: any) => 
        !(f.url === fileToRemove.url && f.name === fileToRemove.name)
      );
      return updatedFiles.length > 0 ? updatedFiles : null;
    });
  };

  const handleFileUploadStart = (files: any[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileUpload = (files: any[]) => {
    setFile((prev: any) => {
      const currentFiles = prev || [];
      const newAllFiles = [...currentFiles, ...files];
      console.log("Accumulating files for API:", { currentFiles, newFiles: files, totalFiles: newAllFiles });
      return newAllFiles;
    });
  
    setUploadedFiles(prev => {
      const nonLoadingFiles = prev.filter(f => !f.isUploading);
      console.log("Replacing loading files with uploaded files:", { nonLoadingFiles, files });
      return [...nonLoadingFiles, ...files];
    });
    console.log("Upload complete, new files:", files);
  };

  const handleSubmitWithCleanup = () => {
    handleSubmit();
    setFile(null);
    setUploadedFiles([]);
  };

  const handleToggleCreativeMode = () => {
    const newCreativeMode = !isCreativeMode;
    dispatch(setIsCreativeMode(newCreativeMode));
    console.log('Creative mode toggled to:', newCreativeMode);
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
        isCreativeMode={isCreativeMode}
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
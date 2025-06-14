"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Menu } from "lucide-react";
import { useChat } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetChatState, setSelectedModel } from '../store/chatSlice';
import { useApiKeys } from '../hooks/useApiKeys';
import axios from 'axios';
import { useQuery } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';
import ChatContainer from './chat/ChatContainer';

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatArea = ({ isSidebarOpen, onToggleSidebar }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { question, selectedModel, isCreativeMode, attachedFiles } = useAppSelector((state) => state.chat);
  const theme = useAppSelector((state) => state.theme.theme);
  const { apiKeys } = useApiKeys();
  const threadId = pathname.split('/')[2];
  const [file, setFile] = useState<any | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  // Use Redux state for creative mode
  const [localIsCreativeMode, setLocalIsCreativeMode] = useState(false);
  const finalIsCreativeMode = isCreativeMode !== undefined ? isCreativeMode : localIsCreativeMode;

  const isThreadExists = useQuery(api.threads.isThreadExists, {
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
      modelParams: {
        temperature: finalIsCreativeMode ? 0.8 : 0.3,
        topK: finalIsCreativeMode ? 50 : 10,
      },
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
        append({ role: 'user', content: question })

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
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length === 1) {
      setFile(null);
    }
  };

  const handleFileUploadStart = (files: any[]) => {
    // Add loading file to preview immediately
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileUpload = (files: any[]) => {
    const newFile = files;
    setFile(prev => [...prev, newFile]);
  
    // Replace the loading file with the actual uploaded file
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      // Find the loading file and replace it
      const loadingIndex = newFiles.findIndex(f => f.isUploading);
      if (loadingIndex !== -1) {
        newFiles[loadingIndex] = newFile;
      } else {
        // If no loading file found, just add the new file
        newFiles.push(newFile);
      }
      return newFiles;
    });
    console.log("Files: ", files);
  };

  const handleSubmitWithCleanup = () => {
    handleSubmit();
    setFile(null);
    setUploadedFiles([]);
  };

  const handleToggleCreativeMode = () => {
    setLocalIsCreativeMode(!localIsCreativeMode);
  };

  const handleModelChange = (model: string) => {
    dispatch(setSelectedModel(model));
  };

  // Get the appropriate messages to display
  const displayMessages = messages || storedMessages?.map(message => ({
    id: message.messageId,
    role: message.role as 'user' | 'assistant' | 'system',
    content: message.content,
    messageId: message.messageId,
    createdAt: new Date(message.createdAt),
  })) || [];

  return (
    <div className={`fixed top-8 right-8 h-[calc(100vh-4rem)] backdrop-blur-xl shadow rounded-2xl border flex flex-col transition-all duration-300 ${
      isSidebarOpen ? 'left-[24rem]' : 'left-8'
    } ${
      theme === 'dark' 
        ? 'border-white/20 bg-white/5' 
        : 'border-black/20 bg-black/5'
    }`}>
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
        messages={displayMessages}
        messagesEndRef={messagesEndRef}
        uploadedFiles={uploadedFiles}
        onRemoveFile={handleRemoveFile}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmitWithCleanup}
        isCreativeMode={finalIsCreativeMode}
        onToggleCreativeMode={handleToggleCreativeMode}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onFileUpload={handleFileUpload}
        onFileUploadStart={handleFileUploadStart}
        status={status}
      />
    </div>
  );
};

export default ChatArea;
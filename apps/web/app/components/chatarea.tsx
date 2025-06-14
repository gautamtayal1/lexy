"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Menu } from "lucide-react";
import { useChat } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useChatContext } from '../context/ChatContext';
import axios from 'axios';
import { useQuery } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';
import ChatContainer from './chat/ChatContainer';

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: string;
}

const ChatArea = ({ isSidebarOpen, onToggleSidebar, theme }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const { question, setQuestion } = useChatContext();
  const threadId = pathname.split('/')[2];
  const [file, setFile] = useState<any | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isCreativeMode, setIsCreativeMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4.1-mini");

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
  } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      userId: user?.id,
      threadId,
      attachments: file ? file : null,
      modelParams: {
        temperature: 0.5,
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
        setQuestion("");
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

  const handleFileUpload = (files: any[]) => {
    const newFile = files[0];
    setFile(newFile);
    setUploadedFiles(prev => [...prev, newFile]);
    console.log("Files: ", files);
  };

  const handleSubmitWithCleanup = () => {
    handleSubmit();
    setFile(null);
    setUploadedFiles([]);
  };

  const handleToggleCreativeMode = () => {
    setIsCreativeMode(!isCreativeMode);
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
    <div className={`fixed top-8 right-8 h-[calc(100vh-4rem)] backdrop-blur-xl shadow rounded-2xl border border-white/20 bg-white/5 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'left-[24rem]' : 'left-8'}`}>
      {!isSidebarOpen && (
        <button 
          onClick={onToggleSidebar}
          className="absolute -left-12 top-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-white" />
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
        isCreativeMode={isCreativeMode}
        onToggleCreativeMode={handleToggleCreativeMode}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
};

export default ChatArea;

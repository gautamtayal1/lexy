"use client"

import React, { useState, useRef, useEffect } from 'react';
import { ArrowBigUp, FileUp, Menu, ChevronDown, ChevronUp } from "lucide-react";
import { useChat } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useChatContext } from '../context/ChatContext';
import axios from 'axios';
import { useQuery } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';
import { UploadButton } from '../utils/uploadthing';
import MessageFormatter from './MessageFormatter';
import ModelDropdown from './ModelDropdown';

interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: string;
}

const ChatArea = ({ isSidebarOpen, onToggleSidebar, theme }: ChatAreaProps) => {
  const [expandedReasonings, setExpandedReasonings] = useState<Record<string, boolean>>({});
  const [selectedModel, setSelectedModel] = useState("groq/llama-3.1-8b-instant");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const { question, setQuestion } = useChatContext();
  const threadId = pathname.split('/')[2];
  const [file, setFile] = useState<any | null>(null);

  const isThreadExists = 
  useQuery(api.threads.isThreadExists, {
    userId: user?.id || "",
    threadId: threadId!,
  });
  
  const storedMessages = 
  useQuery(api.messages.listMessages, {
    threadId: threadId!,
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
    setInput,
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

      // Map Convex schema to `useChat` UIMessage schema
      const history = ordered.map((m) => ({
        id: m.messageId,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        createdAt: new Date(m.createdAt),
        // Preserve reasoning if we have it
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

  const toggleReasoning = (messageId: string) => {
    setExpandedReasonings(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

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

      <div className="flex-1 overflow-y-auto">
        <div className="w-[95%] max-w-4xl mx-auto py-8">
          {messages ? messages.map(message => (
            <div key={message.id} className="space-y-2">
              {message.role === 'assistant' && message.reasoning && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleReasoning(message.id)}
                    className="flex items-center gap-2 text-white/70 hover:text-white text-base transition-colors"
                  >
                    {expandedReasonings[message.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                    Show Reasoning
                  </button>
                  {expandedReasonings[message.id] && (
                    <div className="mt-3 p-4 bg-white/5 rounded-lg text-white/80 text-base leading-relaxed">
                      {message.reasoning}
                    </div>
                  )}
                </div>
              )}
              <div 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-2xl px-6 py-3 text-white text-base leading-relaxed ${
                    message.role === 'user' 
                      ? 'bg-white/10 max-w-[70%]' 
                      : 'w-full'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MessageFormatter content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          )) : storedMessages?.map(message => (
            <div key={message.messageId} className="space-y-3">
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-6 py-3 text-white text-base leading-relaxed ${
                  message.role === 'user' 
                    ? 'bg-white/10 max-w-[70%]' 
                    : 'w-full'
                }`}>
                  {message.role === 'assistant' ? (
                    <MessageFormatter content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-[95%] max-w-4xl mx-auto mb-6">
        <div className="backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-3">
          <div className="relative mb-4">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="w-full text-white placeholder-white/50 rounded-xl py-3 px-4 pr-12 text-base focus:outline-none resize-y overflow-hidden min-h-[60px]"
              rows={1}
              style={{ minHeight: '60px' }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 transition-colors">
                {/* <FileUp className="h-4 w-4" />    
                <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  setFile(res[0]);
                  
                  console.log("Files: ", res);
                  alert("Upload Completed");
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
              /> */}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <ModelDropdown selectedModel={selectedModel} onModelChange={setSelectedModel} />
              <button  
                className="text-white hover:text-white/80 transition-colors p-2" 
                onClick={() => {
                  handleSubmit();
                  setFile(null);
                }}
              >
                <ArrowBigUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

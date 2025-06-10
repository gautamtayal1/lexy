"use client"

import React, { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/db/convex/_generated/api";
import { ArrowBigUp, FileUp, Menu } from "lucide-react";
import { useCurrentUser } from '../useCurrentUser';
interface ChatAreaProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatArea = ({ isSidebarOpen, onToggleSidebar }: ChatAreaProps) => {
  const [message, setMessage] = useState('');
  // const { isLoading, isAuthenticated } = useCurrentUser();
  // const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);

  return (
    <div className={`fixed top-8 right-8 h-[calc(100vh-4rem)] bg-white/30 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'left-[24rem]' : 'left-8'}`}>
      {/* Toggle Sidebar Button - Only visible when sidebar is closed */}
      {!isSidebarOpen && (
        <button 
          onClick={onToggleSidebar}
          className="absolute -left-12 top-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[80%] mx-auto space-y-6">
          <div className="flex flex-col space-y-4">
            {/* {messages?.map(({ _id, user, body }) => (
              <div key={_id} className="bg-white/20 p-4 rounded-lg max-w-[80%] self-start">
                {user}: {body}
              </div>
            ))} */}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="max-w-[80%] mx-auto">
          {/* Model Selection */}
          <div className="flex items-center gap-4 mb-4">
            <select className="bg-white/20 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5">GPT-3.5</option>
              <option value="claude">Claude</option>
            </select>
            <button className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 transition-colors">
              <FileUp className="h-4 w-4" />    
              Attach PDF
            </button>
          </div>

          {/* Message Input */}
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-white/20 text-white placeholder-white/50 rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button 
            className="absolute right-0 top-0 h-full px-4 text-white hover:text-white/80 transition-colors" 
            onClick={() => {
              if (message) {
                sendMessage({ body: message });
                setMessage("");
              }
            }}
              >
              <ArrowBigUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

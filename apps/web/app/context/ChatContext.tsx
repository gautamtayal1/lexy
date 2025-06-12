'use client';

import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext<{
  question: string;
  setQuestion: (question: string) => void;
}>({
  question: '',
  setQuestion: () => {}
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [question, setQuestion] = useState('');
  return (
    <ChatContext.Provider value={{ question, setQuestion }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
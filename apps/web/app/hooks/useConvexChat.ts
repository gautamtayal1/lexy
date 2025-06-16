import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';

export function useConvexChat(threadId: string, userId: string, initialInput: string = '') {
  const [input, setInput] = useState(initialInput);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time messages subscription - this will update across all tabs
  const messages = useQuery(api.messages.listMessages, { threadId });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (
    selectedModel: string,
    attachments?: any,
    apiKeys?: any,
    isTheoMode?: boolean,
    modelParams?: any
  ) => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Call your chat API - it will handle adding both user and assistant messages to Convex
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [...(messages || []).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }],
          threadId,
          model: selectedModel,
          modelParams,
          attachments,
          apiKeys,
          isTheoMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get AI response');
      }

      // The API handles adding both user and assistant messages to Convex
      // Our real-time subscription will automatically update the UI
    } catch (error: any) {
      console.error('Chat error:', error);
      setError(error.message || 'An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, userId, threadId, messages]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Format messages for display
  const formattedMessages = (messages || [])
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((m) => ({
      id: m.messageId,
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
      createdAt: new Date(m.createdAt),
      reasoning: m.modelResponse || undefined,
      messageId: m.messageId,
    }));

  return {
    messages: formattedMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    clearError,
    status: isLoading ? 'submitted' : 'ready' as 'submitted' | 'ready' | 'streaming' | 'error',
  };
} 
'use client';

import { useState, useCallback, useRef } from 'react';
import { createGroqChatService, DEFAULT_SYSTEM_PROMPTS } from '@/lib/llm';
import type { ChatMessage, LLMConfig, LLMResponse } from '@/lib/llm/types';

interface UseLLMChatOptions {
  systemPrompt?: string;
  config?: LLMConfig;
  apiKey?: string;
}

interface UseLLMChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<LLMResponse | null>;
  streamMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setSystemPrompt: (prompt: string) => void;
  updateConfig: (config: Partial<LLMConfig>) => void;
}

export function useLLMChat({
  systemPrompt = DEFAULT_SYSTEM_PROMPTS.terminal,
  config = {},
  apiKey,
}: UseLLMChatOptions = {}): UseLLMChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatServiceRef = useRef(createGroqChatService(config, systemPrompt, apiKey));

  const sendMessage = useCallback(
    async (content: string) => {
      if (isLoading) return null;

      setIsLoading(true);
      setError(null);

      try {
        const response = await chatServiceRef.current.sendMessage(content);
        setMessages(chatServiceRef.current.getMessages());
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const streamMessage = useCallback(
    async (content: string) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        chatServiceRef.current.addUserMessage(content);
        setMessages([...chatServiceRef.current.getMessages()]);

        let streamedContent = '';
        const assistantMessage: ChatMessage = { role: 'assistant', content: '' };

        for await (const chunk of chatServiceRef.current.streamMessage(content)) {
          streamedContent += chunk;
          assistantMessage.content = streamedContent;

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];

            if (lastMessage?.role === 'assistant') {
              newMessages[newMessages.length - 1] = { ...assistantMessage };
            } else {
              newMessages.push({ ...assistantMessage });
            }

            return newMessages;
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const clearMessages = useCallback(() => {
    chatServiceRef.current.clearMessages();
    setMessages([]);
    setError(null);
  }, []);

  const setSystemPrompt = useCallback((prompt: string) => {
    chatServiceRef.current.setSystemPrompt(prompt);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<LLMConfig>) => {
    chatServiceRef.current.updateConfig(newConfig);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    streamMessage,
    clearMessages,
    setSystemPrompt,
    updateConfig,
  };
}

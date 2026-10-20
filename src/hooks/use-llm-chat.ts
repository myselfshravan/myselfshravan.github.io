'use client';

import { useState, useCallback, useRef } from 'react';
import { createGroqChatService, DEFAULT_SYSTEM_PROMPTS } from '@/lib/llm';
import type {
  ChatMessage,
  LLMConfig,
  LLMResponse,
  ToolCall,
  ToolDefinition,
} from '@/lib/llm/types';

interface StreamHandlers {
  onText?: (fullText: string) => void;
  onToolCall?: (call: ToolCall) => void;
}

export interface StreamResult {
  content: string;
  model: string;
  toolCalls: ToolCall[];
}

interface UseLLMChatOptions {
  systemPrompt?: string;
  config?: LLMConfig;
  apiKey?: string;
  tools?: ToolDefinition[];
}

interface UseLLMChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<LLMResponse | null>;
  streamMessage: (content: string, handlers?: StreamHandlers) => Promise<StreamResult>;
  clearMessages: () => void;
  setSystemPrompt: (prompt: string) => void;
  updateConfig: (config: Partial<LLMConfig>) => void;
}

export function useLLMChat({
  systemPrompt = DEFAULT_SYSTEM_PROMPTS.terminal,
  config = {},
  apiKey,
  tools,
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

  const isStreamingRef = useRef(false);

  // Streams one reply. Text arrives through onText as the accumulated reply;
  // tool calls arrive once complete. Errors are rethrown for the caller to show.
  const streamMessage = useCallback(
    async (content: string, handlers: StreamHandlers = {}): Promise<StreamResult> => {
      if (isStreamingRef.current) throw new Error('Still answering the last question');

      isStreamingRef.current = true;
      setIsLoading(true);
      setError(null);

      const result: StreamResult = { content: '', model: '', toolCalls: [] };
      try {
        for await (const event of chatServiceRef.current.streamMessage(content, tools)) {
          if (event.type === 'text') {
            result.content += event.content;
            handlers.onText?.(result.content);
          } else if (event.type === 'tool_call') {
            result.toolCalls.push(event.call);
            handlers.onToolCall?.(event.call);
          } else {
            result.model = event.model;
          }
        }
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setMessages(chatServiceRef.current.getMessages());
        isStreamingRef.current = false;
        setIsLoading(false);
      }
    },
    [tools],
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

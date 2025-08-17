export * from './types';
export * from './groq-provider';
export * from './chat-service';

import { GroqProvider } from './groq-provider';
import { ChatService } from './chat-service';
import type { LLMConfig } from './types';

export function createGroqChatService(
  config: LLMConfig = {},
  systemPrompt?: string,
  apiKey?: string,
): ChatService {
  const provider = new GroqProvider(apiKey);
  return new ChatService(provider, config, systemPrompt);
}

export const DEFAULT_SYSTEM_PROMPTS = {
  assistant: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
  coder: 'You are an expert programmer. Help with coding questions, debugging, and best practices.',
  creative:
    'You are a creative AI assistant. Help with brainstorming, writing, and creative problem-solving.',
  terminal:
    "You are a terminal AI assistant integrated into a portfolio website. Be helpful, concise, and engaging while maintaining a professional tone suitable for a developer's portfolio.",
} as const;

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

// Portfolio context that gets injected into every AI conversation
const PORTFOLIO_CONTEXT = `
PORTFOLIO OWNER CONTEXT:
- Name: Shravan Revanna
- Email: shravanrevanna@gmail.com
- Key Project: NoteRep (opensource notes sharing platform) and some more projects like: ParseFi - AI Statement Analyzer, Forkcast - Plan your meals.
- More projects at /#projects section.
- Focus: Building AI-powered applications, automation solutions, and production-ready systems
- Philosophy: "I see problems, I build solutions" - obsessed with automating everything and eliminating manual work
- Interests: GenAI, automation, full-stack development, technical writing
You are assisting visitors to Shravan's portfolio website. Use this context to provide relevant, personalized responses.
`;

export const DEFAULT_SYSTEM_PROMPTS = {
  assistant: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
  coder: 'You are an expert programmer. Help with coding questions, debugging, and best practices.',
  creative:
    'You are a creative AI assistant. Help with brainstorming, writing, and creative problem-solving.',
  terminal: `
  You are a terminal AI assistant integrated into Shravan Revanna's portfolio website. Provide clear, concise, and accurate responses.
  ---
  ${PORTFOLIO_CONTEXT} 
  ---
  Be helpful, concise, and engaging while maintaining a professional tone. Use the portfolio context above to answer questions about Shravan.`,
} as const;

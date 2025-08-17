export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface ChatCompletionOptions extends LLMConfig {
  systemPrompt?: string;
  messages: ChatMessage[];
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  chat(options: ChatCompletionOptions): Promise<LLMResponse>;
  stream?(options: ChatCompletionOptions): AsyncIterable<string>;
}
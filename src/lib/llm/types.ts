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

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatCompletionOptions extends LLMConfig {
  systemPrompt?: string;
  messages: ChatMessage[];
  tools?: ToolDefinition[];
}

// A streamed reply is text deltas, then any tool calls once their arguments
// have fully arrived, then a final event naming the model that answered.
export type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'tool_call'; call: ToolCall }
  | { type: 'done'; model: string };

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
  stream?(options: ChatCompletionOptions): AsyncIterable<StreamEvent>;
}
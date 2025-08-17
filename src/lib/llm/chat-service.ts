import type { 
  LLMProvider, 
  ChatMessage, 
  LLMConfig,
  LLMResponse 
} from "./types";

export class ChatService {
  private provider: LLMProvider;
  private messages: ChatMessage[] = [];
  private systemPrompt?: string;
  private config: LLMConfig;

  constructor(
    provider: LLMProvider, 
    config: LLMConfig = {},
    systemPrompt?: string
  ) {
    this.provider = provider;
    this.config = config;
    this.systemPrompt = systemPrompt;
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  getSystemPrompt(): string | undefined {
    return this.systemPrompt;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.trimMessages();
  }

  private trimMessages(): void {
    // Keep only the last 3 user-assistant pairs (6 messages total)
    // Always preserve system message if it exists
    const systemMessages = this.messages.filter(msg => msg.role === 'system');
    const conversationMessages = this.messages.filter(msg => msg.role !== 'system');
    
    // Keep only last 6 conversation messages (3 user-assistant pairs)
    const maxConversationMessages = 6;
    if (conversationMessages.length > maxConversationMessages) {
      const trimmedConversation = conversationMessages.slice(-maxConversationMessages);
      this.messages = [...systemMessages, ...trimmedConversation];
    }
  }

  addUserMessage(content: string): void {
    this.addMessage({ role: 'user', content });
  }

  addAssistantMessage(content: string): void {
    this.addMessage({ role: 'assistant', content });
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
  }

  async sendMessage(content: string): Promise<LLMResponse> {
    this.addUserMessage(content);
    
    const response = await this.provider.chat({
      systemPrompt: this.systemPrompt,
      messages: this.messages,
      ...this.config,
    });

    this.addAssistantMessage(response.content);
    return response;
  }

  async *streamMessage(content: string): AsyncIterable<string> {
    this.addUserMessage(content);
    
    if (!this.provider.stream) {
      throw new Error('Provider does not support streaming');
    }

    let fullResponse = '';
    
    for await (const chunk of this.provider.stream({
      systemPrompt: this.systemPrompt,
      messages: this.messages,
      ...this.config,
    })) {
      fullResponse += chunk;
      yield chunk;
    }

    this.addAssistantMessage(fullResponse);
  }

  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }
}
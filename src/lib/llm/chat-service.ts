import type { 
  LLMProvider, 
  ChatMessage, 
  LLMConfig,
  LLMResponse,
  StreamEvent,
  ToolDefinition
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

  async *streamMessage(content: string, tools?: ToolDefinition[]): AsyncIterable<StreamEvent> {
    this.addUserMessage(content);
    
    if (!this.provider.stream) {
      throw new Error('Provider does not support streaming');
    }

    let fullResponse = '';
    const actions: string[] = [];

    try {
      for await (const event of this.provider.stream({
        systemPrompt: this.systemPrompt,
        messages: this.messages,
        tools,
        ...this.config,
      })) {
        if (event.type === 'text') fullResponse += event.content;
        if (event.type === 'tool_call') {
          actions.push(`${event.call.name}(${JSON.stringify(event.call.arguments)})`);
        }
        yield event;
      }

      // Models often answer an action request with only a tool call. Run a
      // second, tool-free turn so the visitor hears what was done and why.
      if (actions.length && !fullResponse.trim()) {
        try {
          for await (const event of this.provider.stream({
            systemPrompt: this.systemPrompt,
            messages: [
              ...this.messages,
              { role: 'assistant', content: `[actions taken: ${actions.join(', ')}]` },
              {
                role: 'system',
                content:
                  'Those actions already ran on the page. Now reply to the visitor in plain text, phrased as done, adding the most useful detail. Do not call tools.',
              },
            ],
            ...this.config,
          })) {
            if (event.type !== 'text') continue;
            fullResponse += event.content;
            yield event;
          }
        } catch {
          // The actions already ran, so a failed recap (e.g. Groq's 400 when
          // the model tries another tool call) must not turn into an error.
        }
      }
    } catch (err) {
      // Drop the unanswered question so the next turn starts clean.
      this.messages.pop();
      throw err;
    }

    // History is plain text, so record what the tools did alongside the reply.
    const note = actions.length ? `\n[actions taken: ${actions.join(', ')}]` : '';
    this.addAssistantMessage(fullResponse + note);
  }

  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }
}
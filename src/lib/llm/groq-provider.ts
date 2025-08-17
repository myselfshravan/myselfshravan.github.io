import Groq from 'groq-sdk';
import type { LLMProvider, ChatCompletionOptions, LLMResponse, ChatMessage } from './types';

export class GroqProvider implements LLMProvider {
  private groq: Groq;
  private defaultModel: string;

  constructor(apiKey?: string, defaultModel = 'llama-3.1-8b-instant') {
    this.groq = new Groq({
      apiKey: apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    this.defaultModel = defaultModel;
  }

  async chat(options: ChatCompletionOptions): Promise<LLMResponse> {
    const messages = this.buildMessages(options.systemPrompt, options.messages);

    const completion = await this.groq.chat.completions.create({
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      model: options.model || this.defaultModel,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      top_p: options.topP ?? 1,
      stream: false,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      model: completion.model,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *stream(options: ChatCompletionOptions): AsyncIterable<string> {
    const messages = this.buildMessages(options.systemPrompt, options.messages);

    const stream = await this.groq.chat.completions.create({
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      model: options.model || this.defaultModel,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      top_p: options.topP ?? 1,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  private buildMessages(systemPrompt?: string, messages: ChatMessage[] = []): ChatMessage[] {
    const result: ChatMessage[] = [];

    if (systemPrompt) {
      result.push({ role: 'system', content: systemPrompt });
    }

    result.push(...messages);
    return result;
  }
}

import Groq from 'groq-sdk';
import type {
  LLMProvider,
  ChatCompletionOptions,
  LLMResponse,
  ChatMessage,
  StreamEvent,
  ToolCall,
} from './types';

// Tried in order: when a model is rate limited or down, the next one answers.
// Each Groq model has its own rate-limit bucket, so the chain also adds capacity.
const DEFAULT_MODELS = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'];

function isRetryable(err: unknown): boolean {
  if (err instanceof Groq.APIError) {
    return err.status === undefined || err.status === 429 || err.status >= 500;
  }
  return err instanceof TypeError; // network failure
}

export class GroqProvider implements LLMProvider {
  private groq: Groq;
  private models: string[];

  constructor(apiKey?: string, models: string[] = DEFAULT_MODELS) {
    this.groq = new Groq({
      apiKey: apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
      // Fail over to the next model instead of waiting out SDK backoff.
      maxRetries: 0,
      timeout: 20_000,
    });
    this.models = models;
  }

  private modelChain(model?: string): string[] {
    return model ? [model, ...this.models.filter((m) => m !== model)] : this.models;
  }

  async chat(options: ChatCompletionOptions): Promise<LLMResponse> {
    const messages = this.buildMessages(options.systemPrompt, options.messages);
    let lastError: unknown;

    for (const model of this.modelChain(options.model)) {
      try {
        const completion = await this.groq.chat.completions.create({
          messages,
          model,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
          top_p: options.topP ?? 1,
          reasoning_effort: 'low',
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
      } catch (err) {
        lastError = err;
        if (!isRetryable(err)) throw err;
      }
    }
    throw lastError;
  }

  async *stream(options: ChatCompletionOptions): AsyncIterable<StreamEvent> {
    const messages = this.buildMessages(options.systemPrompt, options.messages);
    const tools = options.tools?.map((tool) => ({
      type: 'function' as const,
      function: tool,
    }));
    let lastError: unknown;

    for (const model of this.modelChain(options.model)) {
      let started = false;
      try {
        const stream = await this.groq.chat.completions.create({
          messages,
          model,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
          top_p: options.topP ?? 1,
          reasoning_effort: 'low',
          ...(tools?.length ? { tools, tool_choice: 'auto' as const } : {}),
          stream: true,
        });

        // Tool call arguments arrive as JSON fragments keyed by index.
        const pending = new Map<number, { name: string; args: string }>();

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta;
          if (delta?.content) {
            started = true;
            yield { type: 'text', content: delta.content };
          }
          for (const call of delta?.tool_calls ?? []) {
            started = true;
            const entry = pending.get(call.index) ?? { name: '', args: '' };
            entry.name += call.function?.name ?? '';
            entry.args += call.function?.arguments ?? '';
            pending.set(call.index, entry);
          }
        }

        for (const { name, args } of pending.values()) {
          const parsed = parseArguments(args);
          if (name && parsed) yield { type: 'tool_call', call: { name, arguments: parsed } };
        }
        yield { type: 'done', model };
        return;
      } catch (err) {
        lastError = err;
        // Once text has reached the reader, switching models would repeat it.
        if (started || !isRetryable(err)) throw err;
      }
    }
    throw lastError;
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

function parseArguments(raw: string): ToolCall['arguments'] | null {
  try {
    const value = JSON.parse(raw || '{}');
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
}

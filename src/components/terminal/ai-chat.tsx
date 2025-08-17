'use client';

import { useState, useEffect, useRef } from 'react';
import { useLLMChat } from '@/hooks/use-llm-chat';
import { DEFAULT_SYSTEM_PROMPTS } from '@/lib/llm';

interface AIChatProps {
  onOutput: (text: string) => void;
  onExit: () => void;
}

export function AIChat({ onOutput, onExit }: AIChatProps) {
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage, streamMessage, clearMessages } = useLLMChat({
    systemPrompt: DEFAULT_SYSTEM_PROMPTS.terminal,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onOutput('\n🤖 AI Mode activated. Type your questions or "exit" to return to terminal.\n');
    inputRef.current?.focus();
  }, [onOutput]);

  useEffect(() => {
    if (error) {
      onOutput(`\n❌ Error: ${error}\n`);
    }
  }, [error, onOutput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput('');

    if (userInput.toLowerCase() === 'exit') {
      onOutput('\n👋 Exiting AI mode...\n');
      onExit();
      return;
    }

    if (userInput.toLowerCase() === 'clear') {
      clearMessages();
      onOutput('\n🧹 Chat history cleared.\n');
      return;
    }

    onOutput(`\n> ${userInput}\n`);

    if (isLoading) {
      onOutput('\n⏳ AI is thinking...\n');
    }

    try {
      await streamMessage(userInput);
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        onOutput(`\n🤖 ${lastMessage.content}\n`);
      }
    } catch (err) {
      onOutput(`\n❌ Failed to get AI response: ${err}\n`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <span className="text-green-400 mr-2">🤖 ai&gt;</span>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 bg-transparent outline-none text-green-400 font-mono"
        placeholder={isLoading ? 'AI is responding...' : 'Ask me anything...'}
        disabled={isLoading}
        autoFocus
      />
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useLLMChat } from '@/hooks/use-llm-chat';

export function LLMTest() {
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage, clearMessages } = useLLMChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">LLM Chat Test</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Start a conversation!</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-8'
                  : message.role === 'assistant'
                  ? 'bg-gray-100 mr-8'
                  : 'bg-yellow-100'
              }`}
            >
              <div className="font-semibold text-sm mb-1 capitalize">
                {message.role}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <button
        onClick={clearMessages}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Clear Messages
      </button>
    </div>
  );
}
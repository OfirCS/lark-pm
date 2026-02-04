'use client';

import { useEffect, useRef } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { useAgentStore } from '@/lib/stores/agentStore';
import { useAgent } from './AgentProvider';
import { AgentMessages } from './AgentMessages';

export function AgentPanel() {
  const { isOpen, closeAgent, inputValue, setInputValue, isStreaming } = useAgentStore();
  const { sendMessage } = useAgent();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    await sendMessage(inputValue);
  };

  // Handle textarea keydown (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={closeAgent}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-[420px] bg-[var(--card)] border-l border-[var(--card-border)] z-50 flex flex-col shadow-2xl animate-slide-in-right"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-medium text-sm">Lark</h2>
              <p className="text-xs text-[var(--foreground-muted)]">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={closeAgent}
            className="p-2 rounded-lg hover:bg-[var(--background-subtle)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {/* Messages */}
        <AgentMessages />

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--card-border)]">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask Lark anything..."
              disabled={isStreaming}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-[var(--background-subtle)] border border-[var(--card-border)] rounded-xl text-sm resize-none focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] transition-all disabled:opacity-50"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[var(--accent)] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors"
            >
              {isStreaming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--foreground-subtle)] text-center">
            Press <kbd className="px-1.5 py-0.5 bg-[var(--background-subtle)] rounded text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-[var(--background-subtle)] rounded text-[10px] font-mono">Esc</kbd> to close
          </p>
        </form>
      </div>
    </>
  );
}

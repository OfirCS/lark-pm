'use client';

import { useEffect, useRef } from 'react';
import { useAgentStore } from '@/lib/stores/agentStore';
import { UserMessage } from './messages/UserMessage';
import { AgentMessage } from './messages/AgentMessage';
import { ThinkingState } from './messages/ThinkingState';
import { OptionCards } from './messages/OptionCards';
import { SearchProgress } from './messages/SearchProgress';
import { SourceCards } from './messages/SourceCards';
import { ImpactAnalysis } from './messages/ImpactAnalysis';
import type { AgentMessage as AgentMessageType } from '@/types/agent';
import { Sparkles } from 'lucide-react';

export function AgentMessages() {
  const { messages } = useAgentStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessage = (message: AgentMessageType) => {
    if (message.role === 'user') {
      return <UserMessage key={message.id} message={message} />;
    }

    switch (message.type) {
      case 'thinking':
        return <ThinkingState key={message.id} steps={message.data?.thinkingSteps || []} />;

      case 'options':
        return (
          <div key={message.id} className="space-y-3">
            {message.content && <AgentMessage message={message} />}
            <OptionCards options={message.data?.options || []} />
          </div>
        );

      case 'search_progress':
        return <SearchProgress key={message.id} progress={message.data?.searchProgress} />;

      case 'search_results':
        return (
          <div key={message.id} className="space-y-3">
            {message.content && <AgentMessage message={message} />}
            <SourceCards
              results={message.data?.results || []}
              sentiment={message.data?.sentiment}
            />
          </div>
        );

      case 'impact_analysis':
        return <ImpactAnalysis key={message.id} impact={message.data?.impact} />;

      case 'text':
      default:
        return <AgentMessage key={message.id} message={message} />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        messages.map(renderMessage)
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function EmptyState() {
  const suggestions = [
    "What are customers saying about our pricing?",
    "Analyze the SSO feature request",
    "Compare our sentiment to Productboard",
    "What should we build next?",
  ];

  const { setInputValue } = useAgentStore();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-[var(--accent)]" />
      </div>
      <h3 className="font-serif text-lg font-medium mb-2">How can I help?</h3>
      <p className="text-sm text-[var(--foreground-muted)] mb-6 max-w-[280px]">
        I can search your customer data, analyze sentiment, and help you prioritize features.
      </p>

      <div className="w-full space-y-2">
        <p className="text-xs text-[var(--foreground-subtle)] mb-2">Try asking:</p>
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setInputValue(suggestion)}
            className="w-full text-left px-4 py-3 rounded-lg border border-[var(--card-border)] text-sm text-[var(--foreground-muted)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)] hover:border-[var(--foreground-subtle)] transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import type { AgentMessage as AgentMessageType } from '@/types/agent';

interface AgentMessageProps {
  message: AgentMessageType;
}

export function AgentMessage({ message }: AgentMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--background-subtle)] border border-[var(--card-border)] text-sm leading-relaxed">
        {message.content}
        {message.streaming && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--accent)] animate-pulse" />
        )}
      </div>
    </div>
  );
}

'use client';

import type { AgentMessage } from '@/types/agent';

interface UserMessageProps {
  message: AgentMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-[var(--foreground)] text-[var(--background)] text-sm">
        {message.content}
      </div>
    </div>
  );
}

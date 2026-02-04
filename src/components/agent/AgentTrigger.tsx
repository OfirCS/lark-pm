'use client';

import { Sparkles, Command } from 'lucide-react';
import { useAgentStore } from '@/lib/stores/agentStore';

export function AgentTrigger() {
  const { openAgent, isOpen } = useAgentStore();

  if (isOpen) return null;

  return (
    <button
      onClick={() => openAgent()}
      className="fixed bottom-6 right-6 z-30 group"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-2xl bg-[var(--accent)] animate-ping opacity-20" />

      {/* Main button */}
      <div className="relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--foreground)] text-[var(--background)] shadow-lg hover:shadow-xl transition-all group-hover:scale-105">
        <Sparkles size={20} />
        <span className="font-medium text-sm">Ask Lark</span>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-xs">
          <Command size={12} />
          <span>K</span>
        </div>
      </div>
    </button>
  );
}

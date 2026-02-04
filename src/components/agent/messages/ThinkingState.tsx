'use client';

import { Check, Loader2 } from 'lucide-react';
import type { ThinkingStep } from '@/types/agent';

interface ThinkingStateProps {
  steps: ThinkingStep[];
}

export function ThinkingState({ steps }: ThinkingStateProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--background-subtle)] border border-[var(--card-border)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-[var(--foreground-muted)]">Thinking...</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 transition-opacity ${
                step.status === 'pending' ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {step.status === 'completed' ? (
                <Check size={12} className="text-[var(--success)] shrink-0" />
              ) : step.status === 'in_progress' ? (
                <Loader2 size={12} className="text-[var(--accent)] animate-spin shrink-0" />
              ) : (
                <div className="w-3 h-3 shrink-0" />
              )}
              <span className={step.status === 'completed' ? 'text-[var(--foreground-muted)]' : ''}>
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

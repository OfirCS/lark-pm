'use client';

import { Check, Loader2, AlertCircle } from 'lucide-react';
import type { SearchProgress as SearchProgressType } from '@/types/agent';

interface SearchProgressProps {
  progress?: SearchProgressType;
}

const platformLabels: Record<string, string> = {
  reddit: 'Reddit',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  forum: 'Forums',
  call: 'Call Transcripts',
  ticket: 'Support Tickets',
};

const platformColors: Record<string, string> = {
  reddit: '#ff4500',
  twitter: '#1c1917',
  linkedin: '#0077b5',
  forum: '#6366f1',
  call: '#059669',
  ticket: '#d97706',
};

export function SearchProgress({ progress }: SearchProgressProps) {
  if (!progress) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] px-4 py-4 rounded-2xl rounded-bl-md bg-[var(--background-subtle)] border border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="text-[var(--accent)] animate-spin" />
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] px-4 py-4 rounded-2xl rounded-bl-md bg-[var(--background-subtle)] border border-[var(--card-border)]">
        <div className="space-y-3">
          {/* Animated search line */}
          <div className="relative h-1 bg-[var(--card-border)] rounded-full overflow-hidden">
            <div className="absolute inset-y-0 w-1/3 bg-[var(--accent)] rounded-full search-progress-line" />
          </div>

          {/* Platform status */}
          <div className="space-y-2">
            {progress.platforms.map((platform) => (
              <div
                key={platform.platform}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  {platform.status === 'completed' ? (
                    <Check size={14} className="text-[var(--success)]" />
                  ) : platform.status === 'searching' ? (
                    <Loader2 size={14} className="text-[var(--accent)] animate-spin" />
                  ) : platform.status === 'error' ? (
                    <AlertCircle size={14} className="text-[var(--danger)]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--card-border)]" />
                  )}
                  <span
                    className="font-medium"
                    style={{ color: platform.status !== 'pending' ? platformColors[platform.platform] : undefined }}
                  >
                    {platformLabels[platform.platform] || platform.platform}
                  </span>
                </div>
                {platform.count !== undefined && platform.status === 'completed' && (
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {platform.count} found
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Total found */}
          {progress.totalFound > 0 && (
            <div className="pt-2 border-t border-[var(--card-border)]">
              <span className="text-sm font-medium">
                {progress.totalFound} mentions found
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

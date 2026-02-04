'use client';

import { ExternalLink, ArrowUp, MessageSquare, Heart, Repeat2 } from 'lucide-react';
import type { SearchResult, SentimentData } from '@/types/agent';

interface SourceCardsProps {
  results: SearchResult[];
  sentiment?: SentimentData;
}

const platformConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  reddit: { label: 'Reddit', color: '#ff4500', bgColor: 'rgba(255, 69, 0, 0.1)' },
  twitter: { label: 'X', color: '#1c1917', bgColor: 'rgba(28, 25, 23, 0.1)' },
  linkedin: { label: 'LinkedIn', color: '#0077b5', bgColor: 'rgba(0, 119, 181, 0.1)' },
  call: { label: 'Call', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.1)' },
  ticket: { label: 'Ticket', color: '#d97706', bgColor: 'rgba(217, 119, 6, 0.1)' },
  forum: { label: 'Forum', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)' },
};

const sentimentColors = {
  positive: 'text-[var(--success)] bg-[var(--success-subtle)]',
  negative: 'text-[var(--danger)] bg-[var(--danger-subtle)]',
  neutral: 'text-[var(--foreground-muted)] bg-[var(--background-subtle)]',
};

export function SourceCards({ results, sentiment }: SourceCardsProps) {
  if (results.length === 0) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--background-subtle)] border border-[var(--card-border)] text-sm text-[var(--foreground-muted)]">
          No results found. Try adjusting your search.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pl-1">
      {/* Sentiment summary */}
      {sentiment && (
        <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-[var(--background-subtle)] border border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <span className="text-xs">{sentiment.positive}% positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--danger)]" />
            <span className="text-xs">{sentiment.negative}% negative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--foreground-subtle)]" />
            <span className="text-xs">{sentiment.neutral}% neutral</span>
          </div>
        </div>
      )}

      {/* Result cards */}
      <div className="space-y-2">
        {results.slice(0, 5).map((result) => {
          const config = platformConfig[result.platform] || platformConfig.forum;

          return (
            <div
              key={result.id}
              className="group relative rounded-xl border border-[var(--card-border)] overflow-hidden hover:border-[var(--foreground-subtle)] transition-colors"
              style={{ borderLeftWidth: '3px', borderLeftColor: config.color }}
            >
              <div className="p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      {config.label}
                    </span>
                    {result.metadata.subreddit && (
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {result.metadata.subreddit}
                      </span>
                    )}
                    <span className="text-xs text-[var(--foreground-subtle)]">
                      {result.author} · {result.metadata.timestamp}
                    </span>
                  </div>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--background-subtle)] text-[var(--foreground-muted)] transition-all"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed mb-2 line-clamp-2">
                  &quot;{result.content}&quot;
                </p>

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                  {result.metadata.upvotes !== undefined && (
                    <span className="flex items-center gap-1">
                      <ArrowUp size={12} />
                      {result.metadata.upvotes}
                    </span>
                  )}
                  {result.metadata.comments !== undefined && (
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {result.metadata.comments}
                    </span>
                  )}
                  {result.metadata.likes !== undefined && (
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {result.metadata.likes}
                    </span>
                  )}
                  {result.metadata.retweets !== undefined && (
                    <span className="flex items-center gap-1">
                      <Repeat2 size={12} />
                      {result.metadata.retweets}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded capitalize ${sentimentColors[result.sentiment]}`}>
                    {result.sentiment}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more */}
      {results.length > 5 && (
        <button className="w-full py-2 text-xs text-[var(--accent)] hover:underline">
          Show {results.length - 5} more results
        </button>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextBar, WelcomeMessage, ChatInput } from '@/components/chat';
import { useAuth } from '@/components/providers/AuthProvider';
import { useReviewStore } from '@/lib/stores/reviewStore';
import { useCompanyStore, getCompanyContextForAI } from '@/lib/stores/companyStore';
import { cn } from '@/lib/utils';
import { SOURCE_CONFIG, PRIORITY_COLORS } from '@/types/pipeline';
import type { QueueStats, DraftedTicket } from '@/types/pipeline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'loading';
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-stone-300 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3 max-w-2xl', isUser && 'ml-auto')}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold">
          L
        </div>
      )}
      <div className={cn('flex-1 min-w-0', isUser && 'text-right')}>
        {message.type === 'loading' ? (
          <LoadingDots />
        ) : (
          <div
            className={cn(
              'inline-block text-left text-sm leading-relaxed',
              isUser
                ? 'bg-stone-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-md'
                : 'text-stone-700'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PulseFeed({ items }: { items: DraftedTicket[] }) {
  if (items.length === 0) return null;

  const recent = items.slice(0, 5);

  function getTimeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }

  return (
    <div className="pb-4">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Recent feedback</p>
      <div className="space-y-1">
        {recent.map((item, i) => {
          const src = SOURCE_CONFIG[item.feedbackItem.source];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 transition-colors group"
            >
              <span className="text-xs shrink-0 opacity-60">{src?.icon || '#'}</span>
              <span className="text-sm text-stone-700 truncate flex-1">{item.draft.title}</span>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0',
                PRIORITY_COLORS[item.classification.priority].bg,
                PRIORITY_COLORS[item.classification.priority].text
              )}>
                {item.classification.priority}
              </span>
              <span className="text-[10px] text-stone-300 shrink-0 w-6 text-right">
                {getTimeAgo(item.createdAt)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { user } = useAuth();
  const { company } = useCompanyStore();
  const drafts = useReviewStore((state) => state.drafts);

  const stats = useMemo<QueueStats>(() => {
    const s: QueueStats = {
      total: drafts.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      byCategory: { bug: 0, feature_request: 0, praise: 0, question: 0, complaint: 0, other: 0 },
      byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
      bySource: {},
    };
    drafts.forEach((d) => {
      if (d.status === 'pending' || d.status === 'edited') s.pending++;
      else if (d.status === 'approved') s.approved++;
      else if (d.status === 'rejected') s.rejected++;
      s.byCategory[d.classification.category]++;
      s.byPriority[d.classification.priority]++;
      s.bySource[d.feedbackItem.source] = (s.bySource[d.feedbackItem.source] || 0) + 1;
    });
    return s;
  }, [drafts]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getCollectedData = useCallback(() => {
    if (drafts.length === 0) return undefined;

    const items = drafts.slice(0, 20).map((d) => ({
      id: d.id,
      content: d.feedbackItem.content,
      title: d.feedbackItem.title,
      source: d.feedbackItem.source,
      category: d.classification.category,
      priority: d.classification.priority,
      sentiment: d.classification.sentiment,
      suggestedTitle: d.draft.title,
      status: d.status,
    }));

    return {
      items,
      stats: {
        total: stats.total,
        pending: stats.pending,
        byCategory: stats.byCategory,
        byPriority: stats.byPriority,
        bySource: stats.bySource,
      },
    };
  }, [drafts, stats]);

  const handleSend = async (input: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    const loadingId = 'loading-' + Date.now();
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: 'assistant', content: '', type: 'loading' },
    ]);

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          productName: company.productName || undefined,
          productContext: getCompanyContextForAI() || undefined,
          collectedData: getCollectedData(),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== loadingId),
        { id: assistantId, role: 'assistant', content: '' },
      ]);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'text' && data.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + data.content }
                      : m
                  )
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== loadingId),
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = () => {
    const suggestions: string[] = [];
    if (drafts.length > 0) {
      suggestions.push('Top issues from collected feedback');
      suggestions.push('Summarize urgent items');
      if (stats.byCategory.feature_request > 0) {
        suggestions.push('Most requested features');
      }
      if (stats.byCategory.bug > 0) {
        suggestions.push('Reported bugs');
      }
    } else {
      suggestions.push('Most requested features');
      suggestions.push('Sentiment trends this week');
      suggestions.push('Competitor analysis');
      suggestions.push('Help me prioritize my roadmap');
    }
    return suggestions.slice(0, 4);
  };

  const getHighlights = () => {
    const highlights: Array<{
      type: 'urgent' | 'trend' | 'suggestion';
      text: string;
      action: () => void;
    }> = [];

    const urgentCount = stats.byPriority.urgent;
    const pendingCount = stats.pending;
    const totalCount = stats.total;

    if (urgentCount > 0) {
      highlights.push({
        type: 'urgent',
        text: `${urgentCount} urgent item${urgentCount > 1 ? 's' : ''} need attention`,
        action: () => handleSend(`What are the ${urgentCount} urgent items?`),
      });
    }

    if (totalCount > 0) {
      highlights.push({
        type: 'trend',
        text: `${totalCount} feedback items from ${Object.keys(stats.bySource).length} source${Object.keys(stats.bySource).length !== 1 ? 's' : ''}`,
        action: () => handleSend('Summarize the collected feedback'),
      });
    }

    if (pendingCount > 0) {
      highlights.push({
        type: 'suggestion',
        text: `${pendingCount} ticket${pendingCount > 1 ? 's' : ''} pending review`,
        action: () => handleSend('Which pending tickets should I prioritize?'),
      });
    }

    return highlights;
  };

  const userName = user?.fullName
    ? user.fullName.split(' ')[0]
    : user?.email?.split('@')[0] || 'there';

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const contextStats = {
    conversationsAnalyzed: stats.total,
    newInsights: stats.pending,
    urgentItems: stats.byPriority.urgent,
    lastUpdate: stats.total > 0 ? 'recently' : 'no data yet',
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-3xl mx-auto">
      <ContextBar stats={contextStats} />

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <>
            <WelcomeMessage
              userName={userName}
              greetingTime={getGreetingTime()}
              highlights={getHighlights()}
            />
            <PulseFeed items={drafts} />
          </>
        )}

        <div className="space-y-5 pb-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-stone-100">
        <ChatInput
          suggestions={messages.length === 0 ? getSuggestions() : []}
          onSuggestionClick={handleSend}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

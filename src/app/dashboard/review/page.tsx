'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutGrid,
  List,
  Filter,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Inbox,
  Zap,
} from 'lucide-react';
import { KanbanColumn, KanbanCard } from '@/components/kanban';
import { useReviewStore } from '@/lib/stores/reviewStore';
import { SOURCE_CONFIG } from '@/types/pipeline';
import type { DraftedTicket } from '@/types/pipeline';
import { cn } from '@/lib/utils';

// Ticket status for the review queue UI
type TicketStatus = 'inbox' | 'edited' | 'approved' | 'rejected';

interface Ticket {
  id: string;
  title: string;
  source: string;
  sourceIcon: string;
  category: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  engagementScore: number;
  excerpt: string;
  status: TicketStatus;
}

// Map DraftedTicket to the format KanbanCard expects
function draftToTicket(draft: DraftedTicket): Ticket {
  const sourceConfig = SOURCE_CONFIG[draft.feedbackItem.source] || {
    icon: '📝',
    label: draft.feedbackItem.source,
  };

  let status: TicketStatus = 'inbox';
  if (draft.status === 'approved') status = 'approved';
  else if (draft.status === 'rejected') status = 'rejected';
  else if (draft.status === 'edited') status = 'edited';

  return {
    id: draft.id,
    title: draft.draft.title,
    source: sourceConfig.label + (draft.feedbackItem.metadata.subreddit ? ` r/${draft.feedbackItem.metadata.subreddit}` : ''),
    sourceIcon: sourceConfig.icon,
    category: draft.classification.category,
    priority: draft.classification.priority,
    sentiment: draft.classification.sentiment,
    engagementScore: draft.feedbackItem.engagementScore,
    excerpt: draft.feedbackItem.content.slice(0, 150),
    status,
  };
}

// Stats component
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'indigo' | 'amber' | 'emerald' | 'rose';
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-xl border', colorClasses[color])}>
      <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs opacity-80">{label}</p>
      </div>
    </div>
  );
}

export default function ReviewQueuePage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const drafts = useReviewStore((state) => state.drafts);
  const approveDraft = useReviewStore((state) => state.approveDraft);
  const rejectDraft = useReviewStore((state) => state.rejectDraft);

  // Map drafts to ticket format
  const tickets = drafts.map(draftToTicket);

  // Filter tickets
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by status
  const inboxTickets = filteredTickets.filter((t) => t.status === 'inbox');
  const reviewingTickets = filteredTickets.filter((t) => t.status === 'edited');
  const approvedTickets = filteredTickets.filter((t) => t.status === 'approved');
  const rejectedTickets = filteredTickets.filter((t) => t.status === 'rejected');

  // Handle refresh - just a visual feedback, data comes from store
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Handle approve
  const handleApprove = (ticketId: string) => {
    approveDraft(ticketId, 'linear');
  };

  // Handle reject
  const handleReject = (ticketId: string) => {
    rejectDraft(ticketId, 'Not relevant');
  };

  const isEmpty = drafts.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display tracking-tight text-stone-900">Review Queue</h1>
          <p className="text-sm text-stone-500">
            {isEmpty
              ? 'No tickets to review yet. Scan sources to generate tickets.'
              : 'Review, approve, and create tickets from customer feedback'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          {!isEmpty && (
            <div className="flex items-center bg-stone-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  viewMode === 'kanban'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                )}
              >
                <LayoutGrid size={16} />
                Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  viewMode === 'list'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                )}
              >
                <List size={16} />
                List
              </button>
            </div>
          )}

          {/* Refresh */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <RefreshCw size={20} className={cn(isRefreshing && 'animate-spin')} />
          </motion.button>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-6">
            <Inbox className="w-8 h-8 text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">No tickets to review</h2>
          <p className="text-stone-500 text-center max-w-sm mb-6">
            Scan sources from the Intelligence Hub or run the Magic Pipeline to generate ticket drafts for review.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/data"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors"
            >
              <Zap size={16} />
              Scan Sources
            </Link>
            <Link
              href="/dashboard/insights"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors"
            >
              Magic Pipeline
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Inbox"
              value={inboxTickets.length}
              icon={Clock}
              color="indigo"
            />
            <StatCard
              label="Edited"
              value={reviewingTickets.length}
              icon={AlertCircle}
              color="amber"
            />
            <StatCard
              label="Approved"
              value={approvedTickets.length}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              label="Rejected"
              value={rejectedTickets.length}
              icon={XCircle}
              color="rose"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Kanban Board */}
          <AnimatePresence mode="wait">
            {viewMode === 'kanban' ? (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4"
              >
                {/* Inbox Column */}
                <KanbanColumn id="inbox" title="Inbox" count={inboxTickets.length} color="slate">
                  {inboxTickets.map((ticket) => (
                    <KanbanCard
                      key={ticket.id}
                      {...ticket}
                      onApprove={() => handleApprove(ticket.id)}
                      onReject={() => handleReject(ticket.id)}
                      onView={() => {}}
                    />
                  ))}
                </KanbanColumn>

                {/* Edited Column */}
                <KanbanColumn id="edited" title="Edited" count={reviewingTickets.length} color="amber">
                  {reviewingTickets.map((ticket) => (
                    <KanbanCard
                      key={ticket.id}
                      {...ticket}
                      onApprove={() => handleApprove(ticket.id)}
                      onReject={() => handleReject(ticket.id)}
                      onView={() => {}}
                    />
                  ))}
                </KanbanColumn>

                {/* Approved Column */}
                <KanbanColumn id="approved" title="Approved" count={approvedTickets.length} color="emerald">
                  {approvedTickets.map((ticket) => (
                    <KanbanCard
                      key={ticket.id}
                      {...ticket}
                      onView={() => {}}
                    />
                  ))}
                </KanbanColumn>

                {/* Rejected Column */}
                <KanbanColumn id="rejected" title="Rejected" count={rejectedTickets.length} color="rose">
                  {rejectedTickets.map((ticket) => (
                    <KanbanCard
                      key={ticket.id}
                      {...ticket}
                      onView={() => {}}
                    />
                  ))}
                </KanbanColumn>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
              >
                {/* List view table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                          Feedback
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                          Source
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                          Priority
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-stone-50/50">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-stone-900 text-sm">{ticket.title}</p>
                              <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                                {ticket.excerpt}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span>{ticket.sourceIcon}</span>
                              <span className="text-sm text-stone-600">{ticket.source}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                ticket.priority === 'urgent' && 'bg-rose-100 text-rose-700',
                                ticket.priority === 'high' && 'bg-orange-100 text-orange-700',
                                ticket.priority === 'medium' && 'bg-indigo-100 text-indigo-700',
                                ticket.priority === 'low' && 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium capitalize',
                                ticket.status === 'inbox' && 'bg-indigo-100 text-indigo-700',
                                ticket.status === 'edited' && 'bg-amber-100 text-amber-700',
                                ticket.status === 'approved' && 'bg-emerald-100 text-emerald-700',
                                ticket.status === 'rejected' && 'bg-rose-100 text-rose-700'
                              )}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {(ticket.status === 'inbox' || ticket.status === 'edited') && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleApprove(ticket.id)}
                                  className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(ticket.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

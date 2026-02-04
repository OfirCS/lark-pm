'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { KanbanColumn, KanbanCard } from '@/components/kanban';
import { cn } from '@/lib/utils';

// Types
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
  status: 'inbox' | 'reviewing' | 'approved' | 'rejected';
}

// Mock data
const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'SSO/SAML Authentication for Enterprise',
    source: 'Reddit r/SaaS',
    sourceIcon: '🔴',
    category: 'feature_request',
    priority: 'urgent',
    sentiment: 'positive',
    engagementScore: 94,
    excerpt: 'We love the product but IT requires SSO before we can deploy to 500+ employees. This is blocking our rollout.',
    status: 'inbox',
  },
  {
    id: '2',
    title: 'API Rate Limiting Issues',
    source: 'Twitter',
    sourceIcon: '🐦',
    category: 'bug',
    priority: 'high',
    sentiment: 'negative',
    engagementScore: 78,
    excerpt: 'Getting 429 errors constantly. Our integration is basically unusable right now.',
    status: 'inbox',
  },
  {
    id: '3',
    title: 'Dark Mode Support',
    source: 'Slack #feedback',
    sourceIcon: '💬',
    category: 'feature_request',
    priority: 'medium',
    sentiment: 'positive',
    engagementScore: 65,
    excerpt: 'Would love to have dark mode for late night work sessions.',
    status: 'inbox',
  },
  {
    id: '4',
    title: 'Mobile App for iOS/Android',
    source: 'Support Ticket',
    sourceIcon: '🎫',
    category: 'feature_request',
    priority: 'high',
    sentiment: 'positive',
    engagementScore: 87,
    excerpt: 'Customers asking for mobile access to check dashboards on the go.',
    status: 'reviewing',
  },
  {
    id: '5',
    title: 'Onboarding Flow Confusion',
    source: 'Twitter',
    sourceIcon: '🐦',
    category: 'complaint',
    priority: 'medium',
    sentiment: 'negative',
    engagementScore: 54,
    excerpt: 'The setup wizard is confusing. Took me 20 minutes to figure out.',
    status: 'reviewing',
  },
  {
    id: '6',
    title: 'Salesforce Integration',
    source: 'Reddit r/SaaS',
    sourceIcon: '🔴',
    category: 'feature_request',
    priority: 'urgent',
    sentiment: 'positive',
    engagementScore: 89,
    excerpt: 'Direct Salesforce sync would save us hours of manual work every week.',
    status: 'approved',
  },
  {
    id: '7',
    title: 'Export to CSV/PDF',
    source: 'Slack #feedback',
    sourceIcon: '💬',
    category: 'feature_request',
    priority: 'low',
    sentiment: 'neutral',
    engagementScore: 42,
    excerpt: 'Need ability to export reports for stakeholder meetings.',
    status: 'rejected',
  },
];

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
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter tickets
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by status
  const inboxTickets = filteredTickets.filter((t) => t.status === 'inbox');
  const reviewingTickets = filteredTickets.filter((t) => t.status === 'reviewing');
  const approvedTickets = filteredTickets.filter((t) => t.status === 'approved');
  const rejectedTickets = filteredTickets.filter((t) => t.status === 'rejected');

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  // Handle status change
  const handleStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Review Queue</h1>
          <p className="text-sm text-stone-500">
            Review, approve, and create tickets from customer feedback
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Inbox"
          value={inboxTickets.length}
          icon={Clock}
          color="indigo"
        />
        <StatCard
          label="Reviewing"
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
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors">
          <Filter size={16} />
          Filter
        </button>
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
                  onApprove={() => handleStatusChange(ticket.id, 'approved')}
                  onReject={() => handleStatusChange(ticket.id, 'rejected')}
                  onView={() => console.log('View', ticket.id)}
                />
              ))}
            </KanbanColumn>

            {/* Reviewing Column */}
            <KanbanColumn id="reviewing" title="Reviewing" count={reviewingTickets.length} color="amber">
              {reviewingTickets.map((ticket) => (
                <KanbanCard
                  key={ticket.id}
                  {...ticket}
                  onApprove={() => handleStatusChange(ticket.id, 'approved')}
                  onReject={() => handleStatusChange(ticket.id, 'rejected')}
                  onView={() => console.log('View', ticket.id)}
                />
              ))}
            </KanbanColumn>

            {/* Approved Column */}
            <KanbanColumn id="approved" title="Approved" count={approvedTickets.length} color="emerald">
              {approvedTickets.map((ticket) => (
                <KanbanCard
                  key={ticket.id}
                  {...ticket}
                  onView={() => console.log('View', ticket.id)}
                />
              ))}
            </KanbanColumn>

            {/* Rejected Column */}
            <KanbanColumn id="rejected" title="Rejected" count={rejectedTickets.length} color="rose">
              {rejectedTickets.map((ticket) => (
                <KanbanCard
                  key={ticket.id}
                  {...ticket}
                  onView={() => console.log('View', ticket.id)}
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
                            ticket.status === 'reviewing' && 'bg-amber-100 text-amber-700',
                            ticket.status === 'approved' && 'bg-emerald-100 text-emerald-700',
                            ticket.status === 'rejected' && 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

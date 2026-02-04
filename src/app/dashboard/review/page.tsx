'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Inbox,
  Loader2,
  Plus,
  Check,
  X,
  Filter,
  Search,
  ChevronDown,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  MoreHorizontal,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useReviewStore, createDraftFromFeedback } from '@/lib/stores/reviewStore';
import type { DraftedTicket, FeedbackItem, ClassificationResult, ReviewStatus, FeedbackCategory, Priority } from '@/types/pipeline';
import {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  SOURCE_CONFIG,
} from '@/types/pipeline';

// --- Utility Functions ---

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function formatCategory(category: string): string {
  return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// --- Components ---

function FilterDropdown({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 cursor-pointer"
      >
        <option value="all">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
  variant = 'default'
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  variant?: 'default' | 'warning' | 'success';
}) {
  const styles = {
    default: 'bg-white border-stone-200 text-stone-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${styles[variant]}`}>
      <Icon size={18} className="opacity-60" />
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs opacity-70">{label}</p>
      </div>
    </div>
  );
}

// Clean Feedback Card
function FeedbackCard({
  draft,
  onApprove,
  onReject,
}: {
  draft: DraftedTicket;
  onApprove: (id: string, platform: 'linear' | 'jira' | 'github') => void;
  onReject: (id: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'linear' | 'jira' | 'github'>('linear');

  const { feedbackItem, classification, draft: ticketDraft, status } = draft;
  const priorityColors = PRIORITY_COLORS[classification.priority];
  const categoryColors = CATEGORY_COLORS[classification.category];
  const sourceConfig = SOURCE_CONFIG[feedbackItem.source] || SOURCE_CONFIG.reddit;
  const timeAgo = getTimeAgo(new Date(draft.createdAt));

  const isActionable = status === 'pending' || status === 'edited';

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${
      status === 'approved'
        ? 'border-emerald-200 bg-emerald-50/30'
        : status === 'rejected'
        ? 'border-stone-200 opacity-50'
        : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
    }`}>
      {/* Main Content */}
      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Priority Indicator */}
          <div className={`w-1 h-16 rounded-full flex-shrink-0 ${
            classification.priority === 'urgent' ? 'bg-rose-500' :
            classification.priority === 'high' ? 'bg-orange-400' :
            classification.priority === 'medium' ? 'bg-blue-400' :
            'bg-stone-200'
          }`} />

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-medium text-stone-900 mb-1 pr-4">
              {ticketDraft.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                {formatCategory(classification.category)}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${priorityColors.bg} ${priorityColors.text}`}>
                {classification.priority}
              </span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-500 text-xs">{sourceConfig.label}</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-400 text-xs">{timeAgo}</span>
            </div>
          </div>

          {/* Status Badge */}
          {status === 'approved' && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
              <CheckCircle2 size={14} />
              Created
            </span>
          )}
          {status === 'rejected' && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-500 rounded-lg text-xs font-medium">
              Dismissed
            </span>
          )}
        </div>

        {/* Original Feedback Quote */}
        <div className="bg-stone-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            &ldquo;{feedbackItem.content.slice(0, 200)}{feedbackItem.content.length > 200 ? '...' : ''}&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
            <span>{feedbackItem.authorHandle || feedbackItem.author}</span>
            {feedbackItem.sourceUrl && (
              <>
                <span>·</span>
                <a
                  href={feedbackItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-500 hover:text-stone-700 flex items-center gap-1"
                >
                  View source <ExternalLink size={10} />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="border-t border-stone-100 pt-4 mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-stone-500 mb-1">Suggested Description</p>
              <p className="text-sm text-stone-700 whitespace-pre-line">{ticketDraft.description}</p>
            </div>
            {ticketDraft.suggestedLabels.length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone-500 mb-1">Labels</p>
                <div className="flex flex-wrap gap-1">
                  {ticketDraft.suggestedLabels.map((label) => (
                    <span key={label} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {isActionable && (
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onReject(draft.id)}
                className="px-3 py-2 text-sm text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Dismiss
              </button>

              {/* Platform Selector + Create Button */}
              <div className="flex items-center bg-stone-900 rounded-xl overflow-hidden">
                <button
                  onClick={() => onApprove(draft.id, selectedPlatform)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  <Check size={14} />
                  Create Ticket
                </button>
                <div className="w-px h-6 bg-stone-700" />
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as 'linear' | 'jira' | 'github')}
                  className="appearance-none bg-transparent text-white text-xs px-3 py-2 cursor-pointer focus:outline-none"
                >
                  <option value="linear">Linear</option>
                  <option value="jira">Jira</option>
                  <option value="github">GitHub</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Approved ticket link */}
        {status === 'approved' && draft.createdTicket && (
          <div className="flex items-center justify-between pt-4 border-t border-emerald-100 mt-4">
            <span className="text-sm text-emerald-700">
              Ticket created in {draft.createdTicket.platform}
            </span>
            <a
              href={draft.createdTicket.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Open ticket <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---

export default function ReviewQueuePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const {
    drafts,
    approveDraft,
    rejectDraft,
    getStats,
    addDraft,
  } = useReviewStore();

  const stats = getStats();

  // Filter drafts
  const filteredDrafts = drafts.filter((draft) => {
    if (statusFilter !== 'all' && draft.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && draft.classification.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && draft.classification.priority !== priorityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        draft.draft.title.toLowerCase().includes(query) ||
        draft.feedbackItem.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group by status for better organization
  const pendingDrafts = filteredDrafts.filter(d => d.status === 'pending');
  const completedDrafts = filteredDrafts.filter(d => d.status === 'approved' || d.status === 'rejected');

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/pipeline/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: ['reddit', 'twitter'],
          queries: ['saas', 'startup', 'product feedback'],
        }),
      });
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle approve
  const handleApprove = async (id: string, platform: 'linear' | 'jira' | 'github') => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          ticket: {
            title: draft.editedDraft?.title || draft.draft.title,
            description: draft.editedDraft?.description || draft.draft.description,
            priority: draft.editedDraft?.priority || draft.draft.suggestedPriority,
            labels: draft.editedDraft?.labels || draft.draft.suggestedLabels,
            source: {
              type: draft.feedbackItem.source,
              url: draft.feedbackItem.sourceUrl,
            },
          },
        }),
      });

      const result = await response.json();
      approveDraft(id, platform as 'linear' | 'jira', result.success ? { ticketId: result.ticketId, ticketUrl: result.ticketUrl } : undefined);
    } catch (error) {
      console.error('Approve failed:', error);
      approveDraft(id, platform as 'linear' | 'jira');
    }
  };

  // Handle reject
  const handleReject = (id: string) => {
    rejectDraft(id);
  };

  // Add demo data
  const addDemoData = () => {
    const demoFeedback: FeedbackItem = {
      id: `fb_demo_${Date.now()}`,
      source: 'reddit',
      sourceId: 'demo123',
      sourceUrl: 'https://reddit.com/r/SaaS/comments/demo',
      title: 'Need SSO for enterprise deployment',
      content:
        'We love the product but our IT team requires SSO/SAML authentication before we can deploy to our 500+ employees. This is currently blocking our enterprise rollout. Any timeline on this feature?',
      author: 'enterprise_user',
      authorHandle: 'u/enterprise_user',
      createdAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      engagementScore: 85,
      metadata: { subreddit: 'SaaS', replyCount: 23 },
    };

    const demoClassification: ClassificationResult = {
      category: 'feature_request',
      confidence: 94,
      priority: 'high',
      priorityReasons: ['Enterprise customer', 'Revenue blocker', 'High engagement'],
      sentiment: 'positive',
      keywords: ['SSO', 'SAML', 'enterprise', 'authentication'],
      customerSegment: 'enterprise',
    };

    const demoDraft = createDraftFromFeedback(demoFeedback, demoClassification, {
      title: 'Add SSO/SAML Authentication for Enterprise',
      description: `## Context
A user is requesting SSO/SAML authentication, stating it's blocking their enterprise rollout to 500+ employees.

## User Feedback
> "We love the product but our IT team requires SSO/SAML authentication before we can deploy to our 500+ employees."

## Recommendation
This is a high-priority feature request from an enterprise prospect. SSO is a common enterprise requirement and likely blocking multiple deals.

## Source
[Reddit r/SaaS](https://reddit.com/r/SaaS/comments/demo)`,
      suggestedLabels: ['enterprise', 'auth', 'feature-request', 'high-priority'],
      suggestedPriority: 'high',
    });

    addDraft(demoDraft);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/data" className="text-stone-400 hover:text-stone-600 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="h-6 w-px bg-stone-200" />
              <div>
                <h1 className="text-lg font-semibold text-stone-900">Review Queue</h1>
                <p className="text-xs text-stone-500">
                  {stats.pending} pending · {stats.approved} created
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={addDemoData}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <Plus size={16} />
                Add Sample
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {isRefreshing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatBadge icon={Inbox} label="Total" value={stats.total} />
          <StatBadge icon={Clock} label="Pending" value={stats.pending} variant={stats.pending > 0 ? 'warning' : 'default'} />
          <StatBadge icon={CheckCircle2} label="Created" value={stats.approved} variant="success" />
          <StatBadge icon={AlertCircle} label="High Priority" value={stats.byPriority.urgent + stats.byPriority.high} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300"
            />
          </div>

          {/* Filter Dropdowns */}
          <FilterDropdown
            label="All Status"
            value={statusFilter}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Created' },
              { value: 'rejected', label: 'Dismissed' },
            ]}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="All Types"
            value={categoryFilter}
            options={[
              { value: 'feature_request', label: 'Feature Request' },
              { value: 'bug', label: 'Bug' },
              { value: 'question', label: 'Question' },
              { value: 'complaint', label: 'Complaint' },
            ]}
            onChange={setCategoryFilter}
          />
          <FilterDropdown
            label="All Priorities"
            value={priorityFilter}
            options={[
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            onChange={setPriorityFilter}
          />

          {(statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setPriorityFilter('all');
                setSearchQuery('');
              }}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Content */}
        {filteredDrafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
              <Inbox size={28} className="text-stone-300" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              {drafts.length === 0 ? 'No feedback to review' : 'No matching items'}
            </h3>
            <p className="text-sm text-stone-500 text-center max-w-sm mb-6">
              {drafts.length === 0
                ? 'Collect feedback from the pipeline to see items here, or add a sample to test the flow.'
                : 'Try adjusting your filters to see more results.'}
            </p>
            {drafts.length === 0 && (
              <div className="flex gap-3">
                <button
                  onClick={addDemoData}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
                >
                  <Plus size={16} />
                  Add Sample Data
                </button>
                <Link
                  href="/dashboard/data"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Go to Pipeline
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Items */}
            {pendingDrafts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider">
                  Pending Review ({pendingDrafts.length})
                </h2>
                {pendingDrafts.map((draft) => (
                  <FeedbackCard
                    key={draft.id}
                    draft={draft}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}

            {/* Completed Items */}
            {completedDrafts.length > 0 && statusFilter === 'all' && (
              <div className="space-y-4 pt-6">
                <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider">
                  Completed ({completedDrafts.length})
                </h2>
                {completedDrafts.map((draft) => (
                  <FeedbackCard
                    key={draft.id}
                    draft={draft}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}

            {/* Show completed when filtered */}
            {statusFilter !== 'all' && filteredDrafts.map((draft) => (
              <FeedbackCard
                key={draft.id}
                draft={draft}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

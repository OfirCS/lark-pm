'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  TrendingUp,
  Settings,
  ArrowLeft,
  Search,
  RefreshCw,
  Loader2,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  Inbox,
  Check,
  Clock,
  AlertCircle,
  Filter,
  ChevronRight,
  Plus,
  Sparkles,
  Target,
  BarChart3,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useReviewStore, createDraftFromFeedback } from '@/lib/stores/reviewStore';
import { searchReddit } from '@/lib/sources/reddit';
import { normalizeRedditPosts } from '@/lib/pipeline/normalizer';
import { classifyFeedback } from '@/lib/pipeline/classifier';
import { draftTicket } from '@/lib/pipeline/drafter';
import type { DraftedTicket } from '@/types/pipeline';
import {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  SOURCE_CONFIG,
} from '@/types/pipeline';

// --- Utility Functions ---

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatCategory(category: string): string {
  return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// --- Components ---

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'neutral',
  loading
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/60 p-6 hover:shadow-lg hover:border-stone-300/60 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-stone-50 flex items-center justify-center">
          <Icon size={20} className="text-stone-600" />
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            changeType === 'positive' ? 'bg-emerald-50 text-emerald-600' :
            changeType === 'negative' ? 'bg-rose-50 text-rose-600' :
            'bg-stone-100 text-stone-500'
          }`}>
            {change}
          </span>
        )}
      </div>
      {loading ? (
        <Loader2 className="w-7 h-7 animate-spin text-stone-300" />
      ) : (
        <h3 className="text-3xl font-semibold text-stone-900 tracking-tight mb-1">{value}</h3>
      )}
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}

function PipelineStep({
  step,
  title,
  description,
  isActive,
  isComplete,
  count
}: {
  step: number;
  title: string;
  description: string;
  isActive?: boolean;
  isComplete?: boolean;
  count?: number;
}) {
  return (
    <div className={`flex-1 relative ${isActive ? 'opacity-100' : 'opacity-70'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
          isComplete ? 'bg-emerald-500 text-white' :
          isActive ? 'bg-stone-900 text-white' :
          'bg-stone-100 text-stone-400'
        }`}>
          {isComplete ? <Check size={18} /> : step}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-stone-900">{title}</h4>
            {count !== undefined && count > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Quick Action Item in Pipeline View
function FeedbackRow({
  draft,
  onApprove,
  onReject
}: {
  draft: DraftedTicket;
  onApprove: (id: string, platform: 'linear' | 'jira') => void;
  onReject: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const priorityColors = PRIORITY_COLORS[draft.classification.priority];
  const categoryColors = CATEGORY_COLORS[draft.classification.category];

  return (
    <tr
      className="group border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            draft.classification.priority === 'urgent' ? 'bg-rose-500' :
            draft.classification.priority === 'high' ? 'bg-orange-500' :
            draft.classification.priority === 'medium' ? 'bg-blue-500' :
            'bg-stone-300'
          }`} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-stone-900 text-sm truncate">{draft.draft.title}</p>
            <p className="text-xs text-stone-500 truncate">{draft.feedbackItem.content.slice(0, 80)}...</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
          {formatCategory(draft.classification.category)}
        </span>
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${priorityColors.bg} ${priorityColors.text}`}>
          {draft.classification.priority}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">{SOURCE_CONFIG[draft.feedbackItem.source]?.label}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-xs text-stone-400">{getTimeAgo(draft.createdAt)}</span>
      </td>
      <td className="py-4 px-4">
        {draft.status === 'pending' ? (
          <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => onApprove(draft.id, 'linear')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <Check size={12} />
              Create
            </button>
            <button
              onClick={() => onReject(draft.id)}
              className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <XCircle size={16} />
            </button>
          </div>
        ) : draft.status === 'approved' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 size={14} />
            Created
          </span>
        ) : (
          <span className="text-xs text-stone-400">Dismissed</span>
        )}
      </td>
    </tr>
  );
}

// Recent Activity Feed Item
function ActivityItem({ draft }: { draft: DraftedTicket }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
        draft.feedbackItem.source === 'reddit' ? 'bg-orange-100 text-orange-600' :
        draft.feedbackItem.source === 'twitter' ? 'bg-stone-100 text-stone-600' :
        'bg-blue-100 text-blue-600'
      }`}>
        {draft.feedbackItem.source === 'reddit' ? 'R' :
         draft.feedbackItem.source === 'twitter' ? 'X' : 'S'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-700 line-clamp-2">{draft.feedbackItem.content.slice(0, 120)}...</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_COLORS[draft.classification.category].bg} ${CATEGORY_COLORS[draft.classification.category].text}`}>
            {formatCategory(draft.classification.category)}
          </span>
          <span className="text-xs text-stone-400">{getTimeAgo(draft.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function DataPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; status: string } | null>(null);

  const { drafts, addDraft, approveDraft, rejectDraft, getStats } = useReviewStore();
  const stats = getStats();

  // Get pending items
  const pendingDrafts = drafts.filter(d => d.status === 'pending');
  const recentDrafts = [...drafts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Scan sources and run pipeline
  const handleScan = async () => {
    setIsScanning(true);
    setScanProgress({ current: 0, total: 9, status: 'Starting...' });

    try {
      const subreddits = ['SaaS', 'startups', 'ProductManagement'];
      let processed = 0;

      for (const subreddit of subreddits) {
        setScanProgress({ current: processed, total: 9, status: `Checking r/${subreddit}...` });

        try {
          const result = await searchReddit('product feedback', {
            subreddit,
            limit: 5,
            time: 'week',
          });

          if (result.posts.length > 0) {
            const feedbackItems = normalizeRedditPosts(result.posts);

            for (const item of feedbackItems.slice(0, 3)) {
              setScanProgress({ current: processed, total: 9, status: `Processing feedback...` });

              const classification = await classifyFeedback(item);
              const draft = await draftTicket(item, classification);
              const draftedTicket = createDraftFromFeedback(item, classification, draft);
              addDraft(draftedTicket);
              processed++;
            }
          }
        } catch (error) {
          console.error(`Error scanning r/${subreddit}:`, error);
        }
      }

      setScanProgress({ current: 9, total: 9, status: 'Complete!' });
      setTimeout(() => setScanProgress(null), 1500);
    } catch (error) {
      console.error('Scan error:', error);
      setScanProgress(null);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle approve
  const handleApprove = async (id: string, platform: 'linear' | 'jira') => {
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
      approveDraft(id, platform, result.success ? { ticketId: result.ticketId, ticketUrl: result.ticketUrl } : undefined);
    } catch (error) {
      console.error('Approve failed:', error);
      approveDraft(id, platform);
    }
  };

  const handleReject = (id: string) => {
    rejectDraft(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-stone-400 hover:text-stone-600 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="h-6 w-px bg-stone-200" />
              <Logo size="sm" />
            </div>

            <div className="flex items-center gap-3">
              {scanProgress && (
                <div className="flex items-center gap-3 px-4 py-2 bg-stone-50 rounded-xl border border-stone-200">
                  <Loader2 size={16} className="animate-spin text-stone-500" />
                  <span className="text-sm text-stone-600">{scanProgress.status}</span>
                  <div className="w-20 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-900 rounded-full transition-all duration-300"
                      style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50 shadow-sm"
              >
                {isScanning ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Collect Feedback
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Feedback Pipeline</h1>
          <p className="text-stone-500 mt-1">Collect, review, and create tickets from customer feedback</p>
        </div>

        {/* Pipeline Progress */}
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 mb-8">
          <div className="flex items-center gap-4">
            <PipelineStep
              step={1}
              title="Collect"
              description="Gather feedback from sources"
              isComplete={drafts.length > 0}
              isActive={isScanning}
            />
            <ChevronRight size={20} className="text-stone-300 flex-shrink-0" />
            <PipelineStep
              step={2}
              title="Review"
              description="Review and prioritize items"
              isActive={pendingDrafts.length > 0}
              count={pendingDrafts.length}
            />
            <ChevronRight size={20} className="text-stone-300 flex-shrink-0" />
            <PipelineStep
              step={3}
              title="Create"
              description="Push to Linear, Jira, or GitHub"
              isComplete={stats.approved > 0}
              count={stats.approved}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <MetricCard
            icon={Inbox}
            label="Total Feedback"
            value={stats.total}
            loading={isScanning}
          />
          <MetricCard
            icon={Clock}
            label="Pending Review"
            value={stats.pending}
            change={stats.pending > 0 ? 'Action needed' : undefined}
            changeType={stats.pending > 0 ? 'negative' : 'neutral'}
          />
          <MetricCard
            icon={Target}
            label="Feature Requests"
            value={stats.byCategory.feature_request}
          />
          <MetricCard
            icon={AlertCircle}
            label="Bugs Reported"
            value={stats.byCategory.bug}
            change={stats.byCategory.bug > 0 ? `${stats.byPriority.urgent + stats.byPriority.high} high priority` : undefined}
            changeType={stats.byPriority.urgent + stats.byPriority.high > 0 ? 'negative' : 'neutral'}
          />
        </div>

        {/* Main Content Area */}
        {drafts.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border border-stone-200/60 p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">No feedback collected yet</h3>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              Click &ldquo;Collect Feedback&rdquo; to scan Reddit, Twitter, and other sources for customer feedback and feature requests.
            </p>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-all shadow-sm"
            >
              {isScanning ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Zap size={18} />
              )}
              Start Collecting
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Main Table */}
            <div className="col-span-2 bg-white rounded-2xl border border-stone-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900">Review Queue</h3>
                  <p className="text-sm text-stone-500">{pendingDrafts.length} items waiting for review</p>
                </div>
                <Link
                  href="/dashboard/review"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
                >
                  View all <ArrowUpRight size={14} />
                </Link>
              </div>

              {pendingDrafts.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-stone-600 font-medium">All caught up!</p>
                  <p className="text-sm text-stone-400">No pending items to review</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-stone-50/50">
                    <tr className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                      <th className="text-left py-3 px-4">Feedback</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Source</th>
                      <th className="text-left py-3 px-4">Time</th>
                      <th className="text-left py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDrafts.slice(0, 8).map((draft) => (
                      <FeedbackRow
                        key={draft.id}
                        draft={draft}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl border border-stone-200/60 p-5">
                <h4 className="font-semibold text-stone-900 mb-4">By Category</h4>
                <div className="space-y-3">
                  {Object.entries(stats.byCategory)
                    .filter(([_, count]) => count > 0)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-stone-600">{formatCategory(category)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]?.bg.replace('bg-', 'bg-').replace('-50', '-400') || 'bg-stone-400'}`}
                              style={{ width: `${Math.min((count / stats.total) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-stone-900 w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-stone-200/60 p-5">
                <h4 className="font-semibold text-stone-900 mb-4">Recent Activity</h4>
                {recentDrafts.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-1">
                    {recentDrafts.map((draft) => (
                      <ActivityItem key={draft.id} draft={draft} />
                    ))}
                  </div>
                )}
              </div>

              {/* Integrations Status */}
              <div className="bg-white rounded-2xl border border-stone-200/60 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-stone-900">Integrations</h4>
                  <Link href="/settings" className="text-xs text-stone-500 hover:text-stone-700">
                    Configure
                  </Link>
                </div>
                <div className="space-y-3">
                  {['Linear', 'Jira', 'GitHub'].map((integration) => (
                    <div key={integration} className="flex items-center justify-between py-2">
                      <span className="text-sm text-stone-600">{integration}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

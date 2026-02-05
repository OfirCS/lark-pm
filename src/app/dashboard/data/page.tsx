'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  MessageSquare,
  ArrowUp,
  ExternalLink,
  Inbox,
  Zap,
  BarChart3,
  Home,
} from 'lucide-react';
import { useReviewStore, createDraftFromFeedback } from '@/lib/stores/reviewStore';
import { useCompanyStore } from '@/lib/stores/companyStore';
import { normalizeRedditPosts, normalizeTweets } from '@/lib/pipeline/normalizer';
import type { RedditPost } from '@/lib/sources/reddit';
import type { Tweet } from '@/lib/sources/twitter';
import { classifyFeedback } from '@/lib/pipeline/classifier';
import { draftTicket } from '@/lib/pipeline/drafter';
import type { DraftedTicket } from '@/types/pipeline';
import {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  SENTIMENT_COLORS,
  SOURCE_CONFIG,
} from '@/types/pipeline';

// --- Sub-Components ---

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'gray' | 'red' | 'orange' | 'blue' | 'green' }) {
  const styles = {
    gray: 'bg-stone-100 text-stone-600',
    red: 'bg-rose-50 text-rose-700',
    orange: 'bg-orange-50 text-orange-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[color]}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, loading, icon: Icon }: { label: string; value: string | number; trend?: string; loading?: boolean; icon?: React.ElementType }) {
  return (
    <div className="p-5 bg-white border border-stone-200 rounded-xl hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        {Icon && <Icon size={18} className="text-stone-300" />}
      </div>
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      ) : (
        <h3 className="text-3xl font-semibold text-stone-900 tracking-tight">{value}</h3>
      )}
    </div>
  );
}

function RequestsView({ drafts }: { drafts: DraftedTicket[] }) {
  const featureRequests = drafts.filter(
    (d) => d.classification.category === 'feature_request' || d.classification.category === 'bug'
  );

  if (featureRequests.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
        <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500">No feature requests yet. Scan sources to find feedback.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
        <h3 className="font-semibold text-stone-900">Feature Requests & Bugs</h3>
        <Link
          href="/dashboard/review"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View Review Queue <ExternalLink size={12} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-200">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {featureRequests.slice(0, 10).map((req) => (
              <tr key={req.id} className="hover:bg-stone-50/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-stone-900 line-clamp-1">{req.draft.title}</div>
                  <div className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                    {req.feedbackItem.content.slice(0, 60)}...
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${CATEGORY_COLORS[req.classification.category].bg} ${CATEGORY_COLORS[req.classification.category].text}`}>
                    {req.classification.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${PRIORITY_COLORS[req.classification.priority].bg} ${PRIORITY_COLORS[req.classification.priority].text}`}>
                    {req.classification.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs">{SOURCE_CONFIG[req.feedbackItem.source]?.label}</span>
                </td>
                <td className="px-6 py-4">
                  <Badge color={req.status === 'approved' ? 'green' : req.status === 'rejected' ? 'red' : 'gray'}>
                    {req.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedView({ drafts }: { drafts: DraftedTicket[] }) {
  if (drafts.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl bg-white">
        <p className="text-stone-400 text-sm">No mentions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {drafts.slice(0, 5).map((item) => (
        <div key={item.id} className="p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 hover:shadow-sm transition-all">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                item.feedbackItem.source === 'reddit' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {item.feedbackItem.source}
              </span>
              <span className="text-sm font-medium text-stone-900">
                {item.feedbackItem.authorHandle || item.feedbackItem.author}
              </span>
              <span className="text-stone-400 text-xs">{getTimeAgo(item.createdAt)}</span>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${SENTIMENT_COLORS[item.classification.sentiment].bg} ${SENTIMENT_COLORS[item.classification.sentiment].text}`}>
              {item.classification.sentiment}
            </span>
          </div>
          <p className="text-stone-700 text-sm leading-relaxed line-clamp-2">
            {item.feedbackItem.content}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_COLORS[item.classification.category].bg} ${CATEGORY_COLORS[item.classification.category].text}`}>
              {item.classification.category.replace('_', ' ')}
            </span>
            {item.feedbackItem.sourceUrl && (
              <a
                href={item.feedbackItem.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
              >
                View source <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// --- Main Page (renders inside DashboardLayout, no own sidebar) ---

export default function DataPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'social'>('overview');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  const drafts = useReviewStore(state => state.drafts);
  const addDraft = useReviewStore(state => state.addDraft);
  const { company, getRedditSearchTerms, getTwitterSearchTerms } = useCompanyStore();

  const stats = useMemo(() => {
    const result = {
      total: drafts.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      byCategory: { bug: 0, feature_request: 0, praise: 0, question: 0, complaint: 0, other: 0 } as Record<string, number>,
      byPriority: { urgent: 0, high: 0, medium: 0, low: 0 } as Record<string, number>,
      bySource: {} as Record<string, number>,
    };
    drafts.forEach(draft => {
      if (draft.status === 'pending' || draft.status === 'edited') result.pending++;
      else if (draft.status === 'approved') result.approved++;
      else if (draft.status === 'rejected') result.rejected++;
      const category = draft.classification?.category || 'other';
      result.byCategory[category] = (result.byCategory[category] || 0) + 1;
      const priority = draft.classification?.priority || 'medium';
      result.byPriority[priority] = (result.byPriority[priority] || 0) + 1;
      const source = draft.feedbackItem?.source || 'unknown';
      result.bySource[source] = (result.bySource[source] || 0) + 1;
    });
    return result;
  }, [drafts]);

  const productName = company.productName || 'product';
  const subreddits = company.subreddits.length > 0 ? company.subreddits : ['SaaS', 'startups', 'ProductManagement'];
  const redditSearchTerms = getRedditSearchTerms();
  const twitterSearchTerms = getTwitterSearchTerms();

  const handleScan = async () => {
    setIsScanning(true);
    setScanStatus(`Searching for "${productName}" feedback...`);
    try {
      const searchQuery = redditSearchTerms[0] || `${productName} feedback`;
      for (const subreddit of subreddits.slice(0, 4)) {
        setScanStatus(`Scanning r/${subreddit}...`);
        try {
          const response = await fetch('/api/sources/reddit/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery, subreddit, limit: 5, time: 'week' }),
          });
          if (!response.ok) continue;
          const result = await response.json();
          const posts = result.posts as RedditPost[];
          if (posts.length > 0) {
            const feedbackItems = normalizeRedditPosts(posts);
            for (const item of feedbackItems.slice(0, 3)) {
              setScanStatus(`Classifying: ${item.title?.slice(0, 30) || item.content.slice(0, 30)}...`);
              const classification = await classifyFeedback(item);
              const draft = await draftTicket(item, classification);
              const draftedTicket = createDraftFromFeedback(item, classification, draft);
              addDraft(draftedTicket);
            }
          }
        } catch (error) {
          console.error(`Error scanning r/${subreddit}:`, error);
        }
      }
      setScanStatus('Scanning X/Twitter...');
      const twitterQueries = twitterSearchTerms.length > 0
        ? twitterSearchTerms.slice(0, 3)
        : [`${productName} feedback`, `${productName} review`];
      for (const query of twitterQueries) {
        setScanStatus(`Scanning X for "${query}"...`);
        try {
          const response = await fetch('/api/sources/twitter/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, maxResults: 10 }),
          });
          if (!response.ok) continue;
          const result = await response.json();
          const tweets = result.tweets as Tweet[];
          if (tweets && tweets.length > 0) {
            const feedbackItems = normalizeTweets(tweets);
            for (const item of feedbackItems.slice(0, 3)) {
              const classification = await classifyFeedback(item);
              const draft = await draftTicket(item, classification);
              const draftedTicket = createDraftFromFeedback(item, classification, draft);
              addDraft(draftedTicket);
            }
          }
        } catch (error) {
          console.error(`Error scanning Twitter for "${query}":`, error);
        }
      }
      setScanStatus('Done!');
      setTimeout(() => setScanStatus(''), 2000);
    } catch (error) {
      console.error('Scan error:', error);
      setScanStatus('Error scanning sources');
    } finally {
      setIsScanning(false);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Home },
    { id: 'requests' as const, label: 'Requests', icon: TrendingUp, count: stats.byCategory.feature_request + stats.byCategory.bug },
    { id: 'social' as const, label: 'Social Feed', icon: MessageSquare, count: drafts.length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Intelligence Hub</h1>
          <p className="text-stone-500 text-sm mt-1">
            {drafts.length > 0
              ? `${drafts.length} items collected from ${Object.keys(stats.bySource).length} sources`
              : 'Scan sources to start collecting feedback'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {scanStatus && (
            <span className="text-sm text-stone-500 animate-pulse">{scanStatus}</span>
          )}
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-all shadow-sm disabled:opacity-50"
          >
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {isScanning ? 'Scanning...' : 'Scan Sources'}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-stone-100 text-stone-600' : 'bg-stone-200 text-stone-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Items" value={stats.total} loading={isScanning} icon={BarChart3} />
              <StatCard label="Pending Review" value={stats.pending} loading={isScanning} icon={Inbox} />
              <StatCard label="Feature Requests" value={stats.byCategory.feature_request} loading={isScanning} icon={TrendingUp} />
              <StatCard label="Bugs Reported" value={stats.byCategory.bug} loading={isScanning} icon={Zap} />
            </div>

            {drafts.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">No data yet</h3>
                <p className="text-stone-500 mb-6 max-w-sm mx-auto">
                  Click &quot;Scan Sources&quot; to fetch feedback from Reddit and X/Twitter, then review and approve tickets.
                </p>
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10"
                >
                  {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                  {isScanning ? 'Scanning...' : 'Scan Sources Now'}
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RequestsView drafts={drafts} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-4">Recent Mentions</h3>
                  <FeedView drafts={drafts} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && <RequestsView drafts={drafts} />}
        {activeTab === 'social' && (
          <div className="max-w-2xl">
            <FeedView drafts={drafts} />
          </div>
        )}
      </div>
    </div>
  );
}

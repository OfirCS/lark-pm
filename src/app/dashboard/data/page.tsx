'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  TrendingUp,
  Settings,
  ArrowLeft,
  Phone,
  Search,
  RefreshCw,
  Loader2,
  MessageSquare,
  ArrowUp,
  ExternalLink,
  Inbox,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useReviewStore, createDraftFromFeedback } from '@/lib/stores/reviewStore';
import { normalizeRedditPosts, normalizeTweets } from '@/lib/pipeline/normalizer';
import type { RedditPost } from '@/lib/sources/reddit';
import type { Tweet } from '@/lib/sources/twitter';
import { classifyFeedback } from '@/lib/pipeline/classifier';
import { draftTicket } from '@/lib/pipeline/drafter';
import type { DraftedTicket, FeedbackItem } from '@/types/pipeline';
import {
  PRIORITY_COLORS,
  CATEGORY_COLORS,
  SENTIMENT_COLORS,
  SOURCE_CONFIG,
} from '@/types/pipeline';

// --- Components ---

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'gray' | 'red' | 'orange' | 'blue' | 'green' }) {
  const styles = {
    gray: 'bg-stone-100 text-stone-600 border-stone-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[color]}`}>
      {children}
    </span>
  );
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

function SidebarItem({ icon: Icon, label, active, onClick, count }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-stone-100 text-stone-900'
          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
      }`}
    >
      <Icon size={16} strokeWidth={2} />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-auto text-xs text-stone-400 font-normal">{count}</span>
      )}
    </button>
  );
}

function StatCard({ label, value, trend, loading }: { label: string; value: string | number; trend?: string; loading?: boolean }) {
  return (
    <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-sm">
      <p className="text-sm font-medium text-stone-500 mb-2">{label}</p>
      <div className="flex items-baseline justify-between">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        ) : (
          <h3 className="text-3xl font-semibold text-stone-900 tracking-tight">{value}</h3>
        )}
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUp size={12} />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

// Feature requests view from pipeline data
function RequestsView({ drafts }: { drafts: DraftedTicket[] }) {
  const featureRequests = drafts.filter(
    (d) => d.classification.category === 'feature_request' || d.classification.category === 'bug'
  );

  if (featureRequests.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 text-center">
        <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500">No feature requests yet. Scan sources to find feedback.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
        <h3 className="font-semibold text-stone-900">Feature Requests & Bugs</h3>
        <Link
          href="/dashboard/review"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View Review Queue →
        </Link>
      </div>
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
            <tr key={req.id} className="hover:bg-stone-50/50 group">
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
  );
}

// Social feed from pipeline data
function FeedView({ drafts }: { drafts: DraftedTicket[] }) {
  if (drafts.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl">
        <p className="text-stone-400 text-sm">No mentions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {drafts.slice(0, 5).map((item) => (
        <div key={item.id} className="p-4 bg-white border border-stone-200 rounded-xl shadow-sm hover:border-stone-300 transition-all">
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
              <span className="text-stone-400 text-xs">• {getTimeAgo(item.createdAt)}</span>
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
            <a
              href={item.feedbackItem.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
            >
              View source <ExternalLink size={10} />
            </a>
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

// --- Main Page ---

export default function DataPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  const { drafts, addDraft, getStats, getPendingCount } = useReviewStore();
  const stats = getStats();

  // Scan sources and run pipeline
  const handleScan = async () => {
    setIsScanning(true);
    setScanStatus('Searching Reddit...');

    try {
      // Search Reddit via API route (to avoid CORS)
      const subreddits = ['SaaS', 'startups', 'ProductManagement'];

      for (const subreddit of subreddits) {
        setScanStatus(`Searching r/${subreddit}...`);

        try {
          const response = await fetch('/api/sources/reddit/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: 'saas feedback',
              subreddit,
              limit: 5,
              time: 'week',
            }),
          });

          if (!response.ok) {
            console.error(`Reddit API error for r/${subreddit}`);
            continue;
          }

          const result = await response.json();
          const posts = result.posts as RedditPost[];

          if (posts.length > 0) {
            setScanStatus(`Found ${posts.length} posts in r/${subreddit}, classifying...`);

            const feedbackItems = normalizeRedditPosts(posts);

            // Classify and draft each item
            for (const item of feedbackItems.slice(0, 3)) {
              setScanStatus(`Classifying: ${item.title?.slice(0, 30) || item.content.slice(0, 30)}...`);

              const classification = await classifyFeedback(item);

              setScanStatus(`Drafting ticket...`);
              const draft = await draftTicket(item, classification);

              const draftedTicket = createDraftFromFeedback(item, classification, draft);
              addDraft(draftedTicket);
            }
          }
        } catch (error) {
          console.error(`Error scanning r/${subreddit}:`, error);
        }
      }

      // Search Twitter/X via API route
      setScanStatus('Searching Twitter/X...');
      const twitterQueries = ['product feedback', 'customer feedback', 'feature request'];

      for (const query of twitterQueries) {
        setScanStatus(`Searching Twitter for "${query}"...`);

        try {
          const response = await fetch('/api/sources/twitter/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, maxResults: 10 }),
          });

          if (!response.ok) {
            console.error(`Twitter API error for "${query}"`);
            continue;
          }

          const result = await response.json();
          const tweets = result.tweets as Tweet[];

          if (tweets && tweets.length > 0) {
            setScanStatus(`Found ${tweets.length} tweets, classifying...`);

            const feedbackItems = normalizeTweets(tweets);

            // Classify and draft each item (limit to 3 per query)
            for (const item of feedbackItems.slice(0, 3)) {
              setScanStatus(`Classifying tweet: ${item.content.slice(0, 30)}...`);

              const classification = await classifyFeedback(item);

              setScanStatus(`Drafting ticket...`);
              const draft = await draftTicket(item, classification);

              const draftedTicket = createDraftFromFeedback(item, classification, draft);
              addDraft(draftedTicket);
            }
          }
        } catch (error) {
          console.error(`Error scanning Twitter for "${query}":`, error);
          // Continue if Twitter API is not configured
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

  return (
    <div className="min-h-screen bg-stone-50/50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-stone-200 z-30">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="px-3 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 rounded-md transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Chat
          </Link>
        </div>

        <div className="px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 mt-4">Dashboards</p>
          <SidebarItem
            icon={Home}
            label="Overview"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <SidebarItem
            icon={TrendingUp}
            label="Requests"
            active={activeTab === 'requests'}
            onClick={() => setActiveTab('requests')}
            count={stats.byCategory.feature_request + stats.byCategory.bug}
          />
          <SidebarItem
            icon={MessageSquare}
            label="Social Feed"
            active={activeTab === 'social'}
            onClick={() => setActiveTab('social')}
            count={drafts.length}
          />
        </div>

        {/* Review Queue Link */}
        <div className="px-3 mt-6">
          <Link
            href="/dashboard/review"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Zap size={16} />
            Review Queue
            {stats.pending > 0 && (
              <span className="ml-auto bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {stats.pending}
              </span>
            )}
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">PM</div>
            <div>
              <p className="text-sm font-medium text-stone-900">Product Team</p>
              <p className="text-xs text-stone-500">Pro Plan</p>
            </div>
            <Link href="/settings" className="ml-auto text-stone-400 hover:text-stone-600">
              <Settings size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'requests' && 'Feature Requests'}
              {activeTab === 'social' && 'Social Feed'}
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              {drafts.length > 0
                ? `${drafts.length} items collected`
                : 'No data yet - scan sources to begin'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {scanStatus && (
              <span className="text-sm text-stone-500">{scanStatus}</span>
            )}
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {isScanning ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {isScanning ? 'Scanning...' : 'Scan Sources'}
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="space-y-8 animate-in fade-in duration-500">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-4 gap-6">
                <StatCard
                  label="Total Items"
                  value={stats.total}
                  loading={isScanning}
                />
                <StatCard
                  label="Pending Review"
                  value={stats.pending}
                  loading={isScanning}
                />
                <StatCard
                  label="Feature Requests"
                  value={stats.byCategory.feature_request}
                  loading={isScanning}
                />
                <StatCard
                  label="Bugs Reported"
                  value={stats.byCategory.bug}
                  loading={isScanning}
                />
              </div>

              {drafts.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-medium text-stone-900 mb-2">No data yet</h3>
                  <p className="text-stone-500 mb-6 max-w-sm mx-auto">
                    Click &quot;Scan Sources&quot; to fetch feedback from Reddit and Twitter,
                    then review and approve tickets.
                  </p>
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    {isScanning ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Zap size={18} />
                    )}
                    {isScanning ? 'Scanning...' : 'Scan Sources Now'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-2">
                    <RequestsView drafts={drafts} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-4">Recent Mentions</h3>
                    <FeedView drafts={drafts} />
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'requests' && <RequestsView drafts={drafts} />}
          {activeTab === 'social' && (
            <div className="max-w-2xl">
              <FeedView drafts={drafts} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

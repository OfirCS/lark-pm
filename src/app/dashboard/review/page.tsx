'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Inbox,
  AlertTriangle,
  Loader2,
  Plus,
  Zap,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ReviewCard } from '@/components/review/ReviewCard';
import { ReviewFilters, BulkActions } from '@/components/review/ReviewFilters';
import { useReviewStore, createDraftFromFeedback } from '@/lib/stores/reviewStore';
import type { DraftedTicket, FeedbackItem, ClassificationResult } from '@/types/pipeline';

export default function ReviewQueuePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingDraft, setEditingDraft] = useState<DraftedTicket | null>(null);

  // Store state
  const {
    drafts,
    filters,
    selectedIds,
    setFilters,
    clearFilters,
    selectDraft,
    deselectDraft,
    selectAll,
    deselectAll,
    approveDraft,
    rejectDraft,
    bulkApprove,
    bulkReject,
    getFilteredDrafts,
    getStats,
    getPendingCount,
    getUrgentCount,
    addDraft,
  } = useReviewStore();

  const filteredDrafts = getFilteredDrafts();
  const stats = getStats();
  const pendingCount = getPendingCount();
  const urgentCount = getUrgentCount();

  // Pending items only for bulk actions
  const pendingFilteredDrafts = filteredDrafts.filter(
    (d) => d.status === 'pending' || d.status === 'edited'
  );

  // Handle refresh / ingest
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/pipeline/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: ['reddit', 'twitter'],
          queries: ['saas', 'startup', 'product feedback'],
        }),
      });
      // Pipeline will add items to store via notifications
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle approve
  const handleApprove = async (id: string, platform: 'linear' | 'jira') => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;

    try {
      // Call tickets API to create in platform
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

      if (result.success) {
        approveDraft(id, platform, {
          ticketId: result.ticketId,
          ticketUrl: result.ticketUrl,
        });
      } else {
        // Still mark as approved but note the error
        approveDraft(id, platform);
        console.error('Ticket creation failed:', result.error);
      }
    } catch (error) {
      console.error('Approve failed:', error);
      // Mark as approved anyway for demo
      approveDraft(id, platform);
    }
  };

  // Handle reject
  const handleReject = (id: string, reason?: string) => {
    rejectDraft(id, reason);
  };

  // Handle edit
  const handleEdit = (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (draft) {
      setEditingDraft(draft);
    }
  };

  // Handle selection
  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      deselectDraft(id);
    } else {
      selectDraft(id);
    }
  };

  // Add demo data for testing
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
      metadata: {
        subreddit: 'SaaS',
        replyCount: 23,
      },
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
A Reddit user (enterprise segment) is requesting SSO/SAML authentication, stating it's blocking their enterprise rollout to 500+ employees.

## User Quote
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
    <div className="min-h-screen bg-stone-50 relative">
      {/* Texture */}
      <div className="grain fixed inset-0 z-[100] pointer-events-none opacity-30" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft size={18} />
              </Link>
              <Logo size="sm" />
              <div className="w-px h-6 bg-stone-200" />
              <div>
                <h1 className="text-lg font-medium text-stone-900">Review Queue</h1>
                <p className="text-xs text-stone-500">
                  {pendingCount} pending{urgentCount > 0 && ` • ${urgentCount} urgent`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={addDemoData}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <Plus size={16} />
                Add Demo
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {isRefreshing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Scan Sources
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-stone-900">{stats.total}</p>
            <p className="text-xs text-stone-500">Total items</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-stone-500">Pending review</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-emerald-600">{stats.approved}</p>
            <p className="text-xs text-stone-500">Approved</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-2xl font-semibold text-rose-600">
              {stats.byPriority.urgent + stats.byPriority.high}
            </p>
            <p className="text-xs text-stone-500">High priority</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <ReviewFilters
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
            stats={stats}
          />
        </div>

        {/* Bulk actions */}
        <div className="mb-4">
          <BulkActions
            selectedCount={selectedIds.length}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onBulkApprove={(platform) => {
              bulkApprove(platform);
            }}
            onBulkReject={() => {
              bulkReject();
            }}
            totalCount={pendingFilteredDrafts.length}
          />
        </div>

        {/* Queue */}
        {filteredDrafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Inbox size={24} className="text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              No items in queue
            </h3>
            <p className="text-sm text-stone-500 text-center max-w-sm mb-6">
              Click &quot;Scan Sources&quot; to fetch feedback from Reddit and Twitter,
              or add demo data to test the flow.
            </p>
            <div className="flex gap-3">
              <button
                onClick={addDemoData}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <Plus size={16} />
                Add Demo Data
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <Zap size={16} />
                Scan Sources
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrafts.map((draft) => (
              <ReviewCard
                key={draft.id}
                draft={draft}
                isSelected={selectedIds.includes(draft.id)}
                onSelect={handleSelect}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit modal would go here */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6">
            <h2 className="text-lg font-medium mb-4">Edit Ticket Draft</h2>
            <p className="text-sm text-stone-500 mb-4">
              Editing functionality coming soon. For now, approve or reject as-is.
            </p>
            <button
              onClick={() => setEditingDraft(null)}
              className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

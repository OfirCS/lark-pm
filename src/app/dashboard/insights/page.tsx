'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Zap,
  RefreshCw,
  Settings,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { useCompanyStore } from '@/lib/stores/companyStore';
import { useReviewStore } from '@/lib/stores/reviewStore';
import type { ClusteredFeedback } from '@/lib/pipeline/clusterer';

interface PipelineResult {
  success: boolean;
  rawItems: Array<{
    item: {
      id: string;
      content: string;
      title?: string;
      source: string;
    };
    classification: {
      category: string;
      priority: string;
      sentiment: string;
    };
  }>;
  clusters: ClusteredFeedback[];
  stats: {
    totalFound: number;
    totalClusters: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    bySentiment: Record<string, number>;
    bySource: Record<string, number>;
  };
  insights: {
    topIssues: string[];
    urgentItems: number;
    sentimentScore: number;
    recommendations: string[];
  };
  error?: string;
}

export default function InsightsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTickets, setIsCreatingTickets] = useState(false);
  const [ticketsCreated, setTicketsCreated] = useState(0);

  const { company } = useCompanyStore();
  const { addDraft } = useReviewStore();

  // Auto-run on first load if company is set up
  useEffect(() => {
    if (company.productName && !result && !isRunning) {
      runMagicPipeline();
    }
  }, [company.productName]);

  const runMagicPipeline = async () => {
    if (!company.productName) {
      setError('Please set up your product in onboarding first');
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/pipeline/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: company.productName,
          searchTerms: company.searchTerms,
          competitors: company.competitors,
          sources: {
            reddit: { subreddits: company.subreddits, enabled: true },
            twitter: { enabled: true },
          },
          maxItems: 30,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Pipeline failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateTickets = async (clusters: ClusteredFeedback[]) => {
    setIsCreatingTickets(true);
    let created = 0;

    try {
      // For now, add to review store as drafts
      // In production, this would create tickets directly via API
      for (const cluster of clusters) {
        // Add each cluster's items as a draft
        const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        // Use the first item as the main feedback item
        const mainItem = cluster.items[0];

        addDraft({
          id: draftId,
          feedbackItem: mainItem.item,
          classification: mainItem.classification,
          draft: {
            title: cluster.suggestedTicket.title,
            description: cluster.suggestedTicket.description,
            suggestedLabels: cluster.suggestedTicket.labels,
            suggestedPriority: cluster.priority,
          },
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        });

        created++;
      }

      setTicketsCreated(created);
    } catch (err) {
      console.error('Error creating tickets:', err);
    } finally {
      setIsCreatingTickets(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-stone-600" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-stone-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" />
                  Magic Pipeline
                </h1>
                <p className="text-sm text-stone-500">
                  One-click: Search → Extract → Cluster → Tickets
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {result && !isRunning && (
                <span className="text-sm text-stone-500">
                  {result.stats.totalFound} items found
                </span>
              )}
              <button
                onClick={runMagicPipeline}
                disabled={isRunning || !company.productName}
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
              >
                {isRunning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Scan Again
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Messages */}
        {ticketsCreated > 0 && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-900">
                {ticketsCreated} tickets added to review queue
              </p>
              <p className="text-sm text-emerald-700">
                <Link href="/dashboard/data" className="underline hover:no-underline">
                  Go to Data tab
                </Link>{' '}
                to review and approve them
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isRunning && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                <Loader2 size={32} className="text-stone-900 animate-spin" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-lg font-semibold text-stone-900">Running Magic Pipeline</h2>
            <p className="mt-2 text-stone-500 text-center max-w-md">
              Searching Reddit, Twitter, and other sources for feedback about{' '}
              <strong>{company.productName || 'your product'}</strong>...
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-stone-400">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              This may take 30-60 seconds
            </div>
          </div>
        )}

        {/* No Product Set Up */}
        {!company.productName && !isRunning && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-6">
              <Settings size={32} className="text-stone-400" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">Set Up Your Product First</h2>
            <p className="mt-2 text-stone-500 text-center max-w-md">
              The Magic Pipeline needs to know your product name to search for relevant feedback.
            </p>
            <Link
              href="/onboarding"
              className="mt-6 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
            >
              Go to Onboarding
            </Link>
          </div>
        )}

        {/* Results */}
        {result && !isRunning && (
          <InsightsPanel
            clusters={result.clusters}
            stats={result.stats}
            insights={result.insights}
            onCreateTickets={handleCreateTickets}
            isCreatingTickets={isCreatingTickets}
          />
        )}

        {/* Empty State */}
        {result && result.clusters.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-6">
              <Zap size={32} className="text-stone-400" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">No Feedback Found</h2>
            <p className="mt-2 text-stone-500 text-center max-w-md">
              We couldn't find any feedback about <strong>{company.productName}</strong> right now.
              Try again later or adjust your search terms in settings.
            </p>
            <Link
              href="/settings"
              className="mt-6 px-6 py-3 bg-stone-100 text-stone-900 rounded-xl font-medium hover:bg-stone-200 transition-colors"
            >
              Adjust Settings
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

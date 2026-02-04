'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Zap,
  MessageSquare,
  Bug,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import type { ClusteredFeedback } from '@/lib/pipeline/clusterer';

interface InsightsPanelProps {
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
  onCreateTickets?: (clusters: ClusteredFeedback[]) => void;
  isCreatingTickets?: boolean;
}

export function InsightsPanel({
  clusters,
  stats,
  insights,
  onCreateTickets,
  isCreatingTickets,
}: InsightsPanelProps) {
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(new Set());
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  const toggleCluster = (id: string) => {
    const newSelected = new Set(selectedClusters);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedClusters(newSelected);
  };

  const selectAll = () => {
    if (selectedClusters.size === clusters.length) {
      setSelectedClusters(new Set());
    } else {
      setSelectedClusters(new Set(clusters.map(c => c.id)));
    }
  };

  const handleCreateTickets = () => {
    const selected = clusters.filter(c => selectedClusters.has(c.id));
    onCreateTickets?.(selected.length > 0 ? selected : clusters);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<MessageSquare size={20} />}
          label="Total Feedback"
          value={stats.totalFound}
          color="stone"
        />
        <SummaryCard
          icon={<Zap size={20} />}
          label="Potential Tickets"
          value={stats.totalClusters}
          color="amber"
        />
        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="Urgent Items"
          value={insights.urgentItems}
          color={insights.urgentItems > 0 ? 'red' : 'stone'}
        />
        <SummaryCard
          icon={insights.sentimentScore >= 50 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          label="Sentiment"
          value={`${insights.sentimentScore}%`}
          color={insights.sentimentScore >= 60 ? 'emerald' : insights.sentimentScore >= 40 ? 'amber' : 'red'}
        />
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-900 mb-3">Category Breakdown</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <span
              key={category}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(category)}`}
            >
              {getCategoryIcon(category)} {formatCategory(category)}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <Sparkles size={18} />
            AI Recommendations
          </h3>
          <ul className="space-y-1">
            {insights.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clustered Tickets */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-900">Suggested Tickets</h3>
            <p className="text-sm text-stone-500">
              {clusters.length} clusters from {stats.totalFound} feedback items
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              {selectedClusters.size === clusters.length ? 'Deselect all' : 'Select all'}
            </button>
            <button
              onClick={handleCreateTickets}
              disabled={isCreatingTickets}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isCreatingTickets ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Create {selectedClusters.size > 0 ? selectedClusters.size : clusters.length} Tickets
                </>
              )}
            </button>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="p-4 hover:bg-stone-50 transition-colors">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedClusters.has(cluster.id)}
                  onChange={() => toggleCluster(cluster.id)}
                  className="mt-1 w-4 h-4 rounded border-stone-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(cluster.priority)}`}>
                      {cluster.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(cluster.category)}`}>
                      {formatCategory(cluster.category)}
                    </span>
                    <span className="text-xs text-stone-400">
                      {cluster.mentionCount} mention{cluster.mentionCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h4 className="font-medium text-stone-900 mt-1">
                    {cluster.suggestedTicket.title}
                  </h4>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    {cluster.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-stone-400">Sources:</span>
                    {cluster.sources.map((source, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-stone-100 rounded">
                        {source}
                      </span>
                    ))}
                  </div>

                  {/* Expand to see items */}
                  <button
                    onClick={() => setExpandedCluster(expandedCluster === cluster.id ? null : cluster.id)}
                    className="text-xs text-stone-500 hover:text-stone-700 mt-2 flex items-center gap-1"
                  >
                    <ChevronRight
                      size={12}
                      className={`transition-transform ${expandedCluster === cluster.id ? 'rotate-90' : ''}`}
                    />
                    {expandedCluster === cluster.id ? 'Hide' : 'Show'} {cluster.items.length} items
                  </button>

                  {expandedCluster === cluster.id && (
                    <div className="mt-3 space-y-2 pl-4 border-l-2 border-stone-200">
                      {cluster.items.map(({ item }, i) => (
                        <div key={i} className="text-sm">
                          <p className="text-stone-600 line-clamp-2">"{item.content}"</p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {item.source} {item.author ? `• ${item.author}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'stone' | 'amber' | 'red' | 'emerald';
}) {
  const colorClasses = {
    stone: 'bg-stone-50 text-stone-600 border-stone-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// Helper functions
function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-stone-100 text-stone-600',
  };
  return colors[priority] || colors.medium;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    bug: 'bg-red-100 text-red-700',
    feature_request: 'bg-purple-100 text-purple-700',
    complaint: 'bg-orange-100 text-orange-700',
    praise: 'bg-emerald-100 text-emerald-700',
    question: 'bg-blue-100 text-blue-700',
    other: 'bg-stone-100 text-stone-600',
  };
  return colors[category] || colors.other;
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    bug: '🐛',
    feature_request: '✨',
    complaint: '😤',
    praise: '🎉',
    question: '❓',
    other: '📝',
  };
  return icons[category] || '📝';
}

function formatCategory(category: string): string {
  return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

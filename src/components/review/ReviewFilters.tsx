'use client';

import { Search, X, Filter } from 'lucide-react';
import type { ReviewFilters as ReviewFiltersType } from '@/types/pipeline';

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFilterChange: (filters: Partial<ReviewFiltersType>) => void;
  onClearFilters: () => void;
  stats: {
    pending: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    bySource: Record<string, number>;
  };
}

export function ReviewFilters({
  filters,
  onFilterChange,
  onClearFilters,
  stats,
}: ReviewFiltersProps) {
  const hasActiveFilters =
    filters.status ||
    filters.category ||
    filters.priority ||
    filters.source ||
    filters.search;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          type="text"
          placeholder="Search feedback..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
          className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-300 focus:ring-2 focus:ring-stone-100"
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status || 'all'}
        onChange={(e) =>
          onFilterChange({
            status: e.target.value === 'all' ? undefined : (e.target.value as any),
          })
        }
        className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-300 cursor-pointer"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending ({stats.pending})</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Category filter */}
      <select
        value={filters.category || 'all'}
        onChange={(e) =>
          onFilterChange({
            category: e.target.value === 'all' ? undefined : (e.target.value as any),
          })
        }
        className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-300 cursor-pointer"
      >
        <option value="all">All Categories</option>
        <option value="bug">
          Bug {stats.byCategory.bug ? `(${stats.byCategory.bug})` : ''}
        </option>
        <option value="feature_request">
          Feature Request{' '}
          {stats.byCategory.feature_request
            ? `(${stats.byCategory.feature_request})`
            : ''}
        </option>
        <option value="complaint">
          Complaint{' '}
          {stats.byCategory.complaint ? `(${stats.byCategory.complaint})` : ''}
        </option>
        <option value="question">
          Question {stats.byCategory.question ? `(${stats.byCategory.question})` : ''}
        </option>
        <option value="praise">
          Praise {stats.byCategory.praise ? `(${stats.byCategory.praise})` : ''}
        </option>
        <option value="other">
          Other {stats.byCategory.other ? `(${stats.byCategory.other})` : ''}
        </option>
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority || 'all'}
        onChange={(e) =>
          onFilterChange({
            priority: e.target.value === 'all' ? undefined : (e.target.value as any),
          })
        }
        className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-300 cursor-pointer"
      >
        <option value="all">All Priorities</option>
        <option value="urgent">
          Urgent {stats.byPriority.urgent ? `(${stats.byPriority.urgent})` : ''}
        </option>
        <option value="high">
          High {stats.byPriority.high ? `(${stats.byPriority.high})` : ''}
        </option>
        <option value="medium">
          Medium {stats.byPriority.medium ? `(${stats.byPriority.medium})` : ''}
        </option>
        <option value="low">
          Low {stats.byPriority.low ? `(${stats.byPriority.low})` : ''}
        </option>
      </select>

      {/* Source filter */}
      <select
        value={filters.source || 'all'}
        onChange={(e) =>
          onFilterChange({
            source: e.target.value === 'all' ? undefined : (e.target.value as any),
          })
        }
        className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-300 cursor-pointer"
      >
        <option value="all">All Sources</option>
        <option value="reddit">
          Reddit {stats.bySource.reddit ? `(${stats.bySource.reddit})` : ''}
        </option>
        <option value="twitter">
          Twitter {stats.bySource.twitter ? `(${stats.bySource.twitter})` : ''}
        </option>
        <option value="slack">
          Slack {stats.bySource.slack ? `(${stats.bySource.slack})` : ''}
        </option>
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}

// Bulk actions component
interface BulkActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkApprove: (platform: 'linear' | 'jira') => void;
  onBulkReject: () => void;
  totalCount: number;
}

export function BulkActions({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkApprove,
  onBulkReject,
  totalCount,
}: BulkActionsProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-3 bg-stone-50 border border-stone-200 rounded-xl">
      <button
        onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
        className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
            selectedCount === totalCount
              ? 'border-indigo-500 bg-indigo-500'
              : selectedCount > 0
              ? 'border-indigo-500 bg-indigo-100'
              : 'border-stone-300'
          }`}
        >
          {selectedCount === totalCount && (
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {selectedCount > 0 && selectedCount < totalCount && (
            <div className="w-2 h-0.5 bg-indigo-500 rounded" />
          )}
        </div>
        {selectedCount === 0
          ? 'Select all'
          : selectedCount === totalCount
          ? 'Deselect all'
          : `${selectedCount} selected`}
      </button>

      {selectedCount > 0 && (
        <>
          <div className="w-px h-6 bg-stone-200" />

          <button
            onClick={() => onBulkApprove('linear')}
            className="px-3 py-1.5 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
          >
            Approve {selectedCount} → Linear
          </button>

          <button
            onClick={() => onBulkApprove('jira')}
            className="px-3 py-1.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            → Jira
          </button>

          <button
            onClick={onBulkReject}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Reject {selectedCount}
          </button>
        </>
      )}
    </div>
  );
}
